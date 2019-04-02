/**
*   This script adds base game logics for html chess
*/

(function(){
    $("#start").onclick(function(){
        
    });
    $(".figure").on("mousedown", gameControl);
    
})();

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

//These functions are classes for figures

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