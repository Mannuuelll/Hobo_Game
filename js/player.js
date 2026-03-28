class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 48;
        this.h = 72;
        this.vx = 0;
        this.vy = 0;
        this.speed = 4;
        this.jumpForce = -12;
        this.gravity = 0.6;
        this.groundY = y;
        this.onGround = true;
        this.facingRight = true;
        this.frame = 0;

        this.hp = 100;
        this.maxHp = 100;
        this.chakra = 100;
        this.maxChakra = 100;
        this.chakraRegen = 0.08;

        this.state = 'idle'; // idle, walking, jumping, attacking, hurt, blocking
        this.attackTimer = 0;
        this.attackDuration = 0;
        this.currentAttack = null;
        this.hurtTimer = 0;
        this.comboCount = 0;
        this.comboTimer = 0;
        this.maxCombo = 0;
        this.invincible = 0;
        this.blocking = false;
        this.blockTimer = 0;

        // Ability cooldowns (in frames)
        this.cooldowns = {
            rasengan: 0,
            shadowClone: 0,
            rasenshuriken: 0
        };
        this.cooldownMax = {
            rasengan: 90,       // 1.5 sec
            shadowClone: 180,   // 3 sec
            rasenshuriken: 150  // 2.5 sec
        };
        this.chakraCost = {
            rasengan: 25,
            shadowClone: 30,
            rasenshuriken: 35
        };

        this.palette = Sprites.colors.naruto;
        this.type = 'naruto';
    }

    update(keys, groundLevel) {
        this.frame++;
        this.groundY = groundLevel - this.h;

        // Reduce cooldowns
        for (const key in this.cooldowns) {
            if (this.cooldowns[key] > 0) this.cooldowns[key]--;
        }

        // Chakra regen
        if (this.chakra < this.maxChakra) {
            this.chakra = Math.min(this.maxChakra, this.chakra + this.chakraRegen);
        }

        // Combo timer
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) {
                this.comboCount = 0;
            }
        }

        // Invincibility frames
        if (this.invincible > 0) this.invincible--;

        // Hurt state
        if (this.hurtTimer > 0) {
            this.hurtTimer--;
            this.vx *= 0.85;
            if (this.hurtTimer <= 0) {
                this.state = 'idle';
            }
            this.applyPhysics();
            return;
        }

        // Attack state
        if (this.attackTimer > 0) {
            this.attackTimer--;
            this.vx *= 0.8;
            if (this.attackTimer <= 0) {
                this.state = 'idle';
                this.currentAttack = null;
            }
            this.applyPhysics();
            return;
        }

        // Blocking
        this.blocking = keys['KeyL'] || keys['ShiftRight'];
        if (this.blocking) {
            this.state = 'blocking';
            this.vx *= 0.7;
            this.applyPhysics();
            return;
        }

        // Movement
        let moving = false;
        if (keys['KeyA'] || keys['ArrowLeft']) {
            this.vx = -this.speed;
            this.facingRight = false;
            moving = true;
        } else if (keys['KeyD'] || keys['ArrowRight']) {
            this.vx = this.speed;
            this.facingRight = true;
            moving = true;
        } else {
            this.vx *= 0.75;
        }

        // Jump
        if ((keys['KeyW'] || keys['ArrowUp'] || keys['Space']) && this.onGround) {
            this.vy = this.jumpForce;
            this.onGround = false;
            Effects.spawnDust(this.x + this.w / 2, this.y + this.h);
        }

        // Attacks
        if (keys['KeyJ'] && !this.attackTimer) this.punch();
        if (keys['KeyK'] && !this.attackTimer) this.kick();
        if (keys['KeyU'] && !this.attackTimer) this.rasengan();
        if (keys['KeyI'] && !this.attackTimer) this.shadowCloneJutsu();
        if (keys['KeyO'] && !this.attackTimer) this.rasenshuriken();

        // Update state
        if (this.attackTimer <= 0 && !this.blocking) {
            if (!this.onGround) this.state = 'jumping';
            else if (moving) this.state = 'walking';
            else this.state = 'idle';
        }

        this.applyPhysics();
    }

    applyPhysics() {
        // Gravity
        if (!this.onGround) {
            this.vy += this.gravity;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Ground collision
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.vy = 0;
            if (!this.onGround) {
                this.onGround = true;
                Effects.spawnDust(this.x + this.w / 2, this.y + this.h);
            }
        }

        // Screen bounds (with camera)
        if (this.x < 0) this.x = 0;
    }

    punch() {
        this.state = 'attacking';
        this.currentAttack = { type: 'punch', damage: 8, range: 55, knockback: 3 };
        this.attackTimer = 15;
        this.attackDuration = 15;
    }

    kick() {
        this.state = 'attacking';
        this.currentAttack = { type: 'kick', damage: 12, range: 60, knockback: 5 };
        this.attackTimer = 20;
        this.attackDuration = 20;
    }

    rasengan() {
        if (this.cooldowns.rasengan > 0 || this.chakra < this.chakraCost.rasengan) return;
        this.chakra -= this.chakraCost.rasengan;
        this.cooldowns.rasengan = this.cooldownMax.rasengan;

        this.state = 'attacking';
        this.currentAttack = { type: 'rasengan', damage: 35, range: 70, knockback: 12 };
        this.attackTimer = 25;
        this.attackDuration = 25;

        const effectX = this.facingRight ? this.x + this.w + 10 : this.x - 30;
        Effects.spawnRasengan(effectX, this.y + this.h * 0.4, 30);
        Effects.spawnChakraAura(this.x + this.w / 2, this.y + this.h / 2);
    }

    shadowCloneJutsu() {
        if (this.cooldowns.shadowClone > 0 || this.chakra < this.chakraCost.shadowClone) return;
        this.chakra -= this.chakraCost.shadowClone;
        this.cooldowns.shadowClone = this.cooldownMax.shadowClone;

        this.state = 'attacking';
        this.currentAttack = { type: 'shadowClone', damage: 20, range: 100, knockback: 6, aoe: true };
        this.attackTimer = 30;
        this.attackDuration = 30;

        Effects.spawnShadowClone(this.x, this.y, this.facingRight);
        Effects.spawnChakraAura(this.x + this.w / 2, this.y + this.h / 2);
    }

    rasenshuriken() {
        if (this.cooldowns.rasenshuriken > 0 || this.chakra < this.chakraCost.rasenshuriken) return;
        this.chakra -= this.chakraCost.rasenshuriken;
        this.cooldowns.rasenshuriken = this.cooldownMax.rasenshuriken;

        this.state = 'attacking';
        this.currentAttack = { type: 'rasenshuriken', damage: 45, range: 300, knockback: 15, projectile: true };
        this.attackTimer = 25;
        this.attackDuration = 25;

        const effectX = this.facingRight ? this.x + this.w : this.x;
        Effects.spawnRasenshuriken(effectX, this.y + this.h * 0.35, this.facingRight);
        Effects.spawnChakraAura(this.x + this.w / 2, this.y + this.h / 2);
    }

    takeDamage(damage, knockbackX) {
        if (this.invincible > 0) return;

        if (this.blocking) {
            damage = Math.floor(damage * 0.2);
            knockbackX *= 0.3;
        }

        this.hp -= damage;
        this.hurtTimer = 20;
        this.state = 'hurt';
        this.vx = knockbackX;
        this.vy = -4;
        this.onGround = false;
        this.invincible = 30;
        this.comboCount = 0;
        this.comboTimer = 0;

        Effects.spawnHitEffect(this.x + this.w / 2, this.y + this.h / 3, damage);
    }

    addCombo() {
        this.comboCount++;
        this.comboTimer = 90; // 1.5 seconds to keep combo
        if (this.comboCount > this.maxCombo) this.maxCombo = this.comboCount;
        if (this.comboCount > 2) {
            Effects.spawnComboText(this.x + this.w / 2, this.y - 10, this.comboCount);
        }
    }

    getAttackHitbox() {
        if (!this.currentAttack || this.attackTimer <= 0) return null;

        // Only deal damage in the "active" frames of the attack
        const elapsed = this.attackDuration - this.attackTimer;
        if (elapsed < 3 || elapsed > this.attackDuration - 3) return null;

        const range = this.currentAttack.range;
        if (this.currentAttack.projectile) {
            // Projectile hitbox travels forward
            const dist = elapsed * 8;
            const px = this.facingRight ? this.x + this.w + dist : this.x - dist - 30;
            return { x: px, y: this.y + 10, w: 30, h: this.h - 20 };
        }
        if (this.currentAttack.aoe) {
            // Area of effect around player
            return {
                x: this.x - range / 2 + this.w / 2,
                y: this.y - 10,
                w: range,
                h: this.h + 20
            };
        }
        // Normal melee
        return {
            x: this.facingRight ? this.x + this.w - 10 : this.x - range + 10,
            y: this.y + 10,
            w: range,
            h: this.h - 20
        };
    }

    draw(ctx) {
        if (this.state === 'hurt') {
            Sprites.drawHurtPose(ctx, this.x, this.y, this.w, this.h, this.palette, this.frame, this.facingRight, this.type);
        } else if (this.state === 'attacking') {
            const atkType = this.currentAttack ? this.currentAttack.type : 'punch';
            if (atkType === 'punch' || atkType === 'kick') {
                Sprites.drawAttackPose(ctx, this.x, this.y, this.w, this.h, this.palette, this.frame, this.facingRight, this.type, atkType);
            } else {
                Sprites.drawPixelChar(ctx, this.x, this.y, this.w, this.h, this.palette, this.frame, this.facingRight, this.type);
            }
        } else if (this.state === 'blocking') {
            // Blocking visual - slightly crouched, arms crossed
            ctx.save();
            ctx.globalAlpha = 0.9;
            Sprites.drawPixelChar(ctx, this.x, this.y + 5, this.w, this.h - 5, this.palette, 0, this.facingRight, this.type);
            // Shield shimmer
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, 30, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        } else {
            Sprites.drawPixelChar(ctx, this.x, this.y, this.w, this.h, this.palette, this.frame, this.facingRight, this.type);
        }

        // Invincibility flash
        if (this.invincible > 0 && this.invincible % 4 < 2) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#FFF';
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.restore();
        }
    }

    get alive() {
        return this.hp > 0;
    }

    get centerX() { return this.x + this.w / 2; }
    get centerY() { return this.y + this.h / 2; }
}
