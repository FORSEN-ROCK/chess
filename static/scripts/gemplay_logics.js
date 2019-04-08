/**
*   This script adds base game logics for html chess
*/

(function(){
    $("#start").on("click", startGame);
    //$(".figure").on("mousedown", gameControl);
    //$("body").on("click", function(event) { console.log(event);});
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

    // Prepare chees board before new game 
    var rows = transformCellToAreal();
    document.chessBoard = new ChessBoard(rows);

    /*$(".chess-place").on("mousemove", function(event) {
        console.log("pageX-> " + event.pageX);
        console.log("pageY-> " + event.pageY) 
    });*/

    $(".chess-place").on("click", function(event) {
        /**
		*	This listener catch click on new cell
		*	@param {object} event
		*	@return {nothing}
		*/

		var target = $(event.target);

		if(target.hasClass("chess-cell") &&
		   document.selectedFigure != undefined){
				var figure = $("#" + document.selectedFigure).detach();

				figure.appendTo(target);
				document.chessBoard.deactivateBoard();
				document.selectedFigure = undefined;
		}
    });

    // Create the chess figures for forEach gamers
    document.gamers.map(function(gamer) {
        createFigureForGamer(gamer, document.chessBoard.rows)
    });

    // The main game function
    //game(document.gamers, document.chessBoard);
    
};

function createFigureForGamer(gamer, chessArea) {
    /**
    *  This function creates figures for the players
    *  @param {oblect} gamer
    *  @param {array of array of Cell} chessArea
    *  @return {nothing} 
    */

    var figuresOnBoard = $(".figure");
    /*
    if(figuresOnBoard.lenght > 0) {
        var createNew = confirm("Create new game?");

        if(createNew) {
            figuresOnBoard.remove();
        }
    }*/

    var startRow = 0

    if(gamer.color == 'black')
        startRow = 7;

    // Create pawns
    var pawnRow = startRow + gamer.getDirection();

    chessArea[pawnRow].map(function(cell) {
        var itemFigure = new Pawn(gamer.gamerId, cell,
                                  gamer.color, gamer.getDirection());
        gamer.figures.push(itemFigure);
        itemFigure.show($("#" + cell.getId()));

        // Put figurs on the board
        cell.putFigure();
    });

    // Create the rest figures
    chessArea[startRow].map(function(cell) {
        var itemFigure = undefined;

        if(cell.column == 0 || cell.column == 7) {

            // Create rooks
            itemFigure = new Rook(gamer.gamerId, cell,
                                  gamer.color, gamer.getDirection());
        } else if (cell.column == 1 || cell.column == 6) {

            // Create horses
            itemFigure = new Horse(gamer.gamerId, cell,
                                   gamer.color, gamer.getDirection());
        } else if (cell.column == 2 || cell.column == 5) {

            // Create elepants
            itemFigure = new Elephant(gamer.gamerId, cell,
                                      gamer.color, gamer.getDirection());
        } else if (cell.column == 3) {

            // Create queen
            itemFigure = new Queen(gamer.gamerId, cell,
                                   gamer.color, gamer.getDirection());
        } else if (cell.column == 4) {

            // Create king
            itemFigure = new King(gamer.gamerId, cell,
                                  gamer.color, gamer.getDirection());
        }

        if(itemFigure != undefined) {
            gamer.figures.push(itemFigure);
            itemFigure.show($("#" + cell.getId()));

            // Put figurs on the board
            cell.putFigure();
        }
    });
};

function game(gamers, chessBoard) {
    /**
    *   This is the main game function
    *   It starts up game loop and handles 
    *   The player actions and controls 
    *   The game rules and defindes the winner
    *
    *   @param {array} gamers is list of gamer 
    *   @return {nothing}
    */

    while(gamers[0].getAvailableMove() > 0 &&
          gamers[1].getAvailableMove() > 0) {

        currentGamer = gamers[0];

        // Set current gamer
        document.carrentGamer = currentGamer;

        while(!chessBoard.getIsChanged()) {
            // Define which figure have chosen gamer
            var chosedFigure = currentGamer.figures.filter(function(figure) {
                if(figure.getIsChosed())
                    return figure;
            })[0];

            console.log(chosedFigure);
            if(false){//chosedFigure != undefined) {
                // Define where can be to moved chosed figure
                availableSteps = figure.getAvailableStaps();

                // Define what can the figure eat
                eatingAim = figure.getEatingAim();

                // Paint all availabel staps for the figure
                availableSteps.forEach(function(cell) {
                    cell.showAvailability();
                });

                // Paint all eating aim for the figure
                eatingAim.forEach(function(cell) {
                    cell.showEdible();
                });
            }

            // Checks chess board changes
            chessBoard.calculateChanged();
        }

        // At the end of gamer move
        gamers.forEach(function(gamer) {
            gamer.calculateAvailableMove();
            gamer.calculateIsKingScared();
        });
    }
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

// This function is constructor for gamer
function Gamer(color) {
    this.gamerId = Math.floor(Math.random()*10000);
    this._countMove = 0;
    this.color = color;
    this.figures = [];
    this._availablMove = 10;
    this._isKingScared = false;

    this.getCountMove = function() {
        return this._countMove;
    };

    this.getAvailableMove = function() {
        return this._availablMove;
    };

    this.calculateAvailableMove = function() {
        /**
        *   In this method we have to calculate availabel moves
        *   for all player figures and save it in _availablMove
        *   @params {this} this current gamer
        *   @return {nothing}
        */
    };

    this.calculateIsKingScared = function() {
        /**
        *   This checks dangers for player king
        *   @param {this} current gamer
        *   @return {nothing}
        */
    };

    this.getIsKingScared = function() {
        return this._isKingScared;
    };

    this.move = function() {
        this._countMove++;
        return this._countMove;
    };

    this.getDirection = function() {
        /**
        *   This method defind direction
        *   @param {this} current gamer
        *   @return {number} direction
        */

        var direction = 1;

        if(this.color == "black")
            direction = -1;

        return direction;
    };
}

// This function is constructor for cell of board
var NAME_OF_COLUMN = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function Cell(row, column, absnumber) {
    this.row = row;
    this.column = column;
    this._isEmpty = true;
    this._isActivate = false;
    this._id = absnumber;
    this._isChanged = false;

    this.getId = function() {
        return this._id;
    };

    this.getIsEmpty = function() {
        return this._isEmpty;
    };

    this.putFigure = function() {
        this._isEmpty = false;
    };

    this.rowChess = function() {
        return this.row + 1;
    };

    this.columnChess = function() {
        return NAME_OF_COLUMN[this.column];
    };

    this.changeEmpty = function() {
        this._isChanged = true;

        if(this._isEmpty)
            this._isEmpty = false;
        else
            this._isEmpty = true;
    };

    this.getIsChanged = function() {
        return this._isChanged;
    };

    this.showAvailability = function() {
        /**
        *   This method show current cell as availabel in interface
        *   @param {this} current cell
        *   @return {nothing}
        */

        this._isActivate = true;
        $("#" + this._id).find(".aim").addClass("available");
    };

    this.showEdible = function() {
        /**
        *   This method show current cell as edible aim in interface
        *   @param {this} current cell
        *   @return {nothing}
        */

        this._isActivate = true;
        $("#" + this._id).find(".aim").addClass("not-available");
    };

    this.deactivate = function() {
        /**
        *   This method remove activate css-class(availabel or not-available)
        *   From current cell
        *   @param {this} current cell
        *   @return {nothing}
        */

        if(this._isActivate) {
            var $this = $("#" + this._id).find(".aim");

            if($this.hasClass("not-available"))
                $this.removeClass("not-available");
            else
                $this.removeClass("available");

            this._isActivate = false;
        }
    }
};

function ChessBoard(rows) {
    this.rows = rows;
    this._isChanged = false;

    this.getIsChanged = function() {
        return this._isChanged;
    };

    this.nextMove = function() {
        this._isChanged = false;
    };

    this.calculateChanged = function() {
        /**
        *   This method checks all cell of board and
        *   If anyone was chenged set _isChanged = true
        *   @param {this} board
        *   @return {nothing}
        */

        this._isChanged = rows.some(function(row) {
            return row.some(function(cell) {
                return cell.getIsChanged();
            });
        });
    };

    this.deactivateBoard = function() {
        /**
        *   This method deactivate all cell of board
        *   @param {this} board
        *   @return {nothing}
        */

        this.rows.forEach(function(row) {
            row.forEach(function(cell){
                cell.deactivate();
            });
        });
    };
};

// Base class for figure
function Figure(gamerId, startPosition, color, gamerDirection) {
    this._figureId = Math.floor(Math.random()*10000);
    this._ownerId = gamerId;
    this._isChosed = false;
    this._oldPosition = startPosition;
    this._newPosition = startPosition;
    this._color = color || "white";
    this._cssClass = null; 
    this._direction = gamerDirection;

    this.getIsChosed = function() {
        /**
        *   This mithod return _isChosed
        *   @param {this} current figure
        *   @return {boolean} _isChosed
        */

        return this._isChosed;
    };

    this.getFigureId = function() {
        /**
        *   This method return _figureId
        *   @param {this} current figure
        *   @return {number} _figureId
        */

        return this._figureId;
    };

    this.getOwnerId = function() {
        /**
        *   This method returns _ownerId
        *   @param {this} current figure
        *   @return {number} ownerId 
        */

        return this._ownerId;
    };

    this.getOldPosition = function() {
        /**
        *   This method returns _oldPosition
        *   @param {this} current figure
        *   @return {Cell} _oldPosition
        */

        return this._oldPosition;
    };

    this.getNewPosition = function() {
        /**
        *   This method returns _newPosition
        *   @param {this} current figure
        *   @return {Cell} _newPosition
        */

        return this._newPosition;
    };

    this.isChangePosition = function() {
        /**
        *   
        *   @param {this} current figure
        *   @return {boolean} _isChanged
        */

        var isChanged = (this._newPosition.row == this._oldPosition.row) &&
                        (this._newPosition.column == this._oldPosition.column);

        return isChanged;
    };

    this.move = function() {
        //this._isFirst = false;
        this._oldPosition = this._newPosition;
    };

    this.show = function(parentCell) {
        var self = this;

        $("<div/>", {
            id: this.getFigureId(),
            class: "figure " + this._cssClass + this._color,
            on: {
                click: function(event) {
                    //console.log(event);
                    //$(this).hide();
                    //document.chessBoard.deactivateBoard();
                },
                mousedown: function(event) {
					// Save the selected figure
					document.selectedFigure = event.target.id;

                    // Define where can be to moved chosed figure
                    var availableSteps = self.getAvailableStaps(
                                            document.chessBoard.rows
                    );

                    // Define what can the figure eat
                    var eatingAim = self.getEatingAim(
                                            document.chessBoard.rows
                    );
                    console.log(availableSteps);

                    // Paint available cells for chosed figure
                    availableSteps.forEach(function(cell) {
                        cell.showAvailability();
                    });

                    // Paint all eating aim for the figure
                    /*
                    eatingAim.forEach(function(cell) {
                        cell.showEdible();
                    });
                    */
                },
                mouseup: function(event) {
                    //document.chessBoard.deactivateBoard();
                }
            }
        }).appendTo(parentCell);
    };
};

// These functions are constructors for figures
function Pawn(gamerId, startPosition, color, gamerDirection) {
    Figure.apply(this, arguments);

    this._isFirstStep = true;
    this._cssClass = "pawn-";

    this.getAvailableStaps = function(chessArea) {
        /**
        *   This method calculates available cells
        *   For selected pawn
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessArea //??
        *   @returnd {array of Cell} availableCell
        */

        var startRow = this._oldPosition.row;
        var startColumn = this._oldPosition.column;
        var canStep = 1;

        if(this._isFirstStep) 
            canStep = 2;

        var stopRow = startRow + (canStep * this._direction);
        var availableCell = [];

        if(this._direction > 0) {
            for(var row = startRow; row <= stopRow; row += this._direction) {

                    if(chessArea[row][startColumn].getIsEmpty()) {
                        availableCell.push(chessArea[row][startColumn]);
                    }
            }
        } else {
            for(var row = startRow; row >= stopRow; row += this._direction) {

                    if(chessArea[row][startColumn].getIsEmpty()) {
                        availableCell.push(chessArea[row][startColumn]);
                    }
            }
        }

        return availableCell;
    };

    this.getEatingAim = function(chessBoard) {
        /**
        *   This method calculates all eating aim for
        *   Selected pawn
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessBoard
        *   @returned {array of Cell} eatingAims
        */
    }

};

function Rook() {
    Figure.apply(this, arguments);

    this._cssClass = "rook-";

    this.getAvailableStaps = function(chessBoard) {
        /**
        *   This method calculates available cells
        *   For selected rook
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessArea //??
        *   @returnd {array of Cell} availableCell
        */

        var startRow = this._oldPosition.row;
        var startColumn = this._oldPosition.column;
        var availableCell = [];

        // Find empty cell to top
        for(var row = startRow; row <= 7; row++) {
            if(row != startRow) {
                if(chessBoard[row][startColumn].getIsEmpty())
                    availableCell.push(chessBoard[row][startColumn]);
                else 
                    break;
            }
        }

        // Find empty cell to bottom
        for(var row = startRow; row >= 0; row--) {
            if(row != startRow) {
                if(chessBoard[row][startColumn].getIsEmpty())
                    availableCell.push(chessBoard[row][startColumn]);
                else 
                    break;
            }
        }

        // Find empty cell to right
        for (var column = startColumn; column <= 7; column++) {
            if(column != startColumn) {
                if(chessBoard[startRow][column].getIsEmpty())
                    availableCell.push(chessBoard[startRow][column]);
                else
                    break;
            }
        }

        // Find empty cell to left
        for (var column = startColumn; column >= 0; column--) {
            if(column != startColumn) {
                if(chessBoard[startRow][column].getIsEmpty())
                    availableCell.push(chessBoard[startRow][column]);
                else
                    break;
            }
        }

        return availableCell;
    };

    this.getEatingAim = function(chessBoard) {
        /**
        *   This method calculates all eating aim for
        *   Selected rook
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessBoard
        *   @returned {array of Cell} eatingAims
        */
    };
};

function Horse() {
    Figure.apply(this, arguments);

    this._cssClass = "horse-";

    this.getAvailableStaps = function(chessBoard) {
        /**
        *   This method calculates available cells
        *   For selected horse
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessArea //??
        *   @returnd {array of Cell} availableCell
        */

        var startRow = this._oldPosition.row;
        var startColumn = this._oldPosition.column;
        var availableCell = [];

        if((startRow + 2) <= 7) {
            if((startColumn + 1) <= 7) {
                if(chessBoard[startRow + 2][startColumn + 1].getIsEmpty())
                    availableCell.push(chessBoard[startRow + 2][startColumn + 1]);
            }
            if((startColumn - 1) >= 0) {
                if(chessBoard[startRow + 2][startColumn - 1].getIsEmpty())
                    availableCell.push(chessBoard[startRow + 2][startColumn - 1]);
            }
        }

        if((startRow - 2) >= 0) {
            if((startColumn + 1) <= 7) {
                if(chessBoard[startRow - 2][startColumn + 1].getIsEmpty())
                    availableCell.push(chessBoard[startRow - 2][startColumn + 1]);
            }
            if((startColumn - 1) >= 0) {
                if(chessBoard[startRow - 2][startColumn - 1].getIsEmpty())
                    availableCell.push(chessBoard[startRow - 2][startColumn - 1]);
            }
        }

        if((startColumn + 2) <= 7) {
            if((startRow + 1) <= 7) {
                if(chessBoard[startRow + 1][startColumn + 2].getIsEmpty())
                    availableCell.push(chessBoard[startRow + 1][startColumn + 2]);
            }

            if((startRow - 1) >= 0) {
                if(chessBoard[startRow - 1][startColumn + 2].getIsEmpty())
                    availableCell.push(chessBoard[startRow - 1][startColumn + 2]);
            }
        }

        if((startColumn - 2) >= 0) {
            if((startRow + 1) <= 7) {
                if(chessBoard[startRow + 1][startColumn - 2].getIsEmpty())
                    availableCell.push(chessBoard[startRow + 1][startColumn - 2]);
            }

            if((startRow - 1) >= 0) {
                if(chessBoard[startRow - 1][startColumn - 2].getIsEmpty())
                    availableCell.push(chessBoard[startRow - 1][startColumn - 2]);
            }
        }

        return availableCell;
    };

    this.getEatingAim = function(chessBoard) {
        /**
        *   This method calculates all eating aim for
        *   Selected horse
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessBoard
        *   @returned {array of Cell} eatingAims
        */
    };
};

function Elephant() {
    Figure.apply(this, arguments);

    this._cssClass = "elephant-";

    this.getAvailableStaps = function(chessBoard) {
        /**
        *   This method calculates available cells
        *   For selected elephant
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessBoard //??
        *   @returnd {array of Cell} availableCell
        */

        var startRow = this._oldPosition.row;
        var startColumn = this._oldPosition.column;
        var availableCell = [];

        var isNotBlockedLeftToBottom = true;
        var isNotBlockedRightToBottom = true;
        var isNotBlockedLeftToTop = true;
        var isNotBlockedRightToTop = true;

        // Find empty cell to bottom
        for(var row = startRow - 1, columnOfset = 1; row >= 0; row--, columnOfset++) {
            var leftColumn = startColumn - columnOfset;
            var rightColumn = startColumn + columnOfset;

            if(leftColumn >= 0) {
                if(chessBoard[row][leftColumn].getIsEmpty() &&
                   isNotBlockedLeftToBottom) {
                        availableCell.push(chessBoard[row][leftColumn]);
                } else
                    isNotBlockedLeftToBottom = false;
            }

            if(rightColumn <= 7) {
                if(chessBoard[row][rightColumn].getIsEmpty() &&
                   isNotBlockedRightToBottom) {
                        availableCell.push(chessBoard[row][rightColumn]);
                } else
                    isNotBlockedRightToBottom = false;
            }
        }

        // Find empty cell to top
        for(var row = startRow + 1, columnOfset = 1; row <= 7; row++, columnOfset++) {
            var leftColumn = startColumn - columnOfset;
            var rightColumn = startColumn + columnOfset;

            if(leftColumn >= 0) {
                if(chessBoard[row][leftColumn].getIsEmpty() &&
                   isNotBlockedLeftToTop) {
                        availableCell.push(chessBoard[row][leftColumn]);
                } else
                    isNotBlockedLeftToTop = false;
            }

            if(rightColumn <= 7) {
                if(chessBoard[row][rightColumn].getIsEmpty() &&
                   isNotBlockedRightToTop) {
                    availableCell.push(chessBoard[row][rightColumn]);
                } else
                    isNotBlockedRightToTop = false;
            }
        }
        

        return availableCell;
    };

    this.getEatingAim = function(chessBoard) {
        /**
        *   This method calculates all eating aim for
        *   Selected elephant
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessBoard
        *   @returned {array of Cell} eatingAims
        */
    };
};

function Queen() {
    Figure.apply(this, arguments);

    this._cssClass = "queen-";

    this.getAvailableStaps = function(chessBoard) {
        /**
        *   This method calculates available cells
        *   For selected queen
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessArea //??
        *   @returnd {array of Cell} availableCell
        */

        var startRow = this._oldPosition.row;
        var startColumn = this._oldPosition.column;
        var availableCell = [];

        var isNotBlockedLeftToBottom = true;
        var isNotBlockedRightToBottom = true;
        var isNotBlockedLeftToTop = true;
        var isNotBlockedRightToTop = true;

        // Find empty cell to bottom
        for(var row = startRow - 1, columnOfset = 1; row >= 0; row--, columnOfset++) {
            var leftColumn = startColumn - columnOfset;
            var rightColumn = startColumn + columnOfset;

            if(leftColumn >= 0) {
                if(chessBoard[row][leftColumn].getIsEmpty() &&
                   isNotBlockedLeftToBottom) {
                        availableCell.push(chessBoard[row][leftColumn]);
                } else
                    isNotBlockedLeftToBottom = false;
            }

            if(rightColumn <= 7) {
                if(chessBoard[row][rightColumn].getIsEmpty() &&
                   isNotBlockedRightToBottom) {
                        availableCell.push(chessBoard[row][rightColumn]);
                } else
                    isNotBlockedRightToBottom = false;
            }
        }

        // Find empty cell to top
        for(var row = startRow + 1, columnOfset = 1; row <= 7; row++, columnOfset++) {
            var leftColumn = startColumn - columnOfset;
            var rightColumn = startColumn + columnOfset;

            if(leftColumn >= 0) {
                if(chessBoard[row][leftColumn].getIsEmpty() &&
                   isNotBlockedLeftToTop) {
                        availableCell.push(chessBoard[row][leftColumn]);
                } else
                    isNotBlockedLeftToTop = false;
            }

            if(rightColumn <= 7) {
                if(chessBoard[row][rightColumn].getIsEmpty() &&
                   isNotBlockedRightToTop) {
                    availableCell.push(chessBoard[row][rightColumn]);
                } else
                    isNotBlockedRightToTop = false;
            }
        }

        // Find empty cell to top
        for(var row = startRow; row <= 7; row++) {
            if(row != startRow) {
                if(chessBoard[row][startColumn].getIsEmpty())
                    availableCell.push(chessBoard[row][startColumn]);
                else 
                    break;
            }
        }

        // Find empty cell to bottom
        for(var row = startRow; row >= 0; row--) {
            if(row != startRow) {
                if(chessBoard[row][startColumn].getIsEmpty())
                    availableCell.push(chessBoard[row][startColumn]);
                else 
                    break;
            }
        }

        // Find empty cell to right
        for (var column = startColumn; column <= 7; column++) {
            if(column != startColumn) {
                if(chessBoard[startRow][column].getIsEmpty())
                    availableCell.push(chessBoard[startRow][column]);
                else
                    break;
            }
        }

        // Find empty cell to left
        for (var column = startColumn; column >= 0; column--) {
            if(column != startColumn) {
                if(chessBoard[startRow][column].getIsEmpty())
                    availableCell.push(chessBoard[startRow][column]);
                else
                    break;
            }
        }

        return availableCell;
    };

    this.getEatingAim = function(chessBoard) {
        /**
        *   This method calculates all eating aim for
        *   Selected pawn
        *   @param {this} current queen
        *   @param {array of array of Cell} chessBoard
        *   @returned {array of Cell} eatingAims
        */
    };
};

function King() {
    Figure.apply(this, arguments);

    this._cssClass = "king-";

    this.getAvailableStaps = function(chessArea) {
        /**
        *   This method calculates available cells
        *   For selected king
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessArea //??
        *   @returnd {array of Cell} availableCell
        */

        var startRow = this._oldPosition.row;
        var startColumn = this._oldPosition.column;
        var availableCell = [];

        // Find empty cells for king
        for(var ofsetRow = -1; ofsetRow <= 1; ofsetRow++) {
            if((startRow + ofsetRow >= 0) && (startRow + ofsetRow <= 7)) {
                if(chessArea[startRow + ofsetRow][startColumn].getIsEmpty()) {
                    availableCell.push(
                        chessArea[startRow + ofsetRow][startColumn]
                    );
                }

                if(startColumn - 1 >= 0) {
                    if(chessArea[startRow + ofsetRow][startColumn - 1].getIsEmpty()) {
                        availableCell.push(
                            chessArea[startRow + ofsetRow][startColumn - 1]
                        );
                    }
                }

                if(startColumn + 1 <= 7) {
                    if(chessArea[startRow + ofsetRow][startColumn + 1].getIsEmpty()) {
                        availableCell.push(
                            chessArea[startRow + ofsetRow][startColumn + 1]
                        );
                    }
                }
            }
            
        }

        return availableCell;
    };

    this.getEatingAim = function(chessBoard) {
        /**
        *   This method calculates all eating aim for
        *   Selected king
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessBoard
        *   @returned {array of Cell} eatingAims
        */
    };
};