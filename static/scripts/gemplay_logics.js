/**
*   This script adds base game logics for html chess
*
*   Comment:
*       In current version does not have situation with skip stroke
*       And some solutions aren't good and they will be have to fix later 
*/

(function(){
    $("#start").on("click", startGame);
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

    // Set mode of game
    document.firstTouch = false;

    // Set the first gamer
    document.currentGamer = document.gamers[0];

    // Set flag of game over
    document.isGameOver = false;

    $(".chess-place").on("click", game);

    // Create the chess figures for forEach gamers
    document.gamers.map(function(gamer) {
        createFigureForGamer(gamer, document.chessBoard.rows)
    });
    
};

function choseNextGamer(currentGamer) {
    /**
    *   This function chooses who must muves figures
    *   After current gamer
    *   @param {object} currentGamer
    *   @return {object} otherGamer
    */

    var otherGamer;
 
    for(var item = 0; item < document.gamers.length; item++) {
        if(document.gamers[item].gamerId != currentGamer.gamerId)
            otherGamer = document.gamers[item];
    }

    return otherGamer;
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
    if(figuresOnBoard.length > 0) {
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
        cell.putFigure(itemFigure);
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

            // Save king for player
            gamer.setKing(itemFigure);
        }

        if(itemFigure != undefined) {
            gamer.figures.push(itemFigure);
            itemFigure.show($("#" + cell.getId()));

            // Put figurs on the board
            cell.putFigure(itemFigure);
        }
    });
};

