let playButton;
let difficulty;
let difficultyPanel;
let holes;
let gameBoard;

const gameDuration = 60; // Game duration in seconds
let score = 0;

let ghostsVisible = 0;

let isGameOver = false;
let gameTimerInterval; // Store timer interval reference

const maximumGhostsVisible = 3;

const backgroundMusic = new Audio('../media/background_music.mp3');
backgroundMusic.loop = true;

// Volume settings
let musicVolume = 0.5; // Default 50%
let sfxVolume = 0.7;   // Default 70%

const activeSFX = new Set();

document.addEventListener('DOMContentLoaded', function() {
    playButton = document.getElementById('play-button');
    difficultyPanel = document.getElementById('difficulty-panel');
    gameBoard = document.getElementById('game-board');
    holes = document.getElementsByClassName('hole');

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
    const clickAudio = new Audio('../media/click.wav');
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
    const bonkAudio = new Audio('../media/bonk.wav');
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
    let countingSound = new Audio('../media/countdown_counting.wav');
    let countingFinishedSound = new Audio('../media/countdown_finished.wav');
    let countDownElement = document.createElement("div");
    countDownElement.id = "countdown-timer";
    gameBoard.appendChild(countDownElement);

    return new Promise((resolve) => {
        let counter = seconds;
        const interval = setInterval(() => {
            if (counter > 0) {
                countDownElement.textContent = counter;
                countingSound.play();
                counter--;
            } else {
                clearInterval(interval);
                countDownElement.textContent = "GO!";
                countingFinishedSound.play();
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
    
    // Add play again button functionality
    document.getElementById('play-again').addEventListener('click', function() {
        resetGame();
        playGame();
    });
    
    // Hide play button until play again is clicked
    playButton.style.display = 'none';
}

function resetGame() {
    // Clear any existing game over element
    const gameOverElement = document.getElementById('game-over');
    if (gameOverElement) {
        gameOverElement.remove();
    }
    
    // Clear any existing countdown timer
    const countdownTimer = document.getElementById('countdown-timer');
    if (countdownTimer) {
        countdownTimer.remove();
    }
    
    // Clear any existing ghosts completely
    const ghostWrappers = document.querySelectorAll('.ghost-wrapper');
    ghostWrappers.forEach(wrapper => wrapper.remove());
    
    // Reset game state
    score = 0;
    ghostsVisible = 0;
    isGameOver = false;
    difficulty = null; // CRITICAL: Reset difficulty so it asks again
    
    // Clear any existing timer
    if (gameTimerInterval) {
        clearInterval(gameTimerInterval);
    }
    
    // Update displays
    document.getElementById('score-label').textContent = `Score: ${score}`;
    document.getElementById('time-label').textContent = `Time: ${gameDuration}s`;
    
    // Show difficulty panel again for next game
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

        this.ghostWrapper.addEventListener('click', () => {
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
        // Don't update state if game is over
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

                    this.ghostElement.style.backgroundImage = "url('../media/ghost_appear.png')";
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
                this.ghostElement.style.backgroundImage = "url('../media/ghost_idle.gif')";
                this.ghostElement.style.backgroundSize = "cover";
                if (!isGameOver) {
                    this.disappearRandomlyAfterMaxSeconds(5);
                }
                break;
                
            case "hit":
                playBonkSound();
                this.ghostElement.style.backgroundImage = "url('../media/ghost_hit.png')";
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
        // Don't schedule if game is over or already visible
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