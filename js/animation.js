/**
 * Animation Engine - Particle-based geometric art generator
 * Drives canvas animations based on emotion and language analysis.
 */

// ===== Mood Visual Configurations =====
const MOOD_CONFIGS = {
    joy: {
        palette: ['#FFD700', '#FFA500', '#FF6B35', '#FFE66D', '#FF8C42', '#FFC857'],
        background: [10, 8, 20],
        particleCount: 160,
        baseSpeed: 1.4,
        shapes: ['circle', 'star', 'triangle'],
        pattern: 'spiral',
        connectionDist: 120,
        trailAlpha: 0.08,
        turbulence: 0.4,
        pulseRate: 0.03,
        glowIntensity: 15,
    },
    sadness: {
        palette: ['#4169E1', '#6A5ACD', '#483D8B', '#87CEEB', '#B0C4DE', '#7B9EC7'],
        background: [5, 5, 18],
        particleCount: 80,
        baseSpeed: 0.4,
        shapes: ['circle'],
        pattern: 'fall',
        connectionDist: 70,
        trailAlpha: 0.03,
        turbulence: 0.08,
        pulseRate: 0.008,
        glowIntensity: 8,
    },
    anger: {
        palette: ['#FF2D2D', '#FF4500', '#DC143C', '#FF6347', '#B22222', '#FF0044'],
        background: [18, 3, 3],
        particleCount: 140,
        baseSpeed: 2.0,
        shapes: ['triangle', 'diamond', 'square'],
        pattern: 'zigzag',
        connectionDist: 100,
        trailAlpha: 0.12,
        turbulence: 0.8,
        pulseRate: 0.05,
        glowIntensity: 20,
    },
    fear: {
        palette: ['#4B0082', '#2E0854', '#663399', '#8B008B', '#556B2F', '#2F4F4F'],
        background: [3, 3, 8],
        particleCount: 100,
        baseSpeed: 0.7,
        shapes: ['triangle', 'diamond'],
        pattern: 'cluster',
        connectionDist: 60,
        trailAlpha: 0.04,
        turbulence: 0.6,
        pulseRate: 0.04,
        glowIntensity: 6,
    },
    surprise: {
        palette: ['#FF69B4', '#00CED1', '#FFD700', '#7FFF00', '#FF6EC7', '#00FFFF'],
        background: [8, 5, 15],
        particleCount: 180,
        baseSpeed: 1.8,
        shapes: ['star', 'circle', 'hexagon'],
        pattern: 'burst',
        connectionDist: 140,
        trailAlpha: 0.1,
        turbulence: 0.5,
        pulseRate: 0.06,
        glowIntensity: 18,
    },
    love: {
        palette: ['#FF69B4', '#FF1493', '#DB7093', '#FFB6C1', '#FF6B9D', '#E75480'],
        background: [15, 5, 10],
        particleCount: 120,
        baseSpeed: 0.8,
        shapes: ['circle', 'heart'],
        pattern: 'orbit',
        connectionDist: 110,
        trailAlpha: 0.05,
        turbulence: 0.15,
        pulseRate: 0.02,
        glowIntensity: 12,
    },
    calm: {
        palette: ['#48D1CC', '#5F9EA0', '#66CDAA', '#8FBC8F', '#B0E0E6', '#A8D8EA'],
        background: [5, 8, 12],
        particleCount: 90,
        baseSpeed: 0.5,
        shapes: ['circle', 'hexagon'],
        pattern: 'flow',
        connectionDist: 90,
        trailAlpha: 0.04,
        turbulence: 0.1,
        pulseRate: 0.012,
        glowIntensity: 10,
    },
};

// ===== Utility =====
function lerp(a, b, t) { return a + (b - a) * t; }
function lerpColor(hex1, hex2, t) {
    const r1 = parseInt(hex1.slice(1, 3), 16);
    const g1 = parseInt(hex1.slice(3, 5), 16);
    const b1 = parseInt(hex1.slice(5, 7), 16);
    const r2 = parseInt(hex2.slice(1, 3), 16);
    const g2 = parseInt(hex2.slice(3, 5), 16);
    const b2 = parseInt(hex2.slice(5, 7), 16);
    const r = Math.round(lerp(r1, r2, t));
    const g = Math.round(lerp(g1, g2, t));
    const b = Math.round(lerp(b1, b2, t));
    return `rgb(${r},${g},${b})`;
}
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max)); }
function dist(x1, y1, x2, y2) { return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); }

