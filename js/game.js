// Main game engine
const Game = {
    canvas: null,
    ctx: null,
    width: 480,
    height: 270,
    displayWidth: 960,
    displayHeight: 540,

    player: null,
    enemies: [],
    score: 0,
    running: false,
    paused: false,
    gameOver: false,

    keys: {},
    keysPressed: {},
    camera: { x: 0, y: 0 },

    // Background layers
    bgLayers: [],

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Disable smoothing for pixel art
        this.ctx.imageSmoothingEnabled = false;

        // Input
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (!this.keysPressed[e.code]) {
                this.keysPressed[e.code] = true;
            }
            // Prevent scrolling with arrows/space
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keysPressed[e.code] = false;
        });

        this.generateBackground();
    },

    generateBackground() {
        // Create layered parallax background data
        // Layer 0: Sky gradient (drawn directly)
        // Layer 1: Mountains (far)
        // Layer 2: Buildings/trees (mid)
        // Layer 3: Ground details (near)

        this.bgLayers = [];

        // Mountains
        const mountains = [];
        for (let i = 0; i < 20; i++) {
            mountains.push({
                x: i * 120 - 200,
                h: 40 + Math.random() * 60,
                w: 80 + Math.random() * 80,
                color: `rgb(${40 + Math.floor(Math.random() * 20)}, ${50 + Math.floor(Math.random() * 20)}, ${60 + Math.floor(Math.random() * 20)})`
            });
        }
        this.bgLayers.push({ items: mountains, parallax: 0.1 });

        // Buildings (Konoha-style)
        const buildings = [];
        for (let i = 0; i < 30; i++) {
            const bh = 30 + Math.random() * 50;
            buildings.push({
                x: i * 80 - 300,
                h: bh,
                w: 35 + Math.random() * 30,
                color: `rgb(${80 + Math.floor(Math.random() * 30)}, ${70 + Math.floor(Math.random() * 20)}, ${60 + Math.floor(Math.random() * 20)})`,
                roof: Math.random() > 0.5,
                windows: Math.floor(Math.random() * 4) + 1,
            });
        }
        this.bgLayers.push({ items: buildings, parallax: 0.3 });

        // Trees
        const trees = [];
        for (let i = 0; i < 40; i++) {
            trees.push({
                x: i * 60 - 400,
                h: 20 + Math.random() * 25,
                trunkH: 10 + Math.random() * 8,
                color: `rgb(${30 + Math.floor(Math.random() * 40)}, ${80 + Math.floor(Math.random() * 60)}, ${20 + Math.floor(Math.random() * 30)})`
            });
        }
        this.bgLayers.push({ items: trees, parallax: 0.5 });
    },

    start() {
        this.player = new Player(100, this.height - 90 - 72);
        this.enemies = [];
        this.score = 0;
        this.gameOver = false;
        this.running = true;
        this.camera = { x: 0, y: 0 };

        Effects.clear();
        EnemySpawner.reset();

        document.getElementById('title-screen').style.display = 'none';
        document.getElementById('game-over-screen').style.display = 'none';

        this.loop();
    },

    loop() {
        if (!this.running) return;

        this.update();
        this.render();

        // Clear pressed keys each frame (for single-press detection)
        this.keysPressed = {};

        requestAnimationFrame(() => this.loop());
    },

    update() {
        if (this.gameOver) return;

        const groundLevel = this.height - 20;

        // Update player
        this.player.update(this.keys, groundLevel);

        // Check if player died
        if (!this.player.alive) {
            this.triggerGameOver();
            return;
        }

        // Spawn enemies
        EnemySpawner.update(this.enemies, this.player, groundLevel);

        // Update enemies and handle dead ones
        const livingEnemies = [];
        for (const enemy of this.enemies) {
            enemy.update(this.player, groundLevel);

            if (enemy.isDead) {
                // Award points when enemy fully dies
                this.score += enemy.points;
                if (this.player.comboCount > 0) {
                    this.score += Math.floor(enemy.points * this.player.comboCount * 0.1);
                }
                EnemySpawner.onEnemyDefeated();
                // Don't keep this enemy
            } else {
                livingEnemies.push(enemy);
            }
        }
        this.enemies = livingEnemies;

        // Player attack collision
        const playerHitbox = this.player.getAttackHitbox();
        if (playerHitbox) {
            for (const enemy of this.enemies) {
                if (!enemy.alive || enemy.state === 'hurt') continue;
                if (this.checkCollision(playerHitbox, { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h })) {
                    const knockDir = this.player.facingRight ? 1 : -1;
                    enemy.takeDamage(this.player.currentAttack.damage, knockDir * this.player.currentAttack.knockback);
                    this.player.addCombo();
                    this.score += 10;

                    // Screen shake on big hits
                    if (this.player.currentAttack.damage >= 20) {
                        this.screenShake = 8;
                    }
                }
            }
        }

        // Enemy attack collision
        for (const enemy of this.enemies) {
            const enemyHitbox = enemy.getAttackHitbox();
            if (enemyHitbox && this.player.alive) {
                if (this.checkCollision(enemyHitbox, { x: this.player.x, y: this.player.y, w: this.player.w, h: this.player.h })) {
                    const knockDir = enemy.facingRight ? 1 : -1;
                    this.player.takeDamage(enemy.damage, knockDir * 5);
                    this.screenShake = 5;
                }
            }
        }

        // Shadow clone attack (hits all enemies in range)
        for (const effect of Effects.activeEffects) {
            if (effect.type === 'shadowClone' && effect.timer === 15) {
                for (const enemy of this.enemies) {
                    if (!enemy.alive) continue;
                    const dist = Math.abs(enemy.centerX - effect.x - 24) + Math.abs(enemy.centerY - effect.y - 36);
                    if (dist < 80) {
                        const knockDir = effect.facingRight ? 1 : -1;
                        enemy.takeDamage(20, knockDir * 6);
                        this.player.addCombo();
                        this.score += 10;
                    }
                }
            }
        }

        // Update effects
        Effects.update();

        // Camera follow player
        const targetCamX = this.player.x - this.width / 3;
        this.camera.x += (targetCamX - this.camera.x) * 0.08;
        if (this.camera.x < 0) this.camera.x = 0;

        // Screen shake
        if (this.screenShake > 0) this.screenShake--;
    },

    render() {
        const ctx = this.ctx;
        const cam = this.camera;

        // Screen shake offset
        let shakeX = 0, shakeY = 0;
        if (this.screenShake > 0) {
            shakeX = (Math.random() - 0.5) * this.screenShake * 2;
            shakeY = (Math.random() - 0.5) * this.screenShake * 2;
        }

        ctx.save();
        ctx.translate(Math.round(shakeX), Math.round(shakeY));

        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        skyGrad.addColorStop(0, '#1a0a2e');
        skyGrad.addColorStop(0.4, '#2d1b4e');
        skyGrad.addColorStop(0.7, '#4a2860');
        skyGrad.addColorStop(1, '#1a1a3a');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 30; i++) {
            const sx = ((i * 73 + 17) % this.width);
            const sy = ((i * 47 + 13) % (this.height * 0.5));
            const blink = Math.sin(Date.now() * 0.001 + i) * 0.3 + 0.7;
            ctx.globalAlpha = blink * 0.5;
            ctx.fillRect(sx, sy, 1, 1);
        }
        ctx.globalAlpha = 1;

        // Moon
        ctx.fillStyle = '#FFFFDD';
        ctx.beginPath();
        ctx.arc(this.width - 60, 40, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a0a2e';
        ctx.beginPath();
        ctx.arc(this.width - 52, 36, 18, 0, Math.PI * 2);
        ctx.fill();

        // Background layers with parallax
        this.drawBackgroundLayers(ctx, cam);

        // Ground
        ctx.fillStyle = '#3a3020';
        ctx.fillRect(0, this.height - 20, this.width, 20);
        // Ground detail
        ctx.fillStyle = '#4a4030';
        ctx.fillRect(0, this.height - 20, this.width, 2);
        // Ground texture
        for (let i = 0; i < this.width; i += 8) {
            if ((i + Math.floor(cam.x)) % 16 < 8) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                ctx.fillRect(i, this.height - 18, 8, 18);
            }
        }

        // Game world (camera transform)
        ctx.save();
        ctx.translate(-Math.round(cam.x), 0);

        // Draw enemies behind player
        for (const enemy of this.enemies) {
            if (enemy.centerY < this.player.centerY) {
                enemy.draw(ctx);
            }
        }

        // Draw player
        this.player.draw(ctx);

        // Draw enemies in front of player
        for (const enemy of this.enemies) {
            if (enemy.centerY >= this.player.centerY) {
                enemy.draw(ctx);
            }
        }

        // Draw effects
        Effects.draw(ctx);

        ctx.restore(); // camera

        // Draw UI (fixed to screen)
        UI.draw(ctx, this.player, this.score, this.width);
        UI.drawWaveInfo(ctx, EnemySpawner.difficulty, EnemySpawner.enemiesDefeated, this.width);

        ctx.restore(); // shake
    },

    drawBackgroundLayers(ctx, cam) {
        // Mountains
        const layer0 = this.bgLayers[0];
        if (layer0) {
            for (const m of layer0.items) {
                const mx = m.x - cam.x * layer0.parallax;
                const wMod = mx % (this.width + 400) - 200;
                if (wMod < -m.w || wMod > this.width + m.w) continue;
                ctx.fillStyle = m.color;
                ctx.beginPath();
                ctx.moveTo(wMod, this.height - 20);
                ctx.lineTo(wMod + m.w / 2, this.height - 20 - m.h);
                ctx.lineTo(wMod + m.w, this.height - 20);
                ctx.closePath();
                ctx.fill();
            }
        }

        // Buildings
        const layer1 = this.bgLayers[1];
        if (layer1) {
            for (const b of layer1.items) {
                const bx = b.x - cam.x * layer1.parallax;
                const wMod = ((bx % (this.width + 600)) + (this.width + 600)) % (this.width + 600) - 300;
                if (wMod < -b.w || wMod > this.width + b.w) continue;

                ctx.fillStyle = b.color;
                ctx.fillRect(wMod, this.height - 20 - b.h, b.w, b.h);

                // Roof
                if (b.roof) {
                    ctx.fillStyle = '#884422';
                    ctx.beginPath();
                    ctx.moveTo(wMod - 3, this.height - 20 - b.h);
                    ctx.lineTo(wMod + b.w / 2, this.height - 20 - b.h - 12);
                    ctx.lineTo(wMod + b.w + 3, this.height - 20 - b.h);
                    ctx.closePath();
                    ctx.fill();
                }

                // Windows
                const winColor = Math.random() > 0.3 ? '#FFDD88' : '#443322';
                for (let wi = 0; wi < b.windows; wi++) {
                    const wy = this.height - 20 - b.h + 8 + wi * 12;
                    if (wy + 6 > this.height - 20) break;
                    ctx.fillStyle = winColor;
                    ctx.fillRect(wMod + b.w / 2 - 3, wy, 6, 6);
                }
            }
        }

        // Trees
        const layer2 = this.bgLayers[2];
        if (layer2) {
            for (const t of layer2.items) {
                const tx = t.x - cam.x * layer2.parallax;
                const wMod = ((tx % (this.width + 500)) + (this.width + 500)) % (this.width + 500) - 250;
                if (wMod < -30 || wMod > this.width + 30) continue;

                // Trunk
                ctx.fillStyle = '#5a3a1a';
                ctx.fillRect(wMod, this.height - 20 - t.trunkH, 4, t.trunkH);

                // Foliage
                ctx.fillStyle = t.color;
                ctx.beginPath();
                ctx.arc(wMod + 2, this.height - 20 - t.trunkH - t.h / 2, t.h / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },

    triggerGameOver() {
        this.gameOver = true;
        document.getElementById('game-over-screen').style.display = 'flex';
        document.getElementById('final-score').textContent = `Score: ${this.score}`;
        document.getElementById('final-combo').textContent = `Max Combo: ${this.player.maxCombo}`;
    },

    checkCollision(a, b) {
        return a.x < b.x + b.w &&
               a.x + a.w > b.x &&
               a.y < b.y + b.h &&
               a.y + a.h > b.y;
    }
};

// Start game function (called from HTML button)
function startGame() {
    if (!Game.canvas) {
        Game.init();
    }
    Game.start();
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
