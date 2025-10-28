let playButton;
let difficulty;
let difficultyPanel;
let holes;
let gameBoard;

const gameDuration = 60; // Game duration in seconds
let score = 0;

let ghostsVisible = 0;

let isGameOver = false;
let gameTimerInterval; 

const maximumGhostsVisible = 3;

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

    document.addEventListener('mousemove', function(e) {
    const cursor = document.getElementById('custom-cursor');
    cursor.style.left = (e.clientX - 32) + 'px'; // Center the cursor
    cursor.style.top = (e.clientY - 32) + 'px';
});







    console.log(holes);

    initButtons();
    initVolumeControls();

    playButton.addEventListener('click', function() {
        startBackgroundMusic();
        playGame();
    });
});

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

    isGameOver = false;
    score = 0;
    ghostsVisible = 0;
    document.getElementById('score-label').textContent = `Score: ${score}`;
    
    startCountDown(3).then(() => {
        startGameTimer().then(() => {
            endGame();
            playGameOverSound();
        });
        spawnGhosts();

        document.addEventListener('ghostHit', () => {
            if (!isGameOver) {
                score++;
                document.getElementById('score-label').textContent = `Score: ${score}`;
                console.log("Score:", score);
            }
        });
    });  
}

function endGame() {
    console.log("Game Over! Final Score:", score);    
    isGameOver = true;
    
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
    
    const ghostWrappers = document.querySelectorAll('.ghost-wrapper');
    ghostWrappers.forEach(wrapper => wrapper.remove());
    
    score = 0;
    ghostsVisible = 0;
    isGameOver = false;
    difficulty = null; 
    
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
    }
    
    document.getElementById('score-label').textContent = `Score: ${score}`;
    document.getElementById('time-label').textContent = `Time: ${gameDuration}s`;
    
    difficultyPanel.style.visibility = 'visible';
}

function spawnGhosts() {
    for (let i = 0; i < holes.length; i++) {
        const hole = holes[i];
        new Ghost(hole);
    }
}

const hitEvent = new CustomEvent('ghostHit', {});

class Ghost {
    constructor(hole) {
        this.hole = hole;
        this.state = "hidden";
        this.isVisible = false;

        this.ghostWrapper = document.createElement("div");
        this.ghostWrapper.className = "ghost-wrapper";

        this.ghostElement = document.createElement("div");
        this.ghostElement.className = "ghost";

        this.ghostWrapper.addEventListener('mousedown', () => {
            if (!isGameOver && (this.state === "idle" || this.state === "appearing")) {
                this.setState("hit");
                document.dispatchEvent(hitEvent);
            }
        });

        this.ghostWrapper.appendChild(this.ghostElement);
        hole.appendChild(this.ghostWrapper);
        
        this.appearRandomly(3);
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
                if (!isGameOver && ghostsVisible < maximumGhostsVisible) {
                    ghostsVisible++;
                    this.isVisible = true;
                    console.log("Ghost appeared. Total visible:", ghostsVisible);

                    this.ghostElement.style.backgroundImage = "url('./media/ghost_appear.png')";
                    this.ghostElement.style.display = "block";
                    this.ghostElement.style.pointerEvents = "all";
                    this.ghostWrapper.classList.add("floatUp");

                    setTimeout(() => {
                        this.setState("idle");
                    }, 500);
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
                this.ghostElement.style.backgroundImage = "url('./media/ghost_hit.png')";
                this.ghostElement.style.pointerEvents = "none";
                void this.ghostWrapper.offsetWidth;
                this.ghostWrapper.classList.add("shake-horizontal");
                
                setTimeout(() => {
                    this.setState("disappearing");
                }, 500);
                break;
                
            case "disappearing":
                if (this.isVisible) {
                    ghostsVisible--;
                    this.isVisible = false;
                    console.log("Ghost disappeared. Total visible:", ghostsVisible);
                }
                
                this.ghostWrapper.classList.add("floatDown");
                
                setTimeout(() => {
                    this.setState("hidden");
                }, 500);
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
        
        if (ghostsVisible >= maximumGhostsVisible) {
            setTimeout(() => this.appearRandomly(maxDelaySeconds), 1000);
            return;
        }
        
        const randomDelay = Math.random() * maxDelaySeconds * 1000;
        setTimeout(() => {
            if (!isGameOver && this.state === "hidden" && ghostsVisible < maximumGhostsVisible) {
                this.setState("appearing");
            } else if (!isGameOver) {
                this.appearRandomly(2);
            }
        }, randomDelay);
    }

    disappearRandomlyAfterMaxSeconds(seconds) {
        setTimeout(() => {
            if (!isGameOver && this.state === "idle") {
                this.setState("disappearing");
            }
        }, Math.random() * seconds * 1000);
    }
}