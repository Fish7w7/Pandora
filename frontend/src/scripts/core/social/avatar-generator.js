const AvatarGenerator = {
    _cache: {},

    _hash(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
        return Math.abs(h);
    },

    _getColors(username) {
        const h    = this._hash(username);
        const hue  = h % 360;
        const hue2 = (hue + 40) % 360;

        const themeColors = {
            purple: [270, 310], blue:   [210, 250], green:  [140, 170],
            red:    [0,   30],  orange: [25,  50],  pink:   [320, 350],
            teal:   [170, 200], indigo: [230, 260],
        };
        const theme = document.body?.dataset?.theme || 'purple';
        const range = themeColors[theme] || themeColors.purple;
        const tHue  = range[0] + (h % (range[1] - range[0]));

        return {
            bg1:  `hsl(${tHue},65%,35%)`,
            bg2:  `hsl(${(tHue + 20) % 360},70%,25%)`,
            fur:  `hsl(${hue},55%,68%)`,
            fur2: `hsl(${hue2},50%,58%)`,
            ear:  `hsl(${hue},45%,55%)`,
            nose: `hsl(${(hue + 180) % 360},60%,72%)`,
        };
    },

    _getExpression(username) {
        const l = username.length;
        if (l <= 3) return 'serious';
        if (l <= 6) return 'neutral';
        return 'happy';
    },

    generate(username, size = 40) {
        if (!username) username = '?';
        const key = `${username}_${size}`;
        if (this._cache[key]) return this._cache[key];

        const c   = this._getColors(username);
        const exp = this._getExpression(username);
        const s   = size;
        const cx  = s / 2, cy = s / 2 + s * 0.04, r = s * 0.38;

        const eyeY  = cy - r * 0.15;
        const eyeX1 = cx - r * 0.38, eyeX2 = cx + r * 0.38;
        const eyeR  = r * 0.11;
        const mouthY = cy + r * 0.32;

        let mouth = '';
        if (exp === 'happy') {
            mouth = `<path d="M${cx - r*0.25} ${mouthY} Q${cx} ${mouthY + r*0.22} ${cx + r*0.25} ${mouthY}" fill="none" stroke="${c.nose}" stroke-width="${s*0.028}" stroke-linecap="round"/>`;
        } else if (exp === 'neutral') {
            mouth = `<line x1="${cx - r*0.18}" y1="${mouthY}" x2="${cx + r*0.18}" y2="${mouthY}" stroke="${c.nose}" stroke-width="${s*0.025}" stroke-linecap="round"/>`;
        } else {
            mouth = `<path d="M${cx - r*0.2} ${mouthY + r*0.08} Q${cx} ${mouthY - r*0.06} ${cx + r*0.2} ${mouthY + r*0.08}" fill="none" stroke="${c.nose}" stroke-width="${s*0.025}" stroke-linecap="round"/>`;
        }

        const wY = cy + r * 0.12, wLen = r * 0.42;
        const whiskers = `
            <line x1="${cx - r*0.08}" y1="${wY}" x2="${cx - r*0.08 - wLen}" y2="${wY - r*0.08}" stroke="rgba(255,255,255,0.45)" stroke-width="${s*0.018}" stroke-linecap="round"/>
            <line x1="${cx - r*0.08}" y1="${wY + r*0.1}" x2="${cx - r*0.08 - wLen}" y2="${wY + r*0.18}" stroke="rgba(255,255,255,0.45)" stroke-width="${s*0.018}" stroke-linecap="round"/>
            <line x1="${cx + r*0.08}" y1="${wY}" x2="${cx + r*0.08 + wLen}" y2="${wY - r*0.08}" stroke="rgba(255,255,255,0.45)" stroke-width="${s*0.018}" stroke-linecap="round"/>
            <line x1="${cx + r*0.08}" y1="${wY + r*0.1}" x2="${cx + r*0.08 + wLen}" y2="${wY + r*0.18}" stroke="rgba(255,255,255,0.45)" stroke-width="${s*0.018}" stroke-linecap="round"/>`;

        const earH = r * 0.48, earW = r * 0.38, earY = cy - r * 0.82;
        const earX1 = cx - r * 0.55, earX2 = cx + r * 0.55;
        const ears = `
            <polygon points="${earX1},${earY + earH} ${earX1 - earW*0.5},${earY} ${earX1 + earW*0.5},${earY}" fill="${c.ear}"/>
            <polygon points="${earX2},${earY + earH} ${earX2 - earW*0.5},${earY} ${earX2 + earW*0.5},${earY}" fill="${c.ear}"/>
            <polygon points="${earX1},${earY + earH*0.7} ${earX1 - earW*0.28},${earY + earH*0.15} ${earX1 + earW*0.28},${earY + earH*0.15}" fill="${c.nose}" opacity="0.5"/>
            <polygon points="${earX2},${earY + earH*0.7} ${earX2 - earW*0.28},${earY + earH*0.15} ${earX2 + earW*0.28},${earY + earH*0.15}" fill="${c.nose}" opacity="0.5"/>`;

        const cleanKey = key.replace(/\W/g, '');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
            <defs>
                <radialGradient id="bg_${cleanKey}" cx="50%" cy="40%" r="65%">
                    <stop offset="0%" stop-color="${c.bg1}"/><stop offset="100%" stop-color="${c.bg2}"/>
                </radialGradient>
                <radialGradient id="fur_${cleanKey}" cx="50%" cy="45%" r="60%">
                    <stop offset="0%" stop-color="${c.fur}"/><stop offset="100%" stop-color="${c.fur2}"/>
                </radialGradient>
            </defs>
            <rect width="${s}" height="${s}" rx="${s*0.22}" fill="url(#bg_${cleanKey})"/>
            ${ears}
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#fur_${cleanKey})"/>
            <ellipse cx="${cx}" cy="${cy - r*0.55}" rx="${r*0.22}" ry="${r*0.13}" fill="${c.fur2}" opacity="0.6"/>
            <ellipse cx="${eyeX1}" cy="${eyeY}" rx="${eyeR}" ry="${eyeR * 1.15}" fill="#1a1a2e"/>
            <ellipse cx="${eyeX2}" cy="${eyeY}" rx="${eyeR}" ry="${eyeR * 1.15}" fill="#1a1a2e"/>
            <circle cx="${eyeX1 + eyeR*0.3}" cy="${eyeY - eyeR*0.35}" r="${eyeR*0.32}" fill="white" opacity="0.9"/>
            <circle cx="${eyeX2 + eyeR*0.3}" cy="${eyeY - eyeR*0.35}" r="${eyeR*0.32}" fill="white" opacity="0.9"/>
            <ellipse cx="${cx}" cy="${cy + r*0.12}" rx="${r*0.09}" ry="${r*0.07}" fill="${c.nose}"/>
            ${mouth}
            ${whiskers}
        </svg>`;

        this._cache[key] = svg;
        return svg;
    },

    generateDataURL(username, size = 40) {
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(this.generate(username, size));
    },

    clearCache() { this._cache = {}; },
};

window.AvatarGenerator = AvatarGenerator;
