let playButton;
let difficulty;
let difficultyPanel;
let holes;
let gameBoard;
let customCursor;

//SCOREBOARD ELEMENT REFERENCES
let timeLabel;
let scoreLabel;
let highScoreLabel;


let gameDuration = 10; // Game duration in seconds, updates in html automatically.
let score = 0;
let highScore = 0

let molesVisible = 0; // includes both ghosts and skeletons.

let isGameOver = false;
let gameTimerInterval; 

let activeGhosts = []; // used for tracking active instances of ghost class
let activeSkeletons = [];

const maximumMolesVisible = 3;

const backgroundMusic = new Audio('./media/background_music.mp3');
backgroundMusic.loop = true;

let musicVolume = 0.5; 
let sfxVolume = 0.7;   

const activeSFX = new Set();

document.addEventListener('DOMContentLoaded', function() {
    playButton = document.getElementById('play-button');
    difficultyPanel = document.getElementById('difficulty-panel');
    gameBoard = document.getElementById('game-board');
    holes = document.getElementsByClassName('hole');

    scoreLabel = document.getElementById('score-label');
    timeLabel = document.querySelector('#time-label');
    timeLabel.textContent = `Time: ${gameDuration}s`; /* set to match the variable gameDuration! */
    highScoreLabel = document.querySelector('#high-score-label');

    customCursor = document.getElementById('custom-cursor');
    document.body.style.cursor = "auto"; // sets the cursor to auto when game is not running (when dom loaded)
    customCursor.style.visibility = "hidden";

    //below logic that handles custom hursor to follow cursor
    document.addEventListener('mousemove', function(e) {
    
    customCursor.style.left = (e.clientX) + 'px'; 
    customCursor.style.top = (e.clientY - 70) + 'px'; //offset to give the illusion of an "impact point"

});

    console.log(holes);

    initScoreBoard();
    initButtons();
    initVolumeControls();

    playButton.addEventListener('click', function() {
        startBackgroundMusic();
        playGame();
    });

});

function initScoreBoard(){

    initHighScore();
    initGameTimer();

}

function initGameTimer(){

}



function initVolumeControls() {
    const musicSlider = document.getElementById('music-volume');
    const sfxSlider = document.getElementById('sfx-volume');
    
    if (musicSlider) {
        musicSlider.value = musicVolume * 100;
        musicSlider.addEventListener('input', function() {
            setMusicVolume(this.value / 100);
        });
    }
    
    if (sfxSlider) {
        sfxSlider.value = sfxVolume * 100;
        sfxSlider.addEventListener('input', function() {
            setSFXVolume(this.value / 100);
        });
    }
}


function setMusicVolume(volume) {
    musicVolume = Math.max(0, Math.min(1, volume));
    backgroundMusic.volume = musicVolume;
    
    const musicSlider = document.getElementById('music-volume');
    if (musicSlider) {
        musicSlider.value = musicVolume * 100;
    }
    
    localStorage.setItem('musicVolume', musicVolume);
}

function setSFXVolume(volume) {
    sfxVolume = Math.max(0, Math.min(1, volume)); 
    
    activeSFX.forEach(audio => {
        audio.volume = sfxVolume;
    });
    
    const sfxSlider = document.getElementById('sfx-volume');
    if (sfxSlider) {
        sfxSlider.value = sfxVolume * 100;
    }
    
    localStorage.setItem('sfxVolume', sfxVolume);
}

function startBackgroundMusic() {
    const savedMusicVolume = localStorage.getItem('musicVolume');
    const savedSFXVolume = localStorage.getItem('sfxVolume');
    
    if (savedMusicVolume) {
        setMusicVolume(parseFloat(savedMusicVolume));
    }
    if (savedSFXVolume) {
        setSFXVolume(parseFloat(savedSFXVolume));
    }
    
    backgroundMusic.volume = musicVolume;
    backgroundMusic.play().catch(error => {
        console.log('Background music play failed, will retry after user interaction:', error);
    });
}

