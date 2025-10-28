let playButton;
let difficulty;
let difficultyPanel;
let holes;
let gameBoard;

let gameTimer;
let score = 0;

let ghostsVisible = 0;

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
    // Load saved volumes
    const savedMusicVolume = localStorage.getItem('musicVolume');
    const savedSFXVolume = localStorage.getItem('sfxVolume');
    
    if (savedMusicVolume) {
        setMusicVolume(parseFloat(savedMusicVolume));
    }
    if (savedSFXVolume) {
        setSFXVolume(parseFloat(savedSFXVolume));
    }
    
    // Start background music
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

    //difficulty selection -- asynchronous so we wait for user input before starting game loop
    selectDifficulty().then((selectedDifficulty) => {
        difficulty = selectedDifficulty;
        gameLoop(difficulty);
    });

}

function selectDifficulty(difficultyLevel) {

    return new Promise((resolve) => { //promise to be resolved when user selects difficulty, function waits here until then

        const difficultyButtons = Array.from(difficultyPanel.querySelectorAll('.button')); //get all buttons in difficulty panel and store in array

        difficultyButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const selectedDifficulty = btn.getAttribute('data-difficulty'); // could also use dataset.difficulty rather than getAttribute
                difficultyPanel.style.visibility = 'hidden';
                resolve(selectedDifficulty); //resolve promise with selected difficulty   
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
            resolve(); //resolve promise when countdown finishes
            setTimeout(() => {
                countDownElement.style.display = 'none';
            }, 1000); //hide element after 1 second

        }
        }, 1000); //interval every second
    });
}

function startGameTimer(){
    
} 

function gameLoop(difficulty) {

    console.log('Game started with difficulty:', difficulty);
    
    startCountDown(3).then(() => {
        startGameTimer();
        spawnGhosts();

        document.addEventListener('ghostHit', () => {
            score++;
            console.log("Score:", score);
        });

    });  
}

function spawnGhosts() {
    
    for (let i = 0; i < holes.length; i++) {
        const hole = holes[i];
        const mole = new Ghost(hole);
    }

}

const hitEvent = new CustomEvent('ghostHit', {});

class Ghost {
    constructor(hole) {
        this.hole = hole;
        this.state = "hidden"; //initial state
        this.isVisible = false; // Track if this ghost is currently visible

        this.ghostWrapper = document.createElement("div");
        this.ghostWrapper.className = "ghost-wrapper";

        this.ghostElement = document.createElement("div");
        this.ghostElement.className = "ghost";

        // Add click listener to the wrapper instead of element
        this.ghostWrapper.addEventListener('click', () => {
            if (this.state === "idle" || this.state === "appearing") {
                this.setState("hit");
                document.dispatchEvent(hitEvent); // Dispatch globally instead of on element
            }
        });

        this.ghostWrapper.appendChild(this.ghostElement);
        hole.appendChild(this.ghostWrapper);
        
        // Start the appearance cycle
        this.appearRandomly(3); // Reduced initial delay for testing
    }

    updateState() {
        // Clean up classes first
        this.ghostWrapper.classList.remove("shake-horizontal", "floatUp", "floatDown");
        
        switch (this.state) {
            case "hidden":
                this.ghostElement.style.display = "none";
                this.ghostElement.style.pointerEvents = "none";
                this.isVisible = false;
                
                // Schedule next appearance
                this.appearRandomly(15);
                break;
                
            case "appearing":
                if (ghostsVisible < maximumGhostsVisible) {
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
                    // Too many ghosts visible, try again later
                    console.log("Too many ghosts during appearance, retrying...");
                    this.appearRandomly(2);
                }
                break;
                
            case "idle":
                this.ghostElement.style.backgroundImage = "url('../media/ghost_idle.gif')";
                this.ghostElement.style.backgroundSize = "cover";
                this.disappearRandomlyAfterMaxSeconds(5);
                break;
                
            case "hit":
                playBonkSound();
                this.ghostElement.style.backgroundImage = "url('../media/ghost_hit.png')";
                this.ghostElement.style.pointerEvents = "none";
                
                // Add shake class and force reflow to ensure animation plays
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
        // Don't schedule if already visible or in transition
        if (this.state !== "hidden") {
            return;
        }
        
        if (ghostsVisible >= maximumGhostsVisible) {
            setTimeout(() => this.appearRandomly(maxDelaySeconds), 1000);
            return;
        }
        
        const randomDelay = Math.random() * maxDelaySeconds * 1000;
        setTimeout(() => {
            if (this.state === "hidden" && ghostsVisible < maximumGhostsVisible) {
                this.setState("appearing");
            } else {
                this.appearRandomly(2);
            }
        }, randomDelay);
    }

    disappearRandomlyAfterMaxSeconds(seconds) {
        setTimeout(() => {
            if (this.state === "idle") {
                this.setState("disappearing");
            }
        }, Math.random() * seconds * 1000);
    }
}
