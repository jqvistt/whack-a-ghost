
let playButton;
let difficulty;
let difficultyPanel;
let holes;
let gameBoard;



document.addEventListener('DOMContentLoaded', function() {

playButton = document.getElementById('play-button');
difficultyPanel = document.getElementById('difficulty-panel');
gameBoard = document.getElementById('game-board');
holes = document.getElementsByClassName('hole');

console.log(holes);

initButtons();
checkButtonAndRun(playButton, playGame);

});

    

function playClickSound() {
    const audio = new Audio('../media/click.wav');
    audio.play();
}

function playBonkSound() {
    const audio = new Audio('../media/bonk.wav');
    audio.play();
}

function initButtons() {
    const buttons = document.getElementsByClassName('button');

    Array.from(buttons).forEach(function(button) {
        button.addEventListener('click', function() {
            playClickSound();
        });
    });
        
}

function checkButtonAndRun(button, functionToRun) {
    
    if (button == null) {
        return;
    }
    
    button.addEventListener('click', function() {
        functionToRun();
    });
}

function playGame() {
    console.log('Game started!');

    playButton.style.display = 'none';

    if(difficulty == null) {
        difficultyPanel.style.visibility = 'visible';
    }

    const holes = document.getElementsByClassName('hole');
    Array.from(holes).forEach(function(hole) {
        hole.style.display = 'block';
    });

    //difficulty selection
    const difficultyButtons = Array.from(difficultyPanel.querySelectorAll('.button'));
        difficultyButtons.forEach(function(btn) {
            checkButtonAndRun(btn, function() {
                difficulty = btn.dataset.difficulty;
                difficultyPanel.style.visibility = 'hidden';      
                gameLoop(difficulty);
            });
        });

}

function gameLoop(difficulty) {

    let countingSound = new Audio('../media/countdown_counting.wav');
    let countingFinishedSound = new Audio('../media/countdown_finished.wav');
    let countDownTimer = document.createElement("div");
    countDownTimer.id = "countdown-timer";
    gameBoard.appendChild(countDownTimer);
    

    let countdown = 3; //seconds
    let gameTimer = 60; //seconds

    let score = 0;
    
    const countdownInterval = setInterval(() => {
        if (countdown > 0) {
            countDownTimer.textContent = countdown;
            console.log(countdown);
            countingSound.play();
            countdown--;
        } else {
            clearInterval(countdownInterval);
            countDownTimer.textContent = "GO!";
            console.log(countdown);
            countingFinishedSound.play();
            setTimeout(() => {
                countDownTimer.style.display = 'none';
            }, 1000);   

            // End game logic here
        }
    },1000);

    for (let i = 0; i < holes.length; i++) {
        const hole = holes[i];
        const mole = new Ghost(hole);
    }
}


class Ghost {
    constructor(hole) {
        this.hole = hole;
        this.state = "";
        this.ghostElement = document.createElement("div");
        this.ghostElement.className = "ghost";

        this.ghostElement.addEventListener('click', () => {
            this.setState("hit");
        });
        
        hole.appendChild(this.ghostElement);
        this.updateState();
    }


    //hidden
    //appearing
    //disappearing
    //hit
    //idle

    updateState() {
        switch (this.state) {
            case "idle":
                this.ghostElement.style.backgroundImage = "url('../media/ghost_idle.gif')";
                this.ghostElement.style.backgroundSize = "cover";
                this.ghostElement.style.width = "100%";
                this.ghostElement.style.height = "100%";
                break;
            case "hit":
                playBonkSound();
                this.ghostElement.style.backgroundImage = "url('../media/ghost_hit.png')";
                
                setTimeout(() => {
                    this.setState("idle");
                }, 1000);
                break;
            default:
                console.warn("Unknown state:", this.state);
                break;
        }
    }

    // Method to change state
    setState(newState) {
        this.state = newState;
        this.updateState();
    }
}

