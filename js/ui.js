// UI and HUD rendering
const UI = {
    draw(ctx, player, score, screenWidth) {
        this.drawHPBar(ctx, player);
        this.drawChakraBar(ctx, player);
        this.drawScore(ctx, score, screenWidth);
        this.drawCombo(ctx, player);
        this.drawCooldowns(ctx, player);
        this.drawAbilityBar(ctx, player);
    },

    drawHPBar(ctx, player) {
        const x = 15, y = 15, w = 200, h = 20;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - 2, y - 2, w + 4, h + 4);

        // HP bar
        const ratio = Math.max(0, player.hp / player.maxHp);
        const gradient = ctx.createLinearGradient(x, y, x, y + h);
        if (ratio > 0.5) {
            gradient.addColorStop(0, '#66DD66');
            gradient.addColorStop(1, '#44AA44');
        } else if (ratio > 0.25) {
            gradient.addColorStop(0, '#DDDD44');
            gradient.addColorStop(1, '#AAAA22');
        } else {
            gradient.addColorStop(0, '#DD4444');
            gradient.addColorStop(1, '#AA2222');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, w * ratio, h);

        // Border
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);

        // Text
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`HP: ${Math.ceil(player.hp)}/${player.maxHp}`, x + 5, y + 14);

        // Label
        ctx.fillStyle = '#FF6B00';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('NARUTO', x, y - 4);
    },

    drawChakraBar(ctx, player) {
        const x = 15, y = 40, w = 200, h = 12;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - 2, y - 2, w + 4, h + 4);

        // Chakra bar
        const ratio = player.chakra / player.maxChakra;
        const gradient = ctx.createLinearGradient(x, y, x, y + h);
        gradient.addColorStop(0, '#4488FF');
        gradient.addColorStop(1, '#2255CC');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, w * ratio, h);

        // Border
        ctx.strokeStyle = '#88AAFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);

        // Text
        ctx.fillStyle = '#FFF';
        ctx.font = '10px monospace';
        ctx.fillText(`Chakra: ${Math.ceil(player.chakra)}`, x + 5, y + 10);
    },

    drawScore(ctx, score, screenWidth) {
        const x = screenWidth - 15;

        ctx.textAlign = 'right';

        // Score
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px monospace';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`${score}`, x, 32);
        ctx.fillText(`${score}`, x, 32);

        // Label
        ctx.fillStyle = '#FFA500';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('SCORE', x, 12);

        ctx.textAlign = 'left';
    },

    drawCombo(ctx, player) {
        if (player.comboCount > 1) {
            const x = 15, y = 65;
            const size = Math.min(20 + player.comboCount, 32);
            const colors = ['#FFAA00', '#FF6600', '#FF0000', '#FF00FF', '#00FFFF'];
            const ci = Math.min(Math.floor(player.comboCount / 5), colors.length - 1);

            ctx.fillStyle = colors[ci];
            ctx.font = `bold ${size}px monospace`;
            ctx.textAlign = 'left';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            const text = `${player.comboCount}x COMBO`;
            ctx.strokeText(text, x, y + size);
            ctx.fillText(text, x, y + size);
        }
    },

    drawCooldowns(ctx, player) {
        // Draw in ability bar area below
    },

    drawAbilityBar(ctx, player) {
        const abilities = [
            { key: 'J', name: 'Schlag', cd: 0, maxCd: 0, cost: 0, color: '#FFAA44' },
            { key: 'K', name: 'Tritt', cd: 0, maxCd: 0, cost: 0, color: '#FF6644' },
            { key: 'U', name: 'Rasengan', cd: player.cooldowns.rasengan, maxCd: player.cooldownMax.rasengan, cost: player.chakraCost.rasengan, color: '#4488FF' },
            { key: 'I', name: 'Shadow Clone', cd: player.cooldowns.shadowClone, maxCd: player.cooldownMax.shadowClone, cost: player.chakraCost.shadowClone, color: '#44CC88' },
            { key: 'O', name: 'Rasenshuriken', cd: player.cooldowns.rasenshuriken, maxCd: player.cooldownMax.rasenshuriken, cost: player.chakraCost.rasenshuriken, color: '#88DDFF' },
            { key: 'L', name: 'Block', cd: 0, maxCd: 0, cost: 0, color: '#AAAACC' },
        ];

        const barY = ctx.canvas.height - 45;
        const slotW = 70;
        const slotH = 38;
        const startX = (ctx.canvas.width - abilities.length * (slotW + 5)) / 2;

        for (let i = 0; i < abilities.length; i++) {
            const ab = abilities[i];
            const sx = startX + i * (slotW + 5);

            // Background
            const onCooldown = ab.cd > 0;
            const noChakra = ab.cost > 0 && player.chakra < ab.cost;
            ctx.fillStyle = onCooldown || noChakra ? 'rgba(0, 0, 0, 0.7)' : 'rgba(30, 30, 30, 0.8)';
            ctx.fillRect(sx, barY, slotW, slotH);

            // Cooldown overlay
            if (onCooldown) {
                const cdRatio = ab.cd / ab.maxCd;
                ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
                ctx.fillRect(sx, barY, slotW * cdRatio, slotH);
            }

            // Border
            ctx.strokeStyle = onCooldown ? '#555' : ab.color;
            ctx.lineWidth = onCooldown ? 1 : 2;
            ctx.strokeRect(sx, barY, slotW, slotH);

            // Key
            ctx.fillStyle = onCooldown ? '#666' : '#FFF';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(ab.key, sx + slotW / 2, barY + 15);

            // Name
            ctx.fillStyle = onCooldown ? '#555' : ab.color;
            ctx.font = '8px monospace';
            ctx.fillText(ab.name, sx + slotW / 2, barY + 28);

            // Cooldown timer
            if (onCooldown) {
                ctx.fillStyle = '#FF4444';
                ctx.font = 'bold 10px monospace';
                const secs = (ab.cd / 60).toFixed(1);
                ctx.fillText(`${secs}s`, sx + slotW / 2, barY + 36);
            }
        }

        ctx.textAlign = 'left';
    },

    drawGameOver(ctx, score, maxCombo, screenWidth, screenHeight) {
        // This is handled by the HTML overlay
    },

    drawWaveInfo(ctx, difficulty, enemiesDefeated, screenWidth, diffLabel) {
        const x = screenWidth - 15;
        ctx.textAlign = 'right';
        if (diffLabel) {
            ctx.fillStyle = '#FFAA00';
            ctx.font = 'bold 12px monospace';
            ctx.fillText(diffLabel, x, 55);
        }
        ctx.fillStyle = '#FF8800';
        ctx.font = '12px monospace';
        ctx.fillText(`Level: ${Math.floor(difficulty)}`, x, 70);
        ctx.fillStyle = '#AAAAAA';
        ctx.font = '10px monospace';
        ctx.fillText(`Besiegt: ${enemiesDefeated}`, x, 85);
        ctx.textAlign = 'left';
    }
};
