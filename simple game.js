// ------------------------------ Tic-Tac-Toe Game ------------------------------

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';

function makeMove(index) {
    if (board[index] === '') {
        board[index] = currentPlayer;
        const button = document.querySelectorAll('#ticTacToe button')[index];
        button.innerText = currentPlayer === 'X' ? '❌' : '⭕';
        if (checkWin()) {
            setTimeout(() => alert(currentPlayer + ' wins!'), 100);
            return;
        }
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
}

function checkWin() {
    const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return true;
        }
    }
    return false;
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    const buttons = document.querySelectorAll('#ticTacToe .grid button');
    buttons.forEach(button => button.innerText = '');
    button.style.animation = 'iconPop 0.3s ease-out';
}

// ------------------------------ Rock, Paper, Scissors Game ------------------------------

function playRPS(playerChoice) {
    const choices = ['rock', 'paper', 'scissors'];
    const computerChoice = choices[Math.floor(Math.random() * 3)];
    let result = '';
    if (playerChoice === computerChoice) {
        result = 'It\'s a tie!';
    } else if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'scissors' && computerChoice === 'paper') ||
        (playerChoice === 'paper' && computerChoice === 'rock')
    ) {
        result = 'You win!';
    } else {
        result = 'You lose!';
    }
    document.getElementById('rpsResult').innerText = `You chose ${playerChoice}, computer chose ${computerChoice}. ${result}`;
}

// ------------------------------ Guess the Number Game ------------------------------

let randomNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;

function checkGuess() {
    const guess = document.getElementById('guessInput').value;
    attempts++;
    let message = '';
    if (guess < randomNumber) {
        message = 'Too low! Try again.';
    } else if (guess > randomNumber) {
        message = 'Too high! Try again.';
    } else {
        message = `Congratulations! You guessed the number in ${attempts} attempts.`;
        resetGuessGame();
    }
    document.getElementById('guessResult').innerText = message;
}

function resetGuessGame() {
    randomNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    document.getElementById('guessInput').value = '';
}


// Dice Roll with GIF animation
function rollDice() {
    const diceImg = document.getElementById("diceImage");
    const resultText = document.getElementById("diceResult");

    // Show rolling GIF
    diceImg.src = "https://media.tenor.com/I6kN-6X7nhAAAAAi/dice-roll.gif";
    resultText.innerText = "Rolling...";

    // After animation, show final result
    setTimeout(() => {
        const dice = Math.floor(Math.random() * 6) + 1;
        diceImg.src = `https://upload.wikimedia.org/wikipedia/commons/${getDiceImageName(dice)}`;
        resultText.innerText = `You rolled a ${dice}`;
    }, 1500); // 1.5s delay
}

function getDiceImageName(num) {
    const files = {
        1: "1/1b/Dice-1-b.svg",
        2: "5/5f/Dice-2-b.svg",
        3: "b/b1/Dice-3-b.svg",
        4: "f/fd/Dice-4-b.svg",
        5: "0/08/Dice-5-b.svg",
        6: "2/26/Dice-6-b.svg"
    };
    return files[num];
}

// Coin Toss with flipping GIF
function tossCoin() {
    const coinImg = document.getElementById("coinImage");
    const resultText = document.getElementById("coinResult");

    // Show flipping animation
    coinImg.src = "https://media.tenor.com/mqFPOZ4SKeYAAAAC/coin-flip.gif";
    resultText.innerText = "Flipping...";

    // After animation, show result
    setTimeout(() => {
        const result = Math.random() < 0.5 ? "Heads" : "Tails";
        const newSrc = result === "Heads"
            ? "https://upload.wikimedia.org/wikipedia/commons/4/4e/Penny_obverse_2010.jpg"
            : "https://upload.wikimedia.org/wikipedia/commons/4/40/Penny_reverse_2010.jpg";

        coinImg.src = newSrc;
        resultText.innerText = `Result: ${result}`;
    }, 1500); // Delay to simulate flipping
}

// Quick Math Quiz
let currentAnswer = 0;
let score = 0;
let questionCount = 0;

function generateMathQuestion() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ["+", "-", "*"];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let questionText = `${num1} ${operator} ${num2}`;
    currentAnswer = eval(questionText);
    document.getElementById("mathQuestion").innerText = `What is ${questionText}?`;
    document.getElementById("mathResult").innerText = "";
    document.getElementById("mathAnswer").value = "";
    document.getElementById("nextBtn").style.display = "none";
}

function submitAnswer() {
    const userInput = parseInt(document.getElementById("mathAnswer").value, 10);
    const resultElement = document.getElementById("mathResult");
    const nextBtn = document.getElementById("nextBtn");

    if (isNaN(userInput)) {
        resultElement.innerText = "⛔ Please enter a number!";
        resultElement.style.color = "orange";
        return;
    }

    if (userInput === currentAnswer) {
        resultElement.innerText = "✅ Correct!";
        resultElement.style.color = "green";
        score++;
    } else {
        resultElement.innerText = `❌ Wrong! Correct answer: ${currentAnswer}`;
        resultElement.style.color = "red";
    }

    questionCount++;
    document.getElementById("mathScore").innerText = `Score: ${score} / ${questionCount}`;
    nextBtn.style.display = "inline-block";
}

function nextQuestion() {
    generateMathQuestion();
}

function resetQuiz() {
    score = 0;
    questionCount = 0;
    document.getElementById("mathScore").innerText = "";
    generateMathQuestion();
}

window.onload = function () {
    generateMathQuestion();
};



