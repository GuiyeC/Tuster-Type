window.addEventListener("load", function () {

    // Set up an instance of the Quintus engine  and include
    // the Sprites, Scenes, Input and 2D module. The 2D module
    // includes the `TileLayer` class as well as the `2d` componet.
    var Q = window.Q = Quintus({ audioSupported: ['ogg'] })
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
        // Maximize this game to whatever the size of the browser is
        .setup({
            width: 640,
            height: 1136
        })
        // And turn on default input controls and touch input (for UI)
        .controls().touch()
        .enableSound();
    
    Q.input.keyboardControls({
        ENTER: "start",

        Y: "y",
        U: "u",
        I: "i",
        H: "h",
        J: "j",
        K: "k"
    });

    Q.animations("meteorite_anim", {
        move: { frames: [0, 1, 2], rate: 1 / 5 },
        poof: { frames: [3, 4, 5], rate: 1 / 5, loop: false, trigger: "dead" },
        boom: { frames: [0, 1, 2], rate: 1 / 5, loop: false, trigger: "dead" }
    });

    Q.scene("mainStage", function (stage) {
        // Q.audio.play("music.ogg", { loop: true });
        // Q.stageTMX("level.tmx", stage);

        Q.state.reset({ score: 0, lifes: 4, time_juice: 0 });

        // Q.stageScene('scoreUI');
        Q.stageScene('background', 0);
        Q.stageScene('game', 1);
        Q.stageScene('infoUI', 2);
    });

    Q.scene("game", function (stage) {

        var keystrokes = "000";
        function check_keystrokes() {
            console.log(keystrokes);
            var meteorites = Q("Meteorite", 1);
            var count = 0;
            meteorites.each(function () {
                if (this.p.keycombination == keystrokes || this.p.keycombination == keystrokes.split("").reverse().join("")) {
                    this.explode();
                    count += 1;
                }
            });
            Q.state.inc("score", (count * 10));
            Q.state.inc("time_juice", (count * 5));
        }  
        function add_keystroke(keystroke) {
            if (keystrokes[2] != keystroke) {
                keystrokes = keystrokes.substring(1, 3) + keystroke;
                check_keystrokes();
            }
        }  

        Q.input.on("y", this, function () { add_keystroke("y"); });
        Q.input.on("u", this, function () { add_keystroke("u"); });
        Q.input.on("i", this, function () { add_keystroke("i"); });
        Q.input.on("h", this, function () { add_keystroke("h"); });
        Q.input.on("j", this, function () { add_keystroke("j"); });
        Q.input.on("k", this, function () { add_keystroke("k"); });

        // Create the player and add them to the stage
        // var player = stage.insert(new Q.Mario());

        /**
         * Returns a random number between min (inclusive) and max (exclusive)
         */
        function random_num(min, max) {
            return Math.random() * (max - min) + min;
        }

        var time = random_num(500, 1500);        
        stage.on('step', function (dt) {
            // Update the current time offset
            time -= dt * 1000;
            if (time <= 0) {
                time = random_num(300, 800);

                var meteorite_types = ["blue","orange","green","red","purple","yellow"];
                var random = Math.round(random_num(0, 5));
                var meteorite_type = meteorite_types[random];
                var x = random_num(70, 500);
                var y = -(random_num(100, 200));
                // Add in a couple of enemies
                stage.insert(new Q.Meteorite({ x: x, y: y, color: meteorite_type }));
            }
        });
    });

    Q.component("defaultEnemy", {
        added: function () {
            var entity = this.entity;
            entity.play('move');
            entity.on("dead", entity, "destroy");

            // Listen for a sprite collision, if it's the player,
            // end the game unless the enemy is hit on top
            entity.on("bump.left,bump.right,bump.bottom", function (collision) {
                if (collision.obj.isA("Mario")) {
                    collision.obj.gameOver();
                }
            });

            // If the enemy gets hit on the top, destroy it
            // and give the user a "hop"
            entity.on("bump.top", function (collision) {
                if (collision.obj.isA("Mario")) {
                    this.play('die');
                    this.p.vx = 0;
                    collision.obj.p.vy = -300;
                    Q.audio.play("kill_enemy.ogg");
                }
            });
        }
    });     

    // ## Enemy Sprite
    // Create the Enemy class to add in some baddies
    Q.Sprite.extend("Meteorite", {
        init: function (p) {
            switch (p.color) {
                case "blue":
                    p.keycombination = "huk";
                    break;
                case "orange":
                    p.keycombination = "hjk";
                    break;
                case "green":
                    p.keycombination = "hui";
                    break;
                case "red":
                    p.keycombination = "yji";
                    break;
                case "purple":
                    p.keycombination = "yuk";
                    break;
                case "yellow":
                    p.keycombination = "yui";
                    break;
            }

            this._super(p, {
                sprite: "meteorite_anim",
                sheet: p.color+"Meteorite",
                gravity: 0.1,
                type: Q.SPRITE_ENEMY,
                collisionMask: Q.SPRITE_DEFAULT
            });

            this.add('2d, animation');
            this.play('move');
            this.on("dead", this, "destroy");
        },
        step: function (dt) {
            if (this.p.y > 970 && this.p.gravity > 0) {
                this.p.gravity = 0;
                this.p.vy = 0;
                this.sheet("boomMeteorite", false);
                this.play("boom");

                Q.state.dec("lifes", 1);

                // var audio = Math.round(Math.random() * 1 + 1);
                // Q.audio.play("boom" + audio + ".ogg");
            }
        },
        explode: function (dt) {
            this.p.gravity = 0;
            this.p.vy = 0;
            this.play("poof");

            // var audio = Math.round(Math.random() * 3 + 1);
            // Q.audio.play("pop" + audio+".ogg");
        }
    });


    Q.UI.Text.extend("Score", {
        init: function (p) {
            this._super({
                x: 155, y: 1063,
                color: "white",
                size: 58,
                outline: "black",
                outlineWidth: 6,
                angle: 2,
                label: "00000000"
            });

            Q.state.on("change.score", this, "score");
        },
        score: function (score) {
            this.p.label = ("00000000" + score).slice(-8);
        }
    });
    Q.UI.Text.extend("Lifes", {
        init: function (p) {
            this._super({
                x: 370, y: 1075,
                color: "black",
                size: 50,
                label: "x4",
                align: "left"
            });

            Q.state.on("change.lifes", this, "lifes");
        },
        lifes: function (lifes) {
            if (lifes < 0) {
                return;
            }
            this.p.label = "x" + lifes;
        }
    });
    Q.UI.Text.extend("Bombs", {
        init: function (p) {
            this._super({
                x: 495, y: 1075,
                color: "black",
                size: 50,
                label: "x0",
                align: "left"
            });
        }
    });
    Q.Sprite.extend("TimeBar", {
        init: function (p) {
            this._super(p, {
                asset: "timeBar.png",
                cx: 0, cy: 0,
                x: 572, y: 164,
                gravity: 0,
                collisionMask: Q.SPRITE_NONE
            });
        },
        draw: function (ctx) {
            // override draw to show the correct level of time juice
            var level = Q.state.get("time_juice");
            if (level > 285) {
                level = 285;
            }
            var height = 572 / 285.0 * level;
            ctx.drawImage(Q.asset(this.p.asset), 0, 572-height, 32, height, 0, 572-height, 32, height);
        }
    });
    Q.scene('infoUI', function (stage) {
        var time_bar = stage.insert(new Q.TimeBar());
        var background = stage.insert(new Q.Sprite({
            asset: "info.png",
            x: Q.width / 2, y: Q.height / 2,
        }));
        var label = stage.insert(new Q.Score());
        var lifes = stage.insert(new Q.Lifes());
        var lifes = stage.insert(new Q.Bombs());
    });


    Q.Sprite.extend("Sun", {
        init: function (p) {
            this._super(p, {
                asset: "sun.png",
                x: 0,
                y: 0,
                angle: 4,
                gravity: 0,
                collisionMask: Q.SPRITE_NONE
            });

            this.add('tween');
            this.animateSun(1);
        },
        animateSun: function (step) {
            var newAngle = step == 1 ? -8 : 8;
            var newStep = step == 1 ? 2 : 1;
            
            this.animate({ angle: newAngle }, 7, Q.Easing.Quadratic.InOut, {
                delay: 1,
                callback: function () { this.animateSun(newStep); }
            });
        }
    });
    Q.Sprite.extend("Clouds", {
        init: function (p) {
            this._super(p, {
                asset: "clouds" + p.clouds_type + ".png",
                cx: 0,
                x: p.clouds_type == 1 ? 0 : 720,
                y: 800,
                gravity: 0,
                collisionMask: Q.SPRITE_NONE,
                vx: -20
            });

            this.add('2d');
        },
        step: function (dt) {
            if (this.p.x <= -720) {
                this.p.x = 720;
            }
        }
    });
    Q.scene('background', function (stage) {
        var hour = new Date().getHours();
        if (hour >= 7 && hour < 19) {
            var background = stage.insert(new Q.Sprite({
                asset: "day_background.png",
                x: Q.width / 2, y: Q.height / 2,
            }));
            var sun = stage.insert(new Q.Sun());
        }
        else {
            var background = stage.insert(new Q.Sprite({
                asset: "night_background.png",
                x: Q.width / 2, y: Q.height / 2,
            }));
        }

        var clouds1 = stage.insert(new Q.Clouds({ clouds_type: 1 }));
        var clouds1 = stage.insert(new Q.Clouds({ clouds_type: 2 }));
    });

       
    // ## Asset Loading and Game Launch
    // Q.load can be called at any time to load additional assets
    // assets that are already loaded will be skipped
    // The callback will be triggered when everything is loaded
    Q.load(["day_background.png", "night_background.png", "old_background.png", "sun.png", "clouds1.png", "clouds2.png",
        "info.png", "timeBar.png",
        "meteorites.png", "meteorites.json",
        // "bigMBoom1.ogg", "bigMBoom2.ogg", "bigMHit1.ogg", "bigMHit2.ogg", "boom1.ogg", "boom2.ogg",
        // "menu.ogg", "music.ogg", "pause.ogg", "pop1.ogg", "pop2.ogg", "pop3.ogg", "pop4.ogg", "resume.ogg", "tink.ogg"
    ], function () {

            // Or from a .json asset that defines sprite locations
        Q.compileSheets("meteorites.png", "meteorites.json");

        // Q.loadTMX("level.tmx", function () {
            // Finally, call stageScene to run the game
            Q.stageScene("mainStage");
        // }); 
    });

});