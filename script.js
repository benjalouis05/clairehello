const penguinContainer = document.getElementById('penguin-container');
const speechBubble = document.getElementById('speech-bubble');
const finalOverlay = document.getElementById('final-overlay');
const hitMeTitle = document.getElementById('hit-me-title');

let hitCount = 0;
let isRunningAway = false;
let runTimeout = null;
let speechTimeout = null;

// Game state
let x = window.innerWidth / 2;
let y = window.innerHeight / 2;
let vx = 0;
let vy = 0;
const normalSpeed = 2;
const runSpeed = 12;

// Sizes
const penguinWidth = 80;
const penguinHeight = 80;

// Initialize random velocity
function setRandomVelocity(speed) {
    const angle = Math.random() * Math.PI * 2;
    vx = Math.cos(angle) * speed;
    vy = Math.sin(angle) * speed;
}

setRandomVelocity(normalSpeed);
penguinContainer.classList.add('waddling');

let lastTime = performance.now();

function updatePosition(time) {
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    // We use a fixed step multiplier to keep speed consistent regardless of framerate
    const stepMultiplier = deltaTime * 60; 

    // Update position
    x += vx * stepMultiplier;
    y += vy * stepMultiplier;

    // Boundary check (Bounce off walls)
    const boundsX = window.innerWidth - penguinWidth;
    const boundsY = window.innerHeight - penguinHeight - 40; // Extra room for speech bubble

    // Left/Right boundaries
    if (x <= penguinWidth / 2) {
        x = penguinWidth / 2;
        vx = Math.abs(vx); // bounce right
    } else if (x >= window.innerWidth - penguinWidth / 2) {
        x = window.innerWidth - penguinWidth / 2;
        vx = -Math.abs(vx); // bounce left
    }

    // Top/Bottom boundaries
    if (y <= penguinHeight / 2 + 40) {
        y = penguinHeight / 2 + 40;
        vy = Math.abs(vy); // bounce down
    } else if (y >= window.innerHeight - penguinHeight / 2) {
        y = window.innerHeight - penguinHeight / 2;
        vy = -Math.abs(vy); // bounce up
    }

    // Apply translation
    // We use translate instead of top/left for better performance
    penguinContainer.style.transform = `translate(${x - window.innerWidth/2}px, ${y - window.innerHeight/2}px)`;

    // Flip penguin if moving left
    if (vx < 0) {
        document.getElementById('penguin').style.transform = 'scaleX(-1)';
    } else {
        document.getElementById('penguin').style.transform = 'scaleX(1)';
    }

    if (hitCount < 5) {
        requestAnimationFrame(updatePosition);
    }
}

// Start loop
requestAnimationFrame(updatePosition);

function runAway() {
    isRunningAway = true;
    penguinContainer.classList.remove('waddling');
    penguinContainer.classList.add('running');
    
    // Boost speed in a direction away from current velocity (or random)
    setRandomVelocity(runSpeed);

    if (runTimeout) clearTimeout(runTimeout);
    
    // Slow down after 2 seconds
    runTimeout = setTimeout(() => {
        if (hitCount < 5) {
            isRunningAway = false;
            penguinContainer.classList.remove('running');
            penguinContainer.classList.add('waddling');
            
            // Normalize current velocity to normal speed
            const currentSpeed = Math.sqrt(vx*vx + vy*vy);
            if (currentSpeed > 0) {
                vx = (vx / currentSpeed) * normalSpeed;
                vy = (vy / currentSpeed) * normalSpeed;
            } else {
                setRandomVelocity(normalSpeed);
            }
        }
    }, 2000);
}

function showSpeechBubble(text, duration) {
    speechBubble.textContent = text;
    speechBubble.classList.remove('hidden');
    // small delay to allow display:block to apply before opacity transition
    setTimeout(() => {
        speechBubble.classList.add('show');
    }, 10);

    if (speechTimeout) clearTimeout(speechTimeout);
    speechTimeout = setTimeout(() => {
        speechBubble.classList.remove('show');
        setTimeout(() => speechBubble.classList.add('hidden'), 300); // wait for fade out
    }, duration);
}

function triggerFinalMessage() {
    // Stop movement and hide penguin
    vx = 0;
    vy = 0;
    penguinContainer.style.display = 'none';

    // Show overlay
    finalOverlay.classList.remove('hidden');
    setTimeout(() => {
        finalOverlay.classList.add('fade-in');
    }, 50);
}

// Handle clicks and touches
function handleHit(e) {
    if (hitCount >= 5) return; // Ignore after final message
    if (e.cancelable) e.preventDefault(); // prevent double firing on touch devices

    hitCount++;

    if (hitCount === 1) {
        hitMeTitle.style.opacity = '0';
    }

    if (hitCount === 2) {
        showSpeechBubble('claire Stop', 3000);
    }

    if (hitCount === 3) {
        showSpeechBubble('AHHHHHHH', 3000);
    }

    if (hitCount === 5) {
        triggerFinalMessage();
    } else {
        runAway();
    }
}

// Bind both mousedown and touchstart to ensure responsiveness on mobile
penguinContainer.addEventListener('mousedown', handleHit);
penguinContainer.addEventListener('touchstart', handleHit, { passive: false });