function game(event) {
    /**
    *   This function is listener catch click on new cell
    *   And handles game events
    *   @param {object} event
    *   @return {nothing}
    */

    var target = $(event.target);
    var selectedFigure = document.selectedFigure;
    var currentGamer = document.currentGamer;
    var gamers = document.gamers;
    var chessRows = document.chessBoard.rows;

    // Check king is not scared?
    var isKingScared = currentGamer.getIsKingScared(
                                choseNextGamer(currentGamer),
                                chessRows
    );

    if(isKingScared) {
        var saveFigures = currentGamer.getEscSteps(
                                chessRows,
                                choseNextGamer(currentGamer)
        );
    }

    if(isKingScared && saveFigures.length == 0) {

        // Current gamer is lost
        currentGamer.setIsCheckmate(true);
        document.isGameOver = true;

        alert("You are lost!");
    }

    var isGameOver = document.isGameOver;

    // Chech can we move current figure if king is scared
    if(isKingScared && selectedFigure != undefined) {
        var isFound = false;

        for(var figure = 0; figure < saveFigures.length; figure++) {
            if(saveFigures[figure].getFigureId() ==
               selectedFigure.getFigureId()) {
                    isFound = true;
                    break;
            }
        }

        if(!isFound) {
            document.selectedFigure = undefined;
            selectedFigure = undefined;
        }
    }

    // Moved figure without eating
    if(target.hasClass("chess-cell") &&
       selectedFigure != undefined &&
       !isGameOver){

        var newCell = document.chessBoard.getCell(target.attr("id"));

        var availableSteps = selectedFigure.getAvailableSteps(
                                                chessRows
        );
        var isMoved = selectedFigure.move(newCell, availableSteps);

        if(isMoved) {
            selectedFigure.getNewPosition().putFigure(selectedFigure);
            selectedFigure.goTo(newCell);

            document.chessBoard.deactivateBoard();
            document.chessBoard.deactivateAim();
        }
    }

    // Moved figure with eating
    if(target.hasClass("figure") &&
        selectedFigure != undefined &&
        target.attr("id") != selectedFigure.getFigureId() &&
        !isGameOver) {

        // At first get target figure and check figure owner
        var aimFigure = document.chessBoard.getFigure(target.attr("Id"));

        // Is not current gamer owner?
        if(aimFigure != undefined && 
           aimFigure.getOwnerId() != currentGamer.gamerId) {

                var movedPosition = aimFigure.getOldPosition();

                var eatingSteps = selectedFigure.getEatingAim(
                                            chessRows,
                                            currentGamer
                );

                var isMoved = selectedFigure.move(
                                        movedPosition,
                                        eatingSteps
                );

            // Can we move figure there?
            if(isMoved) {
                aimFigure.die();

                //Delete figure for gamer
                document.gamers.map(function(gamer) {
                    gamer.figures = gamer.figures.filter(function(figure) {
                        var isNotDeleted = (
                                figure.getFigureId() != 
                                aimFigure.getFigureId()
                        );

                        return isNotDeleted;
                    });
                });

                selectedFigure.goTo(movedPosition);
                movedPosition.putFigure(selectedFigure);

                document.chessBoard.deactivateBoard();
                document.chessBoard.deactivateAim();
            }                    
        }
    }

    // Move with Castling

    if(selectedFigure != undefined && !isGameOver && 
       document.kingFigure != undefined && !isKingScared &&
       target.attr("id") != document.kingFigure.getFigureId() &&
       target.hasClass("figure") && currentGamer.getIsCastlingAvalaible()) {

            var kingFigure = document.kingFigure;
            var figure = document.chessBoard.getFigure(target.attr("Id"));
            var otherGamer = choseNextGamer(currentGamer);

            var isFigureRook = figure.getCssClass() == "rook-";
            var isNotKingMoved = kingFigure.getIsNotMoved();
            var isEmpty = false;
            var isAttacking = true;

            if(isFigureRook) {
                var isNotRookMoved = figure.getIsNotMoved();
            }

            if(isFigureRook && isNotRookMoved && isNotKingMoved) {
                var kingPosition = kingFigure.getOldPosition();
                var rookPosition = figure.getOldPosition();

                var searchRow = kingPosition.row;
                var start = 0;
                var end = 0;
                var countAll = 0; // dont like it
                var countEmpty = 0;

                var ofset = (
                    (rookPosition.column - kingPosition.column) / 
                    Math.abs(rookPosition.column - kingPosition.column)
                );

                if(ofset > 0) {
                    start = rookPosition.column.column - ofset;
                    end = kingPosition + ofset;
                } else {
                    start = kingPosition.column.column - ofset;
                    end = rookPosition + ofset;
                }

                for(var cell = start; cell <= end; cell++) {
                    countAll++; // think about it

                    if(chessRows[searchRow][cell].getIsEmpty())
                        countEmpty++;
                }

                if(countEmpty == countAll)
                    isEmpty = true;

                isAttacking = otherGamer.checkCellForAttack(
                                                        kingPosition,
                                                        rookPosition,
                                                        chessRows
                );
            }

            if(isEmpty && !isAttacking) {
                var rookOfset = 2 * ofset;

                if(rookOfset > 0)
                    rookOfset = 3;

                var newKingCell = document.chessBoard.getCell(
                                  kingPosition.getId() + 2 * ofset  
                );
                var newRookCell = document.chessBoard.getCell(
                                  rookPosition.getId() + rookOfset
                );

                newKingCell.getNewPosition().putFigure(kingFigure);
                newRookCell.getNewPosition().putFigure(figure);

                kingFigure.goTo(newKingCell);
                figure.goTo(newRookCell);

                document.chessBoard.deactivateBoard();
                document.chessBoard.deactivateAim();

                currentGamer.castlingIsDone();
            }
    }

    // Check end of the move
    var isMoveFinished = currentGamer.finishMove();

    if(isMoveFinished) {
        currentGamer.move();

        // Give the other gamer move
        document.currentGamer = choseNextGamer(currentGamer);
        aimFigure = undefined;
    }

    if(gamers[0].getAvailableMove(chessRows) <= 0 ||
       gamers[1].getAvailableMove(chessRows) <= 0) {
            document.isGameOver = true;
            alert("fwefwefwe");
    }
}


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
    this._king = undefined;
    this.figures = [];
    this._isCastlingAvalaible = true;
    this._isCheckmate = false;

    this.getCountMove = function() {
        /**
        *   This method returns private property
        *   @param {this} current gamer
        *   @return {number} _countMove
        */

        return this._countMove;
    };

    this.getIsCheckmate = function() {
        /**
        *   This method retuthis}rns private property
        *   @param {this} current gamer
        *   @return {boolean} _isCheckmate
        */

        return this._isCheckmate;
    };

    this.setIsCheckmate = function(isCheckmate) {
        /**
        *   This method sets private property
        *   @param {boolean} isCheckmate
        *   @return {boolean} isSeted
        */

        var isSeted = false;

        if(!this._isCheckmate && isCheckmate) 
            this._isCheckmate = isCheckmate;

        return isSeted;
    };

    this.getIsCastlingAvalaible = function() {
        /**
        *   This method returs private property
        *   _isCastlingAvalaible
        *   @param {this} current gamer
        *   @return {boolean} _isCastlingAvalaible
        */

        return this._isCastlingAvalaible;
    };

    this.castlingIsDone = function() {
        this._isCastlingAvalaible = false;
    };

    this.getKing = function() {
        /**
        *   This method returns king of player
        *   @param {this} current gamer
        *   @return {object} king
        */

        return this._king;
    };

    this.setKing = function(figureOfKing) {
        /**
        *   This method checks _kind and set it
        *   If it's nessosory
        *   @param {this} current gamer
        *   @param {object} player king
        *   @return {boolean} isSetKing
        */

        var isSetKing = false;

        if(this._king == undefined && figureOfKing != undefined) {
            this._king = figureOfKing;
            isSetKing = true;
        }

        return isSetKing;
    };

    this.getEscSteps = function(chessBoard, otherGamer) {
        /**
        *   This method searchs how can king be save
        *   @param {this} current gamer
        *   @param {array of row} chessBoard
        *   @param {object} otherGamer
        *   @return {array of objects} saveFigures
        */

        var saveFigures = [];
        var attakingFigures = [];
        var self = this;

        // Find the attaking figure for gamer king
        otherGamer.figures.map(function(figure) {
            var eatingSteps = figure.getEatingAim(chessBoard, 
                                                  otherGamer);

            for(var aim = 0; aim < eatingSteps.length; aim++) {

                // Find figure which can eat the king    
                if(eatingSteps[aim].getFigure().getCssClass() == "king-")
                    attakingFigures.push(figure);
            }
        });

        // Find how can we stop it
        attakingFigures.map(function(angryFigure) {
            var angryEatingSteps = angryFigure.getEatingAim(
                                                        chessBoard,
                                                        otherGamer
            );
            var angryMovingSteps = angryFigure.getAvailableSteps(
                                                        chessBoard
            );
            var attacking = angryFigure.getOldPosition();

            // Check how will the angry figure be moved to the king
            angryMovingSteps = angryMovingSteps.filter(function(step) {
                // Flag for filter
                var isImpotantStep = false;

                var target = self.getKing().getOldPosition();

                // Boolean varible for target and attacking position
                var targetIsLeft = target.column < attacking.column;
                var targetIsRight = target.column > attacking.column;
                var targetIsBottom = target.row < attacking.row;
                var targetIsTop = target.row > attacking.row;

                // Boolean varible for steps regarding 
                // target and attacking position
                var stepIsLeftRegardingTarget = (
                            step.column > attacking.column &&
                            step.column < target.column
                );

                var stepIsRightRegardingTarget = (
                            step.column > target.column &&
                            step.column < attacking.column
                );

                var stepIsBottomRegardingTarget = (
                            step.row > target.row &&
                            step.row < attacking.row
                );

                var stepIsTopRegardingTarget = (
                            step.row > attacking.row &&
                            step.row < target.row
                );

                // Find in the same row
                if((target.row == attacking.row) &&
                   (step.row == target.row) &&
                   (stepIsRightRegardingTarget ||
                    stepIsLeftRegardingTarget)) {
                        isImpotantStep = true;
                }

                // Find in the same column
                if((target.column == attacking.column) &&
                    (target.column == step.column) &&
                    (stepIsBottomRegardingTarget ||
                     stepIsTopRegardingTarget)) {
                        isImpotantStep = true;
                }

                // Find on right from fing
                if((targetIsLeft && targetIsBottom &&
                    stepIsRightRegardingTarget &&
                    stepIsBottomRegardingTarget) ||
                   (targetIsLeft && targetIsTop &&
                    stepIsRightRegardingTarget &&
                    stepIsTopRegardingTarget)) {
                       isImpotantStep = true;
                }

                // Find on left from king
                if((targetIsRight && targetIsBottom && 
                    stepIsLeftRegardingTarget &&
                    stepIsBottomRegardingTarget) ||
                   (targetIsRight && targetIsTop &&
                    stepIsLeftRegardingTarget &&
                    stepIsTopRegardingTarget)) {
                        isImpotantStep = true;
                }

                return isImpotantStep;
            });
            
            self.figures.map(function(saveFigure) {

                if(saveFigure.getCssClass() != "king-") {
                    var saveEatingSteps = saveFigure.getEatingAim(
                                                            chessBoard,
                                                            self
                    );
                    var saveMovingSteps = saveFigure.getAvailableSteps(
                                                            chessBoard
                    );

                    // Check can we eat angry figure
                    for(var step = 0; step < saveEatingSteps.length; step++) {

                        if(saveEatingSteps[step].getId() == attacking.getId())
                            saveFigures.push(saveFigure);
                    }

                    // Check can we stop moving 
                    saveMovingSteps.map(function(move) {

                        for(var step = 0; step < angryEatingSteps.length; step++) {

                            if(angryEatingSteps[step].getId() == move.getId())
                                saveFigures.push(saveFigure);
                        }

                        for(var step = 0; step < angryMovingSteps.length; step++) {

                            if(angryMovingSteps[step].getId() == move.getId())
                                saveFigures.push(saveFigure);
                        }
                    });
                }
            });
        });

        // Chech the king moves 
        var kingMoves = self.getKing().getAvailableSteps(chessBoard);
        var countDangerous = 0;

        otherGamer.figures.map(function(angryFigure) {
            var angryMoves = angryMoves.getAvailableSteps(chessBoard);

            kingMoves.map(function(step) {
                for(var angryStep = 0; angryStep < angryMoves.length; angryMoves++) {
                    if(step.getId() = angryMoves[angryStep].getId())
                        countDangerous++;
                }
            });
        });

        if(countDangerous != kingMoves.lenght) {
            saveFigures.push(self.getKing())
        }

        // Delete dublecation figures
        var counter = {};

        saveFigures = saveFigures.filter(function(item) {
            // Make unique array of figures
            var isUnique = false;

            if(item) {
                if(counter[item.getFigureId()] == undefined) {
                    counter[item.getFigureId()] = 1;
                    isUnique = true;
                }
            }

            return isUnique;
        });

        return saveFigures;
    };

    this.getAvailableMove = function(chessBoard) {
        /**
        *   In this method we have to calculate availabel moves
        *   for all player figures and save it in _availablMove
        *   @params {this} this current gamer
        *   @param {array of row} chessBoard
        *   @return {number} count of available moves
        */

        var countAvailableMove = 0;

        if(this.figures.length > 0) {
            this.figures.forEach(function(figure) {
            countAvailableMove += figure.getAvailableSteps(chessBoard).length;
            });
        }

        //this._availablMove = countAvailableMove;
        return countAvailableMove;
    };

    this.getIsKingScared = function(otherGamer, chessBoard) {
        /**
        *   This checks dangers for player king
        *   @param {this} current gamer
        *   @param {object} otherGamer
        *   @param {array of rows} chessBoard
        *   @return {boolean} isScared
        */

        var allConcurentFigureMoves = [];
        var movesToKing = [];
        var kingIsScared = false;

        otherGamer.figures.map(function(figure) {
            allConcurentFigureMoves.push(figure.getEatingAim(
                                                    chessBoard,
                                                    otherGamer
            ));
        });

        allConcurentFigureMoves.map(function(figureMoves) {
            for(var move = 0; move < figureMoves.length; move++) {
                if(figureMoves[move].getFigure().getCssClass() == "king-" &&
                   figureMoves[move].getFigure().getOwnerId() != this.gamerId) 
                    movesToKing.push(figureMoves[move]);
            }
        });

        if(movesToKing.length > 0)
            kingIsScared = true;

        return kingIsScared;
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

    this.finishMove = function() {
        /**
        *   This method chechs all player figures
        *   And finishes move if someone was moved
        *   @param {nothing}
        *   @return {bolean} isMoveFinished
        */

        var isMoveFinished = false;

        // Find moved figure
        var movedFigure = this.figures.filter(function(figure) {
            return figure.isChangePosition();
        });

        if(movedFigure.length > 0) {
            movedFigure[0].saveMove(this);
            isMoveFinished = true;
        }

        return isMoveFinished;
    };

    this.checkCellForAttack = function(start, end, chessBoard) {
        /**
        *   This method checks can figures of current gamer
        *   Can go there
        *   @param {this} current gamer
        *   @param {object} start
        *   @param {object} end
        *   @param {array of objects} chessBoard
        *   @return {boolean} canGoThere
        */

        var canGoThere = true;
        var startId = start.getId();
        var endId = end.getId();
        var ofset = (endId - startId) / Math.abs(endId - startId);
        var start = 0;
        var end = 0;

        if(startId < endId) {
            start = startId + ofset;
            end = endId - ofset;
        } else {
            start = endId - ofset;
            end = startId + ofset;
            ofset = 1;
        }

        this.figures.map(function(figure) {
            var steps = figure.getAvailableSteps(chessBoard);

            steps.map(function(step) {
                for(var stepOfset = start; stepOfset <= end; stepOfset += ofset) {
                    if(step.getId() == stepOfset) {
                        canGoThere = false;
                        break;
                    }
                }
            });
        });

        return canGoThere;
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
    this._figure = null;

    this.getId = function() {
        /**
        *   This method returns id of cell
        *   @param {current cell} this
        *   @return {number} _id
        */

        return this._id;
    };

    this.getIsEmpty = function() {
        /**
        *   This method return flag isEmpty
        *   @param {current cell} this
        *   @return {boolean} _isEmpty
        */

        return this._isEmpty;
    };

    this.putFigure = function(figure) {
        /**
        *   This method puts figure on current cell
        *   And refreshes flag isEmpty
        *   @param {current cell} this
        *   @param {object} figure
        *   @return {nothing}
        */

        this._isEmpty = false;
        this._figure = figure;
    };

    this.takeFigure = function() {
        /**
        *   This method removes figure on current cell
        *   And refrehes flag isEmpty
        *   @param {current cell} this
        *   @return {nothing}
        */

        this._isEmpty = true;
        this._figure = null;
    };

    this.getFigure = function () {
        /**
        *   This method return figure from current cell
        *   @param {current cell} this
        *   @return {object} _figure
        */

        return this._figure;
    };

    this.rowChess = function() {
        /**
        *   This method returns row number on board
        *   @param {current cell} this
        *   @return {number} row + 1
        */

        return this.row + 1;
    };

    this.columnChess = function() {
        /**
        *   This method returns name of column on chess board
        *   @param {currrent cell} this
        *   @return {string} NAME_OF_COLUMN[this.column]
        */

        return NAME_OF_COLUMN[this.column];
    };

    this.getIsChanged = function() {
        /**
        *   This method returns flag isChanged
        *   @param {current cell} this
        *   @return {boolean} _isChanged
        */

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
        /**
        *   This method returns flag isChanged
        *   @param {current cell} this
        *   @return {boolean} _isChanged
        */

        return this._isChanged;
    };

    this.nextMove = function() {
        /**
        *   This method set change flag in false
        *   @param {nothing}
            @return {nothing}
        */

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
            row.forEach(function(cell) {
                cell.deactivate();
            });
        });
    };

    this.getCell = function(cellId) {
        /**
        *   This method find cell by cellId
        *   @param {number} cellId
        *   @return {object} cell
        */

        var cell;

        for(var row = 0; row < this.rows.length; row++) {
            for(var column = 0; column < this.rows[row].length; column++) {
                if(this.rows[row][column].getId() == cellId) {
                        cell = this.rows[row][column];
                        break;
                }
            }
        }

        return cell;
    };

    this.getFigure = function(figureId) {
        /**
        *   This method find figure by id on the board
        *   @param {number} figureId
        *   @return {object} figure 
        */

        var gamerOne = document.gamers[0];
        var gamerTwo = document.gamers[1];
        var allFigures = gamerOne.figures.concat(gamerTwo.figures);
        var targetFigure = undefined;

        for(var itemFigure = 0; itemFigure < allFigures.length; itemFigure++) {

            if(allFigures[itemFigure].getFigureId() == figureId) {
                targetFigure = allFigures[itemFigure];
                break;
            }
        }

        return targetFigure;
    };

    this.deactivateAim = function() {
        /**
        *   This method get every figur on the board 
        *   And uses figure method hideAim
        *   @param {this} board
        *   @return {nothing}
        */

        this.rows.map(function(row) {
            row.map(function(cell) {
                if(!cell.getIsEmpty()) {
                    cell.getFigure().hideAim();
                }
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
    this._isAim = false;

    this.getColor = function() {
        /**
        *   This method returns this figure color
        *   @param {this} current figure
        *   @return {string} _color
        */

        return this._color;
    };

    this.getCssClass = function() {
        /** 
        *   This method returns name of css class
        *   @param {this} current figure
        *   @return {string} className
        */

        return this._cssClass;
    };

    this.getDirection = function() {
        /**
        *   This method returns this figure direction
        *   @param {this} current figure
        *   @return {number} current direction
        */

        return this._direction;
    };

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

    this.getIsAim = function() {
        /**
        *   This method returns _isAim property
        *   @param {this} current figure
        *   @return {nothing}
        */

        return this._isAim;
    };

    this.isChangePosition = function() {
        /**
        *   
        *   @param {this} current figure
        *   @return {boolean} _isChanged
        */

        var isChanged = this._newPosition.getId() != this._oldPosition.getId();

        return isChanged;
    };

    this.setNewPosition = function(cell) {
        this._newPosition = cell;
    };

    this.move = function(newPosition, availableSteps) {
        /**
        *   This metod moves figure to new available cell
        *   @param {object} newPosition
        *   @param {array} _availableSteps
        *   @return {boolean} isMoved 
        */

        var canBeMoved = false;
        var isMoved = false;

        for(var cellIndex = 0; cellIndex < availableSteps.length;
            cellIndex++) {
            
            if(availableSteps[cellIndex] == newPosition)
                canBeMoved = true;
        }

        if(canBeMoved) {
            this._oldPosition.takeFigure();
            this._newPosition = newPosition;
            //this._newPosition.putFigure(this);
            isMoved = true;
        }

        return isMoved;
    };

    this.saveMove = function(gamer) {
        /**
        *   This method exchange value of _oldPosition
        *   @param {this} current figure
        *   @param {object} gamer
        *   @return {nothing}
        */
        this._oldPosition = this._newPosition;
    };

    this.show = function(parentCell) {
        /**
        *   This method shows figure in interface and adds
        *   showing logic to figure
        *   @param {current figure} this
        *   @param {object} parentCell
        *   @return {nothing}
        */

        var self = this;

        $("<div/>", {
            id: this.getFigureId(),
            class: "figure " + this._cssClass + this._color,
            on: {mousedown: function(event) {
                    if(self.getOwnerId() == document.currentGamer.gamerId) {

                        // Save the selected figure
                        if(document.selectedFigure == undefined)
                            document.selectedFigure = self;

                        // Rule of not first touch
                        if(!document.firstTouch) {
                            document.selectedFigure = self;
                        }

                        // If figure is the gamer king save it 
                        // For castaling
                        if(self.getCssClass() == "king-") {
                            document.kingFigure = self;
                        }

                        // Rule of first touch
                        if(document.selectedFigure == self) {

                            // Define where can be to moved chosed figure
                            var availableSteps = self.getAvailableSteps(
                                                    document.chessBoard.rows
                            );

                            // Define what can the figure eat
                            var eatingAims = self.getEatingAim(
                                                    document.chessBoard.rows,
                                                    document.currentGamer
                            );

                            // Paint all eating aim for the figure
                            if(eatingAims.length > 0) {

                                eatingAims.forEach(function(cell) {
                                    cell.getFigure().showAsAim();
                                });
                            }
                        }

                        // At first deactivate chess cell
                        document.chessBoard.deactivateBoard();

                        // Paint available cells for chosed figure
                        availableSteps.forEach(function(cell) {
                            cell.showAvailability();
                        });
                    }
                }
            }
        }).appendTo(parentCell);
    };

    this.goTo = function(newCell) {
        /**
        *   This method show figure on new cell and
        *   Remove saved figure
        *   @param {object} newCell
        *   @return {nothing}
        */

        // Show figur on new position
        var figureBody = $("#" + this.getFigureId()).detach();
        figureBody.appendTo("#" + newCell.getId());

        // Remove selected figure
        document.selectedFigure = undefined;
    };

    this.showAsAim = function() {
        /**
        *   This method note figure as the aim
        *   @param {this} current figure
        *   @return {nothing} 
        */

        var figureBody = $("#" + this.getFigureId());

        if(!figureBody.hasClass("aim-figure")) {
            figureBody.addClass("aim-figure");
            this._isAim = true;
        }
    };

    this.hideAim = function() {
        /**
        *   This methos hide target aim
        *   @param {this} current figure
        *   @return {nothing}
        */

        var figureBody = $("#" + this.getFigureId());

        if(figureBody.hasClass("aim-figure")) {
            figureBody.removeClass("aim-figure");
            this._isAim = false;
        }
    };

    this.die = function() {
        /**
        *   This method delete figure
        *   @param {this} current figure
        *   @return {nothing}
        */

        // Delete figure in interface
        $("#" + this.getFigureId()).remove();
        
        // Clear positions
        this._oldPosition.takeFigure();
        this._newPosition.takeFigure();

        this._oldPosition = null;
        this._newPosition = null;
    };
};

// These functions are constructors for figures
function Pawn() {
    Figure.apply(this, arguments);

    var baseSaveMove = this.saveMove;

    this._isFirstStep = true;
    this._cssClass = "pawn-";


    this.getAvailableSteps = function(chessArea) {
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
            // Find empty cell to top
            for(var row = startRow + 1; row <= stopRow; row += this._direction) {

                    if(chessArea[row][startColumn].getIsEmpty()) {
                        availableCell.push(chessArea[row][startColumn]);
                    } else {
                        break;
                    }
            }
        } else {
            // Find empty cell to bottom
            for(var row = startRow - 1; row >= stopRow; row += this._direction) {

                    if(chessArea[row][startColumn].getIsEmpty()) {
                        availableCell.push(chessArea[row][startColumn]);
                    } else {
                        break;
                    }
            }
        }

        return availableCell;
    };

    this.getEatingAim = function(chessBoard, gamer) {
        /**
        *   This method calculates all eating aim for
        *   Selected pawn
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessBoard
        *   @returned {array of cell} eatingAims
        */

        var startRow = this._oldPosition.row;
        var startColumn = this._oldPosition.column;

        var stopRow = startRow + this._direction;
        var eatingAims = [];
        //var gamer = document.currentGamer;

        for(var columnOfset = -1; columnOfset <= 1; columnOfset++) {
            var columnAim = startColumn + columnOfset;

            if(columnOfset != 0 && ((columnAim >= 0) && (columnAim <= 7))) {

                if(!chessBoard[stopRow][columnAim].getIsEmpty()) {
                    var figureOwnerId = chessBoard[stopRow][columnAim].getFigure().getOwnerId();

                    if(figureOwnerId != gamer.gamerId)
                        eatingAims.push(chessBoard[stopRow][columnAim]);
                   }
            }
        }

        return eatingAims;
    };

    this.saveMove = function(gamer) {
        /**
        *   This method is extention for base method of figure
        *   This is special method for Pawn
        *   @param {this} current pawn
        *   @param {object} gamer
        *   @return {nothing}
        */

        baseSaveMove.call(this);
        this._isFirstStep = false;

        // Check new position and this pawn stand
        // On the last row, it must turn into qeen
        var newPosition = this.getNewPosition()

        if((newPosition.row == 7 && this.getDirection() > 0) ||
            newPosition.row == 0 && this.getDirection() < 0) {

            var self = this;
            var newLive = new Queen(self.getOwnerId(),
                                    self.getNewPosition(),
                                    self.getColor(),
                                    self.getDirection());

            // Delete current pawn
            gamer.figures = gamer.figures.filter(function(figure) {
                   return figure.getFigureId() != self.getFigureId();
            });

            self.die();

            // add qeen to gamer figures
            gamer.figures.push(newLive);

            // Show new qeen in interface
            newLive.show("#" + newPosition.getId());
            newLive.saveMove(gamer);
            
        }
    };

};

function Rook() {
    Figure.apply(this, arguments);

    this._cssClass = "rook-";
    this._isNotMoved = true;


    this.getIsNotMoved = function() {
        /**
        *   This method returns private property
        *   @param {this} current figure
        *   @return {boolean} _isNotMoved
        */

        return this._isNotMoved;
    };

    this.getAvailableSteps = function(chessBoard) {
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

    this.getEatingAim = function(chessBoard, gamer) {
        /**
        *   This method calculates all eating aim for
        *   Selected rook
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessBoard
        *   @returned {array of Cell} eatingAims
        */

        var startRow = this._oldPosition.row;
        var startColumn = this._oldPosition.column;
        var eatingAims = [];

        // Find aim cell to top
        for(var row = startRow; row <= 7; row++) {
            var cell = chessBoard[row][startColumn];

            if(row != startRow && !cell.getIsEmpty()) {
                var figureOwnerId = cell.getFigure().getOwnerId();

                if(figureOwnerId != gamer.gamerId) {
                    eatingAims.push(chessBoard[row][startColumn]);
                    break;
                } else 
                    break;
            }
        }

        // Find aim cell to bottom
        for(var row = startRow; row >= 0; row--) {
            var cell = chessBoard[row][startColumn];

            if(row != startRow && !cell.getIsEmpty()) {
                var figureOwnerId = cell.getFigure().getOwnerId();

                if(figureOwnerId != gamer.gamerId) {
                    eatingAims.push(chessBoard[row][startColumn]);
                    break;
                } else 
                    break;
            }
        }

        // Find aim cell to right
        for (var column = startColumn; column <= 7; column++) {
            var cell = chessBoard[startRow][column];

            if(column != startColumn && !cell.getIsEmpty()) {
                var figureOwnerId = cell.getFigure().getOwnerId();

                if(figureOwnerId != gamer.gamerId) {
                    eatingAims.push(chessBoard[startRow][column]);
                    break;
                } else
                    break;
            }
        }

        // Find aim cell to left
        for (var column = startColumn; column >= 0; column--) {
            var cell = chessBoard[startRow][column];

            if(column != startColumn && !cell.getIsEmpty()) {
                var figureOwnerId = cell.getFigure().getOwnerId();

                if(figureOwnerId != gamer.gamerId) {
                    eatingAims.push(chessBoard[startRow][column]);
                    break;
                } else
                    break;
            }
        }

        return eatingAims;
    };

    this.saveMove = function(gamer) {
        /**
        *   This method is extention for base method of figure
        *   This is special method for Rock
        *   @param {this} current rock
        *   @param {object} gamer
        *   @return {nothing}
        */

        baseSaveMove.call(this);
        this._isNotMoved = false;
    };
};

function Horse() {
    Figure.apply(this, arguments);

    this._cssClass = "horse-";

    this.getAvailableSteps = function(chessBoard) {
        /**
        *   This method calculates available cells
        *   For selected horse
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessArea //??
        *   @returnd {array of Cell} availableCell
        */

        var startRow = this._oldPosition.row;
        var startColumn = this._oldPosition.column;
        var possibleAvailable = [];
        var availableCell = [];

        if((startRow + 2) <= 7) {
            if((startColumn + 1) <= 7)
                possibleAvailable.push(chessBoard[startRow + 2][startColumn + 1]);

            if((startColumn - 1) >= 0)
                possibleAvailable.push(chessBoard[startRow + 2][startColumn - 1]);

        }

        if((startRow - 2) >= 0) {
            if((startColumn + 1) <= 7)
                possibleAvailable.push(chessBoard[startRow - 2][startColumn + 1]);

            if((startColumn - 1) >= 0)
                possibleAvailable.push(chessBoard[startRow - 2][startColumn - 1]);
        }

        if((startColumn + 2) <= 7) {
            if((startRow + 1) <= 7)
                possibleAvailable.push(chessBoard[startRow + 1][startColumn + 2]);

            if((startRow - 1) >= 0)
                possibleAvailable.push(chessBoard[startRow - 1][startColumn + 2]);

        }

        if((startColumn - 2) >= 0) {
            if((startRow + 1) <= 7)
                possibleAvailable.push(chessBoard[startRow + 1][startColumn - 2]);

            if((startRow - 1) >= 0)
                possibleAvailable.push(chessBoard[startRow - 1][startColumn - 2]);

        }

        availableCell = possibleAvailable.filter(function(cell) {
            return cell.getIsEmpty();
        });

        return availableCell;
    };

    this.getEatingAim = function(chessBoard, gamer) {
        /**
        *   This method calculates all eating aim for
        *   Selected horse
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessBoard
        *   @returned {array of Cell} eatingAims
        */

        //
        var startRow = this._oldPosition.row;
        var startColumn = this._oldPosition.column;
        var possibleAims = [];
        var eatingAims = [];

        if((startRow + 2) <= 7) {
            if((startColumn + 1) <= 7)
                possibleAims.push(chessBoard[startRow + 2][startColumn + 1]);

            if((startColumn - 1) >= 0)
                possibleAims.push(chessBoard[startRow + 2][startColumn - 1]);

        }

        if((startRow - 2) >= 0) {
            if((startColumn + 1) <= 7)
                possibleAims.push(chessBoard[startRow - 2][startColumn + 1]);

            if((startColumn - 1) >= 0)
                possibleAims.push(chessBoard[startRow - 2][startColumn - 1]);
        }

        if((startColumn + 2) <= 7) {
            if((startRow + 1) <= 7)
                possibleAims.push(chessBoard[startRow + 1][startColumn + 2]);

            if((startRow - 1) >= 0)
                possibleAims.push(chessBoard[startRow - 1][startColumn + 2]);
        }

        if((startColumn - 2) >= 0) {
            if((startRow + 1) <= 7)
                possibleAims.push(chessBoard[startRow + 1][startColumn - 2]);

            if((startRow - 1) >= 0)
                possibleAims.push(chessBoard[startRow - 1][startColumn - 2]);
        }

        eatingAims = possibleAims.filter(function(cell) {
            return !cell.getIsEmpty() && (cell.getFigure().getOwnerId() !=
                                                              gamer.gamerId);
        });

        return eatingAims;
    };
};

function Elephant() {
    Figure.apply(this, arguments);

    this._cssClass = "elephant-";

    this.getAvailableSteps = function(chessBoard) {
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

    this.getEatingAim = function(chessBoard, gamer) {
        /**
        *   This method calculates all eating aim for
        *   Selected elephant
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessBoard
        *   @returned {array of Cell} eatingAims
        */

        var startRow = this._oldPosition.row;
        var startColumn = this._oldPosition.column;
        var eatingAims = [];

        var isNotFoundLeftToBottom = true;
        var isNotFoundRightToBottom = true;
        var isNotFoundLeftToTop = true;
        var isNotFoundRightToTop = true;

        // Find aim cell to bottom
        for(var row = startRow - 1, columnOfset = 1; row >= 0; row--, columnOfset++) {
            var leftColumn = startColumn - columnOfset;
            var rightColumn = startColumn + columnOfset;
            var cell = undefined;

            if(leftColumn >= 0) {
                cell = chessBoard[row][leftColumn];

                if(!chessBoard[row][leftColumn].getIsEmpty() &&
                   cell.getFigure().getOwnerId() != gamer.gamerId &&
                   isNotFoundLeftToBottom) {
                        eatingAims.push(chessBoard[row][leftColumn]);
                        isNotFoundLeftToBottom = false;
                } else if(!cell.getIsEmpty() &&
                          cell.getFigure().getOwnerId() == gamer.gamerId) {
                    isNotFoundLeftToBottom = false;
                }
            }

            if(rightColumn <= 7) {
                cell = chessBoard[row][rightColumn];

                if(!cell.getIsEmpty() &&
                   cell.getFigure().getOwnerId() != gamer.gamerId &&
                   isNotFoundRightToBottom) {
                        eatingAims.push(chessBoard[row][rightColumn]);
                        isNotFoundRightToBottom = false;
                } else if(!cell.getIsEmpty() &&
                          cell.getFigure().getOwnerId() == gamer.gamerId) {
                    isNotFoundRightToBottom = false;
                }
            }

            if(!isNotFoundLeftToBottom && !isNotFoundRightToBottom)
                break;
        }

        // Find aim cell to top
        for(var row = startRow + 1, columnOfset = 1; row <= 7; row++, columnOfset++) {
            var leftColumn = startColumn - columnOfset;
            var rightColumn = startColumn + columnOfset;
            var cell = undefined;

            if(leftColumn >= 0) {
                cell = chessBoard[row][leftColumn];

                if(!cell.getIsEmpty() &&
                   cell.getFigure().getOwnerId() != gamer.gamerId &&
                   isNotFoundLeftToTop) {
                        eatingAims.push(chessBoard[row][leftColumn]);
                        isNotFoundLeftToTop = false;
                } else if(!cell.getIsEmpty() &&
                          cell.getFigure().getOwnerId() == gamer.gamerId) {
                    isNotFoundLeftToTop = false;
                }
            }

            if(rightColumn <= 7) {
                cell = chessBoard[row][rightColumn];

                if(!cell.getIsEmpty() &&
                   cell.getFigure().getOwnerId() != gamer.gamerId &&
                   isNotFoundRightToTop) {
                        eatingAims.push(chessBoard[row][rightColumn]);
                        isNotFoundRightToTop = false;
                } else if (!cell.getIsEmpty() &&
                           cell.getFigure().getOwnerId() == gamer.gamerId) {
                    isNotFoundRightToTop = false;
                }
            }

            if(!isNotFoundLeftToTop && !isNotFoundRightToTop)
                break;
        }
        

        return eatingAims;
    };
};

function Queen() {
    Figure.apply(this, arguments);

    this._cssClass = "queen-";

    this.getAvailableSteps = function(chessBoard) {
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

    this.getEatingAim = function(chessBoard, gamer) {
        /**
        *   This method calculates all eating aim for
        *   Selected pawn
        *   @param {this} current queen
        *   @param {array of array of Cell} chessBoard
        *   @returned {array of Cell} eatingAims
        */

        var startRow = this._oldPosition.row;
        var startColumn = this._oldPosition.column;
        var eatingAims = [];

        var isNotFoundLeftToBottom = true;
        var isNotFoundRightToBottom = true;
        var isNotFoundLeftToTop = true;
        var isNotFoundRightToTop = true;

        // Find aim cell to bottom
        for(var row = startRow - 1, columnOfset = 1; row >= 0; row--, columnOfset++) {
            var leftColumn = startColumn - columnOfset;
            var rightColumn = startColumn + columnOfset;
            var cell;

            if(leftColumn >= 0) {
                cell = chessBoard[row][leftColumn];

                if(!cell.getIsEmpty() &&
                   isNotFoundLeftToBottom &&
                   cell.getFigure().getOwnerId() != gamer.gamerId) {
                        eatingAims.push(chessBoard[row][leftColumn]);
                        isNotFoundLeftToBottom = false;
                } else if(!cell.getIsEmpty() &&
                          cell.getFigure().getOwnerId() == gamer.gamerId) {
                    isNotFoundLeftToBottom = false;
                }
            }

            if(rightColumn <= 7) {
                cell = chessBoard[row][rightColumn];

                if(!cell.getIsEmpty() &&
                   isNotFoundRightToBottom &&
                   cell.getFigure().getOwnerId() != gamer.gamerId) {
                        eatingAims.push(chessBoard[row][rightColumn]);
                        isNotFoundRightToBottom = false;
                } else if(!cell.getIsEmpty() &&
                          cell.getFigure().getOwnerId() == gamer.gamerId) {
                    isNotFoundRightToBottom = false;
                }
            }

            if(!isNotFoundLeftToBottom && !isNotFoundRightToBottom)
                break;
        }

        // Find aim cell to top
        for(var row = startRow + 1, columnOfset = 1; row <= 7; row++, columnOfset++) {
            var leftColumn = startColumn - columnOfset;
            var rightColumn = startColumn + columnOfset;
            var cell;

            if(leftColumn >= 0) {
                cell = chessBoard[row][leftColumn];

                if(!cell.getIsEmpty() &&
                   isNotFoundLeftToTop &&
                   cell.getFigure().getOwnerId() != gamer.gamerId) {
                        eatingAims.push(cell);
                        isNotFoundLeftToTop = false;
                } else if(!cell.getIsEmpty() &&
                          cell.getFigure().getOwnerId() == gamer.gamerId) {
                    isNotFoundLeftToTop = false;
                }
            }

            if(rightColumn <= 7) {
                cell = chessBoard[row][rightColumn];

                if(!cell.getIsEmpty() &&
                   isNotFoundRightToTop &&
                   cell.getFigure().getOwnerId() != gamer.gamerId) {
                        eatingAims.push(cell);
                        isNotFoundRightToTop = false;
                } else if (!cell.getIsEmpty() &&
                           cell.getFigure().getOwnerId() == gamer.gamerId) {
                    isNotFoundRightToTop = false;
                }
            }

            if(!isNotFoundLeftToTop && !isNotFoundRightToTop)
                break;
        }

        // Find aim cell to top
        for(var row = startRow; row <= 7; row++) {
            var cell = chessBoard[row][startColumn];

            if(row != startRow) {
                if(!cell.getIsEmpty() &&
                   cell.getFigure().getOwnerId() != gamer.gamerId) {
                        eatingAims.push(cell);
                        break;
                }

                if(!cell.getIsEmpty() &&
                   cell.getFigure().getOwnerId() == gamer.gamerId) {
                       break;
                }
            }
        }

        // Find aim cell to bottom
        for(var row = startRow; row >= 0; row--) {
            var cell = chessBoard[row][startColumn];

            if(row != startRow) {
                if(!cell.getIsEmpty() &&
                    cell.getFigure().getOwnerId() != gamer.gamerId) {
                        eatingAims.push(cell);
                        break;
                }

                if(!cell.getIsEmpty() &&
                   cell.getFigure().getOwnerId() == gamer.gamerId) {
                       break;
                }
            }
        }

        // Find aim cell to right
        for (var column = startColumn; column <= 7; column++) {
            var cell = chessBoard[startRow][column];

            if(column != startColumn) {
                if(!cell.getIsEmpty() &&
                   cell.getFigure().getOwnerId() != gamer.gamerId) {
                        eatingAims.push(cell);
                        break;
                }

                if(!cell.getIsEmpty() &&
                   cell.getFigure().getOwnerId() == gamer.gamerId) {
                       break;
                }
            }
        }

        // Find aim cell to left
        for (var column = startColumn; column >= 0; column--) {
            var cell = chessBoard[startRow][column];

            if(column != startColumn) {
                if(!cell.getIsEmpty() &&
                   cell.getFigure().getOwnerId() != gamer.gamerId) {
                        eatingAims.push(cell);
                        break;
                }

                if(!cell.getIsEmpty() &&
                   cell.getFigure().getOwnerId() == gamer.gamerId) {
                       break;
                }
            }
        }

        return eatingAims;
    };
};

function King() {
    Figure.apply(this, arguments);

    this._cssClass = "king-";
    this._isNotMoved = true;


    this.getIsNotMoved = function() {
        /**
        *   This method returns private property
        *   @param {this} current figure
        *   @return {boolean} _isNotMoved
        */

        return this._isNotMoved;
    };

    this.getAvailableSteps = function(chessBoard) {
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
                if(chessBoard[startRow + ofsetRow][startColumn].getIsEmpty()) {
                    availableCell.push(
                        chessBoard[startRow + ofsetRow][startColumn]
                    );
                }

                if(startColumn - 1 >= 0) {
                    if(chessBoard[startRow + ofsetRow][startColumn - 1].getIsEmpty()) {
                        availableCell.push(
                            chessBoard[startRow + ofsetRow][startColumn - 1]
                        );
                    }
                }

                if(startColumn + 1 <= 7) {
                    if(chessBoard[startRow + ofsetRow][startColumn + 1].getIsEmpty()) {
                        availableCell.push(
                            chessBoard[startRow + ofsetRow][startColumn + 1]
                        );
                    }
                }
            }
            
        }

        return availableCell;
    };

    this.getEatingAim = function(chessBoard, gamer) {
        /**
        *   This method calculates all eating aim for
        *   Selected king
        *   @param {this} current pawn
        *   @param {array of array of Cell} chessBoard
        *   @returned {array of Cell} eatingAims
        */

        var startRow = this._oldPosition.row;
        var startColumn = this._oldPosition.column;
        var possibleAims = [];
        var eatingAims = [];

        // Find empty cells for king
        for(var ofsetRow = -1; ofsetRow <= 1; ofsetRow++) {
            if((startRow + ofsetRow >= 0) && (startRow + ofsetRow <= 7)) {

                if(!chessBoard[startRow + ofsetRow][startColumn].getIsEmpty()) {
                    possibleAims.push(
                        chessBoard[startRow + ofsetRow][startColumn]
                    );
                }

                if(startColumn - 1 >= 0) {
                    if(!chessBoard[startRow + ofsetRow][startColumn - 1].getIsEmpty()) {
                        possibleAims.push(
                            chessBoard[startRow + ofsetRow][startColumn - 1]
                        );
                    }
                }

                if(startColumn + 1 <= 7) {
                    if(!chessBoard[startRow + ofsetRow][startColumn + 1].getIsEmpty()) {
                        possibleAims.push(
                            chessBoard[startRow + ofsetRow][startColumn + 1]
                        );
                    }
                }
            }
            
        }

        eatingAims = possibleAims.filter(function(cell) {
            return cell.getFigure().getOwnerId() != gamer.gamerId;
        });

        return eatingAims;
    };

    this.saveMove = function(gamer) {
        /**
        *   This method is extention for base method of figure
        *   This is special method for King
        *   @param {this} current king
        *   @param {object} gamer
        *   @return {nothing}
        */

        baseSaveMove.call(this);
        this._isNotMoved = false;
    };
};