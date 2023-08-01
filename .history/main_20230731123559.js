var questions = [];
var currentQuestion = 0;
var score = 0;
var totQuestions = 0;

var quizContainer = document.getElementById('quiz-container');
var questionEl = document.getElementById('question');
var choicesEl = document.getElementById('choices');
var nextButton = document.getElementById('next');
var prevButton = document.getElementById('prev');
var resultCont = document.getElementById('result');
var retryButton;
var progressBar = document.getElementById('progress');
var scoreEl = document.getElementById('score');

fetch('https://opentdb.com/api.php?amount=30&category=21&difficulty=medium&type=multiple')
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
        loadQuestion(currentQuestion);
    })
    .catch(error => console.error(error));

function loadQuestion (questionIndex) {
    var q = questions[questionIndex];
    questionEl.textContent = (questionIndex + 1) + '. ' + q.question;
    choicesEl.innerHTML = '';
    var buttonColors = ["#007BFF", "#28a745", "#dc3545", "#ffc107"]; // blue, green, red, yellow
    for(var i = 0; i < q.choices.length; i++) {
        var choice = document.createElement("button");
        choice.textContent = q.choices[i];
        choice.id = 'btn' + i;
        choice.style.backgroundColor = buttonColors[i];
        choicesEl.appendChild(choice);
        choice.addEventListener("click", function(){
            var selectedChoiceId = this.id;
            var selectedChoiceIndex = parseInt(selectedChoiceId.replace('btn',''));
            if(selectedChoiceIndex === q.answer){
                score++;
            }
            currentQuestion++;
            if(currentQuestion == totQuestions - 1){
                nextButton.textContent = 'Finish';
            }
            if(currentQuestion == totQuestions){
                endQuiz();
                return;
            }
            loadQuestion(currentQuestion);
        });
    }

    // Update progress bar
    progressBar.style.width = ((questionIndex + 1) / totQuestions * 100) + '%';
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
    retryButton = document.createElement("button");
    retryButton.textContent = 'Try Again';
    retryButton.style.backgroundColor = '#007BFF';
    retryButton.style.color = 'white';
    retryButton.style.cursor = 'pointer';
    resultCont.appendChild(retryButton);
    retryButton.addEventListener("click", resetQuiz);
}

function resetQuiz() {
    resultCont.style.display = 'none';
    retryButton.remove();
    score = 0;
    currentQuestion = 0;
    nextButton.textContent = 'Next';
    quizContainer.style.display = '';
    fetchQuestions();
}

loadQuestion(currentQuestion);

nextButton.addEventListener("click", function(){
    if(currentQuestion < totQuestions - 1){
        currentQuestion++;
        loadQuestion(currentQuestion);
    } else if(currentQuestion == totQuestions - 1){
        endQuiz();
    }
});

prevButton.addEventListener("click", loadPreviousQuestion);
