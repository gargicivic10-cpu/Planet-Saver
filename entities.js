// Planet Saver - Realistic Game Entities (Humans, Alien Bio-forms, Ships, Weapons)

// ==========================================
// HUMAN COLONIST CLASS (THE LIVES WE MUST SAVE)
// ==========================================
class HumanColonist {
  constructor(x, y, role = 'Scientist') {
    this.x = x;
    this.y = y;
    this.initialY = y;
    this.role = role; // 'Scientist', 'Engineer', 'Medic'
    this.state = 'GROUND'; // 'GROUND', 'ABDUCTING', 'RESCUED', 'DEAD'
    this.abductor = null;
    this.patrolDir = Math.random() > 0.5 ? 1 : -1;
    this.patrolTimer = Math.random() * 3;
    this.walkAnim = 0;
    this.radius = 8;
    this.abductionProgress = 0; // 0 to 1
  }

  update(dt, player) {
    if (this.state === 'RESCUED' || this.state === 'DEAD') return false;

    this.walkAnim += dt * 6;

    if (this.state === 'GROUND') {
      // Gentle patrol around colony dome
      this.patrolTimer -= dt;
      if (this.patrolTimer <= 0) {
        this.patrolTimer = Math.random() * 4 + 2;
        this.patrolDir *= -1;
      }
      this.x += this.patrolDir * 12 * dt;

      // Check proximity to player dropship for rescue
      const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
      if (distToPlayer < 75) {
        this.rescue(player);
        return false;
      }
    } else if (this.state === 'ABDUCTING') {
      // If abductor alien died, fall back to ground
      if (!this.abductor || this.abductor.dead) {
        this.state = 'GROUND';
        this.abductor = null;
        this.abductionProgress = 0;
      } else {
        // Lifted into the air by alien tractor beam
        this.x = this.abductor.x;
        this.abductionProgress += dt * 0.45; // ~2.2 seconds to abduct
        this.y = this.initialY - (this.initialY - this.abductor.y) * this.abductionProgress;

        // Player can intercept and rescue the abducted colonist
        const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
        if (distToPlayer < 85) {
          this.rescue(player);
          return false;
        }

        // Alien successfully abducted human!
        if (this.abductionProgress >= 1.0) {
          this.state = 'DEAD';
          if (window.soundEngine) window.soundEngine.playHumanDistress();
          if (window.particleSystem) {
            window.particleSystem.addFloatingText('HUMAN ABDUCTED!', this.x, this.y - 20, '#ff0055', 16);
          }
          return false;
        }
      }
    }

    return true;
  }

  rescue(player) {
    this.state = 'RESCUED';
    if (this.abductor) {
      this.abductor.targetHuman = null;
      this.abductor = null;
    }
    if (window.soundEngine) window.soundEngine.playHumanRescued();
    if (window.particleSystem) {
      window.particleSystem.createRescueBeam(this.x, this.y, player.x, player.y);
      window.particleSystem.addFloatingText(`+HUMAN ${this.role.toUpperCase()} SAVED!`, this.x, this.y - 25, '#00ff88', 16);
    }
    window.upgradeManager.recordHumanSaved();
  }

  draw(ctx, camera) {
    if (this.state === 'RESCUED' || this.state === 'DEAD') return;

    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    ctx.save();
    ctx.translate(sx, sy);

    // If abducting, draw tractor beam from abductor
    if (this.state === 'ABDUCTING' && this.abductor) {
      const abductorSx = this.abductor.x - camera.x;
      const abductorSy = this.abductor.y - camera.y;
      ctx.restore();
      ctx.save();

      const beamGrad = ctx.createLinearGradient(abductorSx, abductorSy, sx, sy);
      beamGrad.addColorStop(0, 'rgba(57, 255, 20, 0.6)');
      beamGrad.addColorStop(1, 'rgba(57, 255, 20, 0.15)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(abductorSx - 15, abductorSy + 10);
      ctx.lineTo(abductorSx + 15, abductorSy + 10);
      ctx.lineTo(sx + 20, sy);
      ctx.lineTo(sx - 20, sy);
      ctx.closePath();
      ctx.fill();

      ctx.translate(sx, sy);
    }

    // Realistic Astronaut EVA Suit
    // Life support backpack
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-6, -14, 12, 10);

    // White pressurized suit body
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-4, -12, 8, 12, 3);
    ctx.fill();

