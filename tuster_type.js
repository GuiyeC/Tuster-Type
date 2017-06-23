/* TODO
- Combos
- Music ON/OFF
- Titles screen
*/


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


    { // ## Game variables

        var meteorite_types = {
            "yellow": "yui",
            "green": "hui",
            "orange": "hjk",
            "red": "yji",
            "blue": "huk",
            "purple": "yuk"
        };

        var SLOWED_RATE = 0.5;
        var MAX_TIME_JUICE = 285.0;

        var levels = [
            { "lifes": 1, "bombs": 0, "slowTime": 0, "multiplier": 10, "experience": 4500 },
            { "lifes": 1, "bombs": 0, "slowTime": 5000, "multiplier": 11, "experience": 9500 },
            { "lifes": 1, "bombs": 2, "slowTime": 5000, "multiplier": 11, "experience": 15500 },
            { "lifes": 1, "bombs": 2, "slowTime": 7000, "multiplier": 12, "experience": 23500 },
            { "lifes": 2, "bombs": 2, "slowTime": 7000, "multiplier": 12, "experience": 33500 },
            { "lifes": 2, "bombs": 3, "slowTime": 7000, "multiplier": 13, "experience": 46000 },
            { "lifes": 2, "bombs": 3, "slowTime": 9000, "multiplier": 13, "experience": 61000 },
            { "lifes": 2, "bombs": 3, "slowTime": 9000, "multiplier": 14, "experience": 79000 },
            { "lifes": 2, "bombs": 3, "slowTime": 9000, "multiplier": 14, "experience": 100000 },
            { "lifes": 2, "bombs": 4, "slowTime": 11000, "multiplier": 15, "experience": 125000 },
            { "lifes": 2, "bombs": 4, "slowTime": 11000, "multiplier": 15, "experience": 154000 },
            { "lifes": 2, "bombs": 4, "slowTime": 11000, "multiplier": 16, "experience": 188000 },
            { "lifes": 3, "bombs": 4, "slowTime": 13000, "multiplier": 16, "experience": 227000 },
            { "lifes": 3, "bombs": 5, "slowTime": 13000, "multiplier": 17, "experience": 272000 },
            { "lifes": 3, "bombs": 5, "slowTime": 13000, "multiplier": 17, "experience": 332000 },
            { "lifes": 3, "bombs": 5, "slowTime": 14000, "multiplier": 18, "experience": 412000 },
            { "lifes": 3, "bombs": 5, "slowTime": 14000, "multiplier": 18, "experience": 522000 },
            { "lifes": 3, "bombs": 6, "slowTime": 14000, "multiplier": 19, "experience": 672000 },
            { "lifes": 3, "bombs": 6, "slowTime": 15000, "multiplier": 19, "experience": 872000 },
            { "lifes": 4, "bombs": 6, "slowTime": 15000, "multiplier": 20, "experience": -1 }
        ];

    }


    { // ## Helper functions

        // get and set cookie from https://www.w3schools.com/js/js_cookies.asp
        function setCookie(cname, cvalue) {
            // Set to expire in 2038
            var expires = "expires=Tue, 19 Jan 2038 00:00:00 GMT";
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }
        function getCookie(cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return null;
        }

        /**
         * Returns a random number between min (inclusive) and max (exclusive)
         */
        function randomNum(min, max) {
            return Math.random() * (max - min) + min;
        }

        function getLevelForExperience(exp) {
            for (var level = 0; level < levels.length; level += 1) {
                var data = levels[level];
                
                if (data['experience'] > exp) {
                    return level + 1;
                }
            }

            return 20;
        }
    }    
    
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
                Q.stageScene('leaderboardsStage');
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

        var exp = getCookie('experience');
        if (exp == null) {
            exp = 0;
            setCookie('experience', 0);
        }
        else {
            exp = parseInt(exp);
        }
        var level = getLevelForExperience(exp);
        var levelData = levels[level - 1];

        Q.state.reset({
            score: 0,
            combo: 0,
            time_juice: 0.0,
            slowed_time: false,
            lifes: levelData['lifes'],
            bombs: levelData['bombs'],
            slowTime: levelData['slowTime'],
            multiplier: levelData['multiplier']
        });

        Q.stageScene('background', 0);
        var gameStage = Q.stageScene('game', 1);
        Q.stageScene('infoUI', 3);

        Q.input.on("pause", this, function () {
            if (gameStage.paused) {
                Q.clearStage(2);
                gameStage.unpause();
            }
            else {
                gameStage.pause();
                Q.stageScene('pauseStage', 2);
            }
        });
    });


    { // ## Pause Stage
        Q.scene('pauseStage', function (stage) {
            stage.insert(new Q.Sprite({
                x: Q.width / 2, y: Q.height / 2, color: "rgba(0,0,0,0.5)",
                w: Q.width, h: Q.height
            }));
            stage.insert(new Q.Sprite({
                asset: "pause_background.png",
                cx: 0,
                x: 8, y: Q.height / 2 - 50
            }));

            var resumeButton = stage.insert(new Q.UI.Button({
                x: 173, y: 366,
                sheet: 'resumeButton'
            }))
            resumeButton.on("click", function () {
                Q.clearStage(2);
                Q.stage(1).unpause();
            });

            var restartButton = stage.insert(new Q.UI.Button({
                x: 173, y: 490,
                sheet: 'restartButton'
            }))
            restartButton.on("click", function () {
                Q.clearStages();
                Q.stageScene('mainStage');
            });

            var exitButton = stage.insert(new Q.UI.Button({
                x: 173, y: 603,
                sheet: 'exitButton'
            }))
            exitButton.on("click", function () {
                Q.clearStages();
                Q.stageScene('menuStage');
            });

            var musicButton = stage.insert(new Q.UI.Button({
                x: 205, y: 685,
                sheet: 'musicButtonOn'
            }))
            musicButton.on("click", function () {
                if (musicButton.sheet() == 'musicButtonOn') {
                    musicButton.sheet('musicButtonOff', false);
                }
                else {
                    musicButton.sheet('musicButtonOn', false);
                }
            });
        });
    }


    { // ## InfoUI Stage
        Q.UI.Text.extend("Score", {
            init: function (p) {
                this._super({
                    x: 155, y: 1047,
                    color: "white",
                    family: "ChalkboardSE-Regular",
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
        Q.UI.Text.extend("Combo", {
            init: function (p) {
                this._super({
                    x: 565, y: 7,
                    opacity: 0,
                    family: "CrashLandingBB",
                    size: 100,
                    outline: "black",
                    outlineWidth: 5,
                    label: "x0"
                });
                
                this.add('tween');
                Q.state.on("change.combo", this, "combo");
            },
            combo: function (combo) {
                if (combo == null) {
                    return;
                }
                this.stop();

                this.p.label = "x"+combo;
                this.p.angle = randomNum(0, 8) - 4;
                this.p.opacity = 1;

                var color = Math.round(randomNum(0, 4));
                switch (color) {
                    case 0:
                    color = "red";
                    break;
                    case 1:
                    color = "blue";
                    break;
                    case 2:
                    color = "green";
                    break;
                    case 3:
                    color = "yellow";
                    break;
                    case 4:
                    color = "orange";
                    break;
                }
                this.p.color = color;

                this.animate({ opacity: 0 }, 0.3, Q.Easing.Quadratic.Linear, { delay: 2 });
            }
        });
        Q.UI.Text.extend("Lifes", {
            init: function (p) {
                this._super({
                    x: 370, y: 1057,
                    color: "black",
                    family: "Noteworthy-Light",
                    size: 50,
                    label: "x" + Q.state.get("lifes"),
                    align: "left"
                });

                Q.state.on("change.lifes", this, "lifes");
            },
            lifes: function (lifes) {
                if (lifes <= 0) {
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
                    x: 495, y: 1057,
                    color: "black",
                    family: "Noteworthy-Light",
                    size: 50,
                    label: "x" + Q.state.get("bombs"),
                    align: "left"
                });

                Q.state.on("change.bombs", this, "bombs");
            },
            bombs: function (bombs) {
                if (bombs < 0) {
                    this.p.label = "x0";
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
                var juice = Q.state.get("time_juice");
                var height = 572 / MAX_TIME_JUICE * juice;
                ctx.drawImage(Q.asset(this.p.asset), 0, 572 - height, 32, height, 0, 572 - height, 32, height);
            }
        });
        Q.Sprite.extend("TimeIndicator", {
            init: function (p) {
                this._super(p, {
                    asset: "time_button.png",
                    cx: 0, cy: 0,
                    x: 530, y: 110,
                    opacity: 0.6,
                    gravity: 0,
                    collisionMask: Q.SPRITE_NONE
                });

                Q.state.on("change.time_juice", this, "time_juice");
            },
            time_juice: function (time_juice) {
                var active = (time_juice >= MAX_TIME_JUICE);
                this.p.opacity = active ? 1 : 0.6;
            }
        });
        Q.scene('infoUI', function (stage) {
            var background = stage.insert(new Q.Sprite({
                asset: "info.png",
                x: Q.width / 2, y: Q.height / 2,
            }));
            
            stage.insert(new Q.Score());
            stage.insert(new Q.Combo());
            stage.insert(new Q.Lifes());
            stage.insert(new Q.Bombs());
            stage.insert(new Q.TimeBar());
            stage.insert(new Q.TimeIndicator());
        });
    }


    { // ## Game Stage
        Q.Sprite.extend("Meteorite", {
            init: function (p) {
                this._super(p, {
                    sprite: "meteorite_anim",
                    sheet: p.color + "Meteorite",
                    gravity: 0,
                    type: Q.SPRITE_ENEMY,
                    collisionMask: Q.SPRITE_DEFAULT
                });

                this.add('2d, animation, tween');
                this.play('move');
                this.on("dead", this, "destroy");

                var slowed = Q.state.get("slowed_time");
                if (slowed) {
                    this.setRate(SLOWED_RATE);
                }
                this.animate({ x: this.p.x, y: 970 }, this.p.speed / 1000.0, Q.Easing.Linear, { callback: this.crash });
            },
            crash: function (dt) {
                this.stop();
                this.sheet("boomMeteorite", false);
                this.play("boom");

                Q.state.dec("lifes", 1);
                    // var audio = Math.round(Math.random() * 1 + 1);
                    // Q.audio.play("boom" + audio + ".ogg");
            },
            explode: function (dt) {
                this.stop();
                this.play("poof");

                // var audio = Math.round(Math.random() * 3 + 1);
                // Q.audio.play("pop" + audio+".ogg");
            }
        });
        Q.scene("game", function (stage) {
            function clear_meteorites(keystrokes) {
                var meteorites = Q("Meteorite", 1);

                var count = 0;
                if (keystrokes == 'bomb') {
                    count = meteorites.length;

                    meteorites.each(function () {
                        this.explode();
                    });
                }
                else {
                    meteorites.each(function () {
                        var keycombination = meteorite_types[this.p.color];
                        if (keystrokes == null || keycombination == keystrokes || keycombination == keystrokes.split("").reverse().join("")) {
                            this.explode();
                            count += 1;
                        }
                    });
                }

                var addedScore = 0;
                switch (keystrokes) {
                    case meteorite_types["yellow"]:
                        addedScore = 1 + count;
                        break;
                    case "bomb":
                    case meteorite_types["green"]:
                    case meteorite_types["orange"]:
                        addedScore = 2 + count * 2;
                        break;
                    case meteorite_types["red"]:
                        addedScore = 2 + count * 3;
                        break;
                    case meteorite_types["blue"]:
                    case meteorite_types["purple"]:
                        addedScore = 3 + count * 3;
                        break;
                }
                var multiplier = Q.state.get('multiplier');
                addedScore *= count * multiplier;

                Q.state.inc("score", addedScore);

                if (count > 1) {
                    Q.state.set("combo", count);
                }

                // If the time is currently not slowed and the user can potentially slow time                
                if (!Q.state.get("slowed_time") && Q.state.get("slowTime") > 0) {
                    Q.state.inc("time_juice", (count * 5));
                    
                    if (Q.state.get("time_juice") > MAX_TIME_JUICE) {
                        Q.state.set("time_juice", MAX_TIME_JUICE);
                    }
                }
            }

            var keystrokes = "000";
            function add_keystroke(keystroke) {
                if (stage.paused) {
                    return;
                }

                if (keystrokes[2] != keystroke) {
                    keystrokes = keystrokes.substring(1, 3) + keystroke;
                    clear_meteorites(keystrokes);
                }
            }

            let availableKeys = ["y", "u", "i", "h", "j", "k"];
            for (let index = 0; index < availableKeys.length; index += 1) {
                let key = availableKeys[index];
                Q.input.on(key, this, function () { add_keystroke(key); });
            }

            Q.input.on("bomb", this, function () {
                if (stage.paused) {
                    return;
                }

                var bombs = Q.state.get("bombs");
                if (bombs <= 0) {
                    return;
                }

                clear_meteorites('bomb');
                Q.state.dec("bombs", 1);
            });

            function setSlowed(slowed) {
                Q.state.set("slowed_time", slowed);
                Q("Meteorite", 1).each(function () {
                    this.setRate(slowed ? SLOWED_RATE : 1);
                });
            }            
            Q.input.on("slow_time", this, function () {
                if (stage.paused) {
                    return;
                }

                if (Q.state.get("time_juice") < MAX_TIME_JUICE) {
                    return;
                }

                setSlowed(true);
            });

            // Create the player and add them to the stage
            // var player = stage.insert(new Q.Mario());

            var timeForPoint = 1500;
            var meteoriteTimes = {
                "yellow": 1000 + randomNum(0, 500),
                "green": 3000 + randomNum(0, 600), 
                "orange": 6000 + randomNum(0, 800),
                "red": 10000 + randomNum(0, 1000), 
                "blue": 30000 + randomNum(0, 1000),
                "purple": 40000 + randomNum(0, 1000), 
            };
            var time = randomNum(500, 1500);

            stage.on('step', function (dt) {
                dt *= 1000;

                var score = Q.state.get('score');

                timeForPoint -= dt;
                if (timeForPoint <= 0) {
                    Q.state.inc("score", 1);
                    score += 1;

                    timeForPoint = ((Math.sqrt(score + 400.0) * 1.6 / ((score + 200.0) / 8.0)) + 0.1) * 1000;
                }

                for (key in meteoriteTimes) {
                    meteoriteTimes[key] -= dt;

                    if (meteoriteTimes[key] > 0) {
                        continue;
                    }

                    // Add meteorite of type 'key'
                    var newTime = null;
                    var speed = null;
                    switch (key) {
                        case "yellow":
                            newTime = ((Math.sqrt((score + 400) * 5.5) / ((score + 545) / 60)) + 0.15) * 1000;
                            speed = ((Math.sqrt((score + 400) * 6.5) / ((score + 950) / 97)) + 0.3) * 1000;
                            break;
                        case "green":
                        case "orange":
                            newTime = ((Math.sqrt((score + 700) * 5.0) / ((score + 800) / 78)) + 0.25) * 1000;
                            speed = ((Math.sqrt((score + 450) * 7.0) / ((score + 830) / 84)) + 0.4) * 1000;
                            break;
                        case "red":
                            newTime = ((Math.sqrt((score + 500) * 5.0) / ((score + 800) / 100)) + 0.3) * 1000;
                            speed = ((Math.sqrt((score + 520) * 8.0) / ((score + 1000) / 100)) + 0.5) * 1000;
                            break;
                        case "blue":
                        case "purple":
                            newTime = ((Math.sqrt((score + 400) * 5.0) / ((score + 800) / 120)) + 0.4) * 1000;
                            speed = ((Math.sqrt((score + 550) * 8.5) / ((score + 1200) / 120)) + 0.55) * 1000;
                            break;
                    }

                    meteoriteTimes[key] = newTime + randomNum(0, 2000);

                    var x = randomNum(70, 500);
                    var y = -(randomNum(70, 140));
                    // Add in a couple of enemies
                    stage.insert(new Q.Meteorite({ x: x, y: y, speed: speed, color: key }));
                }

                var slowed = Q.state.get("slowed_time");
                if (slowed) {
                    var slowTime = Q.state.get("slowTime");
                    var fragment = MAX_TIME_JUICE / slowTime;

                    Q.state.dec("time_juice", fragment * dt);

                    if (Q.state.get("time_juice") <= 0) {
                        Q.state.set("time_juice", 0);

                        setSlowed(false);
                    }
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
                    opacity: 0.8,
                    gravity: 0,
                    collisionMask: Q.SPRITE_NONE,
                    vx: -16
                });

                this.add('2d');
                Q.state.on("change.slowed_time", this, function (slowed_time) {
                    this.p.opacity = slowed_time ? 1 : 0.8;
                });
            },
            step: function (dt) {
                if (this.p.x <= -720) {
                    this.p.x = 720;
                }
            }
        });
        Q.Sprite.extend("OldBackground", {
            init: function (p) {
                this._super(p, {
                    asset: "old_background.png",
                    x: Q.width / 2, y: Q.height / 2,
                    opacity: 0
                });

                this.add('tween');
                Q.state.on("change.slowed_time", this, function (slowed_time) {
                    var newOpacity = slowed_time ? 0.6 : 0;
                    this.animate({ opacity: newOpacity }, 0.3);
                });
            }
        });
        Q.scene('background', function (stage) {
            var hour = new Date().getHours();
            if (hour >= 7 && hour < 19) {
                stage.insert(new Q.Sprite({
                    asset: "day_background.png",
                    x: Q.width / 2, y: Q.height / 2,
                }));
                stage.insert(new Q.Sun());
            }
            else {
                stage.insert(new Q.Sprite({
                    asset: "night_background.png",
                    x: Q.width / 2, y: Q.height / 2,
                }));
            }

            stage.insert(new Q.Clouds({ clouds_type: 1 }));
            stage.insert(new Q.Clouds({ clouds_type: 2 }));

            stage.insert(new Q.OldBackground());
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
        Q.Sprite.extend("ExperienceBar", {
            init: function (p) {
                this._super(p, {
                    asset: "experience_bar.png",
                    cx: 0, cy: 0,
                    x: 246, y: 476,
                    gravity: 0,
                    collisionMask: Q.SPRITE_NONE
                });
            },
            draw: function (ctx) {
                // override draw to show the correct level of time juice
                var percentage = this.p.percentage;
                var width = 330 / 100.0 * percentage;
                ctx.drawImage(Q.asset(this.p.asset), 0, 0, width, 38, 0, 0, width, 38);
            }
        });

        Q.scene('scoreStage', function (stage) {
            stage.insert(new Q.Sprite({
                asset: "score_screen.png",
                x: Q.width / 2, y: Q.height / 2,
            }));

            // Set buttons
            var restartButton = stage.insert(new Q.UI.Button({
                x: 165, y: 1030,
                sheet: 'restartButton',
                keyActionName: 'bomb'
            }))
            restartButton.on("click", function () {
                Q.clearStages();
                Q.stageScene('mainStage');
            });

            var exitButton = stage.insert(new Q.UI.Button({
                x: 475, y: 1030,
                sheet: 'exitButton'
            }))
            exitButton.on("click", function () {
                Q.clearStages();
                Q.stageScene('menuStage');
            });

            
            // Score and high score
            var score = Q.state.get('score');
            if (score == null) {
                score = 0;
            }

            stage.insert(new Q.NeonMeteorite());
            stage.insert(new Q.UI.Text({
                x: 320, y: 85,
                color: "#26F811",
                size: 130,
                family: "Neon80s",
                label: score.toString()
            }));

            var record = getCookie('record');
            if (record == null || score > parseInt(record)) {
                record = score;
                setCookie('record', record);
                stage.insert(new Q.NeonRecord());
            }
            stage.insert(new Q.UI.Text({
                x: 320, y: 309,
                size: 55,
                family: "Noteworthy-Light",
                align: "left",
                label: record.toString()
            }));
            
            var highScores = getCookie('high_scores');
            if (highScores == null) {
                highScores = "0|0|0|0|0"
                setCookie('high_scores', highScores);
            }
            highScores = highScores.split('|');

            for (var index = 0; index < highScores.length; index += 1) {
                var highScore = highScores[index];
                
                if (score >= parseInt(highScore)) {
                    highScores.splice(index, 0, score);
                    highScores.pop();
                    setCookie('high_scores', highScores.join('|'));
                    break;
                }
            }

            
            // Experience and level
            var exp = getCookie('experience');
            if (exp == null) {
                exp = 0;
            }
            else {
                exp = parseInt(exp);
            }
            exp += score;
            setCookie('experience', exp);

            var level = getLevelForExperience(exp);
            var levelData = levels[level - 1];
            var expPercentage = 100;
            if (level < 20) {
                var currentLevelExperience = 0;
                if (level > 1) {
                    currentLevelExperience = levels[level - 2]['experience'];
                }
                var nextLevelExperience = levelData['experience'];

                expPercentage = ((exp - currentLevelExperience) / nextLevelExperience) * 100;
            }

            var expBar = stage.insert(new Q.ExperienceBar({ percentage: expPercentage }));
            stage.insert(new Q.UI.Text({
                x: 155, y: 437,
                size: 55,
                family: "Noteworthy-Light",
                align: "left",
                label: level.toString()
            }));

            stage.insert(new Q.UI.Text({
                x: 550, y: 743,
                size: 45,
                family: "MarkerFeltThin",
                align: "right",
                label: (levelData['slowTime'] / 1000) + "s"
            }));

            stage.insert(new Q.UI.Text({
                x: 550, y: 802,
                size: 45,
                family: "MarkerFeltThin",
                align: "right",
                label: levelData['multiplier'] + "x"
            }));

            for (var life = 0; life < levelData['lifes']; life += 1) {
                stage.insert(new Q.Sprite({
                    asset: "life_icon.png",
                    x: 533 - (46 * life), y: 652,
                }));
            }
            for (var bomb = 0; bomb < levelData['bombs']; bomb += 1) {
                stage.insert(new Q.Sprite({
                    asset: "bomb_icon.png",
                    x: 533 - (48 * bomb), y: 716,
                }));
            }
        });
    }


    { // ## Leaderboards Stage
        Q.scene('leaderboardsStage', function (stage) {
            stage.insert(new Q.Sprite({
                asset: "leaderboard_background.png",
                x: Q.width / 2, y: Q.height / 2,
            }));
            var backButton = stage.insert(new Q.UI.Button({
                x: 70, y: 55,
                sheet: 'backButton'
            }))
            backButton.on("click", function () {
                Q.clearStages();
                Q.stageScene('menuStage');
            });

            var highScores = getCookie('high_scores');
            if (highScores == null) {
                highScores = [0, 0, 0, 0, 0];
            }
            else {
                highScores = highScores.split('|');
            }

            for (var index = 0; index < highScores.length; index++) {
                var score = highScores[index];

                stage.insert(new Q.UI.Text({
                    x: 130, y: 373+(index*129),
                    size: 70,
                    family: "ChalkboardSE-Regular",
                    align: "left",
                    color: "white",
                    outline: "black",
                    outlineWidth: 6,
                    label: (index+1)+". "+score
                }));
            }
        });
    }


       
    // ## Asset Loading and Game Launch
    // Q.load can be called at any time to load additional assets
    // assets that are already loaded will be skipped
    // The callback will be triggered when everything is loaded
    Q.load(["menu_background.png", "play_button.png", "play_button.json", "leaderboard_button.png", "leaderboard_button.json", "player_button.png", "player_button.json",
        "day_background.png", "night_background.png", "old_background.png", "sun.png", "clouds1.png", "clouds2.png",
        "info.png", "time_bar.png", "time_button.png",
        "pause_background.png", "resume_button.png", "resume_button.json", "music_button.png", "music_button.json",
        "restart_button.png", "restart_button.json", "exit_button.png", "exit_button.json",
        "score_screen.png", "life_icon.png", "bomb_icon.png", "experience_bar.png", "neon_meteorite.png", "neon_meteorite.json", "neon_record.png",
        "meteorites.png", "meteorites.json",
        "back_button.png", "back_button.json", "leaderboard_background.png",
        // "bigMBoom1.ogg", "bigMBoom2.ogg", "bigMHit1.ogg", "bigMHit2.ogg", "boom1.ogg", "boom2.ogg",
        // "menu.ogg", "music.ogg", "pause.ogg", "pop1.ogg", "pop2.ogg", "pop3.ogg", "pop4.ogg", "resume.ogg", "tink.ogg"
    ], function () {
        Q.compileSheets("play_button.png", "play_button.json");
        Q.compileSheets("leaderboard_button.png", "leaderboard_button.json");
        Q.compileSheets("player_button.png", "player_button.json");
        Q.compileSheets("restart_button.png", "restart_button.json");
        Q.compileSheets("exit_button.png", "exit_button.json");
        Q.compileSheets("back_button.png", "back_button.json");
        Q.compileSheets("resume_button.png", "resume_button.json");
        Q.compileSheets("music_button.png", "music_button.json");

        Q.compileSheets("meteorites.png", "meteorites.json");
        Q.compileSheets("neon_meteorite.png", "neon_meteorite.json");
        Q.sheet("neonRecord", "neon_record.png", { tilew: 300, tileh: 200, sx: 0, sy: 0, frames: 2 });

        var body = document.getElementsByTagName("body")[0];
        var loading = document.getElementById("loading");
        body.removeChild(loading);

        // Q.loadTMX("level.tmx", function () {
        // Finally, call stageScene to run the game
        Q.stageScene("menuStage");
        // Q.stageScene("leaderboardsStage");
        // }); 

        }, {
            progressCallback: function (loaded, total) {
                var element = document.getElementById("loading_progress");
                element.style.width = Math.floor(loaded / total * 100) + "%";
            }
        });

});