function playClickSound() {
    const clickAudio = new Audio('./media/click.wav');
    clickAudio.volume = sfxVolume;
    activeSFX.add(clickAudio);
    
    clickAudio.play().then(() => {
        clickAudio.addEventListener('ended', () => {
            activeSFX.delete(clickAudio);
        });
    }).catch(error => {
        activeSFX.delete(clickAudio);
    });
}

function playBonkSound() {
    const bonkAudio = new Audio('./media/bonk.wav');
    bonkAudio.volume = sfxVolume;
    activeSFX.add(bonkAudio);
    
    bonkAudio.play().then(() => {
        bonkAudio.addEventListener('ended', () => {
            activeSFX.delete(bonkAudio);
        });
    }).catch(error => {
        activeSFX.delete(bonkAudio);
    });
}

function playGhostHurtSound() {
    const ghostAudio = new Audio('./media/ghostHurt.wav');
    ghostAudio.volume = sfxVolume;
    activeSFX.add(ghostAudio);
    
    ghostAudio.play().then(() => {
        ghostAudio.addEventListener('ended', () => {
            activeSFX.delete(ghostAudio);
        });
    }).catch(error => {
        activeSFX.delete(ghostAudio);
    });
}

function playSkeletonHurtSound() {
    const skeletonAudio = new Audio('./media/skeletonHurt.wav');
    skeletonAudio.volume = sfxVolume;
    activeSFX.add(skeletonAudio);
    
    skeletonAudio.play().then(() => {
        skeletonAudio.addEventListener('ended', () => {
            activeSFX.delete(skeletonAudio);
        });
    }).catch(error => {
        activeSFX.delete(skeletonAudio);
    });
}

function playSwooshSound() {
    const swooshAudio = new Audio('./media/swooshIn.wav');
    swooshAudio.volume = sfxVolume;
    activeSFX.add(swooshAudio);
    
    swooshAudio.play().then(() => {
        swooshAudio.addEventListener('ended', () => {
            activeSFX.delete(swooshAudio);
        });
    }).catch(error => {
        activeSFX.delete(swooshAudio);
    });
}

function playCountDownSound(){
    const countDownAudio = new Audio("./media/countdown_counting.wav");
    countDownAudio.volume = sfxVolume;
    activeSFX.add(countDownAudio);

    countDownAudio.play().then(() => {
        countDownAudio.addEventListener('ended', () => {
            activeSFX.delete(countDownAudio);
        });
    }).catch(error => {
        activeSFX.delete(countDownAudio);
    });
}

function playCountDownFinishedSound(){
    const countDownAudio = new Audio("./media/countdown_finished.wav");
    countDownAudio.volume = sfxVolume;
    activeSFX.add(countDownAudio);

    countDownAudio.play().then(() => {
        countDownAudio.addEventListener('ended', () => {
            activeSFX.delete(countDownAudio);
        });
    }).catch(error => {
        activeSFX.delete(countDownAudio);
    });
}

function playBeepSound(){
    const beepAudio = new Audio("./media/beep.mp3");
    beepAudio.volume = sfxVolume;
    activeSFX.add(beepAudio);

    beepAudio.play().then(() => {
        beepAudio.addEventListener('ended', () => {
            activeSFX.delete(beepAudio);
        });
    }).catch(error => {
        activeSFX.delete(beepAudio);
    });
}

function playGameOverSound(){
    const gameOverSound = new Audio("./media/gameOver.mp3");
    gameOverSound.volume = sfxVolume;
    activeSFX.add(gameOverSound);

    gameOverSound.play().then(() => {
        gameOverSound.addEventListener('ended', () => {
            activeSFX.delete(gameOverSound);
        });
    }).catch(error => {
        activeSFX.delete(gameOverSound);
    });
}

function initButtons() {
    const buttons = document.getElementsByClassName('button');

    Array.from(buttons).forEach(function(button) {
        button.addEventListener('click', function() {
            playClickSound();
        });
    });
}

