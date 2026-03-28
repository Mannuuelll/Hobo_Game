// Pixel art sprite drawing functions for all characters
const Sprites = {
    // Color palettes
    colors: {
        naruto: {
            hair: '#FFD700',
            skin: '#FFCC99',
            jacket: '#FF6B00',
            pants: '#2255AA',
            headband: '#3344AA',
            headbandPlate: '#AABBCC',
            eyes: '#4488FF',
            whiskers: '#CC9966',
            sandals: '#333366',
        },
        // Villains
        zabuza: {
            skin: '#CCBBAA',
            hair: '#222222',
            bandage: '#CCCCCC',
            pants: '#445566',
            sword: '#AABBCC',
            swordEdge: '#DDEEFF',
            eyes: '#442200',
        },
        orochimaru: {
            skin: '#EEEEDD',
            hair: '#222222',
            robe: '#776655',
            eyes: '#AAAA00',
            eyeShadow: '#7744AA',
            tongue: '#FF4488',
        },
        pain: {
            skin: '#CCBBAA',
            hair: '#FF6600',
            cloak: '#222222',
            cloakCloud: '#CC2222',
            eyes: '#BB88FF',
            piercings: '#444444',
            rinnegan: '#BBAADD',
        },
        madara: {
            skin: '#DDCCBB',
            hair: '#111111',
            armor: '#CC2222',
            armorDark: '#881111',
            pants: '#333333',
            eyes: '#FF0000',
            sharingan: '#FF0000',
        },
        itachi: {
            skin: '#DDCCBB',
            hair: '#222222',
            cloak: '#222222',
            cloakCloud: '#CC2222',
            eyes: '#FF0000',
            headband: '#3344AA',
        },
        sasuke: {
            skin: '#FFDDCC',
            hair: '#1a1a2e',
            shirt: '#EEEEEE',
            pants: '#333344',
            eyes: '#222222',
            sharingan: '#FF0000',
            rope: '#9966CC',
        },
    },

    drawPixelChar(ctx, x, y, w, h, palette, frame, facingRight, type) {
        ctx.save();
        if (!facingRight) {
            ctx.translate(x + w, y);
            ctx.scale(-1, 1);
            x = 0; y = 0;
        }
        switch(type) {
            case 'naruto': this.drawNaruto(ctx, x, y, w, h, palette, frame); break;
            case 'zabuza': this.drawZabuza(ctx, x, y, w, h, palette, frame); break;
            case 'orochimaru': this.drawOrochimaru(ctx, x, y, w, h, palette, frame); break;
            case 'pain': this.drawPain(ctx, x, y, w, h, palette, frame); break;
            case 'madara': this.drawMadara(ctx, x, y, w, h, palette, frame); break;
            case 'itachi': this.drawItachi(ctx, x, y, w, h, palette, frame); break;
            case 'sasuke': this.drawSasuke(ctx, x, y, w, h, palette, frame); break;
            default: this.drawNaruto(ctx, x, y, w, h, palette, frame);
        }
        ctx.restore();
    },

    // Helper to draw a rectangle
    rect(ctx, x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    },

    drawNaruto(ctx, x, y, w, h, p, frame) {
        const px = w / 16;
        const py = h / 24;
        const bobY = Math.sin(frame * 0.15) * py;

        // Hair (spiky)
        this.rect(ctx, x + 3*px, y + bobY, 10*px, 5*py, p.hair);
        this.rect(ctx, x + 2*px, y + 1*py + bobY, 2*px, 4*py, p.hair); // left spike
        this.rect(ctx, x + 12*px, y + 1*py + bobY, 2*px, 4*py, p.hair); // right spike
        this.rect(ctx, x + 1*px, y + 0*py + bobY, 2*px, 2*py, p.hair); // top left spike
        this.rect(ctx, x + 13*px, y + 0*py + bobY, 2*px, 2*py, p.hair); // top right spike
        this.rect(ctx, x + 6*px, y - 1*py + bobY, 4*px, 2*py, p.hair); // top spike

        // Headband
        this.rect(ctx, x + 3*px, y + 4*py + bobY, 10*px, 2*py, p.headband);
        this.rect(ctx, x + 6*px, y + 4*py + bobY, 4*px, 2*py, p.headbandPlate);

        // Face
        this.rect(ctx, x + 4*px, y + 6*py + bobY, 8*px, 6*py, p.skin);

        // Eyes
        this.rect(ctx, x + 5*px, y + 7*py + bobY, 2*px, 2*py, '#FFF');
        this.rect(ctx, x + 9*px, y + 7*py + bobY, 2*px, 2*py, '#FFF');
        this.rect(ctx, x + 6*px, y + 7.5*py + bobY, 1*px, 1*py, p.eyes);
        this.rect(ctx, x + 10*px, y + 7.5*py + bobY, 1*px, 1*py, p.eyes);

        // Whisker marks
        this.rect(ctx, x + 4*px, y + 9*py + bobY, 2*px, 0.5*py, p.whiskers);
        this.rect(ctx, x + 10*px, y + 9*py + bobY, 2*px, 0.5*py, p.whiskers);
        this.rect(ctx, x + 4*px, y + 10*py + bobY, 2*px, 0.5*py, p.whiskers);
        this.rect(ctx, x + 10*px, y + 10*py + bobY, 2*px, 0.5*py, p.whiskers);

        // Mouth
        this.rect(ctx, x + 7*px, y + 10*py + bobY, 2*px, 1*py, '#CC6644');

        // Neck
        this.rect(ctx, x + 6*px, y + 12*py + bobY, 4*px, 1*py, p.skin);

        // Jacket (orange)
        this.rect(ctx, x + 3*px, y + 13*py, 10*px, 5*py, p.jacket);
        // Jacket zipper
        this.rect(ctx, x + 7.5*px, y + 13*py, 1*px, 5*py, '#FFFFFF');

        // Arms
        const armSwing = Math.sin(frame * 0.2) * 1.5 * py;
        this.rect(ctx, x + 1*px, y + 13*py + armSwing, 2*px, 5*py, p.jacket);
        this.rect(ctx, x + 13*px, y + 13*py - armSwing, 2*px, 5*py, p.jacket);
        // Hands
        this.rect(ctx, x + 1*px, y + 18*py + armSwing, 2*px, 1*py, p.skin);
        this.rect(ctx, x + 13*px, y + 18*py - armSwing, 2*px, 1*py, p.skin);

        // Pants (blue)
        this.rect(ctx, x + 4*px, y + 18*py, 3.5*px, 4*py, p.pants);
        this.rect(ctx, x + 8.5*px, y + 18*py, 3.5*px, 4*py, p.pants);

        // Sandals
        const legSwing = Math.sin(frame * 0.2) * py;
        this.rect(ctx, x + 4*px, y + 22*py + legSwing, 3*px, 2*py, p.sandals);
        this.rect(ctx, x + 9*px, y + 22*py - legSwing, 3*px, 2*py, p.sandals);
    },

    drawZabuza(ctx, x, y, w, h, p, frame) {
        const px = w / 16;
        const py = h / 24;
        const bobY = Math.sin(frame * 0.12) * py;

        // Hair
        this.rect(ctx, x + 4*px, y + bobY, 8*px, 3*py, p.hair);

        // Face bandage (covers mouth)
        this.rect(ctx, x + 4*px, y + 3*py + bobY, 8*px, 8*py, p.skin);
        this.rect(ctx, x + 4*px, y + 8*py + bobY, 8*px, 3*py, p.bandage);

        // Eyes
        this.rect(ctx, x + 5*px, y + 5*py + bobY, 2*px, 1.5*py, '#FFF');
        this.rect(ctx, x + 9*px, y + 5*py + bobY, 2*px, 1.5*py, '#FFF');
        this.rect(ctx, x + 6*px, y + 5.5*py + bobY, 1*px, 1*py, p.eyes);
        this.rect(ctx, x + 10*px, y + 5.5*py + bobY, 1*px, 1*py, p.eyes);

        // Body
        this.rect(ctx, x + 3*px, y + 12*py, 10*px, 6*py, p.pants);

        // Arms + Sword
        this.rect(ctx, x + 1*px, y + 12*py, 2*px, 6*py, p.skin);
        this.rect(ctx, x + 13*px, y + 12*py, 2*px, 6*py, p.skin);
        // Giant sword on back
        this.rect(ctx, x + 13*px, y + 2*py, 3*px, 16*py, p.sword);
        this.rect(ctx, x + 15.5*px, y + 2*py, 0.5*px, 16*py, p.swordEdge);

        // Pants
        this.rect(ctx, x + 4*px, y + 18*py, 3.5*px, 4*py, p.pants);
        this.rect(ctx, x + 8.5*px, y + 18*py, 3.5*px, 4*py, p.pants);

        // Feet
        this.rect(ctx, x + 4*px, y + 22*py, 3*px, 2*py, '#333');
        this.rect(ctx, x + 9*px, y + 22*py, 3*px, 2*py, '#333');
    },

    drawOrochimaru(ctx, x, y, w, h, p, frame) {
        const px = w / 16;
        const py = h / 24;
        const bobY = Math.sin(frame * 0.1) * py * 0.5;

        // Long hair
        this.rect(ctx, x + 3*px, y + bobY, 10*px, 4*py, p.hair);
        this.rect(ctx, x + 2*px, y + 3*py + bobY, 3*px, 10*py, p.hair); // left hair
        this.rect(ctx, x + 11*px, y + 3*py + bobY, 3*px, 10*py, p.hair); // right hair

        // Face (pale)
        this.rect(ctx, x + 4*px, y + 4*py + bobY, 8*px, 7*py, p.skin);

        // Eye shadow
        this.rect(ctx, x + 5*px, y + 5*py + bobY, 2*px, 2*py, p.eyeShadow);
        this.rect(ctx, x + 9*px, y + 5*py + bobY, 2*px, 2*py, p.eyeShadow);
        // Snake eyes
        this.rect(ctx, x + 5.5*px, y + 5.5*py + bobY, 1*px, 1*py, p.eyes);
        this.rect(ctx, x + 9.5*px, y + 5.5*py + bobY, 1*px, 1*py, p.eyes);

        // Tongue sticking out sometimes
        if (frame % 60 < 20) {
            this.rect(ctx, x + 7*px, y + 10*py + bobY, 2*px, 3*py, p.tongue);
        }

        // Robe
        this.rect(ctx, x + 3*px, y + 12*py, 10*px, 7*py, p.robe);

        // Arms
        this.rect(ctx, x + 1*px, y + 13*py, 2*px, 5*py, p.robe);
        this.rect(ctx, x + 13*px, y + 13*py, 2*px, 5*py, p.robe);
        this.rect(ctx, x + 1*px, y + 18*py, 2*px, 1*py, p.skin);
        this.rect(ctx, x + 13*px, y + 18*py, 2*px, 1*py, p.skin);

        // Legs
        this.rect(ctx, x + 4*px, y + 19*py, 3.5*px, 3*py, p.robe);
        this.rect(ctx, x + 8.5*px, y + 19*py, 3.5*px, 3*py, p.robe);
        this.rect(ctx, x + 4*px, y + 22*py, 3*px, 2*py, '#333');
        this.rect(ctx, x + 9*px, y + 22*py, 3*px, 2*py, '#333');
    },

    drawPain(ctx, x, y, w, h, p, frame) {
        const px = w / 16;
        const py = h / 24;
        const bobY = Math.sin(frame * 0.1) * py * 0.5;

        // Orange spiky hair
        this.rect(ctx, x + 3*px, y + bobY, 10*px, 4*py, p.hair);
        this.rect(ctx, x + 2*px, y - 1*py + bobY, 2*px, 3*py, p.hair);
        this.rect(ctx, x + 5*px, y - 2*py + bobY, 2*px, 3*py, p.hair);
        this.rect(ctx, x + 9*px, y - 2*py + bobY, 2*px, 3*py, p.hair);
        this.rect(ctx, x + 12*px, y - 1*py + bobY, 2*px, 3*py, p.hair);

        // Face
        this.rect(ctx, x + 4*px, y + 4*py + bobY, 8*px, 7*py, p.skin);

        // Rinnegan eyes
        this.rect(ctx, x + 5*px, y + 5.5*py + bobY, 2*px, 2*py, p.rinnegan);
        this.rect(ctx, x + 9*px, y + 5.5*py + bobY, 2*px, 2*py, p.rinnegan);
        // Rinnegan rings
        this.rect(ctx, x + 5.5*px, y + 6*py + bobY, 1*px, 1*py, '#6644AA');
        this.rect(ctx, x + 9.5*px, y + 6*py + bobY, 1*px, 1*py, '#6644AA');

        // Piercings
        this.rect(ctx, x + 6*px, y + 8*py + bobY, 0.5*px, 0.5*py, p.piercings);
        this.rect(ctx, x + 9.5*px, y + 8*py + bobY, 0.5*px, 0.5*py, p.piercings);
        this.rect(ctx, x + 7*px, y + 9.5*py + bobY, 0.5*px, 1*py, p.piercings);
        this.rect(ctx, x + 8.5*px, y + 9.5*py + bobY, 0.5*px, 1*py, p.piercings);

        // Akatsuki cloak
        this.rect(ctx, x + 2*px, y + 12*py, 12*px, 8*py, p.cloak);
        // Red clouds
        this.rect(ctx, x + 3*px, y + 14*py, 3*px, 2*py, p.cloakCloud);
        this.rect(ctx, x + 10*px, y + 16*py, 3*px, 2*py, p.cloakCloud);

        // Legs
        this.rect(ctx, x + 4*px, y + 20*py, 3.5*px, 2*py, p.cloak);
        this.rect(ctx, x + 8.5*px, y + 20*py, 3.5*px, 2*py, p.cloak);
        this.rect(ctx, x + 4*px, y + 22*py, 3*px, 2*py, '#333');
        this.rect(ctx, x + 9*px, y + 22*py, 3*px, 2*py, '#333');
    },

    drawMadara(ctx, x, y, w, h, p, frame) {
        const px = w / 16;
        const py = h / 24;
        const bobY = Math.sin(frame * 0.1) * py * 0.5;

        // Long wild hair
        this.rect(ctx, x + 2*px, y + bobY, 12*px, 5*py, p.hair);
        this.rect(ctx, x + 1*px, y + 4*py + bobY, 3*px, 12*py, p.hair);
        this.rect(ctx, x + 12*px, y + 4*py + bobY, 3*px, 12*py, p.hair);
        this.rect(ctx, x + 4*px, y - 1*py + bobY, 2*px, 2*py, p.hair);
        this.rect(ctx, x + 10*px, y - 1*py + bobY, 2*px, 2*py, p.hair);

        // Face
        this.rect(ctx, x + 4*px, y + 4*py + bobY, 8*px, 7*py, p.skin);

        // Sharingan eyes
        this.rect(ctx, x + 5*px, y + 6*py + bobY, 2*px, 2*py, p.sharingan);
        this.rect(ctx, x + 9*px, y + 6*py + bobY, 2*px, 2*py, p.sharingan);
        this.rect(ctx, x + 5.7*px, y + 6.7*py + bobY, 0.6*px, 0.6*py, '#000');
        this.rect(ctx, x + 9.7*px, y + 6.7*py + bobY, 0.6*px, 0.6*py, '#000');

        // Red armor
        this.rect(ctx, x + 3*px, y + 12*py, 10*px, 6*py, p.armor);
        this.rect(ctx, x + 4*px, y + 12*py, 8*px, 2*py, p.armorDark);

        // Arms
        this.rect(ctx, x + 1*px, y + 12*py, 2*px, 6*py, p.armor);
        this.rect(ctx, x + 13*px, y + 12*py, 2*px, 6*py, p.armor);
        this.rect(ctx, x + 1*px, y + 18*py, 2*px, 1*py, p.skin);
        this.rect(ctx, x + 13*px, y + 18*py, 2*px, 1*py, p.skin);

        // Pants
        this.rect(ctx, x + 4*px, y + 18*py, 3.5*px, 4*py, p.pants);
        this.rect(ctx, x + 8.5*px, y + 18*py, 3.5*px, 4*py, p.pants);
        this.rect(ctx, x + 4*px, y + 22*py, 3*px, 2*py, '#222');
        this.rect(ctx, x + 9*px, y + 22*py, 3*px, 2*py, '#222');
    },

    drawItachi(ctx, x, y, w, h, p, frame) {
        const px = w / 16;
        const py = h / 24;
        const bobY = Math.sin(frame * 0.1) * py * 0.5;

        // Hair (ponytail)
        this.rect(ctx, x + 3*px, y + 1*py + bobY, 10*px, 4*py, p.hair);
        this.rect(ctx, x + 2*px, y + 3*py + bobY, 2*px, 6*py, p.hair);
        this.rect(ctx, x + 12*px, y + 3*py + bobY, 2*px, 6*py, p.hair);
        // Ponytail
        this.rect(ctx, x + 7*px, y + 5*py + bobY, 2*px, 8*py, p.hair);

        // Headband with slash
        this.rect(ctx, x + 3*px, y + 3*py + bobY, 10*px, 2*py, p.headband);
        ctx.strokeStyle = '#CC0000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 5*px, y + 3*py + bobY);
        ctx.lineTo(x + 11*px, y + 5*py + bobY);
        ctx.stroke();

        // Face
        this.rect(ctx, x + 4*px, y + 5*py + bobY, 8*px, 6*py, p.skin);

        // Sharingan
        this.rect(ctx, x + 5*px, y + 6.5*py + bobY, 2*px, 2*py, p.eyes);
        this.rect(ctx, x + 9*px, y + 6.5*py + bobY, 2*px, 2*py, p.eyes);
        // Stress lines
        this.rect(ctx, x + 5*px, y + 5.5*py + bobY, 0.5*px, 3*py, '#AA8888');
        this.rect(ctx, x + 10.5*px, y + 5.5*py + bobY, 0.5*px, 3*py, '#AA8888');

        // Akatsuki cloak
        this.rect(ctx, x + 2*px, y + 12*py, 12*px, 8*py, p.cloak);
        // Red clouds
        this.rect(ctx, x + 3*px, y + 14*py, 3*px, 2*py, p.cloakCloud);
        this.rect(ctx, x + 10*px, y + 17*py, 3*px, 2*py, p.cloakCloud);

        // Legs
        this.rect(ctx, x + 4*px, y + 20*py, 3.5*px, 2*py, p.cloak);
        this.rect(ctx, x + 8.5*px, y + 20*py, 3.5*px, 2*py, p.cloak);
        this.rect(ctx, x + 4*px, y + 22*py, 3*px, 2*py, '#333');
        this.rect(ctx, x + 9*px, y + 22*py, 3*px, 2*py, '#333');
    },

    drawSasuke(ctx, x, y, w, h, p, frame) {
        const px = w / 16;
        const py = h / 24;
        const bobY = Math.sin(frame * 0.1) * py * 0.5;

        // Hair (duck-butt style)
        this.rect(ctx, x + 4*px, y + 1*py + bobY, 8*px, 4*py, p.hair);
        this.rect(ctx, x + 3*px, y + 2*py + bobY, 2*px, 4*py, p.hair);
        this.rect(ctx, x + 11*px, y + 2*py + bobY, 2*px, 4*py, p.hair);
        // Spikes at back
        this.rect(ctx, x + 10*px, y + 0*py + bobY, 3*px, 3*py, p.hair);
        this.rect(ctx, x + 12*px, y - 1*py + bobY, 2*px, 3*py, p.hair);

        // Face
        this.rect(ctx, x + 4*px, y + 5*py + bobY, 8*px, 6*py, p.skin);

        // Eyes (Sharingan)
        this.rect(ctx, x + 5*px, y + 6.5*py + bobY, 2*px, 2*py, '#FFF');
        this.rect(ctx, x + 9*px, y + 6.5*py + bobY, 2*px, 2*py, '#FFF');
        this.rect(ctx, x + 5.7*px, y + 7*py + bobY, 1*px, 1*py, p.sharingan);
        this.rect(ctx, x + 9.7*px, y + 7*py + bobY, 1*px, 1*py, p.sharingan);

        // White shirt
        this.rect(ctx, x + 3*px, y + 12*py, 10*px, 5*py, p.shirt);
        // Rope belt
        this.rect(ctx, x + 3*px, y + 15*py, 10*px, 1.5*py, p.rope);

        // Arms
        this.rect(ctx, x + 1*px, y + 12*py, 2*px, 5*py, p.shirt);
        this.rect(ctx, x + 13*px, y + 12*py, 2*px, 5*py, p.shirt);
        this.rect(ctx, x + 1*px, y + 17*py, 2*px, 1*py, p.skin);
        this.rect(ctx, x + 13*px, y + 17*py, 2*px, 1*py, p.skin);

        // Pants
        this.rect(ctx, x + 4*px, y + 17*py, 3.5*px, 5*py, p.pants);
        this.rect(ctx, x + 8.5*px, y + 17*py, 3.5*px, 5*py, p.pants);
        this.rect(ctx, x + 4*px, y + 22*py, 3*px, 2*py, '#222');
        this.rect(ctx, x + 9*px, y + 22*py, 3*px, 2*py, '#222');
    },

    // Attack pose overrides
    drawAttackPose(ctx, x, y, w, h, palette, frame, facingRight, type, attackType) {
        ctx.save();
        if (!facingRight) {
            ctx.translate(x + w, y);
            ctx.scale(-1, 1);
            x = 0; y = 0;
        }

        const px = w / 16;
        const py = h / 24;

        // Draw base character
        switch(type) {
            case 'naruto': this.drawNaruto(ctx, x, y, w, h, palette, frame); break;
            case 'zabuza': this.drawZabuza(ctx, x, y, w, h, palette, frame); break;
            case 'orochimaru': this.drawOrochimaru(ctx, x, y, w, h, palette, frame); break;
            case 'pain': this.drawPain(ctx, x, y, w, h, palette, frame); break;
            case 'madara': this.drawMadara(ctx, x, y, w, h, palette, frame); break;
            case 'itachi': this.drawItachi(ctx, x, y, w, h, palette, frame); break;
            case 'sasuke': this.drawSasuke(ctx, x, y, w, h, palette, frame); break;
        }

        // Draw extended fist/kick
        if (attackType === 'punch') {
            this.rect(ctx, x + 15*px, y + 13*py, 5*px, 2*py, palette.skin || '#FFCC99');
        } else if (attackType === 'kick') {
            this.rect(ctx, x + 13*px, y + 19*py, 6*px, 2*py, palette.pants || '#333');
            this.rect(ctx, x + 17*px, y + 19*py, 3*px, 2*py, '#333');
        }

        ctx.restore();
    },

    // Hurt / knockback pose
    drawHurtPose(ctx, x, y, w, h, palette, frame, facingRight, type) {
        ctx.save();
        ctx.globalAlpha = 0.7 + Math.sin(frame * 0.5) * 0.3;
        this.drawPixelChar(ctx, x, y, w, h, palette, frame, facingRight, type);
        ctx.restore();
    },

    // Dead pose (lying down)
    drawDeadPose(ctx, x, y, w, h, palette, frame, facingRight, type) {
        ctx.save();
        ctx.translate(x + w/2, y + h);
        ctx.rotate(Math.PI / 2 * (facingRight ? 1 : -1));
        ctx.translate(-w/2, -h);
        this.drawPixelChar(ctx, 0, 0, w, h, palette, 0, true, type);
        ctx.restore();
    }
};