// ===== Particle =====
class Particle {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.originX = x;
        this.originY = y;
        this.vx = rand(-1, 1) * config.baseSpeed;
        this.vy = rand(-1, 1) * config.baseSpeed;
        this.size = rand(2, 6);
        this.baseSize = this.size;
        this.color = config.palette[randInt(0, config.palette.length)];
        this.shape = config.shapes[randInt(0, config.shapes.length)];
        this.opacity = rand(0.4, 0.9);
        this.angle = rand(0, Math.PI * 2);
        this.angularVel = rand(-0.02, 0.02);
        this.phase = rand(0, Math.PI * 2);
        this.life = 1;
    }

    update(dt, config, time, w, h, speedMult) {
        const speed = config.baseSpeed * speedMult;
        const turb = config.turbulence;

        switch (config.pattern) {
            case 'spiral': {
                const cx = w / 2, cy = h / 2;
                const dx = this.x - cx, dy = this.y - cy;
                const angle = Math.atan2(dy, dx);
                const r = dist(this.x, this.y, cx, cy);
                this.vx += (-Math.sin(angle) * speed * 0.3 + Math.cos(time * 0.5 + this.phase) * turb) * dt;
                this.vy += (Math.cos(angle) * speed * 0.3 + Math.sin(time * 0.7 + this.phase) * turb) * dt;
                // Gentle pull toward orbit
                const targetR = 50 + ((this.phase / (Math.PI * 2)) * Math.min(w, h) * 0.35);
                this.vx += (dx / r) * (targetR - r) * 0.001 * dt;
                this.vy += (dy / r) * (targetR - r) * 0.001 * dt;
                break;
            }
            case 'fall': {
                this.vy += 0.02 * speed * dt;
                this.vx += Math.sin(time * 0.3 + this.phase) * turb * 0.5 * dt;
                if (this.y > h + 10) {
                    this.y = -10;
                    this.x = rand(0, w);
                }
                break;
            }
            case 'zigzag': {
                const zigFreq = 3 + turb * 5;
                this.vx += Math.sin(time * zigFreq + this.phase) * speed * 0.5 * dt;
                this.vy += Math.cos(time * zigFreq * 0.7 + this.phase) * speed * 0.3 * dt;
                this.vx += (Math.random() - 0.5) * turb * 2 * dt;
                this.vy += (Math.random() - 0.5) * turb * 2 * dt;
                break;
            }
            case 'cluster': {
                const cx = w / 2 + Math.sin(time * 0.2) * w * 0.15;
                const cy = h / 2 + Math.cos(time * 0.15) * h * 0.15;
                const dx = cx - this.x, dy = cy - this.y;
                const d = Math.max(dist(this.x, this.y, cx, cy), 1);
                this.vx += (dx / d) * speed * 0.1 * dt;
                this.vy += (dy / d) * speed * 0.1 * dt;
                // Random jitter (fear trembling)
                this.vx += (Math.random() - 0.5) * turb * 3 * dt;
                this.vy += (Math.random() - 0.5) * turb * 3 * dt;
                break;
            }
            case 'burst': {
                const cx = w / 2, cy = h / 2;
                const dx = this.x - cx, dy = this.y - cy;
                const d = Math.max(dist(this.x, this.y, cx, cy), 1);
                const burstForce = Math.sin(time * 0.8 + this.phase) * speed * 0.2;
                this.vx += (dx / d) * burstForce * dt;
                this.vy += (dy / d) * burstForce * dt;
                this.vx += Math.cos(time * 2 + this.phase * 3) * turb * dt;
                this.vy += Math.sin(time * 2.5 + this.phase * 2) * turb * dt;
                break;
            }
            case 'orbit': {
                const numAttractors = 3;
                for (let i = 0; i < numAttractors; i++) {
                    const ax = w / 2 + Math.cos(time * 0.3 + (i * Math.PI * 2 / numAttractors)) * w * 0.2;
                    const ay = h / 2 + Math.sin(time * 0.3 + (i * Math.PI * 2 / numAttractors)) * h * 0.2;
                    const dx = ax - this.x, dy = ay - this.y;
                    const d = Math.max(dist(this.x, this.y, ax, ay), 20);
                    this.vx += (dx / d) * speed * 0.15 * dt;
                    this.vy += (dy / d) * speed * 0.15 * dt;
                    // Tangential force for orbiting
                    this.vx += (-dy / d) * speed * 0.08 * dt;
                    this.vy += (dx / d) * speed * 0.08 * dt;
                }
                break;
            }
            case 'flow':
            default: {
                // Perlin-like flow field using sin/cos
                const scale = 0.003;
                const fx = Math.sin(this.x * scale + time * 0.2) * Math.cos(this.y * scale * 0.8);
                const fy = Math.cos(this.y * scale + time * 0.15) * Math.sin(this.x * scale * 0.7);
                this.vx += fx * speed * 0.5 * dt;
                this.vy += fy * speed * 0.5 * dt;
                break;
            }
        }

        // Damping
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Clamp speed
        const maxSpeed = speed * 4;
        const currentSpeed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
        if (currentSpeed > maxSpeed) {
            this.vx = (this.vx / currentSpeed) * maxSpeed;
            this.vy = (this.vy / currentSpeed) * maxSpeed;
        }

        this.x += this.vx * dt * 60;
        this.y += this.vy * dt * 60;
        this.angle += this.angularVel * dt * 60;

        // Pulsing size
        this.size = this.baseSize + Math.sin(time * config.pulseRate * 60 + this.phase) * this.baseSize * 0.3;

        // Wrap around edges
        const margin = 20;
        if (config.pattern !== 'fall') {
            if (this.x < -margin) this.x = w + margin;
            if (this.x > w + margin) this.x = -margin;
            if (this.y < -margin) this.y = h + margin;
            if (this.y > h + margin) this.y = -margin;
        }
    }

    draw(ctx, glowIntensity, sizeMod = 1.0) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.globalAlpha = this.opacity;

        if (glowIntensity > 0) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = glowIntensity;
        }

        ctx.fillStyle = this.color;
        ctx.beginPath();

        const s = this.size * sizeMod;
        switch (this.shape) {
            case 'circle':
                ctx.arc(0, 0, s, 0, Math.PI * 2);
                break;
            case 'triangle':
                ctx.moveTo(0, -s);
                ctx.lineTo(s * 0.866, s * 0.5);
                ctx.lineTo(-s * 0.866, s * 0.5);
                ctx.closePath();
                break;
            case 'square':
                ctx.rect(-s * 0.7, -s * 0.7, s * 1.4, s * 1.4);
                break;
            case 'diamond':
                ctx.moveTo(0, -s * 1.2);
                ctx.lineTo(s * 0.7, 0);
                ctx.lineTo(0, s * 1.2);
                ctx.lineTo(-s * 0.7, 0);
                ctx.closePath();
                break;
            case 'hexagon':
                for (let i = 0; i < 6; i++) {
                    const a = (Math.PI / 3) * i - Math.PI / 6;
                    const method = i === 0 ? 'moveTo' : 'lineTo';
                    ctx[method](Math.cos(a) * s, Math.sin(a) * s);
                }
                ctx.closePath();
                break;
            case 'star': {
                for (let i = 0; i < 5; i++) {
                    const outerA = (Math.PI * 2 / 5) * i - Math.PI / 2;
                    const innerA = outerA + Math.PI / 5;
                    const method = i === 0 ? 'moveTo' : 'lineTo';
                    ctx[method](Math.cos(outerA) * s, Math.sin(outerA) * s);
                    ctx.lineTo(Math.cos(innerA) * s * 0.4, Math.sin(innerA) * s * 0.4);
                }
                ctx.closePath();
                break;
            }
            case 'heart': {
                const hs = s * 0.6;
                ctx.moveTo(0, hs * 0.7);
                ctx.bezierCurveTo(-hs * 1.5, -hs * 0.5, -hs * 0.5, -hs * 1.8, 0, -hs * 0.8);
                ctx.bezierCurveTo(hs * 0.5, -hs * 1.8, hs * 1.5, -hs * 0.5, 0, hs * 0.7);
                break;
            }
        }

        ctx.fill();
        ctx.restore();
    }
}