function difficultyToInteger(difficulty){

switch(difficulty){

case("easy"):
return 1;
    break;

case("medium"):
return 2
    break;

case("hard"):
return 3
    break

default:
    return 2; //defauting this function to return 2 makes medium the default diff
    break;

}

}

function initHighScore(){

    if(!localStorage.getItem("highScore")) return; //skip this if there isnt any high score in localStorage
    
    const localHighScore = localStorage.getItem("highScore");

    console.log("localHighScore is: ", localHighScore)

    highScore = localHighScore;
    highScoreLabel.textContent = `High-Score: ${highScore}`;

}

function updateHighScore(newScore){

    if(newScore < highScore) return; // skip this if new score is less than the current high score.
    

    highScore = newScore;
    highScoreLabel.textContent = `High-Score: ${highScore}`;
    localStorage.setItem("highScore", highScore);
    
    flashTextElement(highScoreLabel, "green", "long");
}


function playGame() {
    console.log('Play pressed');

    playButton.style.display = 'none';

    if(difficulty == null) {
        difficultyPanel.style.visibility = 'visible';
    }

    const holes = document.getElementsByClassName('hole');
    Array.from(holes).forEach(function(hole) {
        hole.style.display = 'block';
    });

    selectDifficulty().then((selectedDifficulty) => {
        difficulty = selectedDifficulty;
        document.body.style.cursor = "none"; // sets the cursor to hidden when the game is running
        customCursor.style.visibility = "visible"; // sets custom cursor to visible
        gameLoop(difficulty);
    });
}

function selectDifficulty(difficultyLevel) {
    return new Promise((resolve) => {
        const difficultyButtons = Array.from(difficultyPanel.querySelectorAll('.button'));
        difficultyButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const selectedDifficulty = btn.getAttribute('data-difficulty');
                difficultyPanel.style.visibility = 'hidden';
                resolve(selectedDifficulty);
            });
        });
    });
}

function startCountDown(seconds) {
    let countingFinishedSound = new Audio('./media/countdown_finished.wav');
    let countDownElement = document.createElement("div");
    countDownElement.id = "countdown-timer";
    gameBoard.appendChild(countDownElement);

    return new Promise((resolve) => {
        let counter = seconds;
        const interval = setInterval(() => {
            if (counter > 0) {
                countDownElement.textContent = counter;
                playCountDownSound();
                counter--;
            } else {
                clearInterval(interval);
                countDownElement.textContent = "GO!";
                playCountDownFinishedSound();
                resolve();
                setTimeout(() => {
                    countDownElement.style.display = 'none';
                }, 1000);
            }
        }, 1000);
    });
}

function startGameTimer(){
    return new Promise((resolve) => {
        let counter = gameDuration;
        
        document.getElementById('time-label').textContent = `Time: ${counter}s`;
        
        gameTimerInterval = setInterval(() => {
            if (counter > 0 && !isGameOver) {
                counter--;

                if(counter <= 5) playBeepSound(); //plays the beep audio when time is running out

                document.getElementById('time-label').textContent = `Time: ${counter}s`;
            } else {
                clearInterval(gameTimerInterval);
                isGameOver = true;
                resolve();
            }
        }, 1000);
    });
} 

function gameLoop(difficulty) {
    console.log('Game started with difficulty:', difficulty);
    console.log('That means the difficulty modifier is: ', difficultyToInteger(difficulty))

    isGameOver = false;
    score = 0;
    molesVisible = 0;

    scoreLabel.textContent = `Score: ${score}`;
    
    startCountDown(3).then(() => {
        startGameTimer().then(() => {
            //Happens when the game timer runs out (game over)
            endGame();
            playGameOverSound();
        });

        spawnMoles();

        document.addEventListener('ghostHit', handleGhostHit);
        document.addEventListener('skeletonHit', handleSkeletonHit);

    });  
}

