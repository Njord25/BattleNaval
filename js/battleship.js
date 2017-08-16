// ----- Juego ----- //

function Game(GAME_SIZE) {
    this.gameSize = GAME_SIZE;
    this.init();
    this.gameOver = false;
}

Game.prototype.init = function() {
    this.friendlyBoard = new GameBoard(GAME_SIZE, FRIENDLY);
    this.enemyBoard = new GameBoard(GAME_SIZE, ENEMY);
    this.friendlyFleet = new Fleet(this.friendlyBoard);
    this.enemyFleet = new Fleet(this.enemyBoard);
    setMessage("¡El juego está listo! Dispara a la flota enemiga !..")

    //Inicializa el bot
    this.bot = new Bot(this);

    // Agrega click listener para disparos en todas las celdas enemigas
    var enemyCells = document.querySelector(".enemy").childNodes;
    for (var j = 0; j < enemyCells.length; j++) {
        enemyCells[j].self = this;
        enemyCells[j].addEventListener("click", this.shootListener);
    }
}


Game.prototype.shootListener = function(e) {
    var self = e.target.self;
    var cell_x = parseInt(e.target.getAttribute("data-x"));
    var cell_y = parseInt(e.target.getAttribute("data-y"));

    self.shoot(cell_x, cell_y, ENEMY);

    if(!Game.gameOver) {
        self.bot.guessShot();
    }
}


Game.prototype.shoot = function(x, y, targetPlayer) {
    var targetBoard;
    var targetFleet;
    if(targetPlayer == ENEMY) {
        targetBoard = this.enemyBoard;
        targetFleet = this.enemyFleet;
    } else {
        targetBoard = this.friendlyBoard;
        targetFleet = this.friendlyFleet;
    }

    if((targetBoard.grid[x][y] == MISS) || 
        (targetBoard.grid[x][y] == HIT) ||
        (targetBoard.grid[x][y] == SUNK)) {
        return null; 

    } else if(targetBoard.grid[x][y] == SHIP){
        targetBoard.updateCell(x, y, HIT, targetPlayer);
        targetFleet.findShipByCoords(x, y).takesHit();
        // Return hit info to bot
        if(targetPlayer == FRIENDLY) {
            if(this.bot.followShip) {
                
            } else {
                this.bot.followShip = true;
                this.bot.huntingShots = 0;
            }
            this.bot.prevX = x;
            this.bot.prevY = y;
            
        }
    } else {
        if(targetPlayer == FRIENDLY) {
            if(this.bot.followShip) {
                this.bot.huntingShots++;
            }
        }
        targetBoard.updateCell(x, y, MISS, targetPlayer);
    }
}


// ----- Tabla del juego----- //
function GameBoard(GAME_SIZE, player) {
    this.player = player;
    this.size = GAME_SIZE;
    this.grid = [];
    this.init();
}

GameBoard.prototype.placeShip = function(ship) {
    var x = ship.startingX;
    var y = ship.startingY;
    for(var i = 0; i < ship.length; i ++) {
        this.grid[x][y] = SHIP;
        if (this.player == FRIENDLY) {
            this.updateCell(x, y, SHIP, FRIENDLY);
        }
        if(ship.orientation == VERTICAL) {
            x++;
        } else {
            y++;
        }
    }
}


// ----- Barcos ----- //


function Ship(name, fleet, length) {
    this.name = name;
    this.length = length;
    this.startingX;
    this.startingY; 
    this.orientation = HORIZONTAL;
    this.damage = 0;

    this.board = fleet.board;
    this.maxDamage = this.length;
    this.sunk = false;
}

