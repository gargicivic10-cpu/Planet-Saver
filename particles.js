// Planet Saver - High Performance Realistic Particle & Visual Effects Engine

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];
    this.maxParticles = 650;
  }

  reset() {
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];
  }

  addParticle(p) {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }
    this.particles.push({
      x: p.x,
      y: p.y,
      vx: p.vx || 0,
      vy: p.vy || 0,
      size: p.size || 3,
      life: p.life || 1.0,
      maxLife: p.life || 1.0,
      color: p.color || '#00f0ff',
      decay: p.decay || 0.025,
      shape: p.shape || 'circle',
      angle: p.angle || 0,
      length: p.length || 6,
      glow: p.glow !== undefined ? p.glow : true
    });
  }

  // Realistic Rocket & Jet Thruster exhaust
  createThruster(x, y, angle, speed, color = '#ff8800') {
    const spread = (Math.random() - 0.5) * 0.35;
    const pAngle = angle + Math.PI + spread;
    const pSpeed = speed * 0.6 + Math.random() * 3 + 2;
    this.addParticle({
      x: x + (Math.random() - 0.5) * 4,
      y: y + (Math.random() - 0.5) * 4,
      vx: Math.cos(pAngle) * pSpeed,
      vy: Math.sin(pAngle) * pSpeed,
      size: Math.random() * 3.5 + 2,
      life: 1.0,
      decay: Math.random() * 0.06 + 0.04,
      color: Math.random() > 0.4 ? color : '#ffeeaa',
      shape: 'circle'
    });
  }

  // Reaction Control System (RCS) cold-gas maneuvering puffs
  createRcsPuff(x, y, angle) {
    for (let i = 0; i < 3; i++) {
      const pSpeed = Math.random() * 3 + 1.5;
      this.addParticle({
        x: x,
        y: y,
        vx: Math.cos(angle) * pSpeed,
        vy: Math.sin(angle) * pSpeed,
        size: Math.random() * 2.5 + 1.5,
        life: 0.5,
        decay: 0.08,
        color: 'rgba(230, 245, 255, 0.8)',
        shape: 'circle',
        glow: false
      });
    }
  }

  // Corrosive green alien acid splatter
  createAcidSplatter(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.addParticle({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.03,
        color: Math.random() > 0.5 ? '#39ff14' : '#a6ff00',
        shape: 'circle'
      });
    }
  }

  // Bioluminescent alien ichor / blood sparks
  createAlienSparks(x, y, count = 10, color = '#39ff14') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.addParticle({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2.5 + 1.5,
        life: 1.0,
        decay: Math.random() * 0.06 + 0.04,
        color: color,
        shape: 'spark',
        angle: angle,
        length: Math.random() * 8 + 4
      });
    }
  }

  // Kinetic sparks (bullets striking armor)
  createSparks(x, y, count = 8, color = '#ffcc00') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      this.addParticle({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2 + 1,
        life: 1.0,
        decay: Math.random() * 0.07 + 0.05,
        color: color,
        shape: 'spark',
        angle: angle,
        length: Math.random() * 7 + 4
      });
    }
  }

  // Fiery debris explosion
  createExplosion(x, y, scale = 1.0, colorCore = '#ffe600', colorOuter = '#ff3300') {
    const count = Math.floor(28 * scale);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 5.5 + 1.5) * scale;
      const isCore = Math.random() > 0.4;
      this.addParticle({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (Math.random() * 4 + 2) * scale,
        life: 1.0,
        decay: Math.random() * 0.035 + 0.02,
        color: isCore ? colorCore : colorOuter,
        shape: 'circle'
      });
    }

    this.shockwaves.push({
      x: x,
      y: y,
      radius: 4,
      maxRadius: 45 * scale,
      speed: 4.5 * scale,
      color: colorCore,
      alpha: 1.0
    });
  }

  // Energy shield deflection ripple
  createShieldRipple(x, y, radius, hitAngle, color = '#00f0ff') {
    this.shockwaves.push({
      x: x,
      y: y,
      radius: radius * 0.8,
      maxRadius: radius * 1.35,
      speed: 2.2,
      color: color,
      alpha: 0.9,
      isShield: true,
      hitAngle: hitAngle
    });
  }

  // Human extraction / rescue beam effect
  createRescueBeam(humanX, humanY, shipX, shipY) {
    this.shockwaves.push({
      x: humanX,
      y: humanY,
      radius: 5,
      maxRadius: 25,
      speed: 1.5,
      color: '#00f59b',
      alpha: 1.0
    });
    for (let i = 0; i < 6; i++) {
      this.addParticle({
        x: humanX + (Math.random() - 0.5) * 15,
        y: humanY,
        vx: (shipX - humanX) * 0.05 + (Math.random() - 0.5),
        vy: (shipY - humanY) * 0.05 - 1.5,
        size: Math.random() * 2.5 + 1.5,
        life: 1.0,
        decay: 0.05,
        color: '#00f59b',
        shape: 'circle'
      });
    }
  }

  addFloatingText(text, x, y, color = '#00ff88', size = 15) {
    this.floatingTexts.push({
      text: text,
      x: x,
      y: y,
      vy: -1.2,
      life: 1.0,
      decay: 0.02,
      color: color,
      size: size
    });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.radius += s.speed;
      s.alpha = 1 - (s.radius / s.maxRadius);
      if (s.radius >= s.maxRadius || s.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy;
      t.life -= t.decay;
      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw(ctx, camera) {
    ctx.save();

    for (let p of this.particles) {
      const screenX = p.x - camera.x;
      const screenY = p.y - camera.y;
      const alpha = Math.max(0, p.life);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      if (p.glow) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
      } else {
        ctx.shadowBlur = 0;
      }

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'spark') {
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(
          screenX - Math.cos(p.angle) * p.length * alpha,
          screenY - Math.sin(p.angle) * p.length * alpha
        );
        ctx.stroke();
      }
    }

    for (let s of this.shockwaves) {
      const screenX = s.x - camera.x;
      const screenY = s.y - camera.y;
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.strokeStyle = s.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = s.color;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      if (s.isShield && s.hitAngle !== undefined) {
        ctx.arc(screenX, screenY, s.radius, s.hitAngle - Math.PI / 3, s.hitAngle + Math.PI / 3);
      } else {
        ctx.arc(screenX, screenY, s.radius, 0, Math.PI * 2);
      }
      ctx.stroke();
    }

    ctx.font = '700 14px "Rajdhani", sans-serif';
    ctx.textAlign = 'center';
    for (let t of this.floatingTexts) {
      const screenX = t.x - camera.x;
      const screenY = t.y - camera.y;
      ctx.globalAlpha = Math.max(0, t.life);
      ctx.fillStyle = t.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = t.color;
      ctx.fillText(t.text, screenX, screenY);
    }

    ctx.restore();
  }
}

window.particleSystem = new ParticleSystem();
