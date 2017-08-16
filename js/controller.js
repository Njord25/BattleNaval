GameBoard.prototype.init = function() {
    // Crea la matriz para almacenar la información del barco
    for(var i = 0; i < this.size; i++) {
        this.grid[i] = [];
        for(var j = 0; j < this.size; j++) {
            this.grid[i][j] = 0;
        }
    }

    // Crea en los elementos (ship) html de la cuadrícula
    var currentBoardDiv;
    if(this.player == FRIENDLY) {
        currentBoardDiv = document.querySelector(".gameboard");
    } else if (this.player == ENEMY) {
        currentBoardDiv = document.querySelectorAll(".gameboard")[1];
    }

    for (var i = 0; i < this.size; i++) {
        for (var j = 0; j < this.size; j++) {
            var el = document.createElement("div");
            el.setAttribute("data-x", i);
            el.setAttribute("data-y", j);
            el.setAttribute("class", "gameboard-cell gameboard-cell-" + i + "-" + j);

            currentBoardDiv.appendChild(el);    
        }
    }
}


GameBoard.prototype.updateCell = function(x, y, type, targetPlayer) {
    if(targetPlayer == FRIENDLY) {
        var player = "friendly";
    } else {
        var player = "enemy";
    }
    switch (type) {
        case EMPTY:
            this.grid[x][y] = EMPTY;
            var cssType = "empty";
            break;
        case SHIP:
            this.grid[x][y] = SHIP;
            var cssType = "ship";
            break;
        case HIT:
            this.grid[x][y] = HIT;
            var cssType = "hit";
            if(targetPlayer == ENEMY) {
                setMessage("¡Bien, has impactado a un Barco!");
            }
            break;
        case SUNK:
            this.grid[x][y] = SUNK;
            var cssType = "sunk";
            if(targetPlayer == ENEMY) {
                setMessage("¡Woohoo, has hundido esa nave!");
            }
            break;
        case MISS:
        this.grid[x][y] = MISS;
            var cssType = "miss";
            if(targetPlayer == ENEMY) {
                setMessage("Disparo Pedido Sigue Intentando!");
            }
            break;
        default:
            this.grid[x][y] = EMPTY;
            var cssType = "empty";
            break;
    }
    var newClass = " grid-" + cssType;
    var cell = document.querySelector(".gameboard." + player + " .gameboard-cell-" + x + "-" + y);

    if(cell.className.match("grid-ship")) {
        cell.classList.remove("grid-ship");
    }
    cell.className+= newClass;    
}