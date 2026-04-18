class Enemy {
    constructor(x, y, type, difficulty) {
        this.x = x;
        this.y = y;
        this.w = 48;
        this.h = 72;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 0.6;
        this.groundY = y;
        this.onGround = true;
        this.facingRight = true;
        this.frame = 0;
        this.type = type;
        this.difficulty = difficulty || 1;

        this.state = 'idle'; // idle, walking, attacking, hurt, dead
        this.attackTimer = 0;
        this.attackCooldown = 0;
        this.hurtTimer = 0;
        this.deathTimer = 0;
        this.aiTimer = 0;
        this.aggroRange = 500;
        this.attackRange = 55;

        // Set stats based on type
        this.setupStats(type, difficulty);
        this.palette = Sprites.colors[type] || Sprites.colors.zabuza;
    }

    setupStats(type, diff) {
        const base = {
            zabuza:     { hp: 40, speed: 1.8, damage: 8,  points: 100, attackCd: 60,  name: 'Zabuza' },
            orochimaru: { hp: 60, speed: 1.5, damage: 12, points: 200, attackCd: 50,  name: 'Orochimaru' },
            pain:       { hp: 80, speed: 2.0, damage: 15, points: 300, attackCd: 45,  name: 'Pain' },
            itachi:     { hp: 70, speed: 2.2, damage: 14, points: 250, attackCd: 40,  name: 'Itachi' },
            sasuke:     { hp: 65, speed: 2.5, damage: 13, points: 220, attackCd: 35,  name: 'Sasuke' },
            madara:     { hp: 100, speed: 2.0, damage: 18, points: 500, attackCd: 40, name: 'Madara' },
        };

        const stats = base[type] || base.zabuza;
        const scale = 1 + (diff - 1) * 0.3;

        this.maxHp = Math.floor(stats.hp * scale);
        this.hp = this.maxHp;
        this.speed = stats.speed * (1 + (diff - 1) * 0.1);
        this.damage = Math.floor(stats.damage * scale);
        this.points = Math.floor(stats.points * scale);
        this.attackCdMax = Math.max(20, Math.floor(stats.attackCd / (1 + (diff - 1) * 0.15)));
        this.name = stats.name;
        this.attackRange = type === 'zabuza' ? 70 : (type === 'madara' ? 65 : 55);
    }

    update(player, groundLevel) {
        this.frame++;
        this.groundY = groundLevel - this.h;

        if (this.attackCooldown > 0) this.attackCooldown--;

        // Dead
        if (this.hp <= 0 && this.state !== 'dead') {
            this.state = 'dead';
            this.deathTimer = 90;
            this.vx = this.facingRight ? -3 : 3;
            this.vy = -6;
            this.onGround = false;
            Effects.spawnKO(this.x + this.w / 2, this.y);
        }

        if (this.state === 'dead') {
            this.deathTimer--;
            this.vx *= 0.95;
            this.applyPhysics();
            return this.deathTimer > 0;
        }

        // Hurt
        if (this.hurtTimer > 0) {
            this.hurtTimer--;
            this.vx *= 0.85;
            if (this.hurtTimer <= 0) this.state = 'idle';
            this.applyPhysics();
            return true;
        }

        // Attacking
        if (this.attackTimer > 0) {
            this.attackTimer--;
            this.vx *= 0.6;
            if (this.attackTimer <= 0) this.state = 'idle';
            this.applyPhysics();
            return true;
        }

        // AI behavior
        this.aiTimer++;
        const dx = player.centerX - this.centerX;
        const dist = Math.abs(dx);

        this.facingRight = dx > 0;

        // Enemies ALWAYS chase the player once spawned
        if (dist < this.attackRange && this.attackCooldown <= 0 && this.onGround && player.alive) {
            this.attack();
        } else if (player.alive) {
            // Move toward player
            const moveDir = dx > 0 ? 1 : -1;
            // Run faster if far away to catch up
            const chaseSpeed = dist > 300 ? this.speed * 1.8 : this.speed;
            this.vx = moveDir * chaseSpeed;
            this.state = 'walking';

            // Random jump
            if (this.onGround && Math.random() < 0.01 && dist < 120) {
                this.vy = -10;
                this.onGround = false;
            }
        } else {
            this.vx *= 0.8;
            this.state = 'idle';
        }

        this.applyPhysics();
        return true;
    }

    applyPhysics() {
        if (!this.onGround) {
            this.vy += this.gravity;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.vy = 0;
            this.onGround = true;
        }

        if (this.x < 0) this.x = 0;
    }

    attack() {
        this.state = 'attacking';
        this.attackTimer = 20;
        this.attackCooldown = this.attackCdMax;
        Effects.add({
            type: 'enemyAttack',
            x: this.facingRight ? this.x + this.w : this.x,
            y: this.y + this.h * 0.4,
            facingRight: this.facingRight,
            timer: 0,
            duration: 15
        });
    }

    getAttackHitbox() {
        if (this.state !== 'attacking' || this.attackTimer <= 0) return null;
        const elapsed = 20 - this.attackTimer;
        if (elapsed < 5 || elapsed > 15) return null;

        return {
            x: this.facingRight ? this.x + this.w - 10 : this.x - this.attackRange + 10,
            y: this.y + 10,
            w: this.attackRange,
            h: this.h - 20
        };
    }

    takeDamage(damage, knockbackX) {
        this.hp -= damage;
        this.hurtTimer = 15;
        this.state = 'hurt';
        this.vx = knockbackX;
        this.vy = -3;
        this.onGround = false;

        Effects.spawnHitEffect(this.x + this.w / 2, this.y + this.h / 3, damage);
    }

    draw(ctx) {
        if (this.state === 'dead') {
            const alpha = this.deathTimer / 90;
            ctx.save();
            ctx.globalAlpha = alpha;
            Sprites.drawDeadPose(ctx, this.x, this.y, this.w, this.h, this.palette, this.frame, this.facingRight, this.type);
            ctx.restore();
        } else if (this.state === 'hurt') {
            Sprites.drawHurtPose(ctx, this.x, this.y, this.w, this.h, this.palette, this.frame, this.facingRight, this.type);
        } else if (this.state === 'attacking') {
            Sprites.drawAttackPose(ctx, this.x, this.y, this.w, this.h, this.palette, this.frame, this.facingRight, this.type, 'punch');
        } else {
            Sprites.drawPixelChar(ctx, this.x, this.y, this.w, this.h, this.palette, this.frame, this.facingRight, this.type);
        }

        // Health bar above enemy
        if (this.state !== 'dead') {
            const barW = 40;
            const barH = 4;
            const barX = this.x + (this.w - barW) / 2;
            const barY = this.y - 10;

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barW, barH);

            const hpRatio = this.hp / this.maxHp;
            ctx.fillStyle = hpRatio > 0.5 ? '#44CC44' : (hpRatio > 0.25 ? '#CCCC44' : '#CC4444');
            ctx.fillRect(barX, barY, barW * hpRatio, barH);

            // Name tag
            ctx.fillStyle = '#FFF';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.name, this.x + this.w / 2, barY - 2);
        }
    }

    get alive() { return this.hp > 0; }
    get isDead() { return this.state === 'dead' && this.deathTimer <= 0; }
    get centerX() { return this.x + this.w / 2; }
    get centerY() { return this.y + this.h / 2; }
}