    // Helmet with Golden Reflective Visor
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, -14, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd166'; // Gold visor
    ctx.beginPath();
    ctx.ellipse(this.patrolDir * 1.5, -14, 3, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs animation
    const legOffset = Math.sin(this.walkAnim) * 2;
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(-2, 6 + legOffset);
    ctx.moveTo(2, 0);
    ctx.lineTo(2, 6 - legOffset);
    ctx.stroke();

    // Role badge
    ctx.font = '700 9px "Rajdhani", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.role === 'Medic' ? '#06d6a0' : (this.role === 'Engineer' ? '#ffd166' : '#00f0ff');
    ctx.fillText(this.role.toUpperCase(), 0, -22);

    ctx.restore();
  }
}

// ==========================================
// PROJECTILE CLASS (KINETIC ROUNDS & ACID)
// ==========================================
class Projectile {
  constructor(x, y, vx, vy, damage, isPlayer = true, type = 'kinetic', target = null) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.isPlayer = isPlayer;
    this.type = type; // 'kinetic', 'torpedo', 'acid', 'bio_plasma'
    this.target = target;
    this.life = type === 'torpedo' ? 3.5 : (type === 'acid' ? 2.2 : 1.6);
    this.radius = type === 'torpedo' ? 6 : (type === 'acid' ? 7 : 3);
    this.color = isPlayer ? (type === 'torpedo' ? '#ff9e00' : '#e2e8f0') : '#39ff14';
  }

  update(dt, enemies) {
    this.life -= dt;

    if (this.type === 'torpedo') {
      if (!this.target || this.target.dead) {
        let minDist = 750;
        let closest = null;
        for (let e of enemies) {
          const d = Math.hypot(e.x - this.x, e.y - this.y);
          if (d < minDist) {
            minDist = d;
            closest = e;
          }
        }
        this.target = closest;
      }

      if (this.target) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const desiredAngle = Math.atan2(dy, dx);
        const currentAngle = Math.atan2(this.vy, this.vx);
        let diff = desiredAngle - currentAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        const turnSpeed = 4.8 * dt;
        const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed);
        const speed = Math.hypot(this.vx, this.vy) * 1.01;
        this.vx = Math.cos(newAngle) * Math.min(speed, 12);
        this.vy = Math.sin(newAngle) * Math.min(speed, 12);
      }

      if (window.particleSystem && Math.random() > 0.3) {
        window.particleSystem.addParticle({
          x: this.x,
          y: this.y,
          vx: -this.vx * 0.2 + (Math.random() - 0.5),
          vy: -this.vy * 0.2 + (Math.random() - 0.5),
          size: Math.random() * 3 + 2,
          life: 0.5,
          decay: 0.05,
          color: '#ff8800',
          shape: 'circle'
        });
      }
    } else if (this.type === 'acid') {
      // Alien Acid Sizzle Trail
      if (window.particleSystem && Math.random() > 0.4) {
        window.particleSystem.addParticle({
          x: this.x + (Math.random() - 0.5) * 6,
          y: this.y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: Math.random() * 2.5 + 1.5,
          life: 0.4,
          decay: 0.06,
          color: '#39ff14',
          shape: 'circle'
        });
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    return this.life > 0;
  }

  draw(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;

    if (this.type === 'kinetic') {
      // High-velocity tungsten penetrator tracer
      const angle = Math.atan2(this.vy, this.vx);
      ctx.translate(sx, sy);
      ctx.rotate(angle);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-12, -1.5, 24, 3);
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(-12, -2.5, 6, 5);
    } else if (this.type === 'torpedo') {
      const angle = Math.atan2(this.vy, this.vx);
      ctx.translate(sx, sy);
      ctx.rotate(angle);
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff8800';
      ctx.fillRect(-9, -2.5, 6, 5);
    } else if (this.type === 'acid') {
      // Corrosive glowing green bio-glob
      ctx.fillStyle = '#39ff14';
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a6ff00';
      ctx.beginPath();
      ctx.arc(sx - 1, sy - 1, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// ==========================================
// PICKUP ITEM CLASS (SCRAP / BIO-CORES)
// ==========================================
class Pickup {
  constructor(x, y, type = 'scrap', value = 25) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.type = type;
    this.value = value;
    this.life = 18.0;
    this.radius = 12;
    this.angle = 0;
    this.pulse = 0;
  }

  update(dt, player) {
    this.life -= dt;
    this.angle += 2 * dt;
    this.pulse += 4 * dt;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 230) {
      const pull = (230 - dist) / 230 * 9;
      this.vx += (dx / dist) * pull * dt * 6;
      this.vy += (dy / dist) * pull * dt * 6;
    }

    this.vx *= 0.96;
    this.vy *= 0.96;
    this.x += this.vx;
    this.y += this.vy;

    return this.life > 0;
  }

  draw(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;
    const pScale = 1 + Math.sin(this.pulse) * 0.15;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(pScale, pScale);

    if (this.type === 'scrap') {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffd166';
      ctx.fillStyle = '#ffd166';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.rotate(this.angle);
      ctx.fillRect(-6, -6, 12, 12);
      ctx.strokeRect(-6, -6, 12, 12);
    } else if (this.type === 'shield') {
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00f0ff';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (this.type === 'repair') {
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#06d6a0';
      ctx.fillStyle = '#06d6a0';
      ctx.fillRect(-2, -7, 4, 14);
      ctx.fillRect(-7, -2, 14, 4);
    }
    ctx.restore();
  }
}

// ==========================================
// COLONY CLASS (HUMAN HABITAT & GENERATOR)
// ==========================================
class Colony {
  constructor(x, y, maxHealth = 1000, name = 'Colony Bio-Dome') {
    this.x = x;
    this.y = y;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.shield = maxHealth * 0.35;
    this.maxShield = maxHealth * 0.35;
    this.shieldRechargeTimer = 0;
    this.radius = 80;
    this.name = name;
    this.warningTimer = 0;
  }

  takeDamage(amount) {
    this.shieldRechargeTimer = 4.0;
    if (this.shield > 0) {
      if (this.shield >= amount) {
        this.shield -= amount;
        amount = 0;
      } else {
        amount -= this.shield;
        this.shield = 0;
      }
      if (window.soundEngine) window.soundEngine.playShieldHit();
    }

    if (amount > 0) {
      this.health = Math.max(0, this.health - amount);
      if (window.particleSystem) {
        window.particleSystem.createExplosion(
          this.x + (Math.random() - 0.5) * 60,
          this.y + (Math.random() - 0.5) * 40,
          0.85
        );
      }
      if (this.health < this.maxHealth * 0.35 && this.warningTimer <= 0) {
        if (window.soundEngine) window.soundEngine.playWarning();
        this.warningTimer = 5.0;
      }
    }
  }

  update(dt) {
    if (this.warningTimer > 0) this.warningTimer -= dt;
    if (this.shieldRechargeTimer > 0) {
      this.shieldRechargeTimer -= dt;
    } else if (this.shield < this.maxShield) {
      this.shield = Math.min(this.maxShield, this.shield + 16 * dt);
    }
  }

  draw(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    ctx.save();
    ctx.translate(sx, sy);

    // Realistic Planetary Surface Landing Pad / Foundation
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.fillRect(-this.radius - 20, 20, (this.radius + 20) * 2, 18);
    ctx.strokeRect(-this.radius - 20, 20, (this.radius + 20) * 2, 18);

    // Geodesic Pressurized Glass Bio-Dome
    const domeGrad = ctx.createRadialGradient(0, 0, 10, 0, 10, this.radius * 0.75);
    domeGrad.addColorStop(0, 'rgba(0, 220, 180, 0.5)');
    domeGrad.addColorStop(0.8, 'rgba(10, 80, 140, 0.3)');
    domeGrad.addColorStop(1, 'rgba(2, 20, 50, 0.7)');
    ctx.fillStyle = domeGrad;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(0, 20, this.radius * 0.7, Math.PI, 0, false);
    ctx.fill();
    ctx.stroke();

    // Human Research Complex Interior (Lights, Antennas)
    ctx.fillStyle = '#ffea75';
    for (let i = -3; i <= 3; i++) {
      ctx.fillRect(i * 12 - 2, 12, 4, 3);
      ctx.fillRect(i * 10 - 2, -6 + Math.abs(i) * 4, 3, 3);
    }

    // Communication Tower Mast
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -this.radius * 0.7 + 20);
    ctx.lineTo(0, -this.radius * 0.7 - 12);
    ctx.stroke();

    // Red beacon blinking on top of antenna
    if (Math.sin(Date.now() * 0.006) > 0) {
      ctx.fillStyle = '#ff0055';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ff0055';
      ctx.beginPath();
      ctx.arc(0, -this.radius * 0.7 - 12, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shield Dome if active
    if (this.shield > 0) {
      const shieldAlpha = Math.min(0.4, (this.shield / this.maxShield) * 0.4);
      ctx.strokeStyle = `rgba(0, 240, 255, ${shieldAlpha + 0.25})`;
      ctx.fillStyle = `rgba(0, 240, 255, ${shieldAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 20, this.radius * 1.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();
    }

    // Health Bar & Name
    const barW = 140;
    const barH = 6;
    const bx = -barW / 2;
    const by = -this.radius - 30;

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(bx, by, barW, barH * 2 + 3);

    ctx.fillStyle = this.health > this.maxHealth * 0.3 ? '#00f59b' : '#ff0055';
    ctx.fillRect(bx, by, barW * (this.health / this.maxHealth), barH);

    if (this.shield > 0) {
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(bx, by + barH + 2, barW * (this.shield / this.maxShield), barH);
    }

    ctx.font = '700 12px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#00f0ff';
    ctx.fillText(this.name.toUpperCase(), 0, by - 8);

    ctx.restore();
  }
}

// ==========================================
// REALISTIC HUMAN VANGUARD STRIKE VESSEL
// ==========================================
class PlayerShip {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.angle = -Math.PI / 2;
    this.targetAngle = -Math.PI / 2;
    this.radius = 20;

    this.maxHealth = 100;
    this.health = 100;
    this.maxShield = 80;
    this.shield = 80;
    this.shieldRechargeRate = 8;
    this.shieldRechargeTimer = 0;

    this.blasterStats = { damage: 22, fireRate: 0.18, barrels: 1 };
    this.missileStats = { unlocked: false, maxAmmo: 0, damage: 60 };
    this.missileAmmo = 0;
    this.droneStats = { unlocked: false, count: 0, fireRate: 0.45 };
    this.empStats = { unlocked: false, cooldown: 15, radius: 250 };
    this.empTimer = 0;
    this.thrusterStats = { maxSpeed: 6.2, accel: 0.34, turnSpeed: 0.085 };

    this.fireTimer = 0;
    this.missileTimer = 0;
    this.hitFlash = 0;
    this.drones = [];

    // Realistic RCS nozzle puffs
    this.rcsTimer = 0;
  }

  syncUpgrades() {
    const um = window.upgradeManager;
    if (!um) return;

    this.maxHealth = um.upgrades.hull.getValue(um.upgrades.hull.level);
    this.health = this.maxHealth;

    const sVal = um.upgrades.shield.getValue(um.upgrades.shield.level);
    this.maxShield = sVal.maxShield;
    this.shield = this.maxShield;
    this.shieldRechargeRate = sVal.rechargeRate;

    this.blasterStats = um.upgrades.blaster.getValue(um.upgrades.blaster.level);
    this.missileStats = um.upgrades.missiles.getValue(um.upgrades.missiles.level);
    this.missileAmmo = this.missileStats.maxAmmo;

    this.droneStats = um.upgrades.drone.getValue(um.upgrades.drone.level);
    this.empStats = um.upgrades.emp.getValue(um.upgrades.emp.level);
    this.thrusterStats = um.upgrades.thrusters.getValue(um.upgrades.thrusters.level);

    this.drones = [];
    if (this.droneStats.unlocked) {
      for (let i = 0; i < this.droneStats.count; i++) {
        this.drones.push({
          orbitAngle: (i * (Math.PI * 2)) / this.droneStats.count,
          orbitDist: 58,
          fireCooldown: 0
        });
      }
    }
  }

  takeDamage(amount, hitAngle = 0) {
    this.shieldRechargeTimer = 3.2;
    this.hitFlash = 0.15;

    if (this.shield > 0) {
      if (this.shield >= amount) {
        this.shield -= amount;
        amount = 0;
      } else {
        amount -= this.shield;
        this.shield = 0;
      }
      if (window.soundEngine) window.soundEngine.playShieldHit();
      if (window.particleSystem) {
        window.particleSystem.createShieldRipple(this.x, this.y, this.radius + 8, hitAngle, '#00f0ff');
      }
    }

    if (amount > 0) {
      this.health = Math.max(0, this.health - amount);
      if (window.soundEngine) window.soundEngine.playExplosion(0.5);
      if (window.particleSystem) {
        window.particleSystem.createSparks(this.x, this.y, 10, '#ffcc00');
      }
    }
  }

  fireBlaster(projectiles) {
    if (this.fireTimer > 0) return;
    this.fireTimer = this.blasterStats.fireRate;

    const speed = 14;
    const barrels = this.blasterStats.barrels;

    if (barrels === 1) {
      const vx = Math.cos(this.angle) * speed;
      const vy = Math.sin(this.angle) * speed;
      projectiles.push(new Projectile(this.x, this.y, vx, vy, this.blasterStats.damage, true, 'kinetic'));
    } else if (barrels === 2) {
      const spreadDist = 9;
      const p1x = this.x + Math.cos(this.angle + Math.PI / 2) * spreadDist;
      const p1y = this.y + Math.sin(this.angle + Math.PI / 2) * spreadDist;
      const p2x = this.x + Math.cos(this.angle - Math.PI / 2) * spreadDist;
      const p2y = this.y + Math.sin(this.angle - Math.PI / 2) * spreadDist;
      const vx = Math.cos(this.angle) * speed;
      const vy = Math.sin(this.angle) * speed;
      projectiles.push(new Projectile(p1x, p1y, vx, vy, this.blasterStats.damage, true, 'kinetic'));
      projectiles.push(new Projectile(p2x, p2y, vx, vy, this.blasterStats.damage, true, 'kinetic'));
    } else {
      const spreadAngles = [-0.07, 0, 0.07];
      for (let offset of spreadAngles) {
        const a = this.angle + offset;
        const vx = Math.cos(a) * speed;
        const vy = Math.sin(a) * speed;
        projectiles.push(new Projectile(this.x, this.y, vx, vy, this.blasterStats.damage, true, 'kinetic'));
      }
    }

    if (window.soundEngine) window.soundEngine.playLaser(true);
  }

  fireMissile(projectiles, enemies) {
    if (!this.missileStats.unlocked || this.missileAmmo <= 0 || this.missileTimer > 0) return;
    this.missileTimer = 0.5;
    this.missileAmmo--;

    const speed = 6;
    const vx = Math.cos(this.angle) * speed;
    const vy = Math.sin(this.angle) * speed;

    projectiles.push(new Projectile(this.x, this.y, vx, vy, this.missileStats.damage, true, 'torpedo', null));
    if (window.soundEngine) window.soundEngine.playMissile();
  }

  triggerEmp(enemies, projectiles) {
    if (!this.empStats.unlocked || this.empTimer > 0) return;
    this.empTimer = this.empStats.cooldown;

    if (window.soundEngine) window.soundEngine.playEmp();
    if (window.particleSystem) {
      window.particleSystem.shockwaves.push({
        x: this.x,
        y: this.y,
        radius: 10,
        maxRadius: this.empStats.radius,
        speed: 8,
        color: '#00f0ff',
        alpha: 1.0
      });
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      if (!p.isPlayer) {
        if (Math.hypot(p.x - this.x, p.y - this.y) < this.empStats.radius) {
          projectiles.splice(i, 1);
        }
      }
    }

    for (let e of enemies) {
      if (Math.hypot(e.x - this.x, e.y - this.y) < this.empStats.radius) {
        e.stunTimer = 2.5;
        e.takeDamage(45);
      }
    }
  }

  update(dt, input, projectiles, enemies) {
    if (this.fireTimer > 0) this.fireTimer -= dt;
    if (this.missileTimer > 0) this.missileTimer -= dt;
    if (this.empTimer > 0) this.empTimer -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;

    if (this.shieldRechargeTimer > 0) {
      this.shieldRechargeTimer -= dt;
    } else if (this.shield < this.maxShield) {
      this.shield = Math.min(this.maxShield, this.shield + this.shieldRechargeRate * dt);
    }

    let moveX = 0;
    let moveY = 0;
    if (input.up) moveY -= 1;
    if (input.down) moveY += 1;
    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;

    const len = Math.hypot(moveX, moveY);
    if (len > 0) {
      moveX /= len;
      moveY /= len;
      this.vx += moveX * this.thrusterStats.accel;
      this.vy += moveY * this.thrusterStats.accel;

      if (window.particleSystem) {
        // Dual engine exhaust plume
        const engineDist = 7;
        const e1x = this.x + Math.cos(this.angle + Math.PI / 2) * engineDist;
        const e1y = this.y + Math.sin(this.angle + Math.PI / 2) * engineDist;
        const e2x = this.x + Math.cos(this.angle - Math.PI / 2) * engineDist;
        const e2y = this.y + Math.sin(this.angle - Math.PI / 2) * engineDist;

        window.particleSystem.createThruster(e1x, e1y, this.angle, Math.hypot(this.vx, this.vy), '#ff8800');
        window.particleSystem.createThruster(e2x, e2y, this.angle, Math.hypot(this.vx, this.vy), '#ff8800');
      }
    }

    const currentSpeed = Math.hypot(this.vx, this.vy);
    if (currentSpeed > this.thrusterStats.maxSpeed) {
      this.vx = (this.vx / currentSpeed) * this.thrusterStats.maxSpeed;
      this.vy = (this.vy / currentSpeed) * this.thrusterStats.maxSpeed;
    }
    this.vx *= 0.94;
    this.vy *= 0.94;

    this.x += this.vx;
    this.y += this.vy;

    // Rotation & Realistic RCS Cold Gas Thruster Bursts
    if (input.mouseAim) {
      this.targetAngle = Math.atan2(input.mouseAimY - this.y, input.mouseAimX - this.x);
    } else if (len > 0) {
      this.targetAngle = Math.atan2(moveY, moveX);
    }

    let diff = this.targetAngle - this.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    if (Math.abs(diff) > 0.08) {
      this.rcsTimer += dt;
      if (this.rcsTimer > 0.06 && window.particleSystem) {
        this.rcsTimer = 0;
        const rcsDir = Math.sign(diff);
        const rcsAngle = this.angle + (rcsDir > 0 ? -Math.PI / 2 : Math.PI / 2);
        window.particleSystem.createRcsPuff(
          this.x + Math.cos(this.angle) * 15,
          this.y + Math.sin(this.angle) * 15,
          rcsAngle
        );
      }
    }

    this.angle += diff * Math.min(1.0, this.thrusterStats.turnSpeed * 60 * dt);

    // Escort Drones
    if (this.drones.length > 0) {
      for (let drone of this.drones) {
        drone.orbitAngle += 2.0 * dt;
        const dx = this.x + Math.cos(drone.orbitAngle) * drone.orbitDist;
        const dy = this.y + Math.sin(drone.orbitAngle) * drone.orbitDist;

        drone.fireCooldown -= dt;
        if (drone.fireCooldown <= 0 && enemies.length > 0) {
          let closest = null;
          let minDist = 380;
          for (let e of enemies) {
            const d = Math.hypot(e.x - dx, e.y - dy);
            if (d < minDist) {
              minDist = d;
              closest = e;
            }
          }

          if (closest) {
            drone.fireCooldown = this.droneStats.fireRate;
            const a = Math.atan2(closest.y - dy, closest.x - dx);
            projectiles.push(new Projectile(dx, dy, Math.cos(a) * 13, Math.sin(a) * 13, 14, true, 'kinetic'));
            if (window.soundEngine) window.soundEngine.playLaser(true);
          }
        }
      }
    }
  }

  draw(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    ctx.save();
    ctx.translate(sx, sy);

    // Shield Bubble
    if (this.shield > 0) {
      const shieldRatio = this.shield / this.maxShield;
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.25 + shieldRatio * 0.45})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.rotate(this.angle);

    // Realistic Aerospace Fighter Geometry
    ctx.shadowBlur = this.hitFlash > 0 ? 15 : 6;
    ctx.shadowColor = this.hitFlash > 0 ? '#ff0055' : 'rgba(0,0,0,0.5)';

    // Titanium / Carbon-Composite Fuselage
    ctx.fillStyle = this.hitFlash > 0 ? '#ff4d6d' : '#273444';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(24, 0);       // Nose radome
    ctx.lineTo(-12, -18);    // Left delta wing
    ctx.lineTo(-8, -8);      // Left engine nacelle
    ctx.lineTo(-14, -5);     // Left exhaust
    ctx.lineTo(-14, 5);      // Right exhaust
    ctx.lineTo(-8, 8);       // Right engine nacelle
    ctx.lineTo(-12, 18);     // Right delta wing
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Heat Shield Underbelly Tile Lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-8, -10);
    ctx.moveTo(14, 0);
    ctx.lineTo(-8, 10);
    ctx.stroke();

    // Human Cockpit Canopy Glass & Pilot Helmet Silhouette
    ctx.fillStyle = 'rgba(255, 209, 102, 0.85)'; // Golden radiation-reflective glass
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffd166';
    ctx.beginPath();
    ctx.ellipse(3, 0, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pilot helmet inside cockpit
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(2, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Aerospace Wingtip Navigation Strobe Lights
    ctx.fillStyle = '#ff0055'; // Port (Red)
    ctx.fillRect(-12, -18, 3, 3);
    ctx.fillStyle = '#00ff88'; // Starboard (Green)
    ctx.fillRect(-12, 16, 3, 3);

    ctx.restore();

    // Escort Drones
    if (this.drones.length > 0) {
      for (let drone of this.drones) {
        const dsx = (this.x + Math.cos(drone.orbitAngle) * drone.orbitDist) - camera.x;
        const dsy = (this.y + Math.sin(drone.orbitAngle) * drone.orbitDist) - camera.y;

        ctx.save();
        ctx.translate(dsx, dsy);
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

// ==========================================
// ALIEN INVADERS & BIO-ARCHETYPES
// ==========================================
class Enemy {
  constructor(x, y, type = 'scout', level = 1) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.type = type; // 'scout' (drone), 'harvester' (abductor), 'gunship' (spitter), 'boss' (hive mother)
    this.level = level;
    this.stunTimer = 0;
    this.hitFlash = 0;
    this.dead = false;

    this.wingAnim = 0;
    this.targetHuman = null;

    if (type === 'scout') {
      // Xenophage Bio-Drone
      this.maxHealth = 38 * (1 + (level - 1) * 0.25);
      this.speed = 3.8;
      this.radius = 15;
      this.color = '#39ff14';
      this.fireCooldown = 1.5;
      this.damage = 12;
      this.scoreVal = 50;
      this.scrapVal = 15;
    } else if (type === 'harvester') {
      // Alien Abductor Harvester
      this.maxHealth = 75 * (1 + (level - 1) * 0.28);
      this.speed = 2.4;
      this.radius = 22;
      this.color = '#9d00ff';
      this.fireCooldown = 2.0;
      this.damage = 15;
      this.scoreVal = 95;
      this.scrapVal = 30;
      this.abductionCooldown = 1.0;
    } else if (type === 'gunship') {
      // Xeno-Spitter Bio-Artillery
      this.maxHealth = 150 * (1 + (level - 1) * 0.32);
      this.speed = 2.0;
      this.radius = 26;
      this.color = '#ffaa00';
      this.fireCooldown = 2.2;
      this.damage = 25;
      this.scoreVal = 150;
      this.scrapVal = 45;
    } else if (type === 'boss') {
      // Colossal Alien Hive Mother
      this.maxHealth = 950 * (1 + (level - 1) * 0.45);
      this.speed = 1.4;
      this.radius = 52;
      this.color = '#39ff14';
      this.fireCooldown = 0.8;
      this.damage = 32;
      this.scoreVal = 900;
      this.scrapVal = 220;
      this.specialAttackTimer = 4.0;
    }

    this.health = this.maxHealth;
    this.shootTimer = Math.random() * this.fireCooldown;
  }

  takeDamage(amount) {
    this.health -= amount;
    this.hitFlash = 0.12;

    if (window.particleSystem) {
      window.particleSystem.createAlienSparks(this.x, this.y, 6, this.color);
    }

    if (this.health <= 0) {
      this.dead = true;
      if (this.targetHuman) {
        this.targetHuman.abductor = null;
        this.targetHuman.state = 'GROUND';
      }
    }
  }

  update(dt, player, colony, projectiles, enemies, humans = []) {
    this.wingAnim += dt * 8;
    if (this.hitFlash > 0) this.hitFlash -= dt;

    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      return;
    }

    // Alien Harvester Logic: Seek and Abduct Human Colonists!
    if (this.type === 'harvester') {
      if (!this.targetHuman || this.targetHuman.state !== 'GROUND') {
        let nearestHuman = null;
        let minDist = 1000;
        for (let h of humans) {
          if (h.state === 'GROUND') {
            const d = Math.hypot(h.x - this.x, h.y - this.y);
            if (d < minDist) {
              minDist = d;
              nearestHuman = h;
            }
          }
        }
        this.targetHuman = nearestHuman;
      }

      if (this.targetHuman) {
        const hdx = this.targetHuman.x - this.x;
        const hdy = (this.targetHuman.y - 120) - this.y; // Hover above human
        const hDist = Math.hypot(hdx, hdy);

        this.vx += (hdx / (hDist || 1)) * this.speed * dt * 3.5;
        this.vy += (hdy / (hDist || 1)) * this.speed * dt * 3.5;

        // In abduction position
        if (hDist < 45 && this.targetHuman.state === 'GROUND') {
          this.targetHuman.state = 'ABDUCTING';
          this.targetHuman.abductor = this;
          if (window.soundEngine) window.soundEngine.playHumanDistress();
        }
      }
    }

    // Target Selection: Player or Colony
    let targetX = player.x;
    let targetY = player.y;
    if (this.type === 'gunship' && colony && colony.health > 0) {
      targetX = colony.x;
      targetY = colony.y;
    }

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);
    this.angle = Math.atan2(dy, dx);

    if (this.type === 'scout') {
      const idealDist = 180;
      if (dist > idealDist) {
        this.vx += (dx / dist) * this.speed * dt * 4;
        this.vy += (dy / dist) * this.speed * dt * 4;
      } else {
        this.vx += Math.cos(this.angle + Math.PI / 2.2) * this.speed * dt * 4;
        this.vy += Math.sin(this.angle + Math.PI / 2.2) * this.speed * dt * 4;
      }
    } else if (this.type === 'gunship') {
      if (dist > 300) {
        this.vx += (dx / dist) * this.speed * dt * 2.5;
        this.vy += (dy / dist) * this.speed * dt * 2.5;
      }
    } else if (this.type === 'boss') {
      if (dist > 320) {
        this.vx += (dx / dist) * this.speed * dt * 2;
        this.vy += (dy / dist) * this.speed * dt * 2;
      } else {
        this.vx += Math.cos(this.angle + Math.PI / 2) * this.speed * dt * 2;
        this.vy += Math.sin(this.angle + Math.PI / 2) * this.speed * dt * 2;
      }

      this.specialAttackTimer -= dt;
      if (this.specialAttackTimer <= 0) {
        this.specialAttackTimer = 4.0;
        // Radial Bio-Acid Barrage
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI * 2) / 8;
          projectiles.push(new Projectile(this.x, this.y, Math.cos(a) * 6, Math.sin(a) * 6, 22, false, 'acid'));
        }
        if (window.soundEngine) {
          window.soundEngine.playAlienScreech();
          window.soundEngine.playAcidSpit();
        }
      }
    }

    const currentSpeed = Math.hypot(this.vx, this.vy);
    if (currentSpeed > this.speed) {
      this.vx = (this.vx / currentSpeed) * this.speed;
      this.vy = (this.vy / currentSpeed) * this.speed;
    }
    this.vx *= 0.95;
    this.vy *= 0.95;

    this.x += this.vx;
    this.y += this.vy;

    // Firing Weapons
    this.shootTimer -= dt;
    if (this.shootTimer <= 0 && dist < 650) {
      this.shootTimer = this.fireCooldown;
      const bSpeed = 7.5;
      const pvx = Math.cos(this.angle) * bSpeed;
      const pvy = Math.sin(this.angle) * bSpeed;

      const pType = this.type === 'gunship' ? 'acid' : 'acid';
      projectiles.push(new Projectile(this.x, this.y, pvx, pvy, this.damage, false, pType));
      if (window.soundEngine) window.soundEngine.playAcidSpit();
    }
  }

  draw(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.angle);

    ctx.shadowBlur = 10;
    ctx.shadowColor = this.hitFlash > 0 ? '#ffffff' : this.color;
    ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#0a1a08';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;

    if (this.type === 'scout') {
      // Insectoid Bio-Drone (Flapping wings & mandibles)
      const wingFlap = Math.sin(this.wingAnim) * 8;

      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Translucent Chitin Wings
      ctx.fillStyle = 'rgba(57, 255, 20, 0.35)';
      ctx.beginPath();
      ctx.ellipse(-2, -12 + wingFlap, 10, 4, -0.4, 0, Math.PI * 2);
      ctx.ellipse(-2, 12 - wingFlap, 10, 4, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glowing alien eyes
      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.arc(8, -3, 2, 0, Math.PI * 2);
      ctx.arc(8, 3, 2, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'harvester') {
      // Cephalopod / Bio-Saucer Abductor
      ctx.fillStyle = '#140520';
      ctx.strokeStyle = '#bc13fe';
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pulsating central bio-eye / abduction emitter
      ctx.fillStyle = '#39ff14';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#39ff14';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Organic Tendrils
      ctx.strokeStyle = '#bc13fe';
      ctx.lineWidth = 1.5;
      for (let t = -2; t <= 2; t++) {
        const tWave = Math.sin(this.wingAnim + t) * 4;
        ctx.beginPath();
        ctx.moveTo(-10, t * 5);
        ctx.quadraticCurveTo(-18, t * 6 + tWave, -26, t * 7);
        ctx.stroke();
      }

    } else if (this.type === 'gunship') {
      // Armored Xeno-Spitter Cruiser
      ctx.fillStyle = '#1c1003';
      ctx.strokeStyle = '#ffaa00';
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(8, -18);
      ctx.lineTo(-18, -14);
      ctx.lineTo(-24, 0);
      ctx.lineTo(-18, 14);
      ctx.lineTo(8, 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Corrosive acid sac
      ctx.fillStyle = '#39ff14';
      ctx.beginPath();
      ctx.ellipse(-4, 0, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();

    } else if (this.type === 'boss') {
      // Colossal Alien Hive Mother
      ctx.fillStyle = '#081a06';
      ctx.strokeStyle = '#39ff14';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(48, 0);
      ctx.lineTo(20, -42);
      ctx.lineTo(-28, -36);
      ctx.lineTo(-46, -16);
      ctx.lineTo(-38, 0);
      ctx.lineTo(-46, 16);
      ctx.lineTo(-28, 36);
      ctx.lineTo(20, 42);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Bioluminescent Egg Core Sac
      ctx.fillStyle = '#39ff14';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#39ff14';
      ctx.beginPath();
      ctx.ellipse(-6, 0, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Menacing Bio-Mandibles
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(35, -12);
      ctx.lineTo(52, -4);
      ctx.moveTo(35, 12);
      ctx.lineTo(52, 4);
      ctx.stroke();
    }

    ctx.restore();

    // Health Bar
    if (this.health < this.maxHealth || this.type === 'boss') {
      const barW = this.type === 'boss' ? 80 : 34;
      const barH = 4;
      const bx = sx - barW / 2;
      const by = sy - this.radius - 12;

      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = this.color;
      ctx.fillRect(bx, by, barW * (this.health / this.maxHealth), barH);
      ctx.restore();
    }
  }
}

window.HumanColonist = HumanColonist;
window.Projectile = Projectile;
window.Pickup = Pickup;
window.Colony = Colony;
window.PlayerShip = PlayerShip;
window.Enemy = Enemy;
