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
        SPACE: "bomb",
        T: "slow_time",
        P: "pause",
        M: "mute",

        Y: "y",
        U: "u",
        I: "i",
        H: "h",
        J: "j",
        K: "k"
    });

    { // ## Animations
        Q.animations("meteorite_anim", {
            move: { frames: [0, 1, 2], rate: 1 / 5 },
            poof: { frames: [3, 4, 5], rate: 1 / 5, loop: false, trigger: "dead" },
            boom: { frames: [0, 1, 2], rate: 1 / 5, loop: false, trigger: "dead" }
        });

        Q.animations("neon_meteorite_anim", {
            move: { frames: [0, 1, 2, 3, 4, 5, 2, 5, 2, 5], rate: 1 }
        });
        Q.animations("neon_record_anim", {
            move: { frames: [0, 1], rate: 2 }
        });
    }    



    { // ## Menu Stage
        Q.scene('menuStage', function (stage) {
            var background = stage.insert(new Q.Sprite({
                asset: "menu_background.png",
                x: Q.width / 2, y: Q.height / 2,
            }));

            
            var playButton = stage.insert(new Q.UI.Button({
                x: 320, y: 420,
                sheet: 'playButton'
            }))
            playButton.on("click", function () {
                Q.clearStages();
                Q.stageScene('mainStage');
            });

            var leaderboardButton = stage.insert(new Q.UI.Button({
                x: 320, y: 690,
                sheet: 'leaderboardButton'
            }))
            leaderboardButton.on("click", function () {
                Q.clearStages();
                Q.stageScene('mainStage');
            });

            var playerButton = stage.insert(new Q.UI.Button({
                x: 320, y: 945,
                sheet: 'playerButton'
            }))
            playerButton.on("click", function () {
                Q.clearStages();
                Q.stageScene('mainStage');
            });
        });
    }

    

    Q.scene("mainStage", function (stage) {
        // Q.audio.play("music.ogg", { loop: true });
        // Q.stageTMX("level.tmx", stage);

        Q.state.reset({ score: 0, lifes: 4, bombs: 4, time_juice: 0 });

        Q.stageScene('background', 0);
        Q.stageScene('game', 1);
        Q.stageScene('infoUI', 2);
    });


    { // ## InfoUI Stage
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
                    label: "x" + Q.state.get("lifes"),
                    align: "left"
                });

                Q.state.on("change.lifes", this, "lifes");
            },
            lifes: function (lifes) {
                if (lifes < 0) {
                    Q.clearStages();
                    Q.stageScene('scoreStage');
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
                    label: "x" + Q.state.get("bombs"),
                    align: "left"
                });

                Q.state.on("change.bombs", this, "bombs");
            },
            bombs: function (bombs) {
                if (bombs < 0) {
                    return;
                }
                this.p.label = "x" + bombs;
            }
        });
        Q.Sprite.extend("TimeBar", {
            init: function (p) {
                this._super(p, {
                    asset: "time_bar.png",
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
                ctx.drawImage(Q.asset(this.p.asset), 0, 572 - height, 32, height, 0, 572 - height, 32, height);
            }
        });
        Q.scene('infoUI', function (stage) {
            var background = stage.insert(new Q.Sprite({
                asset: "info.png",
                x: Q.width / 2, y: Q.height / 2,
            }));
            var time_bar = stage.insert(new Q.TimeBar());
            var label = stage.insert(new Q.Score());
            var lifes = stage.insert(new Q.Lifes());
            var lifes = stage.insert(new Q.Bombs());
        });
    }


    { // ## Game Stage
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
                    sheet: p.color + "Meteorite",
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
        Q.scene("game", function (stage) {
            var keystrokes = "000";
            function check_keystrokes() {
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

            let availableKeys = ["y", "u", "i", "h", "j", "k"];
            for (let index = 0; index < availableKeys.length; index += 1) {
                let key = availableKeys[index];
                Q.input.on(key, this, function () { add_keystroke(key); });
            }

            Q.input.on("pause", this, function () {
                if (stage.paused) {
                    stage.unpause();
                }
                else {
                    stage.pause();
                }
            });
            Q.input.on("bomb", this, function () {
                var meteorites = Q("Meteorite", 1);
                meteorites.invoke("explode");

                Q.state.dec("bombs", 1);
            });

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

                    var meteorite_types = ["blue", "orange", "green", "red", "purple", "yellow"];
                    var random = Math.round(random_num(0, 5));
                    var meteorite_type = meteorite_types[random];
                    var x = random_num(70, 500);
                    var y = -(random_num(100, 200));
                    // Add in a couple of enemies
                    stage.insert(new Q.Meteorite({ x: x, y: y, color: meteorite_type }));
                }
            });
        });
    }


    { // ## Background Stage
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
    }



    { // ## Score Stage
        Q.Sprite.extend("NeonMeteorite", {
            init: function (p) {
                this._super(p, {
                    sprite: "neon_meteorite_anim",
                    sheet: "neonMeteorite0",
                    cx: 0, cy: 0,
                    x: 500, y: 0,
                    gravity: 0,
                    collisionMask: Q.SPRITE_NONE
                });

                this.add('animation');
                this.play('move');
            }
        });
        Q.Sprite.extend("NeonRecord", {
            init: function (p) {
                this._super(p, {
                    sprite: "neon_record_anim",
                    sheet: "neonRecord",
                    cx: 0, cy: 0,
                    x: 18, y: 0,
                    gravity: 0,
                    collisionMask: Q.SPRITE_NONE
                });

                this.add('animation');
                this.play('move');
            }
        });
        Q.UI.Text.extend("NeonScore", {
            init: function (p) {
                this._super({
                    x: 320, y: 85,
                    color: "#26F811",
                    size: 120,
                    label: "" + Q.state.get('score')
                });
            }
        });
        Q.scene('scoreStage', function (stage) {
            var background = stage.insert(new Q.Sprite({
                asset: "score_screen.png",
                x: Q.width / 2, y: Q.height / 2,
            }));
            var neon_meteorite = stage.insert(new Q.NeonMeteorite());
            var neon_record = stage.insert(new Q.NeonRecord());
            var score = stage.insert(new Q.NeonScore());

            var restartButton = stage.insert(new Q.UI.Button({
                x: 165, y: 1030,
                sheet: 'restartButton'
            }))
            var restart = function () {
                Q.clearStages();
                Q.stageScene('mainStage');
            };
            restartButton.on("click", restart);

            var exitButton = stage.insert(new Q.UI.Button({
                x: 475, y: 1030,
                sheet: 'exitButton'
            }))
            var exit = function () {
                Q.clearStages();
                Q.stageScene('menuStage');
            };
            exitButton.on("click", exit);
        });
    }


       
    // ## Asset Loading and Game Launch
    // Q.load can be called at any time to load additional assets
    // assets that are already loaded will be skipped
    // The callback will be triggered when everything is loaded
    Q.load(["menu_background.png", "play_button.png", "play_button.json", "leaderboard_button.png", "leaderboard_button.json", "player_button.png", "player_button.json",
        "day_background.png", "night_background.png", "old_background.png", "sun.png", "clouds1.png", "clouds2.png",
        "info.png", "time_bar.png",
        "restart_button.png", "restart_button.json", "exit_button.png", "exit_button.json",
        "score_screen.png", "experience_bar.png", "neon_meteorite.png", "neon_meteorite.json", "neon_record.png",
        "meteorites.png", "meteorites.json",
        "bigMBoom1.ogg", "bigMBoom2.ogg", "bigMHit1.ogg", "bigMHit2.ogg", "boom1.ogg", "boom2.ogg",
        "menu.ogg", "music.ogg", "pause.ogg", "pop1.ogg", "pop2.ogg", "pop3.ogg", "pop4.ogg", "resume.ogg", "tink.ogg"
    ], function () {
        Q.compileSheets("play_button.png", "play_button.json");
        Q.compileSheets("leaderboard_button.png", "leaderboard_button.json");
        Q.compileSheets("player_button.png", "player_button.json");
        Q.compileSheets("restart_button.png", "restart_button.json");
        Q.compileSheets("exit_button.png", "exit_button.json");

        Q.compileSheets("meteorites.png", "meteorites.json");
        Q.compileSheets("neon_meteorite.png", "neon_meteorite.json");
        Q.sheet("neonRecord", "neon_record.png", { tilew: 300, tileh: 200, sx: 0, sy: 0, frames: 2 });

        var body = document.getElementsByTagName("body")[0];
        var loading = document.getElementById("loading");
        body.removeChild(loading);

        // Q.loadTMX("level.tmx", function () {
            // Finally, call stageScene to run the game
        Q.stageScene("menuStage");
        // }); 

        }, {
            progressCallback: function (loaded, total) {
                var element = document.getElementById("loading_progress");
                element.style.width = Math.floor(loaded / total * 100) + "%";
            }
        });

});