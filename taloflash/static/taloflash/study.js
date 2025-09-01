var flashcardIndex = 0;
var flashcards = [];
var remainingFlashcards = [];
var timerIntervals = [];
var learnedFlashcardsCounter = 0;
var failedFlashcardsCounter = 0;
var settings = JSON.parse(document.querySelector("#settings-data").textContent);

document.addEventListener('DOMContentLoaded', () => {
    let pathnameArray = window.location.pathname.split("/");
    var flashset_id = pathnameArray[2];

    if (settings.showTimer) {
        handleTimer();
    }

    fetch(`/sets/${flashset_id}/study`, {
        method: "POST",
        headers: {
            'X-CSRFToken': Cookies.get('csrftoken')
        },
        credentials: 'same-origin',
    })
    .then(response => response.json())
    .then(responseFlashcards => {
        flashcards = responseFlashcards.slice(0);
        document.querySelector("#learnedFlashcards").innerHTML = `Flashcards learned: 0/${responseFlashcards.length}`;
        document.querySelector("#learnedButton").addEventListener('click', () => learned(responseFlashcards.length));
        document.querySelector("#notLearnedButton").addEventListener('click', () => notLearned());
        displayFlashcard();
    });
});

function flip(cooldown) {
    let flashcardFront = document.querySelector("#flashcardFront");
    let flashcardBack = document.querySelector("#flashcardBack");

    if (flashcardFront.classList.contains("d-none")) {
        flashcardBack.classList.add("d-none");
        flashcardFront.classList.remove("d-none");
    } else {
        flashcardFront.classList.add("d-none");
        flashcardBack.classList.remove("d-none");
    }

    setTimeout(() => {
        document.querySelector("#learnedButton").disabled = false;
        document.querySelector("#notLearnedButton").disabled = false;
    }, cooldown*1000);

}

function displayFlashcard() {
    let flashcard = flashcards[flashcardIndex];
    let frontText = document.querySelector('#studyFlashcardFrontText');
    let backText = document.querySelector('#studyFlashcardBackText');
    let frontImageURL = document.querySelector('#studyFlashcardFrontImageURL');
    let backImageURL = document.querySelector('#studyFlashcardBackImageURL');

    frontText.innerHTML = flashcard.front;
    backText.innerHTML = flashcard.back;
    frontImageURL.src = flashcard.imageURL;
    backImageURL.src = flashcard.imageURL;
}

function learned(totalFlashcardsLength) {
    learnedFlashcardsCounter += 1;
    document.querySelector("#learnedFlashcards").innerHTML = `Flashcards learned: ${learnedFlashcardsCounter}/${totalFlashcardsLength}`;

    // If current flashcard is the last one, shuffle and reset remaining flashcards
    if (flashcardIndex === flashcards.length - 1) {
        flashcards = remainingFlashcards.splice(0);
        remainingFlashcards = [];
        flashcardIndex = 0;
        flip(0);
        // If all the flashcards have been learned
        if (parseInt(flashcards.length) === 0) {
            timerIntervals.forEach(clearInterval);
            displayResults();
            return
        }
        flashcards = shuffle(flashcards);
        displayFlashcard();
        return
    }

    flashcardIndex += 1;
    flip(0);
    displayFlashcard();
}

function notLearned() {
    // If hardcore mode is on
    if (settings.hardcoreMode) {
        window.location.assign(window.location.href.split("/study")[0]);
        return
    }

    failedFlashcardsCounter += 1;

    // If current flashcard is the last one, shuffle and reset remaining flashcards
    if (flashcardIndex === flashcards.length - 1) {
        remainingFlashcards.push(flashcards[flashcardIndex]);
        flashcards = remainingFlashcards.splice(0);
        remainingFlashcards = [];
        flashcardIndex = 0;
        flip(0);
        flashcards = shuffle(flashcards);
        displayFlashcard();
        return
    }

    remainingFlashcards.push(flashcards[flashcardIndex]);
    flashcardIndex += 1;
    flip(0);
    displayFlashcard();
}

function shuffle(array) {
    let shuffledArray = [];
    while(true) {
        let index = Math.floor(Math.random() * array.length);
        if (!shuffledArray.includes(array[index])) {
            shuffledArray.push(array[index]);
        }
        if (shuffledArray.length === array.length) {
            return shuffledArray;
        }
    }
}

function handleTimer() {
    let centiseconds = 0;
    let seconds = 0;
    let minutes = 0;
    let hours = 0;
    var timer = document.querySelector("#studyTimer");
    timer.innerHTML = "Timer: 00:00:00:00"
    var centisecondInterval = setInterval(() => {
        centiseconds += 1;
        timer.innerHTML = `Timer: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(centiseconds).padStart(2, '0')}`;
    }, 10);
    var secondInterval = setInterval(() => {
        seconds += 1;
        centiseconds = 0;
    }, 1000);
    var minuteInterval = setInterval(() => {
        minutes += 1;
        seconds = 0;
    }, 1000*60);
    var hourInterval = setInterval(() => {
        hours += 1;
        minutes = 0;
    }, 1000*60*60);
    if (settings.timeLimit != 0) {
        var limitInterval = setInterval(() => {
            if (settings.timeLimitBehavior === "nothing") {
                timer.style.color = "red";
            } else if (settings.timeLimitBehavior === "kick") {
                window.location.assign(window.location.href.split("/study")[0]);
            } else {
                window.location.assign(window.location.href);
            }
        }, settings.timeLimit*1000);
    }
    timerIntervals.push(centisecondInterval, secondInterval, minuteInterval, hourInterval, limitInterval);
}

function displayResults() {
    document.querySelector("#flashcardFront").classList.add("d-none");
    document.querySelector("#flashcardBack").classList.add("d-none");
    document.querySelector("#studyResults").classList.remove("d-none");

    let accuracyPercentage = Math.round(learnedFlashcardsCounter/(learnedFlashcardsCounter+failedFlashcardsCounter)*100);
    document.querySelector("#studyAccuracy").innerHTML = `Accuracy: ${learnedFlashcardsCounter}/${learnedFlashcardsCounter+failedFlashcardsCounter} (&#126;${accuracyPercentage}%)`;
}