// ===== Animation Engine =====
export class AnimationEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.currentMood = 'calm';
        this.targetMood = 'calm';
        this.config = { ...MOOD_CONFIGS.calm };
        this.targetConfig = { ...MOOD_CONFIGS.calm };
        this.speedMultiplier = 1.0;
        this.arousalMod = 1.0;   // from VAD: 0.5-1.5 speed/turbulence multiplier
        this.dominanceMod = 1.0; // from VAD: 0.7-1.3 size/glow multiplier
        this.time = 0;
        this.running = false;
        this.animId = null;
        this.lastTime = 0;
        this.transitionProgress = 1;
        this.bgColor = [...MOOD_CONFIGS.calm.background];
        this.targetBgColor = [...MOOD_CONFIGS.calm.background];

        this.resize();
        this.initParticles();

        this._resizeHandler = () => this.resize();
        window.addEventListener('resize', this._resizeHandler);
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.width = rect.width;
        this.height = rect.height;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    initParticles() {
        this.particles = [];
        const count = this.config.particleCount || 100;
        for (let i = 0; i < count; i++) {
            this.particles.push(
                new Particle(
                    rand(0, this.width),
                    rand(0, this.height),
                    this.config
                )
            );
        }
    }

    // Apply VAD dimensions to animation parameters
    setVAD(vad) {
        if (!vad || vad.matchCount === 0) return;
        // Arousal: low (0) → slower/calmer, high (1) → faster/more turbulent
        this.arousalMod = 0.5 + vad.arousal * 1.0; // range 0.5 to 1.5
        // Dominance: low (0) → smaller/subtle, high (1) → larger/bolder
        this.dominanceMod = 0.7 + vad.dominance * 0.6; // range 0.7 to 1.3
    }

    setMood(mood, speedMultiplier = 1.0) {
        const newConfig = MOOD_CONFIGS[mood] || MOOD_CONFIGS.calm;

        if (mood === this.currentMood && Math.abs(speedMultiplier - this.speedMultiplier) < 0.05) {
            return;
        }

        this.targetMood = mood;
        this.targetConfig = { ...newConfig };
        this.targetBgColor = [...newConfig.background];
        this.speedMultiplier = speedMultiplier;
        this.transitionProgress = 0;

        // Adjust particle count
        const targetCount = newConfig.particleCount;
        while (this.particles.length < targetCount) {
            this.particles.push(
                new Particle(
                    rand(0, this.width),
                    rand(0, this.height),
                    newConfig
                )
            );
        }
        while (this.particles.length > targetCount) {
            this.particles.pop();
        }

        // Update particle properties gradually
        for (const p of this.particles) {
            p.color = newConfig.palette[randInt(0, newConfig.palette.length)];
            p.shape = newConfig.shapes[randInt(0, newConfig.shapes.length)];
        }
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this._animate();
    }

    stop() {
        this.running = false;
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
    }

    _animate() {
        if (!this.running) return;

        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.05); // cap delta
        this.lastTime = now;
        this.time += dt;

        this._update(dt);
        this._draw();

        this.animId = requestAnimationFrame(() => this._animate());
    }

    _update(dt) {
        // Smooth transition between moods
        if (this.transitionProgress < 1) {
            this.transitionProgress = Math.min(this.transitionProgress + dt * 0.8, 1);
            const t = this.transitionProgress;

            this.config.baseSpeed = lerp(this.config.baseSpeed, this.targetConfig.baseSpeed, t * 0.1);
            this.config.turbulence = lerp(this.config.turbulence, this.targetConfig.turbulence, t * 0.1);
            this.config.connectionDist = lerp(this.config.connectionDist, this.targetConfig.connectionDist, t * 0.1);
            this.config.trailAlpha = lerp(this.config.trailAlpha, this.targetConfig.trailAlpha, t * 0.1);
            this.config.pulseRate = lerp(this.config.pulseRate, this.targetConfig.pulseRate, t * 0.1);
            this.config.glowIntensity = lerp(this.config.glowIntensity, this.targetConfig.glowIntensity, t * 0.1);

            this.bgColor[0] = lerp(this.bgColor[0], this.targetBgColor[0], t * 0.05);
            this.bgColor[1] = lerp(this.bgColor[1], this.targetBgColor[1], t * 0.05);
            this.bgColor[2] = lerp(this.bgColor[2], this.targetBgColor[2], t * 0.05);

            if (this.transitionProgress >= 1) {
                this.currentMood = this.targetMood;
                this.config = { ...this.targetConfig };
            }
        }

        // Update active config pattern from target
        this.config.pattern = this.targetConfig.pattern;
        this.config.palette = this.targetConfig.palette;
        this.config.shapes = this.targetConfig.shapes;

        // Update particles — arousal modulates speed
        const effectiveSpeed = this.speedMultiplier * this.arousalMod;
        for (const p of this.particles) {
            p.update(dt, this.config, this.time, this.width, this.height, effectiveSpeed);
        }
    }

    _draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Trail effect - semi-transparent background
        const [br, bg, bb] = this.bgColor.map(Math.round);
        const alpha = this.config.trailAlpha || 0.05;
        ctx.fillStyle = `rgba(${br},${bg},${bb},${alpha})`;
        ctx.fillRect(0, 0, w, h);

        // Draw connections
        ctx.shadowBlur = 0;
        const connDist = this.config.connectionDist;
        if (connDist > 0) {
            for (let i = 0; i < this.particles.length; i++) {
                const a = this.particles[i];
                for (let j = i + 1; j < this.particles.length; j++) {
                    const b = this.particles[j];
                    const d = dist(a.x, a.y, b.x, b.y);
                    if (d < connDist) {
                        const opacity = (1 - d / connDist) * 0.2 * a.opacity * b.opacity;
                        ctx.strokeStyle = hexToRgba(a.color, opacity);
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Draw particles — dominance modulates glow intensity
        const effectiveGlow = this.config.glowIntensity * this.dominanceMod;
        for (const p of this.particles) {
            p.draw(ctx, effectiveGlow, this.dominanceMod);
        }
    }

    // Clear canvas completely with current background
    clear() {
        const [r, g, b] = this.bgColor.map(Math.round);
        this.ctx.fillStyle = `rgb(${r},${g},${b})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    destroy() {
        this.stop();
        window.removeEventListener('resize', this._resizeHandler);
    }
}
