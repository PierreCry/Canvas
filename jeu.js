var stats = new Phaser.Game(1356, 95, Phaser.Canvas, 'phaser-example-2', { preload: preloadStats, create: createStats });
var game = new Phaser.Game(1356, 900, Phaser.Canvas, 'phaser-example', { preload: preloadGame, create: create, update: update });


var gameImages = ['bas', 'haut', 'gauche', 'droite', 'baie', 'batterie', 'cactus', 'eau', 'rocher', 'panneau', 'map', 'base', 'rejouer'];
var statsImages = ['drink_bar', 'eat_bar', 'energy_bar', 'batterie', 'panneau'];

function preloadGame() {

    for (var i = 0; i < gameImages.length; i++) {
        console.log(gameImages[i]);
        loadImages(game, gameImages[i]);
    }


}

function preloadStats() {
    for (var i = 0; i < gameImages.length; i++) {
        loadImages(stats, statsImages[i]);
    }

}

function loadImages(game, Simage) {
    game.load.image(Simage, 'Graphics/' + Simage + '.png');
}
var i=0;
var player;
var objectsGroup;
var kb;

var timerStats;

var playerSpeed = 250;

var eatbar;
var drinkbar;
var energybar;

var maxLenBar = 500;

var day = 121;
var timerGame;
var generatedItem;

var txtDays;
var items = ["baie", "batterie", "eau", "panneau"];

var restartButton;
var flagRestartButton = false;

var totalEnergy = 0;
var food;
var water;
var energy;
var nbBatteries = 0;
var txtNbBatteries;

function createStats() {

    stats.stage.backgroundColor = "#eee";


    stats.add.sprite(stats.width - 75, stats.height / 2, 'batterie');
    stats.add.sprite(stats.width - 50, stats.height / 2, 'panneau');


    eatbar = stats.add.sprite(0, 0, 'eat_bar');
    drinkbar = stats.add.sprite(0, 30, 'drink_bar');
    energybar = stats.add.sprite(0, 60, 'energy_bar');

    eatbar.cropEnabled = true;
    drinkbar.cropEnabled = true;
    energybar.cropEnabled = true;

    timerStats = stats.time.create(false);

    timerStats.loop(600, updateDay, this);
    timerStats.loop(1, update_eatbar, this);
    timerStats.loop(1, update_drinkbar, this);
    timerStats.loop(1, update_energybar, this);

    timerStats.start();

    var style = { font: "16px Arial", fill: "BLACK" };

    txtDays = stats.add.text(stats.width / 2, 16, "JOURS RESTANTS : " + day, style);
    food = stats.add.text(5, 4, "Nourriture", style);
    water = stats.add.text(5, 33, "Eau", style);
    energy = stats.add.text(5, 62, "Energie", style);
    txtNbBatteries = stats.add.text(stats.width - 30, stats.height / 2, "x " + nbBatteries, style);

}

function create() {

    game.world.scale.setTo(1.5, 1.5);

    game.add.tileSprite(0, 0, game.width, game.height, "map");

    kb = game.input.keyboard.createCursorKeys();

    game.physics.startSystem(Phaser.Physics.ARCADE);


    player = game.add.sprite(game.width / 2, game.height / 2 + 50, 'bas');

    game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

    game.physics.enable(player);

    objectsGroup = game.add.physicsGroup();

    generatedItem = generateRandomItems(300);

    generateSameItem('cactus', 50);
    generateSameItem('rocher', 30);

    timerGame = game.time.create(false);
    timerGame.loop(game.rnd.between(500, 1500), showObjet, this);
    timerGame.start();


    var base = objectsGroup.create(650, 300, 'base');
    base.id = "base";
    base.body.immovable = true;

    kb = game.input.keyboard.createCursorKeys();

}

function showObjet() {
    i++;
    console.log(i);
    var obj = generatedItem.shift();
    var c = objectsGroup.create(obj[0], obj[1], obj.id);
    c.id = obj.id;
    c.body.immovable = true;
}


function randomInRange(start, end) {
    return Math.floor(Math.random() * (end - start + 1) + start);
}


