# Starter Game JS File Structure

starter_game = """// === SECTION: CONFIG ===
// Basic game settings like screen size, title, and initial states.
const config = {
    width: 800,
    height: 600,
    fps: 60,
    defaultGravity: 0.5
};

// === SECTION: ASSETS ===
// Declare empty objects or arrays for images, sounds, sprites here.
const assets = {};

// === SECTION: INPUT ===
// Handles keydown/keyup events and tracking player input states.
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};
window.addEventListener('keydown', (e) => keys[e.code] = true);
window.addEventListener('keyup', (e) => keys[e.code] = false);

// === SECTION: GAME_STATE ===
// Core state variables (score, lives, level, isGameOver).
let gameState = {
    score: 0,
    isGameOver: false,
    timeElapsed: 0
};

// === SECTION: PLAYER ===
// Player entity definition, its update logic and properties.
let player = {
    x: 400,
    y: 300,
    width: 32,
    height: 32,
    color: 'blue',
    vx: 0,
    vy: 0,
    speed: 5,
    jumpForce: 10,
    isGrounded: false
};

// === SECTION: ENTITIES ===
// Arrays for enemies, items, platforms, and their management.
let enemies = [];
let platforms = [
    { x: 0, y: 550, width: 800, height: 50, color: 'gray' } // Ground floor
];

// === SECTION: PHYSICS_COLLISIONS ===
// Functions to check AABB collisions and apply gravity.
function checkCollision(r1, r2) {
    return r1.x < r2.x + r2.width &&
           r1.x + r1.width > r2.x &&
           r1.y < r2.y + r2.height &&
           r1.y + r1.height > r2.y;
}
function applyPhysics() {
    player.vy += config.defaultGravity;
    player.x += player.vx;
    player.y += player.vy;
    
    // Simple ground floor collision for starter
    let onGround = false;
    for (let platform of platforms) {
        if (player.y + player.height >= platform.y && player.y + player.height <= platform.y + player.vy + 1 && player.x + player.width > platform.x && player.x < platform.x + platform.width) {
            player.y = platform.y - player.height;
            player.vy = 0;
            onGround = true;
        }
    }
    player.isGrounded = onGround;
}

// === SECTION: GAME_RULES ===
// Logic for scoring, level transitions, and win/lose conditions.
function checkGameRules() {
    if (player.y > config.height) {
        gameState.isGameOver = true;
    }
}

// === SECTION: UPDATE_LOOP ===
// Main update function calling all other updates.
function update() {
    if (gameState.isGameOver) return;
    
    // Player movement
    if (keys['ArrowLeft']) player.vx = -player.speed;
    else if (keys['ArrowRight']) player.vx = player.speed;
    else player.vx = 0;
    
    if (keys['ArrowUp'] && player.isGrounded) {
        player.vy = -player.jumpForce;
    }
    
    applyPhysics();
    checkGameRules();
    gameState.timeElapsed += 1 / config.fps;
}

// === SECTION: RENDER ===
// Functions that draw everything to the screen context.
function render(ctx) {
    // Clear screen
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, config.width, config.height);
    
    // Draw platforms
    for (let p of platforms) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
    }
    
    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// === SECTION: UI_HUD ===
// Draws text, score, game over screens over the game.
function drawHUD(ctx) {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 10, 30);
    
    if (gameState.isGameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '40px Arial';
        ctx.fillText("GAME OVER", config.width / 2 - 100, config.height / 2);
    }
}

// === SECTION: HELPERS ===
// Mathematical functions, randomizers, utils.
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
"""

def get_starter_game_content() -> str:
    return starter_game
