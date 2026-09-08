// Planet Saver - Master Realistic Game Orchestrator & State Controller

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.state = 'EARTH_HQ'; // 'EARTH_HQ', 'LAUNCH', 'COMBAT', 'DEBRIEF', 'GAMEOVER'
    this.lastTime = 0;

    this.camera = { x: 0, y: 0 };
    this.input = {
      up: false,
      down: false,
      left: false,
      right: false,
      mouseAim: true,
      mouseAimX: 0,
      mouseAimY: 0,
      isFiring: false
    };

    // Entities
    this.player = new PlayerShip();
    this.colony = null;
    this.humans = [];
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];

    // Wave & Mission Management
    this.currentWave = 1;
    this.maxWaves = 3;
    this.waveSpawnTimer = 0;
    this.isBossSpawned = false;
    this.score = 0;
    this.scrapCollectedInMission = 0;
    this.initialHumansCount = 0;
    this.humansRescuedThisMission = 0;

    this.initCanvas();
    this.initInputs();
    this.initUI();

    // Start with Earth Command Theme
    window.soundEngine.startMusic('earth');
  }

  initCanvas() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  initInputs() {
    window.addEventListener('keydown', (e) => {
      window.soundEngine.resume();
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.input.up = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.input.down = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.input.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.input.right = true;

      if (e.code === 'Space') {
        this.input.isFiring = true;
        e.preventDefault();
      }
      if (e.code === 'KeyQ' || e.code === 'KeyE') {
        if (this.state === 'COMBAT') {
          this.player.triggerEmp(this.enemies, this.projectiles);
        }
      }
      if (e.code === 'Digit2' || e.code === 'KeyF') {
        if (this.state === 'COMBAT') this.player.fireMissile(this.projectiles, this.enemies);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.input.up = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.input.down = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.input.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.input.right = false;
      if (e.code === 'Space') this.input.isFiring = false;
    });

    window.addEventListener('mousemove', (e) => {
      this.input.mouseAimX = e.clientX + this.camera.x;
      this.input.mouseAimY = e.clientY + this.camera.y;
    });

    window.addEventListener('mousedown', (e) => {
      window.soundEngine.resume();
      if (this.state !== 'COMBAT') return;
      if (e.button === 0) {
        this.input.isFiring = true;
      } else if (e.button === 2) {
        this.player.fireMissile(this.projectiles, this.enemies);
        e.preventDefault();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.input.isFiring = false;
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());

    this.setupTouchControls();
  }

  setupTouchControls() {
    const fireBtn = document.getElementById('touchFireBtn');
    const missileBtn = document.getElementById('touchMissileBtn');
    const empBtn = document.getElementById('touchEmpBtn');

    if (fireBtn) {
      fireBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        window.soundEngine.resume();
        this.input.isFiring = true;
      });
      fireBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.input.isFiring = false;
      });
    }

    if (missileBtn) {
      missileBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        window.soundEngine.resume();
        if (this.state === 'COMBAT') this.player.fireMissile(this.projectiles, this.enemies);
      });
    }

    if (empBtn) {
      empBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        window.soundEngine.resume();
        if (this.state === 'COMBAT') this.player.triggerEmp(this.enemies, this.projectiles);
      });
    }
  }

  initUI() {
    this.updateHQScreen();

    const muteBtn = document.getElementById('muteToggleBtn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        window.soundEngine.resume();
        const muted = window.soundEngine.toggleMute();
        muteBtn.textContent = muted ? '🔇 UNMUTE' : '🔊 SOUND ON';
        muteBtn.classList.toggle('muted', muted);
      });
    }

    const launchBtn = document.getElementById('launchMissionBtn');
    if (launchBtn) {
      launchBtn.addEventListener('click', () => {
        window.soundEngine.resume();
        this.startExpedition();
      });
    }

    const returnBtns = document.querySelectorAll('.return-hq-btn');
    returnBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        window.soundEngine.resume();
        this.goToEarthHQ();
      });
    });

    const retryBtn = document.getElementById('retryMissionBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        window.soundEngine.resume();
        this.startExpedition();
      });
    }

    const nextPlanetBtn = document.getElementById('nextMissionBtn');
    if (nextPlanetBtn) {
      nextPlanetBtn.addEventListener('click', () => {
        window.soundEngine.resume();
        if (window.galaxyManager.currentPlanetIndex < window.galaxyManager.planets.length - 1) {
          window.galaxyManager.currentPlanetIndex++;
        }
        this.goToEarthHQ();
      });
    }

    const tabBtns = document.querySelectorAll('.hq-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        window.soundEngine.resume();
        window.soundEngine.playUIClick();
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tabTarget = btn.getAttribute('data-tab');
        document.querySelectorAll('.hq-tab-content').forEach(c => c.classList.remove('active'));
        const activeContent = document.getElementById(tabTarget);
        if (activeContent) activeContent.classList.add('active');
        if (tabTarget === 'tabHangar') this.renderUpgradesUI();
      });
    });

    this.renderPlanetSelectUI();
  }

  renderPlanetSelectUI() {
    const list = document.getElementById('planetSelectorList');
    if (!list) return;
    list.innerHTML = '';

    window.galaxyManager.planets.forEach((p, idx) => {
      const isUnlocked = idx < window.galaxyManager.maxUnlockedLevel;
      const isCurrent = idx === window.galaxyManager.currentPlanetIndex;

      const card = document.createElement('div');
      card.className = `planet-nav-card ${isCurrent ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
      card.innerHTML = `
        <div class="planet-nav-icon" style="background: radial-gradient(circle, ${p.color}, #000); box-shadow: 0 0 10px ${p.color};"></div>
        <div class="planet-nav-info">
          <div class="planet-nav-name">${p.name} ${!isUnlocked ? '🔒' : ''}</div>
          <div class="planet-nav-sector">${p.system}</div>
        </div>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          window.soundEngine.resume();
          window.soundEngine.playUIClick();
          window.galaxyManager.currentPlanetIndex = idx;
          this.updateHQScreen();
          this.renderPlanetSelectUI();
        });
      }
      list.appendChild(card);
    });
  }

  updateHQScreen() {
    const planet = window.galaxyManager.getCurrentPlanet();
    const mission = window.missionManager.getCurrentMission(window.galaxyManager.currentPlanetIndex);
    const um = window.upgradeManager;
    const rank = um.getRank();

    const rankEl = document.getElementById('hqPilotRank');
    if (rankEl) rankEl.textContent = `${rank.title} (RANK ${um.pilotLevel})`;
    const scrapsEl = document.getElementById('hqTechScraps');
    if (scrapsEl) scrapsEl.textContent = `${um.techScraps} SALVAGE CORES`;
    const humansEl = document.getElementById('hqHumansSavedTotal');
    if (humansEl) humansEl.textContent = `${um.totalHumansSaved} RESCUED`;

    const titleEl = document.getElementById('hqMissionTitle');
    if (titleEl) titleEl.textContent = mission.title;
    const nameEl = document.getElementById('hqPlanetName');
    if (nameEl) nameEl.textContent = planet.name.toUpperCase();
    const typeEl = document.getElementById('hqPlanetType');
    if (typeEl) typeEl.textContent = `${planet.type} // ${planet.system}`;
    const threatEl = document.getElementById('hqThreatLevel');
    if (threatEl) threatEl.textContent = planet.threatLevel;
    const descEl = document.getElementById('hqMissionDesc');
    if (descEl) descEl.textContent = mission.earthBriefing;
    const colonyEl = document.getElementById('hqColonyTarget');
    if (colonyEl) colonyEl.textContent = `${planet.colonyName} (${planet.humanCount} Humans)`;
    const bossEl = document.getElementById('hqTargetBoss');
    if (bossEl) bossEl.textContent = planet.bossName;
    const rewardEl = document.getElementById('hqMissionReward');
    if (rewardEl) rewardEl.textContent = `+${mission.rewardCredits} TECH SALVAGE`;
    const distEl = document.getElementById('hqTargetDist');
    if (distEl) distEl.textContent = planet.distanceAU;
  }

  renderUpgradesUI() {
    const container = document.getElementById('upgradesListContainer');
    if (!container) return;
    container.innerHTML = '';
    const um = window.upgradeManager;

    const scrapsBadge = document.getElementById('hangarScrapsCount');
    if (scrapsBadge) scrapsBadge.textContent = `${um.techScraps} SALVAGE CORES`;

    for (let key in um.upgrades) {
      const u = um.upgrades[key];
      const cost = um.getCost(key);
      const isMax = u.level >= u.maxLevel;
      const canAfford = um.canAfford(key);

      const row = document.createElement('div');
      row.className = 'upgrade-item-card';
      row.innerHTML = `
        <div class="upgrade-header">
          <span class="upgrade-name">${u.name}</span>
          <span class="upgrade-level">TIER ${u.level}/${u.maxLevel}</span>
        </div>
        <div class="upgrade-desc">${u.desc}</div>
        <div class="upgrade-footer">
          <div class="upgrade-cost">${isMax ? 'MAX TIER REACHED' : `COST: ${cost} CORES`}</div>
          <button class="upgrade-btn ${isMax ? 'disabled' : (canAfford ? 'active' : 'unaffordable')}" ${isMax || !canAfford ? 'disabled' : ''}>
            ${isMax ? 'MAXED' : 'UPGRADE'}
          </button>
        </div>
      `;

      const btn = row.querySelector('.upgrade-btn');
      if (btn && !isMax && canAfford) {
        btn.addEventListener('click', () => {
          if (um.buyUpgrade(key)) {
            this.renderUpgradesUI();
            this.updateHQScreen();
          }
        });
      }
      container.appendChild(row);
    }
  }

  goToEarthHQ() {
    this.state = 'EARTH_HQ';
    document.getElementById('hqModal').classList.add('visible');
    document.getElementById('hudOverlay').classList.remove('visible');
    document.getElementById('debriefModal').classList.remove('visible');
    document.getElementById('gameOverModal').classList.remove('visible');
    this.updateHQScreen();
    this.renderPlanetSelectUI();
    window.soundEngine.startMusic('earth');
  }

  startExpedition() {
    this.state = 'LAUNCH';
    document.getElementById('hqModal').classList.remove('visible');
    document.getElementById('debriefModal').classList.remove('visible');
    document.getElementById('gameOverModal').classList.remove('visible');

    const targetIdx = window.galaxyManager.currentPlanetIndex;
    window.galaxyManager.startExpedition(targetIdx, () => {
      this.beginCombat();
    });
  }

  beginCombat() {
    this.state = 'COMBAT';
    document.getElementById('hudOverlay').classList.add('visible');

    const planet = window.galaxyManager.getCurrentPlanet();
    const mission = window.missionManager.getCurrentMission(window.galaxyManager.currentPlanetIndex);

    this.player = new PlayerShip();
    this.player.syncUpgrades();
    this.player.x = 0;
    this.player.y = -180;

    this.colony = new Colony(0, 420, planet.colonyMaxHealth, planet.colonyName);

    // Spawn Human Colonists around the colony
    this.humans = [];
    this.initialHumansCount = planet.humanCount || 8;
    this.humansRescuedThisMission = 0;

    const roles = ['Scientist', 'Engineer', 'Medic'];
    for (let h = 0; h < this.initialHumansCount; h++) {
      const hx = (Math.random() - 0.5) * 110;
      const hy = 435 + (Math.random() - 0.5) * 15;
      const role = roles[h % roles.length];
      this.humans.push(new HumanColonist(hx, hy, role));
    }

    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];

    this.currentWave = 1;
    this.maxWaves = planet.waves;
    this.isBossSpawned = false;
    this.score = 0;
    this.scrapCollectedInMission = 0;

    window.particleSystem.reset();
    window.missionManager.queueDialogue(mission.dialogueStart);
    this.spawnWave(1);
    window.soundEngine.startMusic('combat');
  }

  spawnWave(waveNum) {
    this.currentWave = waveNum;
    const planet = window.galaxyManager.getCurrentPlanet();
    const isFinalWave = waveNum === this.maxWaves;

    if (isFinalWave && !this.isBossSpawned) {
      this.isBossSpawned = true;
      const boss = new Enemy(0, -620, 'boss', planet.level);
      this.enemies.push(boss);

      // Alien Harvesters accompanying boss
      for (let i = 0; i < 2; i++) {
        const angle = (i * Math.PI) + Math.PI / 2;
        this.enemies.push(new Enemy(Math.cos(angle) * 220, -600 + Math.sin(angle) * 100, 'harvester', planet.level));
      }

      const mission = window.missionManager.getCurrentMission(window.galaxyManager.currentPlanetIndex);
      window.missionManager.queueDialogue(mission.dialogueBoss);
      window.soundEngine.startMusic('boss');
      return;
    }

    const count = 4 + waveNum * 2 + (planet.level - 1) * 2;
    for (let i = 0; i < count; i++) {
      const angle = (i * Math.PI * 2) / count;
      const spawnDist = 650 + Math.random() * 200;
      const ex = Math.cos(angle) * spawnDist;
      const ey = Math.sin(angle) * spawnDist - 180;

      let type = 'scout';
      if (waveNum >= 2 && Math.random() > 0.45) type = 'harvester';
      if (waveNum >= 3 && Math.random() > 0.6) type = 'gunship';

      this.enemies.push(new Enemy(ex, ey, type, planet.level));
    }

    if (waveNum === 2) {
      const mission = window.missionManager.getCurrentMission(window.galaxyManager.currentPlanetIndex);
      window.missionManager.queueDialogue(mission.dialogueMid);
    }
  }

  updateCombat(dt) {
    if (this.input.isFiring) {
      this.player.fireBlaster(this.projectiles);
    }

    this.player.update(dt, this.input, this.projectiles, this.enemies);

    const targetCamX = this.player.x - this.width / 2;
    const targetCamY = this.player.y - this.height / 2;
    this.camera.x += (targetCamX - this.camera.x) * 0.1;
    this.camera.y += (targetCamY - this.camera.y) * 0.1;

    // Update Humans
    let rescuedCount = 0;
    for (let i = this.humans.length - 1; i >= 0; i--) {
      const h = this.humans[i];
      const active = h.update(dt, this.player);
      if (h.state === 'RESCUED') rescuedCount++;
    }
    this.humansRescuedThisMission = rescuedCount;

    if (this.colony) {
      this.colony.update(dt);
      if (this.colony.health <= 0) {
        this.handleGameOver('COLONY OBLITERATED BY ALIEN SWARM');
        return;
      }
    }

    if (this.player.health <= 0) {
      this.handleGameOver('VANGUARD CRAFT DESTROYED IN ACTION');
      return;
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const isAlive = p.update(dt, this.enemies);

      if (!isAlive) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (p.isPlayer) {
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          const dist = Math.hypot(e.x - p.x, e.y - p.y);
          if (dist < e.radius + p.radius) {
            e.takeDamage(p.damage);
            window.particleSystem.createSparks(p.x, p.y, 6, '#ffcc00');

            if (p.type === 'torpedo') {
              window.particleSystem.createExplosion(p.x, p.y, 1.3);
              if (window.soundEngine) window.soundEngine.playExplosion(1.0);
              for (let other of this.enemies) {
                if (other !== e && Math.hypot(other.x - p.x, other.y - p.y) < 130) {
                  other.takeDamage(p.damage * 0.5);
                }
              }
            }

            this.projectiles.splice(i, 1);
            break;
          }
        }
      } else {
        // Enemy Acid or Bio-Plasma vs Player
        const distToPlayer = Math.hypot(this.player.x - p.x, this.player.y - p.y);
        if (distToPlayer < this.player.radius + p.radius) {
          const hitAngle = Math.atan2(p.y - this.player.y, p.x - this.player.x);
          this.player.takeDamage(p.damage, hitAngle);
          window.particleSystem.createAcidSplatter(p.x, p.y, 6);
          this.projectiles.splice(i, 1);
          continue;
        }

        // Enemy Acid vs Colony
        if (this.colony) {
          const distToColony = Math.hypot(this.colony.x - p.x, this.colony.y - p.y);
          if (distToColony < this.colony.radius + p.radius) {
            this.colony.takeDamage(p.damage);
            window.particleSystem.createAcidSplatter(p.x, p.y, 8);
            this.projectiles.splice(i, 1);
            continue;
          }
        }
      }
    }

    // Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(dt, this.player, this.colony, this.projectiles, this.enemies, this.humans);

      if (e.dead) {
        const scrapCount = Math.floor(e.scrapVal / 10);
        for (let s = 0; s < scrapCount; s++) {
          this.pickups.push(new Pickup(e.x + (Math.random() - 0.5) * 20, e.y + (Math.random() - 0.5) * 20, 'scrap', 10));
        }

        if (Math.random() < 0.28) {
          this.pickups.push(new Pickup(e.x, e.y, Math.random() > 0.5 ? 'shield' : 'repair', 20));
        }

        window.particleSystem.createExplosion(e.x, e.y, e.type === 'boss' ? 3.2 : 1.3, '#39ff14', '#ff0055');
        if (window.soundEngine) {
          window.soundEngine.playExplosion(e.type === 'boss' ? 2.2 : 1.1);
          window.soundEngine.playAlienScreech();
        }

        this.score += e.scoreVal;
        window.upgradeManager.totalEnemiesDefeated++;
        this.enemies.splice(i, 1);
      }
    }

    // Update Pickups
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      const isAlive = p.update(dt, this.player);

      if (!isAlive) {
        this.pickups.splice(i, 1);
        continue;
      }

      const dist = Math.hypot(this.player.x - p.x, this.player.y - p.y);
      if (dist < this.player.radius + p.radius) {
        if (p.type === 'scrap') {
          this.scrapCollectedInMission += p.value;
          window.upgradeManager.addScrap(p.value);
          window.particleSystem.addFloatingText(`+${p.value} ALIEN BIO-CORE`, this.player.x, this.player.y - 20, '#ffd166');
        } else if (p.type === 'shield') {
          this.player.shield = Math.min(this.player.maxShield, this.player.shield + 30);
          window.particleSystem.addFloatingText('+SHIELD RECHARGE', this.player.x, this.player.y - 20, '#00f0ff');
        } else if (p.type === 'repair') {
          this.player.health = Math.min(this.player.maxHealth, this.player.health + 35);
          window.particleSystem.addFloatingText('+HULL REPAIR', this.player.x, this.player.y - 20, '#06d6a0');
        }
        if (window.soundEngine) window.soundEngine.playPickup();
        this.pickups.splice(i, 1);
      }
    }

    // Wave Progression
    if (this.enemies.length === 0) {
      if (this.currentWave < this.maxWaves) {
        this.waveSpawnTimer += dt;
        if (this.waveSpawnTimer > 2.0) {
          this.waveSpawnTimer = 0;
          this.spawnWave(this.currentWave + 1);
        }
      } else if (this.isBossSpawned) {
        this.handleVictory();
      }
    }

    this.updateHUD();
  }

  updateHUD() {
    const hpBar = document.getElementById('hudHpFill');
    const hpText = document.getElementById('hudHpText');
    if (hpBar) hpBar.style.width = `${Math.max(0, (this.player.health / this.player.maxHealth) * 100)}%`;
    if (hpText) hpText.textContent = `${Math.ceil(this.player.health)} / ${this.player.maxHealth}`;

    const shieldBar = document.getElementById('hudShieldFill');
    const shieldText = document.getElementById('hudShieldText');
    if (shieldBar) shieldBar.style.width = `${Math.max(0, (this.player.shield / this.player.maxShield) * 100)}%`;
    if (shieldText) shieldText.textContent = `${Math.ceil(this.player.shield)} / ${this.player.maxShield}`;

    const colBar = document.getElementById('hudColonyFill');
    const colText = document.getElementById('hudColonyText');
    if (this.colony && colBar) {
      colBar.style.width = `${Math.max(0, (this.colony.health / this.colony.maxHealth) * 100)}%`;
      if (colText) colText.textContent = `${Math.ceil(this.colony.health)} / ${this.colony.maxHealth}`;
    }

    const waveEl = document.getElementById('hudWaveStatus');
    if (waveEl) {
      waveEl.textContent = this.isBossSpawned ? 'WARNING: ALIEN HIVE MOTHER DETECTED' : `INVASION WAVE ${this.currentWave} / ${this.maxWaves}`;
      waveEl.style.color = this.isBossSpawned ? '#ff0055' : '#00ff88';
    }

    // Humans Rescued Indicator on HUD
    const humanHud = document.getElementById('hudHumansStatus');
    if (humanHud) {
      humanHud.textContent = `${this.humansRescuedThisMission} / ${this.initialHumansCount} SECURED`;
    }

    const missileEl = document.getElementById('hudMissileCount');
    if (missileEl) {
      missileEl.textContent = this.player.missileStats.unlocked ? `${this.player.missileAmmo} / ${this.player.missileStats.maxAmmo}` : 'LOCKED';
    }

    const empEl = document.getElementById('hudEmpStatus');
    if (empEl) {
      if (!this.player.empStats.unlocked) {
        empEl.textContent = 'LOCKED';
        empEl.style.color = '#666';
      } else if (this.player.empTimer > 0) {
        empEl.textContent = `${Math.ceil(this.player.empTimer)}s`;
        empEl.style.color = '#ff9e00';
      } else {
        empEl.textContent = 'READY (Q)';
        empEl.style.color = '#00ff88';
      }
    }

    const transBox = document.getElementById('transmissionBox');
    const transSpeaker = document.getElementById('transmissionSpeaker');
    const transText = document.getElementById('transmissionText');
    const activeTrans = window.missionManager.activeTransmission;

    if (activeTrans && transBox) {
      transBox.classList.add('visible');
      if (transSpeaker) transSpeaker.textContent = `// ${activeTrans.speaker.toUpperCase()}`;
      if (transText) transText.textContent = activeTrans.text;
    } else if (transBox) {
      transBox.classList.remove('visible');
    }
  }

  handleVictory() {
    this.state = 'DEBRIEF';
    document.getElementById('hudOverlay').classList.remove('visible');
    document.getElementById('debriefModal').classList.add('visible');

    const planet = window.galaxyManager.getCurrentPlanet();
    const mission = window.missionManager.getCurrentMission(window.galaxyManager.currentPlanetIndex);
    const um = window.upgradeManager;

    window.soundEngine.stopMusic();
    window.soundEngine.playVictory();

    const humanBonus = this.humansRescuedThisMission * 25;
    const colonyBonus = Math.floor((this.colony.health / this.colony.maxHealth) * 100);
    const totalCredits = mission.rewardCredits + this.scrapCollectedInMission + humanBonus + colonyBonus;

    um.recordMissionCompletion(mission.rewardCredits + humanBonus + colonyBonus);
    window.galaxyManager.unlockNextPlanet();

    const planetEl = document.getElementById('debriefPlanetName');
    if (planetEl) planetEl.textContent = `${planet.name.toUpperCase()} LIBERATED`;

    const scoreEl = document.getElementById('debriefScore');
    if (scoreEl) scoreEl.textContent = `${this.score} PTS`;

    const scrapEl = document.getElementById('debriefScrap');
    if (scrapEl) scrapEl.textContent = `+${totalCredits} SALVAGE CORES`;

    const rankEl = document.getElementById('debriefPilotRank');
    if (rankEl) rankEl.textContent = `${um.getRank().title} (RANK ${um.pilotLevel})`;

    const integrityEl = document.getElementById('debriefColonyHealth');
    if (integrityEl) integrityEl.textContent = `${Math.ceil((this.colony.health / this.colony.maxHealth) * 100)}% (+${colonyBonus} CORES)`;

    const humansDebrief = document.getElementById('debriefHumansSaved');
    if (humansDebrief) {
      humansDebrief.textContent = `${this.humansRescuedThisMission} / ${this.initialHumansCount} Humans Rescued (+${humanBonus} CORES)`;
    }
  }

  handleGameOver(reason) {
    this.state = 'GAMEOVER';
    document.getElementById('hudOverlay').classList.remove('visible');
    document.getElementById('gameOverModal').classList.add('visible');

    const reasonEl = document.getElementById('gameOverReason');
    if (reasonEl) reasonEl.textContent = `MISSION FAILED: ${reason}`;

    window.soundEngine.stopMusic();
    window.soundEngine.playWarning();
  }

  drawMinimap() {
    const miniCanvas = document.getElementById('hudMinimap');
    if (!miniCanvas) return;
    const mCtx = miniCanvas.getContext('2d');
    const mW = miniCanvas.width;
    const mH = miniCanvas.height;
    const mScale = 0.045;

    mCtx.clearRect(0, 0, mW, mH);
    mCtx.fillStyle = 'rgba(5, 12, 25, 0.8)';
    mCtx.fillRect(0, 0, mW, mH);

    mCtx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    mCtx.lineWidth = 1;
    mCtx.beginPath();
    mCtx.arc(mW / 2, mH / 2, mW / 2 - 4, 0, Math.PI * 2);
    mCtx.stroke();

    const cx = mW / 2;
    const cy = mH / 2;

    if (this.colony) {
      const colX = cx + (this.colony.x - this.player.x) * mScale;
      const colY = cy + (this.colony.y - this.player.y) * mScale;
      mCtx.fillStyle = '#00ff88';
      mCtx.fillRect(colX - 3, colY - 3, 6, 6);
    }

    // Humans on radar (small yellow dots)
    mCtx.fillStyle = '#ffd166';
    for (let h of this.humans) {
      if (h.state === 'GROUND' || h.state === 'ABDUCTING') {
        const hx = cx + (h.x - this.player.x) * mScale;
        const hy = cy + (h.y - this.player.y) * mScale;
        mCtx.fillRect(hx - 1, hy - 1, 2, 2);
      }
    }

    // Aliens on radar (red/purple)
    for (let e of this.enemies) {
      const ex = cx + (e.x - this.player.x) * mScale;
      const ey = cy + (e.y - this.player.y) * mScale;
      mCtx.fillStyle = e.type === 'boss' ? '#ff0055' : (e.type === 'harvester' ? '#bc13fe' : '#39ff14');
      const size = e.type === 'boss' ? 4 : 2;
      mCtx.beginPath();
      mCtx.arc(ex, ey, size, 0, Math.PI * 2);
      mCtx.fill();
    }

    // Player (cyan)
    mCtx.fillStyle = '#00f0ff';
    mCtx.beginPath();
    mCtx.arc(cx, cy, 3, 0, Math.PI * 2);
    mCtx.fill();
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(currentTime) {
    const dt = Math.min(0.1, (currentTime - this.lastTime) * 0.001);
    this.lastTime = currentTime;

    window.particleSystem.update(dt);
    window.missionManager.update(dt);

    if (this.state === 'LAUNCH') {
      window.galaxyManager.updateWarp(dt);
    } else if (this.state === 'COMBAT') {
      this.updateCombat(dt);
    }

    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.state === 'EARTH_HQ') {
      // In Earth Command: Draw Earth in Orbit
      window.galaxyManager.drawBackground(this.ctx, this.camera, this.width, this.height);
      window.galaxyManager.drawRealisticEarth(this.ctx, this.width * 0.5, this.height * 0.55, Math.min(this.width, this.height) * 0.36);
    } else {
      window.galaxyManager.drawBackground(this.ctx, this.camera, this.width, this.height);
    }

    if (this.state === 'COMBAT') {
      if (this.colony) {
        this.colony.draw(this.ctx, this.camera);
      }

      // Draw Humans on ground / abducting
      for (let h of this.humans) {
        h.draw(this.ctx, this.camera);
      }

      for (let p of this.pickups) {
        p.draw(this.ctx, this.camera);
      }

      for (let e of this.enemies) {
        e.draw(this.ctx, this.camera);
      }

      for (let p of this.projectiles) {
        p.draw(this.ctx, this.camera);
      }

      this.player.draw(this.ctx, this.camera);
      window.particleSystem.draw(this.ctx, this.camera);
      this.drawMinimap();
    }

    if (this.state === 'LAUNCH') {
      window.galaxyManager.drawWarpSequence(this.ctx, this.width, this.height);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
  window.game.start();
});
