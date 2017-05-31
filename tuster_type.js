window.addEventListener("load", function () {

    // Set up an instance of the Quintus engine  and include
    // the Sprites, Scenes, Input and 2D module. The 2D module
    // includes the `TileLayer` class as well as the `2d` componet.
    var Q = window.Q = Quintus({ audioSupported: ['ogg', 'mp3'] })
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
        poof: { frames: [3, 4, 5], rate: 1 / 4, loop: false, trigger: "dead" }
    });

    Q.scene("mainStage", function (stage) {
        // Q.stageTMX("level.tmx", stage);

        Q.state.reset({ score: 0 });

        // Q.stageScene('scoreUI');
        Q.stageScene('background', 0);
        Q.stageScene('game', 1);
        Q.stageScene('infoUI', 2);
    });

    Q.scene("game", function (stage) {
        Q.input.on("y", this, function () {
            console.log("killing y");
            var meteorites = Q("Meteorite", 1);
            meteorites.each(function () {
                if (this.p.meteorite_type == 'Y') {
                    this.play('poof');
                }
            });
        });
        Q.input.on("u", this, function () {
            console.log("killing u");
            var meteorites = Q("Meteorite", 1);
            meteorites.each(function () {
                if (this.p.meteorite_type == 'U') {
                    this.play('poof');
                }
            });
        });
        Q.input.on("i", this, function () {
            var meteorites = Q("Meteorite", 1);
            meteorites.each(function () {
                if (this.p.meteorite_type == 'I') {
                    this.play('poof');
                }
            });
        });
        Q.input.on("h", this, function () {
            var meteorites = Q("Meteorite", 1);
            meteorites.each(function () {
                if (this.p.meteorite_type == 'H') {
                    this.play('poof');
                }
            });
        });
        Q.input.on("j", this, function () {
            var meteorites = Q("Meteorite", 1);
            meteorites.each(function () {
                if (this.p.meteorite_type == 'J') {
                    this.play('poof');
                }
            });
        });
        Q.input.on("k", this, function () {
            var meteorites = Q("Meteorite", 1);
            meteorites.each(function () {
                if (this.p.meteorite_type == 'K') {
                    this.play('poof');
                }
            });
        });

        // Create the player and add them to the stage
        // var player = stage.insert(new Q.Mario());

        /**
         * Returns a random number between min (inclusive) and max (exclusive)
         */
        function getRandomArbitrary(min, max) {
            return Math.random() * (max - min) + min;
        }

        var time = 0;        
        stage.on('step', function (dt) {
            // Update the current time offset
            time += dt * 1000;
            if (time > 1500) {
                time = 0;

                // Add in a couple of enemies
                stage.insert(new Q.Meteorite({ x: getRandomArbitrary(70, 500), y: -200, meteorite_type: 'Y' }));
                stage.insert(new Q.Meteorite({ x: getRandomArbitrary(70, 500), y: -230, meteorite_type: 'U' }));
                stage.insert(new Q.Meteorite({ x: getRandomArbitrary(70, 500), y: -300, meteorite_type: 'I' }));
                stage.insert(new Q.Meteorite({ x: getRandomArbitrary(70, 500), y: -240, meteorite_type: 'J' }));
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
            var color = null;
            switch (p.meteorite_type) {
                case 'Y':
                    color = "blueMeteorite";
                    break;
                case 'U':
                    color = "orangeMeteorite";
                    break;
                case 'I':
                    color = "greenMeteorite";
                    break;
                case 'H':
                    color = "redMeteorite";
                    break;
                case 'J':
                    color = "purpleMeteorite";
                    break;
                case 'K':
                    color = "yellowMeteorite";
                    break;
            }

            this._super(p, {
                sprite: "meteorite_anim",
                sheet: color,
                gravity: 0.2,
                type: Q.SPRITE_ENEMY,
                collisionMask: Q.SPRITE_DEFAULT
            });

            this.add('2d, animation');
            this.play('move');
            this.on("dead", this, "destroy");
        }
    });


    Q.UI.Text.extend("Score", {
        init: function (p) {
            this._super({
                x: 160, y: 50,
                label: "Coins: 0"
            });
            
            Q.state.on("change.score", this, "score");
        },
        score: function (score) {
            this.p.label = "Coins: " + score;
        }
    });
    
    // To display a game over / game won popup box, 
    // create a endGame scene that takes in a `label` option
    // to control the displayed message.
    Q.scene('scoreUI', function (stage) {
        var label = stage.insert(new Q.Score());
    }, { stage: 1 });


    Q.scene('background', function (stage) {
        var background = stage.insert(new Q.Sprite({
            asset: "day_background.png",
            x: Q.width / 2, y: Q.height / 2,
        }));
    });
    
    Q.scene('infoUI', function (stage) {
        var background = stage.insert(new Q.Sprite({
            asset: "info.png",
            x: Q.width / 2, y: Q.height / 2,
        }));
    });

       
    // ## Asset Loading and Game Launch
    // Q.load can be called at any time to load additional assets
    // assets that are already loaded will be skipped
    // The callback will be triggered when everything is loaded
    Q.load(["day_background.png", "night_background.png", "old_background.png", "sun.png", "clouds1.png", "clouds2.png", "info.png",
        "blue_meteorite.png", "blue_meteorite.json", "green_meteorite.png", "green_meteorite.json", "orange_meteorite.png", "orange_meteorite.json",
        "purple_meteorite.png", "purple_meteorite.json", "red_meteorite.png", "red_meteorite.json", "yellow_meteorite.png", "yellow_meteorite.json",
        // "bigMBoom1.m4a", "bigMBoom2.m4a", "bigMHit1.wav", "bigMHit2.wav", "boom1.m4a", "boom2.m4a",
        // "menu.mp3", "music.mp3", "pause.aif", "pop1.wav", "pop2.wav", "pop3.wav", "pop4.wav", "resume.aif", "tink.aif"
    ], function () {

            // Or from a .json asset that defines sprite locations
            Q.compileSheets("blue_meteorite.png", "blue_meteorite.json");
            Q.compileSheets("green_meteorite.png", "green_meteorite.json");
            Q.compileSheets("orange_meteorite.png", "orange_meteorite.json");
            Q.compileSheets("purple_meteorite.png", "purple_meteorite.json");
            Q.compileSheets("red_meteorite.png", "red_meteorite.json");
            Q.compileSheets("yellow_meteorite.png", "yellow_meteorite.json");

        // Q.loadTMX("level.tmx", function () {
            // Finally, call stageScene to run the game
            Q.stageScene("mainStage");
        // }); 
    });

});