function generateRandomItems(n) {
    var arr = [];

    for (var i = 0; i < n; i++) {
        arr.push([randomInRange(200, game.width-200), randomInRange(100, game.height-100)]);
    }


    var unique = arr.map(cur => JSON.stringify(cur))
        .filter(function (curr, index, self) {
            return self.indexOf(curr) == index;
        })
        .map(cur => JSON.parse(cur));

    for (var i = 0; i < unique.length; i++) {
        var x = unique[i][0];
        var y = unique[i][1];
        if (x < 730 && x > 650 && y > 300 && y < 380) {
            unique.splice(i, 1);
        } else {
            unique[i].id = items[randomInRange(0, items.length)];
        }
    }

    return unique;
}

function generateSameItem(itemID, n) {
    for (var i = 0; i < n; i++) {
        var c = objectsGroup.create(randomInRange(0, game.width), randomInRange(0, game.height), itemID);
        c.id = itemID;
        c.body.immovable = true;
    }
}


function checkIfAlive() {
    if (eatbar.width <= 0 || energybar.width <= 0 || drinkbar.width <= 0) {
        gameOver("LOSE");
    }
}

function update() {

    checkIfAlive();
    game.physics.arcade.collide(player, objectsGroup, collisionHandler, processHandler, this)

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (kb.left.isDown) {
        player.body.velocity.x = -playerSpeed;
        player.loadTexture("gauche", 0, false)
    }
    else if (kb.right.isDown) {
        player.body.velocity.x = playerSpeed;
        player.loadTexture("droite", 0, false)
    }

    if (kb.up.isDown) {
        player.body.velocity.y = -playerSpeed;
        player.loadTexture("haut", 0, false)
    }
    else if (kb.down.isDown) {
        player.body.velocity.y = playerSpeed;
        player.loadTexture("bas", 0, false)
    }

    game.world.wrap(player, 0, true);


}

function processHandler(player, veg) {
    return true;
}

function collisionHandler(player, veg) {
    switch (veg.id) {
        case "baie":
            eatbar.width = (eatbar.width + 50 > maxLenBar) ? maxLenBar : eatbar.width + 50;
            veg.kill();
            break;
        case "panneau":
        case "batterie":
            totalEnergy += 50;
            nbBatteries++;
            txtNbBatteries.text = "x " + nbBatteries;
            veg.kill();
            break;

        case "eau":
            drinkbar.width = (drinkbar.width + 50 > maxLenBar) ? maxLenBar : drinkbar.width + 50;
            veg.kill();
            break;

        case "base":
            energybar.width = (energybar.width + totalEnergy > maxLenBar) ? maxLenBar : energybar.width + totalEnergy;
            totalEnergy = 0;
            nbBatteries = 0;
            txtNbBatteries.text = "x " + nbBatteries;
    }
}



function update_drinkbar() { 
    drinkbar.width -= 0.25;
}

function update_eatbar() {
    eatbar.width -= 0.20;;
}

function update_energybar() {
    energybar.width -= 0.25;;
}

function randomnbr(a, b, n) {
    return (Math.random() * ((a / 10) - (b / 10)) + (b / 10)).toFixed(n);
}

function updateDay() {
    if (day !== 0) {
        day--;
        txtDays.text = "JOURS RESTANTS : " + day;
    } else {
        gameOver("WIN");
    }
}

function restartGame() {
    day = 121;
    flagRestartButton = false;
    totalEnergy = 0;
    nbBatteries = 0;
    restartButton.destroy();
    game.state.restart();
    stats.state.restart();
}

function gameOver(result) {
    var message;
    var textX;
    var textY;

    game.world.scale.setTo(1, 1);

    if (result === "WIN") {
        message = "FELICITATIONS !";

        player.x = game.width / 2;
        player.y = game.height / 2;

        textX = game.width / 3;
        textY = game.height / 2 - 30;
    } else if (result === "LOSE") {
        message = "VOUS ETES MORT";

        textX = game.width / 3;
        textY = game.height / 2 - 30;
    }

    var fontSize = 72;
    var style = { font: fontSize + "px Arial", fill: "BLACK", align: "center" };

    game.add.text(textX, textY, message, style);

    if (!flagRestartButton) {
        restartButton = game.add.button(game.world.centerX - 95, game.world.centerY + 50, 'rejouer', restartGame, this);
        flagRestartButton = true;
        console.log(restartButton);
    }

    timerStats.stop();
    timerGame.stop();

    game.physics.arcade.isPaused = true;
    stats.physics.arcade.isPaused = true;

}