function flashTextElement(element, color, duration){

    element.classList.remove("text-flash-red-short", "text-flash-green-short"); //removes any and all related classes from element
    void element.offsetWidth; // forces reflow of animation
    element.classList.add(`text-flash-${color}-${duration}`) // nice :D

}

function handleGhostHit(){
    if (!isGameOver) {
        score--;
        gameDuration = gameDuration - 10;
        scoreLabel.textContent = `Score: ${score}`;

        flashTextElement(scoreLabel, "red", "short");
        
    }
    console.log("Score:", score);
}
    


function handleSkeletonHit(){
    if (!isGameOver) {
        gameDuration = gameDuration + 5;
        score++;
        scoreLabel.textContent = `Score: ${score}`;

        flashTextElement(scoreLabel, "green", "short");
    }

    console.log("Score:", score);
}

function endGame() {
    console.log("Game Over! Final Score:", score);    
    isGameOver = true;

    updateHighScore(score);

    document.body.style.cursor = "auto"; // sets the cursor to auto when game is not running (when dom loaded)
    customCursor.style.visibility = "hidden";
    

    //THIS ALL HAS TO GET REPLACED WITH ACTUAL HTML...
    const gameOverElement = document.createElement("div");
    gameOverElement.id = "game-over";
    gameOverElement.innerHTML = `
        <h2>Game Over!</h2>
        <p>Final Score: ${score}</p>
        <button class="button" id="play-again">Play Again</button>
    `;
    gameOverElement.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--secondary-color);
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        z-index: 1000;
        border: 3px solid var(--primary-color);
    `;
    
    gameBoard.appendChild(gameOverElement);
    
    document.getElementById('play-again').addEventListener('click', function() {
        resetGame();
        playGame();
    });
    
    playButton.style.display = 'none';
}

function resetGame() {
    const gameOverElement = document.getElementById('game-over');
    if (gameOverElement) {
        gameOverElement.remove();
    }
    
    const countdownTimer = document.getElementById('countdown-timer');
    if (countdownTimer) {
        countdownTimer.remove();
    }
    
    cleanUpMoles();
    
    score = 0;
    molesVisible = 0;
    isGameOver = false;
    difficulty = null; 
    
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
    }
    
    scoreLabel.textContent = `Score: ${score}`;
    document.getElementById('time-label').textContent = `Time: ${gameDuration}s`;
    
    difficultyPanel.style.visibility = 'visible';
}

function cleanUpMoles(){

    if(activeGhosts != []){

        activeGhosts.forEach(ghost => {
        console.log("active ghosts: ", activeGhosts);
        ghost.destroy(); // destroy all active ghosts
        console.log("active ghosts, post-destroy: ", activeGhosts);

        activeGhosts = []; //empty the array

    });

    }
    

    if( activeSkeletons != []){

        activeSkeletons.forEach(skeleton => {
        skeleton.destroy();
    });

    activeSkeletons = [];

    }

}

function spawnMoles() {

    cleanUpMoles();

    for (let i = 0; i < holes.length; i++) {
        const hole = holes[i];
        const ghost = new Ghost(hole);
        const skeleton = new Skeleton(hole);
        activeGhosts.push(ghost); // store new ghost in array
        activeSkeletons.push(skeleton);
    }
}

const ghostHitEvent = new CustomEvent('ghostHit', {});
const skeletonHitEvent = new CustomEvent('skeletonHit', {});

class Ghost {
    constructor(hole) {
        this.hole = hole;
        this.state = "hidden";
        this.isVisible = false;
        this.timeouts = []; //track timeouts for cleaning up after game


        //ghostCanvashides the ghost unless its inside the canvas area. This makes the ghost appear to go INTO the hole and not just through it.
        this.ghostCanvas = document.createElement("div");
        this.ghostCanvas.className = "ghost-canvas";

        this.ghostWrapper = document.createElement("div");
        this.ghostWrapper.className = "ghost-wrapper";

        this.ghostElement = document.createElement("div");
        this.ghostElement.className = "ghost";

        this.ghostWrapper.addEventListener('mousedown', () => {
            if (!isGameOver && (this.state === "idle" || this.state === "appearing")) {
                this.setState("hit");
                document.dispatchEvent(ghostHitEvent);
            }
        });

        this.ghostCanvas.appendChild(this.ghostWrapper);
        this.ghostWrapper.appendChild(this.ghostElement);
        hole.appendChild(this.ghostCanvas);
        
        this.appearRandomly(3);
    }

    cleanup() { //cleans up and removes unused timeouts
        this.timeouts.forEach(timeout => clearTimeout(timeout));
        this.timeouts = [];
    }

    updateState() {
        if (isGameOver && this.state !== "hit") {
            return;
        }
        
        this.ghostWrapper.classList.remove("shake-horizontal", "floatUp", "floatDown");
        
        switch (this.state) {
            case "hidden":
                this.ghostElement.style.display = "none";
                this.ghostElement.style.pointerEvents = "none";
                this.isVisible = false;
                
                if (!isGameOver) {
                    this.appearRandomly(15);
                }
                break;
                
            case "appearing":
                if (!isGameOver && molesVisible < maximumMolesVisible && !this.hole.classList.contains('occupied')) {
                    molesVisible++;
                    this.isVisible = true;
                    playSwooshSound();
                    this.hole.classList.add('occupied');

                    console.log("Ghost appeared. Total visible:", molesVisible);

                    this.ghostElement.style.backgroundImage = "url('./media/ghost_appear.png')";
                    this.ghostElement.style.display = "block";
                    this.ghostElement.style.pointerEvents = "all";
                    this.ghostWrapper.classList.add("floatUp");

                    const timeout = setTimeout(() => {
                        this.setState("idle");
                    }, 500);
                    this.timeouts.push(timeout); //add timeout to array
                } else {
                    this.setState("hidden");
                }
                break;
                
            case "idle":
                this.ghostElement.style.backgroundImage = "url('./media/ghost_idle.gif')";
                this.ghostElement.style.backgroundSize = "cover";
                if (!isGameOver) {
                    this.disappearRandomlyAfterMaxSeconds(5);
                }
                break;
                
            case "hit":
                playBonkSound();
                playGhostHurtSound();
                this.ghostElement.style.backgroundImage = "url('./media/ghost_hit.png')";
                this.ghostElement.style.pointerEvents = "none";
                void this.ghostWrapper.offsetWidth;
                this.ghostWrapper.classList.add("shake-horizontal");
                
                const hitTimeout = setTimeout(() => {
                    this.setState("disappearing");
                }, 500);
                this.timeouts.push(hitTimeout); //add timeout to array
                break;
                
            case "disappearing":
                if (this.isVisible) {
                    molesVisible--;
                    this.isVisible = false;
                }
                
                playSwooshSound();
                this.ghostWrapper.classList.add("floatDown");
                this.hole.classList.remove('occupied');

                const disappearTimeout = setTimeout(() => {
                    this.setState("hidden");
                }, 500);
                this.timeouts.push(disappearTimeout); //add timeout to array
                break;
        }
    }

    setState(newState) {
        this.state = newState;
        this.updateState();
    }

    appearRandomly(maxDelaySeconds) {

        if (isGameOver || this.state !== "hidden") {
            return;
        }
        
        if (molesVisible >= maximumMolesVisible) {
            const timeout = setTimeout(() => this.appearRandomly(maxDelaySeconds), 1000);
            this.timeouts.push(timeout);
            return;
        }
        
        const randomDelay = Math.random() * maxDelaySeconds * 1000;
        const timeout = setTimeout(() => {
            if (!isGameOver && this.state === "hidden" && molesVisible < maximumMolesVisible) {
                this.setState("appearing");
            } else if (!isGameOver) {
                this.appearRandomly(2);
            }
        }, randomDelay);
        this.timeouts.push(timeout);
    }

    disappearRandomlyAfterMaxSeconds(seconds) {
        const timeout = setTimeout(() => {
            if (!isGameOver && this.state === "idle") {
                this.setState("disappearing");
            }
        }, (Math.random() * calculateDissapearDiff() * 1000));
        this.timeouts.push(timeout);
    }
    
    //AI GENERATED DESTROY!!
    destroy() {
        // 1. Clear all timeouts
        this.cleanup();
        
        // 2. Remove event listeners
        if (this.ghostWrapper) {
            this.ghostWrapper.removeEventListener('mousedown', this.handleMouseDown);
        }
        
        // 3. Remove DOM elements
        if (this.ghostCanvas && this.ghostCanvas.parentNode) {
            this.ghostCanvas.parentNode.removeChild(this.ghostCanvas);
        }
        
        // 4. Update ghost count if this ghost was visible
        if (this.isVisible) {
            molesVisible--;
            console.log("Ghost destroyed. Total visible:", molesVisible);
        }
        
        // 5. Nullify references to help garbage collection
        this.hole = null;
        this.ghostWrapper = null;
        this.ghostElement = null;
        this.handleMouseDown = null;
        
        // 6. Set state to indicate destruction
        this.state = "destroyed";
    }
}

class Skeleton {
    constructor(hole) {
        this.hole = hole;
        this.state = "hidden";
        this.isVisible = false;
        this.timeouts = []; //track timeouts for cleaning up after game


        //skeletonCanvashides the skeleton unless its inside the canvas area. This makes the skeleton appear to go INTO the hole and not just through it.
        this.skeletonCanvas = document.createElement("div");
        this.skeletonCanvas.className = "skeleton-canvas";

        this.skeletonWrapper = document.createElement("div");
        this.skeletonWrapper.className = "skeleton-wrapper";

        this.skeletonElement = document.createElement("div");
        this.skeletonElement.className = "skeleton";

        this.skeletonWrapper.addEventListener('mousedown', () => {
            if (!isGameOver && (this.state === "idle" || this.state === "appearing")) {
                this.setState("hit");
                document.dispatchEvent(skeletonHitEvent);
            }
        });

        this.skeletonCanvas.appendChild(this.skeletonWrapper);
        this.skeletonWrapper.appendChild(this.skeletonElement);
        hole.appendChild(this.skeletonCanvas);
        
        this.appearRandomly(3);
    }

    cleanup() { //cleans up and removes unused timeouts
        this.timeouts.forEach(timeout => clearTimeout(timeout));
        this.timeouts = [];
    }

    updateState() {
        if (isGameOver && this.state !== "hit") {
            return;
        }
        
        this.skeletonWrapper.classList.remove("shake-horizontal", "floatUp", "floatDown");
        
        switch (this.state) {
            case "hidden":
                this.skeletonElement.style.display = "none";
                this.skeletonElement.style.pointerEvents = "none";
                this.isVisible = false;
                
                
                if (!isGameOver) {
                    this.appearRandomly(15);
                }
                break;
                
            case "appearing":
                if (!isGameOver && molesVisible < maximumMolesVisible && !this.hole.classList.contains('occupied')) {
                    molesVisible++;
                    this.isVisible = true;
                    playSwooshSound();
                    this.hole.classList.add('occupied');

                    console.log("Skeleton appeared. Total visible:", molesVisible);

                    this.skeletonElement.style.backgroundImage = "url('./media/skeleton_appear.png')";
                    this.skeletonElement.style.display = "block";
                    this.skeletonElement.style.pointerEvents = "all";
                    this.skeletonWrapper.classList.add("floatUp");

                    const timeout = setTimeout(() => {
                        this.setState("idle");
                    }, 500);
                    this.timeouts.push(timeout); //add timeout to array
                } else {
                    this.setState("hidden");
                }
                break;
                
            case "idle":
                this.skeletonElement.style.backgroundImage = "url('./media/skeleton_idle.gif')";
                this.skeletonElement.style.backgroundSize = "cover";
                if (!isGameOver) {
                    this.disappearRandomlyAfterMaxSeconds(5);
                }
                break;
                
            case "hit":
                playBonkSound();
                playSkeletonHurtSound();
                
                // Add cache-busting parameter to force reload of gif, to play the one-shot animation again
                // Basically takes the current time and adds it to the url, which makes the browser think its a "new" file,
                // and therefore plays the animation again... 
                // New concept to me, a tad worried about possible performance loss due to this method.
                // gif anim can easily be swapped out for a css animation too...

                const timestamp = new Date().getTime();
                this.skeletonElement.style.backgroundImage = `url('./media/skeleton_hit.gif?${timestamp}')`;
                
                this.skeletonElement.style.pointerEvents = "none";
                void this.skeletonWrapper.offsetWidth;
                this.skeletonWrapper.classList.add("shake-horizontal");
                
                const hitTimeout = setTimeout(() => {
                    this.setState("disappearing");
                }, 500);
                this.timeouts.push(hitTimeout);
                break;
                
            case "disappearing":
                if (this.isVisible) {
                    molesVisible--;
                    this.isVisible = false;
                }
                
                playSwooshSound();
                this.skeletonWrapper.classList.add("floatDown");
                this.hole.classList.remove('occupied');
                
                const disappearTimeout = setTimeout(() => {
                    this.setState("hidden");
                }, 500);
                this.timeouts.push(disappearTimeout); //add timeout to array
                break;
        }
    }

    setState(newState) {
        this.state = newState;
        this.updateState();
    }

    appearRandomly(maxDelaySeconds) {

        if (isGameOver || this.state !== "hidden") {
            return;
        }
        
        if (molesVisible >= maximumMolesVisible) {
            const timeout = setTimeout(() => this.appearRandomly(maxDelaySeconds), 1000);
            this.timeouts.push(timeout);
            return;
        }
        
        const randomDelay = Math.random() * maxDelaySeconds * 1000;
        const timeout = setTimeout(() => {
            if (!isGameOver && this.state === "hidden" && molesVisible < maximumMolesVisible) {
                this.setState("appearing");
            } else if (!isGameOver) {
                this.appearRandomly(2);
            }
        }, randomDelay);
        this.timeouts.push(timeout);
    }

    disappearRandomlyAfterMaxSeconds(seconds) {
        const timeout = setTimeout(() => {
            if (!isGameOver && this.state === "idle") {
                this.setState("disappearing");
            }
        }, (Math.random() * calculateDissapearDiff() * 1000));
        this.timeouts.push(timeout);
    }
    
    //AI GENERATED DESTROY!!
    destroy() {
        // 1. Clear all timeouts
        this.cleanup();
        
        // 2. Remove event listeners
        if (this.skeletonWrapper) {
            this.skeletonWrapper.removeEventListener('mousedown', this.handleMouseDown);
        }
        
        // 3. Remove DOM elements
        if (this.skeletonCanvas && this.skeletonCanvas.parentNode) {
            this.skeletonCanvas.parentNode.removeChild(this.skeletonCanvas);
        }
        
        // 4. Update skeleton count if this skeleton was visible
        if (this.isVisible) {
            molesVisible--;
            console.log("Skeleton destroyed. Total visible:", molesVisible);
        }
        
        // 5. Nullify references to help garbage collection
        this.hole = null;
        this.skeletonWrapper = null;
        this.skeletonElement = null;
        this.handleMouseDown = null;
        
        // 6. Set state to indicate destruction
        this.state = "destroyed";
    }
}


function calculateDissapearDiff(){

    const disappearMaxTime = 5;
    const diff = (disappearMaxTime - (1.5 * difficultyToInteger(difficulty))); /* multiplies the difftoint with 1.5 to make effect more extreme */

    console.log('The current difficultotointeger is: ', difficultyToInteger(difficulty))
    console.log('calculating the max disappear time to be: ', diff);

    return diff;


}