// Enemy wave/spawning system
const EnemySpawner = {
    enemyTypes: ['zabuza', 'orochimaru', 'pain', 'itachi', 'sasuke', 'madara'],
    spawnTimer: 0,
    waveTimer: 0,
    difficulty: 1,
    enemiesDefeated: 0,
    spawnInterval: 90, // 1.5 seconds initially
    noEnemyTimer: 0,

    reset() {
        this.spawnTimer = 30; // first enemies come quick
        this.waveTimer = 0;
        this.difficulty = 1;
        this.enemiesDefeated = 0;
        this.spawnInterval = 90;
        this.noEnemyTimer = 0;
    },

    update(enemies, player, groundLevel) {
        this.waveTimer++;
        this.spawnTimer--;

        // Increase difficulty over time
        if (this.waveTimer % 600 === 0) { // every 10 seconds
            this.difficulty += 0.2;
            this.spawnInterval = Math.max(40, this.spawnInterval - 8);
        }

        // Count only alive enemies (not in death animation)
        const aliveCount = enemies.filter(e => e.alive).length;

        // Force spawn if no alive enemies for too long
        if (aliveCount === 0) {
            this.noEnemyTimer++;
            if (this.noEnemyTimer > 60) { // 1 second with no enemies
                this.spawnTimer = 0;
                this.noEnemyTimer = 0;
            }
        } else {
            this.noEnemyTimer = 0;
        }

        // Spawn enemies (only count alive ones for max check)
        if (this.spawnTimer <= 0 && aliveCount < this.getMaxEnemies()) {
            this.spawnEnemy(enemies, player, groundLevel);
            this.spawnTimer = this.spawnInterval + Math.floor(Math.random() * 30);
        }
    },

    getMaxEnemies() {
        return Math.min(8, 2 + Math.floor(this.difficulty / 2));
    },

    spawnEnemy(enemies, player, groundLevel) {
        // Pick type based on difficulty
        let availableTypes;
        if (this.difficulty < 2) {
            availableTypes = ['zabuza'];
        } else if (this.difficulty < 3) {
            availableTypes = ['zabuza', 'sasuke', 'orochimaru'];
        } else if (this.difficulty < 5) {
            availableTypes = ['zabuza', 'sasuke', 'orochimaru', 'itachi', 'pain'];
        } else {
            availableTypes = this.enemyTypes;
        }

        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];

        // Spawn just outside the visible screen area
        const side = Math.random() > 0.5 ? 1 : -1;
        const spawnX = player.x + side * (200 + Math.random() * 150);

        const enemy = new Enemy(
            Math.max(0, spawnX),
            groundLevel - 72,
            type,
            Math.floor(this.difficulty)
        );

        enemies.push(enemy);
    },

    onEnemyDefeated() {
        this.enemiesDefeated++;
    }
};