Ship.prototype.goodPlacement = function(x, y, orientation) {
    // Comprueba si el barco está dentro de la rejilla 
    if(orientation == VERTICAL) {
        if((x + this.length) > GAME_SIZE) {
            return false;
        } else {
            for(var i = 0; i < this.length; i++) {
                if(this.board.grid[x+i][y] != EMPTY) {
                    return false;
                }
            }
        }
    } else {
        if((y + this.length) > GAME_SIZE) {
            return false;
        } else {
            for(var i = 0; i < this.length; i++) {
                if(this.board.grid[x][y+i] != EMPTY) {
                    return false;
                }
            }
        }
    }
    return true;
}

Ship.prototype.takesHit = function(){
    this.damage ++;
    if(this.damage >= this.maxDamage) {
        this.sunk = true;
        currentGame.bot.followShip = false;

        var x = this.startingX;
        var y = this.startingY;

        for(var i=0; i < this.length; i++) {
            this.board.updateCell(x, y, SUNK, this.board.player);
            if(this.orientation == VERTICAL) {
                x++;
            } else {
                y++;
            }
        }
        currentGame.checkForWin();
    }
}
// ---- Flota o Armada ----- //


function Fleet(board) {
    this.board = board;
    this.player = board.player;
    this.numShips = ALLSHIPS.length;
    this.ships = [];
    this.init();
}

Fleet.prototype.init = function() {
    for(var i = 0; i < this.numShips; i++) {
        this.ships[i] = new Ship(ALLSHIPS[i].name, this, ALLSHIPS[i].length);
    }
    this.randomPlacement();
}

Fleet.prototype.allShipsSunk = function () {
    for(var i = 0; i < this.ships.length; i++) {
        if(this.ships[i].sunk == false) {
            return false;
        }
    }
    return true;
}

Fleet.prototype.randomPlacement = function() {
    for(var i = 0; i < this.ships.length; i++) {
        var badPlacement = true;
        while(badPlacement) {
            var randX = Math.floor(Math.random()*GAME_SIZE);
            var randY = Math.floor(Math.random()*GAME_SIZE);
            var randOrient = Math.floor(Math.random() *2);
            if(this.ships[i].goodPlacement(randX, randY, randOrient)) {
                this.ships[i].startingX = randX;
                this.ships[i].startingY = randY;
                this.ships[i].orientation = randOrient;
                this.board.placeShip(this.ships[i]);
                badPlacement = false;
            } else {
                continue;
            }
        }
    }
}

Fleet.prototype.findShipByCoords = function(x, y) {
    for (var i = 0; i < this.ships.length; i++) {
        var currShip = this.ships[i];
        if (currShip.orientation == VERTICAL) {
            if (y == currShip.startingY &&
                x >= currShip.startingX &&
                x < currShip.startingX + currShip.length) {
                return currShip;
            } else {
                continue;
            }
        } else {
            if (x == currShip.startingX &&
                y >= currShip.startingY &&
                y < currShip.startingY + currShip.length) {
                return currShip;
            } else {
                continue;
            }
        }
    }
    return null;
}
// ------ Bot AI ----- //
function Bot(game) {
    this.followShip = false;
    this.player = ENEMY;
    this.game = game;

}
Bot.prototype.init = function() {

}
// Comprueba si la dirección de la caza todavía está en el tablero
// Necesitamos decirle al bot que deje de cazar 
Bot.prototype.guessShot = function() {
    var x, y;
    if(this.followShip) {
        if (this.huntingShots == 0) {
            this.direction = 'N';
            x = this.prevX-1;
            y = this.prevY;
        } else  if (this.huntingShots == 1) {
            this.direction = 'W';
            x = this.prevX;
            y = this.prevY-1;
        } else if (this.huntingShots == 2) {
            this.direction = 'S';
            x = this.prevX+1;
            y = this.prevY;
        } else {
            this.direction = 'E';
            x = this.prevX;
            y = this.prevY+1;
        }

    } else {
        x = Math.floor(Math.random() * GAME_SIZE);
        y = Math.floor(Math.random() * GAME_SIZE); 
    }
    this.game.shoot(x, y, FRIENDLY);
}

Bot.prototype.goHunting = function() {
    
}

