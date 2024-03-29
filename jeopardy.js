// ____________________NEW SCRIPT____________________
        // NOTES TO HATCHWAY REVIEWER:
            // I ended up writing the application from scratch instead filling in the provided functions.
            // I wanted to challenge myself to finish this assignment without relying on any given code.
            // If this is an issue please let me know and I will refactor my work back into the functions given originally.




// _____GLOBAL VARIABLES_____
const loadedCategories = [];
const categoryIndexArray = []





// _____MAIN FUNCTIONS_____

// gets all category IDs from jeopardy API  =>  gets properties of each category => which are made into an object and pushed into an array declared globally
async function LoadCategoriesFromAPI(){
    const responseForIds = await axios.get("https://rithm-jeopardy.herokuapp.com/api/categories?count=100");
    const arrayOfIds = responseForIds.data.map((val) => val.id);
    
    const categories = [];

    // When this loop was move to a helper function, it seemed to freeze the application?
        // Look into calling async functions within an async function. 
    for (let id of arrayOfIds){
       const responseForCategories = await axios.get("https://rithm-jeopardy.herokuapp.com/api/category?", ({params: {id}}))
       let newCategory = {
            title: responseForCategories.data.title,
            clues: getClues(responseForCategories),
            showing: false
       }; 
       categories.push(newCategory);
    }

    categories.forEach((categoryObj) => loadedCategories.push(categoryObj));
    changeButtonTextToStartWhenFinishedLoading();
}



function createGameTable() {
    let $newTable = $('<table>');
    makeCategoriesRow($newTable);
    makeQuestionRows($newTable);
    $('body').append($($newTable));
}




function createStartMenu(){
    let $newDiv = $('<div>')
        .attr('id', 'header');
    $newDiv.append($('<h1>JEOPARDY!<h1/>'))
    let $newbutton = makeNewButton();
    $startButton = $newbutton;
    $newDiv.append($newbutton);        
    $('body').append($newDiv);    
}




function addEventListenerToTable(){
    $('td').on('click', (event) => {
        if (event.currentTarget.innerText === '?'){
            event.currentTarget.innerText = $(event.target).attr('data-question');
            $(event.target).css('font-size', '130%')
        } else {
            event.currentTarget.innerText = $(event.target).attr('data-answer');
            $(event.target).css("background-color", "rgb(107, 255, 107)");
        }
    })
}



function makeBoardOnClick(){
    createGameTable();
    addEventListenerToTable();
}




function restartGame() {
    $('table').remove()
    resetShowingProperty();
    makeBoardOnClick();
}








// _____HELPER FUNCTIONS_____

// makes loading/start/restart button and adds event listener that handles before for click depending on its value
function makeNewButton(){
    return $('<input type="button" value="LOADING..." id="start-button">')
    .on('click', (event) => {
        if ($('#start-button').attr('value') === "START!") {
            makeBoardOnClick();
            $('#start-button').attr('value', 'RESTART?');
            $('#start-button').css('background-color', 'rgb(255, 255, 144)')
        } else if ($('#start-button').attr('value') === "RESTART?") {
            restartGame();
        }
    })
}



function getClues(categories){
    const cluesObj = [];
    const clues = categories.data.clues;
    for (let clue of clues){
        const newClue = {
            question: clue.question,
            answer: clue.answer,
            showing: null
        };
        cluesObj.push(newClue);
    }
    return cluesObj;
}




function makeCategoriesRow(table){
    let $newTr = $('<tr>');

    // clears categoryIndexArray so that no unintended extra questions are generated during restart
    categoryIndexArray.length = 0;

    for (let i = 0; i < 5; i++){
        let categoryIndex = getRandomCategoryIndex()
        categoryIndexArray.push(categoryIndex);
        let randomCategory = loadedCategories[categoryIndex].title;
        let $newTh = $('<th>')
            .addClass('categories')
            .text(randomCategory);
        $newTr.append($newTh);
    }
    table.append($newTr);
}



function makeQuestionRows(table){
    for (let i = 0; i < 5; i++){
        let $newTr = $('<tr>').empty();
        
        for (let catIndex of categoryIndexArray){
            let $newTd = $('<td>')
                .addClass('questions')
                .text('?')
                .attr("data-question", loadedCategories[catIndex].clues[i].question)
                .attr("data-answer", loadedCategories[catIndex].clues[i].answer);
            loadedCategories[catIndex].clues[i].showing = true;
            $newTr.append($newTd);
        }
        table.append($newTr);   
    }
}




function getRandomCategoryIndex(){
    let index = Math.floor(Math.random() * loadedCategories.length);
    while (loadedCategories[index].showing !== false) {
        index = Math.floor(Math.random() * loadedCategories.length);
    }
    loadedCategories[index].showing = true;
    return index
}



function changeButtonTextToStartWhenFinishedLoading(){
    $('#start-button')
        .attr('value', "START!")
        .css("background-color", "rgb(107, 255, 107)");
};





function resetShowingProperty() {
    for (let i = 0; i < loadedCategories.length; i++) {
        loadedCategories[i].showing = false;
    }
}





// _____EVENT LISTENERS_____
$(document).ready(() => {
    createStartMenu();
    LoadCategoriesFromAPI();
})
