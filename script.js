let isPlaying = false;
let tempo = 120;
let intervalId;
let beatCount = 0;
let subdivisionsPerMeasure = 1;

const tempoDisplay = document.getElementById('tempo-display');
const tempoSlider = document.getElementById('tempo-slider');
const startStopButton = document.getElementById('start-stop-button');
const visualIndicatorsContainer = document.getElementById('visual-indicators');
const subdivisionsSlider = document.getElementById('subdivisions-slider');
const measureLine = document.getElementById('measure-line');
const tickSound = document.getElementById('tick-sound');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let tickBuffer;

fetch('https://raw.githubusercontent.com/dennis1979/metronome/main/click.mp3')
    .then(response => response.arrayBuffer())
    .then(data => audioContext.decodeAudioData(data))
    .then(buffer => {
        tickBuffer = buffer;
    });

tempoSlider.addEventListener('input', (e) => {
    tempo = e.target.value;
    tempoDisplay.textContent = `${tempo} BPM`;
    if (isPlaying) {
        clearInterval(intervalId);
        startMetronome();
    }
});

subdivisionsSlider.addEventListener('input', (e) => {
    subdivisionsPerMeasure = e.target.value;
    updateVisualIndicators();
    if (isPlaying) {
        clearInterval(intervalId);
        startMetronome();
    }
});

startStopButton.addEventListener('click', () => {
    if (isPlaying) {
        stopMetronome();
    } else {
        startMetronome();
    }
});

function startMetronome() {
    isPlaying = true;
    startStopButton.textContent = 'Stop';
    intervalId = setInterval(playClick, (60 / (tempo * subdivisionsPerMeasure)) * 1000);
}

function stopMetronome() {
    isPlaying = false;
    startStopButton.textContent = 'Start';
    clearInterval(intervalId);
}

function playClick() {
    console.log('tick');
    const indicators = document.querySelectorAll('.visual-indicator');
    indicators.forEach((indicator, index) => {
        if (index === beatCount) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
    //tickSound.currentTime = 0;
    //tickSound.play();
    playSound(tickBuffer);
    
    // Flash the measure line on every beat
    if (beatCount === 0) {
        measureLine.style.backgroundColor = '#00FF00'; // Bright green for flash
        setTimeout(() => {
            measureLine.style.backgroundColor = '#008000'; // Return to original green
        }, 100);
    }
    

    beatCount = (beatCount + 1) % subdivisionsPerMeasure;
}

function playSound(buffer) {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
}

function updateVisualIndicators() {
    visualIndicatorsContainer.innerHTML = '';
    const indicatorSize = Math.min(50, visualIndicatorsContainer.clientWidth / subdivisionsPerMeasure - 10);
    for (let i = 0; i < subdivisionsPerMeasure; i++) {
        const indicator = document.createElement('div');
        indicator.classList.add('visual-indicator');
        indicator.style.width = `${indicatorSize}px`;
        indicator.style.height = `${indicatorSize}px`;
        visualIndicatorsContainer.appendChild(indicator);
    }
}

updateVisualIndicators();