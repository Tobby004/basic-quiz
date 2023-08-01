var questions = [];
var currentQuestion = 0;
var score = 0;
var totQuestions = 0;
var timeRemaining = 0; // Will be set after fetching questions
var selectedChoices = []; // Keep track of selected choices for each question

var quizContainer = document.getElementById('quiz-container');
var questionEl = document.getElementById('question');
var choicesEl = document.getElementById('choices');
var nextButton = document.getElementById('next');
var prevButton = document.getElementById('prev');
var resultCont = document.getElementById('result');
var retryButton;
var progressBar = document.getElementById('progress');
var scoreEl = document.getElementById('score');
var timerEl = document.getElementById('timer');

fetch('https://opentdb.com/api.php?amount=15&category=23&difficulty=medium&type=multiple')
    .then(response => response.json())
    .then(data => {
        questions = data.results.map(item => ({
            question: item.question,
            choices: [...item.incorrect_answers, item.correct_answer],
            answer: item.correct_answer
        }));

        // Shuffle choices for each question
        questions.forEach(question => {
            for (let i = question.choices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [question.choices[i], question.choices[j]] = [question.choices[j], question.choices[i]];
            }

            // After shuffling, find the correct answer index
            question.answer = question.choices.indexOf(question.answer);
        });

        // Now you have your questions array ready
        totQuestions = questions.length;

        // Set time remaining based on number of questions (30 seconds per question)
        timeRemaining = totQuestions * 30;

        // Load the first question
        loadQuestion(currentQuestion);
    })
    .catch(error => console.error(error));

function loadQuestion (questionIndex) {
    var q = questions[questionIndex];
    questionEl.textContent = (questionIndex + 1) + '. ' + q.question;
    choicesEl.innerHTML = '';
    var buttonColors = ["#007BFF", "#28a745", "#dc3545", "#ffc107"]; // blue, green, red, yellow
    var choicesLabels = ["A", "B", "C", "D"];
    for(var i = 0; i < q.choices.length; i++) {
        var choice = document.createElement("button");
        choice.textContent = choicesLabels[i] + ': ' + q.choices[i];
        choice.id = 'btn' + i;
        choice.style.backgroundColor = buttonColors[i];
        choicesEl.appendChild(choice);
        choice.addEventListener("click", function(){
            var selectedChoiceId = this.id;
            var selectedChoiceIndex = parseInt(selectedChoiceId.replace('btn',''));

            // Save the selected choice
            selectedChoices[currentQuestion] = selectedChoiceIndex;

            // Check answer and update score
            if(selectedChoiceIndex === q.answer){
                score++;
            }

            // Do not automatically move to the next question
        });
    }

    // Check if a choice has been selected for this question, and highlight it
    var selectedChoice = selectedChoices[questionIndex];
    if (selectedChoice !== undefined) {
        document.getElementById('btn' + selectedChoice).classList.add('selected');
    }

    // Update progress bar
    progressBar.style.width = ((questionIndex + 1) / totQuestions * 100) + '%';

    // Start timer
    startTimer();
}

function startTimer() {
    var minutes = Math.floor(timeRemaining / 60);
    var seconds = timeRemaining % 60;
    timerEl.textContent = 'Time Remaining: ' + formatTime(minutes) + ':' + formatTime(seconds);
    var timer = setInterval(function() {
        timeRemaining--;
        minutes = Math.floor(timeRemaining / 60);
        seconds = timeRemaining % 60;
        timerEl.textContent = 'Time Remaining: ' + formatTime(minutes) + ':' + formatTime(seconds);
        if (timeRemaining <= 0) {
            clearInterval(timer);
            endQuiz();
        }
    }, 1000);
}

// Helper function to format time
function formatTime(time) {
    return time < 10 ? '0' + time : time;
}

function loadPreviousQuestion() {
    if(currentQuestion > 0){
        currentQuestion--;
        loadQuestion(currentQuestion);
    }
}

function endQuiz() {
    quizContainer.style.display = 'none';
    resultCont.style.display = '';
    scoreEl.textContent = 'Your Score: ' + score;

    // Check if a "Try Again" button already exists
    retryButton = document.getElementById('retry');
    if (!retryButton) {
        // If not, create a new one
        retryButton = document.createElement("button");
        retryButton.id = 'retry';  // Add an ID to the "Try Again" button
        retryButton.textContent = 'Try Again';
        retryButton.style.backgroundColor = '#007BFF';
        retryButton.style.color = 'white';
        retryButton.style.cursor = 'pointer';
        resultCont.appendChild(retryButton);
        retryButton.addEventListener("click", resetQuiz);
    }
}


function resetQuiz() {
    resultCont.style.display = 'none';
    retryButton.remove();
    score = 0;
    currentQuestion = 0;
    nextButton.textContent = 'Next';
    quizContainer.style.display = '';
    timeRemaining = totQuestions * 30;
    fetchQuestions();
}

// Add event listeners for Next and Previous buttons
nextButton.addEventListener("click", function(){
    if(currentQuestion < totQuestions - 1){
        currentQuestion++;
        loadQuestion(currentQuestion);
    } else {
        endQuiz();
    }
});

prevButton.addEventListener("click", loadPreviousQuestion);
