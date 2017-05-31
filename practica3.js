window.addEventListener("load", function () {

    // Set up an instance of the Quintus engine  and include
    // the Sprites, Scenes, Input and 2D module. The 2D module
    // includes the `TileLayer` class as well as the `2d` componet.
    var Q = window.Q = Quintus({ audioSupported: ['ogg', 'mp3'] })
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
        // Maximize this game to whatever the size of the browser is
        .setup({
            width: 320,
            height: 480
        })
        // And turn on default input controls and touch input (for UI)
        .controls().touch()
        .enableSound();
    
    Q.input.keyboardControls({
        ENTER: "start"
    });

    Q.animations("mario_anim", {
        run_right: { frames: [1, 2, 3], rate: 1 / 8 },
        run_left: { frames: [15, 16, 17], rate: 1 / 8 },
        stand_right: { frames: [0], rate: 1 / 5 },
        stand_left: { frames: [14], rate: 1 / 5 },
        jump_right: { frames: [4], rate: 1 / 5 },
        jump_left: { frames: [18], rate: 1 / 5 },
        die: { frames: [12], rate: 1 / 2, loop: false }
    });
    Q.animations("goomba_anim", {
        move: { frames: [0, 1], rate: 1 / 2 },
        die: { frames: [2, 3], rate: 1 / 2, loop: false, trigger: "dead" }
    });
    Q.animations("bloopa_anim", {
        move: { frames: [0, 1], rate: 1 / 2 },
        die: { frames: [2], rate: 1 / 2, loop: false, trigger: "dead" }
    });
    Q.animations("coin_anim", {
        move: { frames: [0, 1, 2], rate: 1 / 3 }
    });

    Q.scene("level1", function (stage) {
        Q.stageTMX("level.tmx", stage);

        Q.state.reset({ score: 0 });

        stage.add("viewport");
        stage.centerOn(150, 380);
        stage.viewport.offsetX = -120;
        stage.viewport.offsetY = 160;

        Q.stageScene('scoreUI');

        // Create the player and add them to the stage
        var player = stage.insert(new Q.Mario());

        // Add in a couple of enemies
        stage.insert(new Q.Goomba({ x: 450, y: 500, vx: -100 }));
        stage.insert(new Q.Goomba({ x: 1500, y: 450 }));
        stage.insert(new Q.Goomba({ x: 1700, y: 450 }));

        stage.insert(new Q.Bloopa({ x: 700, y: 450 }));
        stage.insert(new Q.Bloopa({ x: 800, y: 450 }));
        stage.insert(new Q.Bloopa({ x: 1410, y: 450 }));

        stage.insert(new Q.Coin({ x: 300, y: 450 }));
        stage.insert(new Q.Coin({ x: 400, y: 450 }));
        stage.insert(new Q.Coin({ x: 500, y: 450 }));
        stage.insert(new Q.Coin({ x: 1250, y: 440 }));
        stage.insert(new Q.Coin({ x: 1330, y: 420 }));
        stage.insert(new Q.Coin({ x: 1500, y: 420 }));

        stage.insert(new Q.Princess({ x: 1900, y: 350 }));

        // Give the stage a moveable viewport and tell it
        // to follow the player.
        stage.add("viewport").follow(player);
    });

    // ## Mario Sprite
    // The very basic player sprite, this is just a normal sprite
    // using the player sprite sheet with default controls added to it.
    Q.Sprite.extend("Mario", {

        // the init constructor is called on creation
        init: function (p) {

            // You can call the parent's constructor with this._super(..)
            this._super(p, {
                sprite: "mario_anim",  // Setting a sprite sheet sets sprite width and height
                sheet: "marioR",  // Setting a sprite sheet sets sprite width and height
                x: 150,           // You can also set additional properties that can
                y: 380,             // be overridden on object creation
                jumpSpeed: -400,    // Jump more
                type: Q.SPRITE_DEFAULT,
                collisionMask: Q.SPRITE_ENEMY | Q.SPRITE_DEFAULT
            });

            // Add in pre-made components to get up and running quickly
            // The `2d` component adds in default 2d collision detection
            // and kinetics (velocity, gravity)
            // The `platformerControls` makes the player controllable by the
            // default input actions (left, right to move,  up or action to jump)
            // It also checks to make sure the player is on a horizontal surface before
            // letting them jump.
            this.add('2d, platformerControls, animation');
        },

        step: function (dt) {
            if (this.p.y > 700) {
                this.gameOver();
            }
            else if (this.p.vy < 0) {
                this.play("jump_" + this.p.direction);
            }
            else if (this.p.vx > 0) {
                this.play("run_right");
            }
            else if (this.p.vx < 0) {
                this.play("run_left");
            }
            else {
                this.play("stand_" + this.p.direction);
            }
        },

        gameOver: function (dt) {
            this.play("die", 10);
            Q.stage().pause();
            Q.stageScene("endGame", 1, { label: "Game Over" });
            Q.audio.stop("music_main.ogg");
            Q.audio.play("music_die.ogg");
        }

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
    Q.Sprite.extend("Goomba", {
        init: function (p) {
            this._super(p, {
                sprite: "goomba_anim",
                sheet: 'goomba',
                vx: 100,
                type: Q.SPRITE_ENEMY,
                collisionMask: Q.SPRITE_DEFAULT
            });

            // Enemies use the Bounce AI to change direction 
            // whenver they run into something.
            this.add('2d, aiBounce, animation, defaultEnemy');
        }
    });

    // ## Enemy Sprite
    // Create the Enemy class to add in some baddies
    Q.Sprite.extend("Bloopa", {
        init: function (p) {
            this._super(p, {
                sprite: 'bloopa_anim',
                sheet: 'bloopa',
                gravity: 0.2,
                type: Q.SPRITE_ENEMY,
                collisionMask: Q.SPRITE_DEFAULT
            });

            this.goingDown = true;

            // Enemies use the Bounce AI to change direction 
            // whenver they run into something.
            this.add('2d, aiBounce, animation, defaultEnemy');
        },

        step: function (dt) {
            if (this.p.vy == 0 && this.goingDown) {
                this.goingDown = false;
                this.p.vy = -150;
            }
            else if (this.p.vy > 0) {
                this.goingDown = true;
            }
        }
    });

    // ## Enemy Sprite
    // Create the Enemy class to add in some baddies
    Q.Sprite.extend("Princess", {
        init: function (p) {
            this._super(p, {
                sheet: 'princess',
                type: Q.SPRITE_DEFAULT,
                collisionMask: Q.SPRITE_DEFAULT
            });

            // Enemies use the Bounce AI to change direction 
            // whenver they run into something.
            this.add('2d');

            this.on("hit", function (collision) {
                if (collision.obj.isA("Mario")) {
                    Q.stage().pause();
                    Q.audio.stop("music_main.ogg");
                    Q.audio.play("music_level_complete.ogg");
                    Q.stageScene("endGame", 1, { label: "Mario wins" });
                }
            });
        }
    });


    // ## Enemy Sprite
    // Create the Enemy class to add in some baddies
    Q.Sprite.extend("Coin", {
        init: function (p) {
            this._super(p, {
                sprite: "coin_anim",
                sheet: 'coin',
                gravity: 0,
                type: Q.SPRITE_PARTICLE,
                sensor: true
            });

            // Enemies use the Bounce AI to change direction 
            // whenver they run into something.
            this.add('2d, animation, tween');
            this.play('move');
            this.on("dead", this, "destroy");

            this.on("sensor");
        },

        // When a dot is hit..
        sensor: function () {
            Q.state.inc("score", 1);
            this.animate({ x: this.p.x, y: this.p.y - 80 }, 0.3, Q.Easing.Quadratic.Linear, { callback: function () { this.destroy(); } })
            this.off("sensor");
            Q.audio.play("coin.ogg");
        }
    });


    // To display a game over / game won popup box, 
    // create a endGame scene that takes in a `label` option
    // to control the displayed message.
    Q.scene('mainMenu', function (stage) {
        Q.audio.stop();
        Q.audio.play("music_main.ogg", { loop: true });

        var button = stage.insert(new Q.UI.Button({
            x: Q.width / 2, y: Q.height / 2, 
            asset: 'mainTitle.png'
        }))

        var start = function () {
            Q.clearStages();
            Q.stageScene('level1');
            Q.input.off("start");
        };

        // When the button is clicked or enter pressed, clear all the stages
        // and restart the game.
        button.on("click", start);
        Q.input.on("start", this, start);
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

    // To display a game over / game won popup box, 
    // create a endGame scene that takes in a `label` option
    // to control the displayed message.
    Q.scene('endGame', function (stage) {
        var container = stage.insert(new Q.UI.Container({
            x: Q.width / 2, y: Q.height / 2, fill: "rgba(0,0,0,0.5)"
        }));

        var button = container.insert(new Q.UI.Button({
            x: 0, y: 0, fill: "#CCCCCC",
            label: "Play Again"
        }))
        var label = container.insert(new Q.UI.Text({
            x: 10, y: -10 - button.p.h,
            label: stage.options.label
        }));
        // When the button is clicked, clear all the stages
        // and restart the game.
        button.on("click", function () {
            Q.clearStages();
            Q.stageScene('mainMenu');
        });

        // Expand the container to visibily fit it's contents
        // (with a padding of 20 pixels)
        container.fit(20);
    });


       
    // ## Asset Loading and Game Launch
    // Q.load can be called at any time to load additional assets
    // assets that are already loaded will be skipped
    // The callback will be triggered when everything is loaded
    Q.load(["mario_small.png", "mario_small.json", "goomba.png", "goomba.json", "bloopa.png", "bloopa.json", "coin.png", "coin.json", "princess.png", "mainTitle.png",
        "coin.ogg", "music_die.ogg", "music_main.ogg", "music_level_complete.ogg", "kill_enemy.ogg",
        "coin.mp3", "music_die.mp3", "music_main.mp3", "music_level_complete.mp3", "kill_enemy.mp3"], function () {
        // Sprites sheets can be created manually
        Q.sheet("princess", "princess.png", { tilew: 30, tileh: 48 });

        // Or from a .json asset that defines sprite locations
        Q.compileSheets("mario_small.png", "mario_small.json");
        Q.compileSheets("goomba.png", "goomba.json");
        Q.compileSheets("bloopa.png", "bloopa.json");
        Q.compileSheets("coin.png", "coin.json");

        Q.loadTMX("level.tmx", function () {
            // Finally, call stageScene to run the game
            Q.stageScene("mainMenu");
        }); 
    });

});