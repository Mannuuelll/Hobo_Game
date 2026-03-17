// Visual effects for abilities and combat
const Effects = {
    activeEffects: [],

    add(effect) {
        this.activeEffects.push(effect);
    },

    update() {
        this.activeEffects = this.activeEffects.filter(e => {
            e.timer++;
            return e.timer < e.duration;
        });
    },

    draw(ctx) {
        for (const e of this.activeEffects) {
            switch(e.type) {
                case 'rasengan': this.drawRasengan(ctx, e); break;
                case 'rasenshuriken': this.drawRasenshuriken(ctx, e); break;
                case 'shadowClone': this.drawShadowClone(ctx, e); break;
                case 'hit': this.drawHitEffect(ctx, e); break;
                case 'ko': this.drawKOEffect(ctx, e); break;
                case 'comboText': this.drawComboText(ctx, e); break;
                case 'chakra': this.drawChakraAura(ctx, e); break;
                case 'dust': this.drawDust(ctx, e); break;
                case 'enemyAttack': this.drawEnemyAttack(ctx, e); break;
            }
        }
    },

    drawRasengan(ctx, e) {
        const progress = e.timer / e.duration;
        const size = e.size * (progress < 0.3 ? progress / 0.3 : 1);
        const alpha = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Outer glow
        const gradient = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, size);
        gradient.addColorStop(0, 'rgba(100, 180, 255, 0.9)');
        gradient.addColorStop(0.4, 'rgba(50, 120, 255, 0.7)');
        gradient.addColorStop(0.7, 'rgba(30, 80, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 50, 200, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(e.x, e.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Inner swirl
        ctx.strokeStyle = 'rgba(200, 230, 255, 0.8)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const angle = (e.timer * 0.3) + (i * Math.PI * 2 / 3);
            ctx.beginPath();
            ctx.arc(e.x, e.y, size * 0.5, angle, angle + 1.5);
            ctx.stroke();
        }

        // Core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(e.x, e.y, size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawRasenshuriken(ctx, e) {
        const progress = e.timer / e.duration;
        const alpha = progress > 0.8 ? 1 - (progress - 0.8) / 0.2 : 1;
        const size = e.size;

        // Move projectile
        if (e.vx !== undefined) {
            e.x += e.vx;
        }

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(e.x, e.y);
        ctx.rotate(e.timer * 0.4);

        // Shuriken blades (wind style)
        for (let i = 0; i < 4; i++) {
            ctx.save();
            ctx.rotate(i * Math.PI / 2);

            ctx.fillStyle = 'rgba(150, 220, 255, 0.7)';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(size, -size * 0.3);
            ctx.lineTo(size * 0.8, 0);
            ctx.lineTo(size, size * 0.3);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = 'rgba(200, 240, 255, 0.8)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }

        // Center glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.3);
        gradient.addColorStop(0, 'rgba(200, 230, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(100, 180, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawShadowClone(ctx, e) {
        const progress = e.timer / e.duration;
        const alpha = progress > 0.6 ? 1 - (progress - 0.6) / 0.4 : 0.6;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Draw a ghost-like Naruto clone
        Sprites.drawPixelChar(ctx, e.x, e.y, 48, 72, Sprites.colors.naruto, e.timer, e.facingRight, 'naruto');

        // Smoky poof effect at creation
        if (e.timer < 15) {
            const puffAlpha = 1 - e.timer / 15;
            ctx.globalAlpha = puffAlpha * 0.5;
            ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2 + e.timer * 0.2;
                const dist = e.timer * 2;
                ctx.beginPath();
                ctx.arc(e.x + 24 + Math.cos(angle) * dist, e.y + 36 + Math.sin(angle) * dist, 8 + e.timer, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    },

    drawHitEffect(ctx, e) {
        const progress = e.timer / e.duration;
        const alpha = 1 - progress;
        const size = 10 + progress * 20;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Star burst hit effect
        ctx.fillStyle = '#FFFF00';
        ctx.translate(e.x, e.y);
        for (let i = 0; i < 8; i++) {
            ctx.save();
            ctx.rotate((i / 8) * Math.PI * 2 + e.timer * 0.1);
            ctx.fillRect(-2, 0, 4, size);
            ctx.restore();
        }

        // "Impact" text
        if (e.damage && e.timer < 15) {
            ctx.fillStyle = '#FF4444';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(e.damage, 0, -20 - e.timer * 2);
        }

        ctx.restore();
    },

    drawKOEffect(ctx, e) {
        const progress = e.timer / e.duration;
        const alpha = progress < 0.2 ? progress / 0.2 : (progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1);
        const scale = progress < 0.3 ? progress / 0.3 : 1;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${40 * scale}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FF0000';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText('K.O.!', e.x, e.y - 30 * progress);
        ctx.fillText('K.O.!', e.x, e.y - 30 * progress);
        ctx.restore();
    },

    drawComboText(ctx, e) {
        const progress = e.timer / e.duration;
        const alpha = progress > 0.6 ? 1 - (progress - 0.6) / 0.4 : 1;
        const scale = 1 + Math.sin(progress * Math.PI) * 0.3;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${20 * scale}px monospace`;
        ctx.textAlign = 'center';

        const colors = ['#FFAA00', '#FF6600', '#FF0000', '#FF00FF', '#00FFFF'];
        const colorIdx = Math.min(Math.floor(e.combo / 5), colors.length - 1);
        ctx.fillStyle = colors[colorIdx];
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        const text = `${e.combo} HITS!`;
        ctx.strokeText(text, e.x, e.y - e.timer * 1.5);
        ctx.fillText(text, e.x, e.y - e.timer * 1.5);
        ctx.restore();
    },

    drawChakraAura(ctx, e) {
        const progress = e.timer / e.duration;
        const alpha = (1 - progress) * 0.4;

        ctx.save();
        ctx.globalAlpha = alpha;

        const gradient = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size);
        gradient.addColorStop(0, 'rgba(50, 120, 255, 0.6)');
        gradient.addColorStop(0.5, 'rgba(100, 180, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(50, 100, 200, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size + Math.sin(e.timer * 0.3) * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },

    drawDust(ctx, e) {
        const progress = e.timer / e.duration;
        const alpha = (1 - progress) * 0.6;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#AA9977';

        for (let i = 0; i < (e.count || 5); i++) {
            const angle = (i / (e.count || 5)) * Math.PI + progress * 2;
            const dist = progress * 30;
            const sz = (1 - progress) * 6;
            ctx.beginPath();
            ctx.arc(
                e.x + Math.cos(angle) * dist,
                e.y + Math.sin(angle) * dist * 0.5 - progress * 10,
                sz, 0, Math.PI * 2
            );
            ctx.fill();
        }
        ctx.restore();
    },

    drawEnemyAttack(ctx, e) {
        const progress = e.timer / e.duration;
        const alpha = 1 - progress;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Simple slash effect
        ctx.strokeStyle = '#FF4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const startX = e.x - 15 * (e.facingRight ? -1 : 1);
        const endX = e.x + 15 * (e.facingRight ? -1 : 1);
        ctx.moveTo(startX, e.y - 10);
        ctx.lineTo(endX, e.y + 10);
        ctx.stroke();

        ctx.restore();
    },

    // Spawn specific effects
    spawnHitEffect(x, y, damage) {
        this.add({ type: 'hit', x, y, damage, timer: 0, duration: 20 });
    },

    spawnKO(x, y) {
        this.add({ type: 'ko', x, y, timer: 0, duration: 60 });
    },

    spawnComboText(x, y, combo) {
        this.add({ type: 'comboText', x, y, combo, timer: 0, duration: 40 });
    },

    spawnRasengan(x, y, size) {
        this.add({ type: 'rasengan', x, y, size: size || 30, timer: 0, duration: 30 });
    },

    spawnRasenshuriken(x, y, facingRight) {
        this.add({
            type: 'rasenshuriken',
            x, y,
            size: 25,
            vx: facingRight ? 8 : -8,
            facingRight,
            timer: 0,
            duration: 60
        });
    },

    spawnShadowClone(x, y, facingRight) {
        // Spawn 2 clones at offset positions
        const offsets = [{ x: -40, y: -10 }, { x: 40, y: 10 }];
        for (const off of offsets) {
            this.add({
                type: 'shadowClone',
                x: x + off.x,
                y: y + off.y,
                facingRight,
                timer: 0,
                duration: 45
            });
        }
    },

    spawnChakraAura(x, y) {
        this.add({ type: 'chakra', x, y, size: 40, timer: 0, duration: 30 });
    },

    spawnDust(x, y) {
        this.add({ type: 'dust', x, y, count: 5, timer: 0, duration: 20 });
    },

    clear() {
        this.activeEffects = [];
    }
};
