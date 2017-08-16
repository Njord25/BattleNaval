// ----- CONSTANTS ----- //
GAME_SIZE = 10; // El tamaño predeterminado del juego es 10
// Código de la tabla
EMPTY = 0; // 0 = Agua (vacía)
SHIP = 1; // 1 = Barco intacto
MISS = 2; // 2 = Agua con una bala de cañón en ella (tiro perdido)
HIT = 3; // 3 = Barco dañado
SUNK = 4; // 4 = Barco hundido

// Constantes de los jugadores
FRIENDLY = 0;
ENEMY = 1;

// Información del barco
ALLSHIPS = [{"name": "carrier", "length": 5 },
            {"name": "battleship", "length": 4 },
            {"name": "cruiser", "length": 3 },
            {"name": "destroyer", "length": 3 },
            {"name": "frigate", "length": 2 }];

// orientacion de los barcos
HORIZONTAL = 0;
VERTICAL = 1;


// GLOBAL
var currentGame;

// Configura el botón de inicio del juego
function startGame (e) {
    var startButton = document.getElementById("start-game");
    startButton.style.visibility = "hidden";
    if(currentGame == null) {
        currentGame = new Game(GAME_SIZE);  
    } else if(!currentGame.gameOver) {
        alert("Don't quit now! Finish the game you have already started!");
    }
}

var startButton = document.getElementById("start-game");
startButton.self = this;
startButton.addEventListener("click", startGame);

// Establece mensaje de instrucción
function setMessage(msg) {
    document.getElementById("message").innerText = msg;
}

Game.prototype.checkForWin = function() {
    if(this.enemyFleet.allShipsSunk()) {
        alert("Felicidades, has ganado! (Refresca de nuevo el sitio!)!");
        setMessage("");
        this.gameOver = true;

    } else if (this.friendlyFleet.allShipsSunk()) {
        alert("Has perdido, mala suerte !!");
        setMessage("Actualizar página para iniciar un nuevo juego!. (Refresca de nuevo el sitio!)");
        this.gameOver = true;
    }
}