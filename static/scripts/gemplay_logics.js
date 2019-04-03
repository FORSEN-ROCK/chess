/**
*   This script adds base game logics for html chess
*/

(function(){
    $("#start").on("click", startGame);
    //$(".figure").on("mousedown", gameControl);
    
})();

function startGame() {
    /**
    *  This function begins new geme
    *  @param {nothing}
    *  @return {noting}
    */

    document.gamers = [
        new Gamer("white"),
        new Gamer("black")
    ]

    document.gameArea = transformCellToAreal();

    document.gamers.map(function(gamer) {
        createFigureForGamer(gamer, document.gameArea)
    });
};

function createFigureForGamer(gamer, chessArea) {
    /**
    *  This function creates figures for a player
    *  @param {oblect} gamer
    *  @return {nothing} 
    */

    var TOTAL_PAWN = 8;
    var TOTAL_ROOK = 2;
    var TOTAL_HORSE = 2;
    var TOTAL_ELEPHANT = 2;

    var gamerSide = 0;
    var pawnRow = 1;

    if(gamer.color == 'black') {
        gamerSide = 7;
        pawnRow = 6;
    }

    // Create pawns
    for(var cell = 0; cell < chessArea[pawnRow].length; cell++) {
        var itemFigure = new Pawn(gamer.gamerId, chessArea[pawnRow][cell], gamer.color);
        gamer.figures.push(itemFigure);
        itemFigure.show($("#" + chessArea[pawnRow][cell].number));
    }

    // Create rooks
    for(var itemNum = 0; itemNum < TOTAL_ROOK; itemNum++) {
    }

    // Create horses
    for(var itemNum = 0; itemNum < TOTAL_HORSE; itemNum++) {
    }

    // Create elepants
    for(var itemNum = 0; itemNum < TOTAL_ELEPHANT; itemNum++) {
    }
    
    // Create queen
    // Create king
};

function gameControl(event) {
    /**
    *  This function process user actions
    *  @param {event-object} event is standart js object for action
    *  @return {nothing}
    */
    var figure = transformToFigure($(event.target));
    console.log(figure);
};

// This function creates game area
function transformCellToAreal() {
    /**
    *  This function find all html cell and transforms to js-objects
    *  and build chess area
    *  @param {nothing}
    *  @return {array} chessArea 
    */

    var rows = $(".chess-row");
    var chessArea = [];
    var cellNumber = 0;

    for(var row = rows.length - 1; row >= 0; row--) {
        var itemRow = [];
        var cells = $(rows[row]).children();

        //script goes from 7 to 0 but in fact
        //row number 7 is row number 0 on user display 
        var rowIndex = 7 - row;

        for(var cell = 0; cell < cells.length; cell++) {
            $(cells[cell]).attr("id", cellNumber);
            itemRow.push(new Cell(rowIndex, cell, cellNumber));
            cellNumber++;
        }

        chessArea.push(itemRow);
    }

    return chessArea;
};

/*
function transformToFigure($figure) {
    /**
    *  This function transforms jq-object to js-object
    *  @param {jq-object} $figure is source jq-object
    *  @return {js-object} figure
    */
/*
    var className = $figure.attr("class");

    className = className.split(" ")[1];
    className = className.split("-")[0];
    console.log(className);

    switch(className) {
        case "pawn" :
            figure = new Pawn();
            break;
        case "rook":
            figure = new Rook();
            break;
        case "horse":
            figure = new Horse();
            break;
        case "elephant":
            figure = new Elephant();
            break;
        case "queen":
            figure = new Queen();
            break;
        case "king":
            figure = new King();
            break;
        default:
            figure = null;
    }

    return figure;
};*/

// This function is constructor for gamer

function Gamer(color) {
    this.gamerId = Math.floor(Math.random()*10000);
    this._countMove = 0;
    this.color = color;
    this.figures = [];

    this.getCountMove = function() {
        return this._countMove;
    };

    this.move = function() {
        this._countMove++;
        return this._countMove;
    };
}

// This function is constructor for cell of area

var NAME_OF_COLUMN = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function Cell(row, column, absnumber) {
    this.row = row;
    this.column = column;
    this.isEmpty = true;
    //this._isAvailable = true;
    this.number = absnumber;

    this.rowChess = function() {
        return this.row + 1;
    };

    this.columnChess = function() {
        return NAME_OF_COLUMN[this.column];
    };

    this.changeEmpty = function() {
        if(this._isEmpty)
            this._isEmpty = false;
        else
            this._isEmpty = true;
    };
        
}
// These functions are constructors for figures

function Pawn(gamerId, startPosition, color) {
    this.figureId = Math.floor(Math.random()*10000);
    this._ownerId = gamerId;
    this._isFirstStep = true;
    this._color = color || "white";
    this.oldPosition = startPosition;
    this.newPosition = startPosition;
    

    this.getIsFirstStep = function() {
        return this._isFirstStep;
    };

    this.move = function() {
        this._isFirst = false;
    };

    this.getAvailableStaps = function(chessArea) {
        var currentRow = this.oldPosition.row;
        var currentColumn = this.oldPosition.column;
        var direction = 1;
        var canStep = 1;

        if(this._color == "black")
            direction = -1;

        if(this._isFirst) 
            canStep = 2;

        for(var row = currentRow; row == currentRow + (canStep * direction); row += direction) {
            if(chessArea[row][currentColumn].isEmpty) {
                $("#" + chessArea[row][currentColumn].number)
                    .find(".aim").addClass("available");
            }
        }
        
    };

    this.show = function(parentCell) {
        $("<div/>", {
            id: this.figureId,
            class: "figure pawn-" + this._color,
            on: {
                click: function(event) {
                    //console.log(event);
                    //$(this).hide();
                },
                mousedown: function(event) {
                    //console.log(event);
                    //$(this).css(position: absolute);
                    this.getAvailableStaps(document.gameArea);
                }
            }
        }).appendTo(parentCell);
    };
};

function Rook() {
};

function Horse() {
};

function Elephant() {
};

function Queen() {
};

function King() {
};