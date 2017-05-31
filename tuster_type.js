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
        ENTER: "start"
    });

    Q.animations("meteorite_anim", {
        move: { frames: [0, 1, 2], rate: 1 / 5 },
        die: { frames: [3, 4, 5], rate: 1 / 4, loop: false, trigger: "dead" }
    });

    Q.scene("main_game", function (stage) {
        // Q.stageTMX("level.tmx", stage);

        Q.state.reset({ score: 0 });

        stage.add("viewport");
        // stage.centerOn(150, 380);
        // stage.viewport.offsetX = -120;
        // stage.viewport.offsetY = 160;

        // Q.stageScene('scoreUI');
        // Q.stageScene('background');
        Q.stageScene('infoUI');

        // Create the player and add them to the stage
        // var player = stage.insert(new Q.Mario());

        // Add in a couple of enemies
        stage.insert(new Q.Meteorite({ x: 0, y: 50 }));
        stage.insert(new Q.Meteorite({ x: 250, y: 250 }));
        stage.insert(new Q.Meteorite({ x: 250, y: 500 }));
        stage.insert(new Q.Meteorite({ x: 500, y: 500 }));
    });


    // ## Enemy Sprite
    // Create the Enemy class to add in some baddies
    Q.Sprite.extend("Meteorite", {
        init: function (p) {
            this._super(p, {
                sprite: "meteorite_anim",
                sheet: 'blueMeteorite',
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
    }, { stage: 1 });

    // ## Enemy Sprite
    // Create the Enemy class to add in some baddies
    Q.Sprite.extend("Background", {
        init: function (p) {
            this._super(p, {
                asset: "day_background.png",
                x: Q.width / 2, y: Q.height / 2, 
            });
        }
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
            Q.stageScene("main_game");
        // }); 
    });

});