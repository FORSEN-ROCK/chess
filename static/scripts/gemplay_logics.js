/**
*   This script adds base game logics for html chess
*/

(function(){
    $("#start").on("click", startGame);
    $(".figure").on("mousedown", gameControl);
    
})();

function startGame() {
    /**
    *  This function begins new geme
    *  @param {nothing}
    *  @return {noting}
    */

    document.gamers = [
        new Gamer(),
        new Gamer()
    ]
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

function transformToFigure($figure) {
    /**
    *  This function transforms jq-object to js-object
    *  @param {jq-object} $figure is source jq-object
    *  @return {js-object} figure
    */

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
};

// This function is constructor for gamer

function Gamer() {
    this.gamerId = Number(Math.random()*10000);
    this._countMove = 0;
    this.color = null;
    this.figures = [];

    this.getCountMove = function() {
        return this._countMove;
    };

    this.move = function() {
        this._countMove++;
        return this._countMove;
    };
}

//These functions are constructors for figures

function Pawn() {
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