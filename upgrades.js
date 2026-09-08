// Planet Saver - Earth Military & Alien Bio-Tech Upgrades

class UpgradeManager {
  constructor() {
    this.techScraps = 150;
    this.pilotLevel = 1;
    this.missionsCompleted = 0;
    this.totalEnemiesDefeated = 0;
    this.totalHumansSaved = 0;

    this.ranks = [
      { level: 1, title: 'Flight Officer', minMissions: 0, perk: 'Earth Vanguard Aerospace Fighter Chassis' },
      { level: 2, title: 'Strike Lieutenant', minMissions: 1, perk: 'Dual Kinetic Railgun Autocannons unlocked' },
      { level: 3, title: 'Wing Commander', minMissions: 2, perk: 'Maverick Guided Torpedoes & Extraction Beam' },
      { level: 4, title: 'Earth Vanguard Ace', minMissions: 3, perk: 'Autonomous Sentry Escort Drone Link' },
      { level: 5, title: 'Savior of Humanity', minMissions: 4, perk: 'Particle Beam & Cryo-EMP Nova unlocked' }
    ];

    this.upgrades = {
      hull: {
        name: 'Carbon-Nanotube Plating',
        desc: 'Reinforced heat-shielding and carbon armor against direct kinetic impacts and alien acid.',
        level: 1,
        maxLevel: 5,
        baseCost: 100,
        costMultiplier: 1.5,
        getValue: (lvl) => 100 + (lvl - 1) * 35
      },
      shield: {
        name: 'Deflector Shield Array',
        desc: 'Electromagnetic deflector barrier that absorbs corrosive acid and hostile bio-plasma.',
        level: 1,
        maxLevel: 5,
        baseCost: 120,
        costMultiplier: 1.6,
        getValue: (lvl) => ({
          maxShield: 80 + (lvl - 1) * 30,
          rechargeRate: 8 + (lvl - 1) * 3
        })
      },
      blaster: {
        name: 'Kinetic Railguns',
        desc: 'High-velocity tungsten penetrators upgraded to dual autocannons and particle beams.',
        level: 1,
        maxLevel: 5,
        baseCost: 150,
        costMultiplier: 1.7,
        getValue: (lvl) => ({
          damage: 22 + (lvl - 1) * 8,
          fireRate: 0.18 - Math.min(0.06, (lvl - 1) * 0.015),
          barrels: lvl >= 5 ? 3 : (lvl >= 2 ? 2 : 1)
        })
      },
      missiles: {
        name: 'Maverick Guided Torpedoes',
        desc: 'High-explosive radar-guided missiles that track and detonate alien bio-ships.',
        level: 0,
        maxLevel: 4,
        baseCost: 200,
        costMultiplier: 1.8,
        getValue: (lvl) => ({
          unlocked: lvl > 0,
          maxAmmo: lvl * 3,
          damage: 65 + lvl * 25
        })
      },
      drone: {
        name: 'Autonomous Sentry Drone',
        desc: 'Deploys an AI-controlled human defense drone that provides covering fire.',
        level: 0,
        maxLevel: 3,
        baseCost: 250,
        costMultiplier: 2.0,
        getValue: (lvl) => ({
          unlocked: lvl > 0,
          count: lvl,
          fireRate: 0.45 - (lvl - 1) * 0.08
        })
      },
      emp: {
        name: 'Cryo-EMP Shockwave',
        desc: 'Radial pulse that neutralizes incoming acid globs and paralyzes alien organisms.',
        level: 0,
        maxLevel: 3,
        baseCost: 220,
        costMultiplier: 1.8,
        getValue: (lvl) => ({
          unlocked: lvl > 0,
          cooldown: Math.max(10, 18 - lvl * 2.5),
          radius: 220 + lvl * 50
        })
      },
      thrusters: {
        name: 'Aerospace Scramjets & RCS',
        desc: 'Upgraded sub-orbital engines and cold-gas RCS nozzles for superior agility.',
        level: 1,
        maxLevel: 4,
        baseCost: 90,
        costMultiplier: 1.5,
        getValue: (lvl) => ({
          maxSpeed: 5.6 + (lvl - 1) * 0.8,
          accel: 0.30 + (lvl - 1) * 0.06,
          turnSpeed: 0.08 + (lvl - 1) * 0.012
        })
      }
    };

    this.load();
  }

  getRank() {
    for (let i = this.ranks.length - 1; i >= 0; i--) {
      if (this.pilotLevel >= this.ranks[i].level) {
        return this.ranks[i];
      }
    }
    return this.ranks[0];
  }

  getCost(upgradeKey) {
    const item = this.upgrades[upgradeKey];
    if (!item || item.level >= item.maxLevel) return null;
    return Math.floor(item.baseCost * Math.pow(item.costMultiplier, item.level));
  }

  canAfford(upgradeKey) {
    const cost = this.getCost(upgradeKey);
    return cost !== null && this.techScraps >= cost;
  }

  buyUpgrade(upgradeKey) {
    const item = this.upgrades[upgradeKey];
    if (!item) return false;
    const cost = this.getCost(upgradeKey);
    if (cost === null || this.techScraps < cost) return false;

    this.techScraps -= cost;
    item.level++;
    this.save();
    if (window.soundEngine) {
      window.soundEngine.playPickup();
    }
    return true;
  }

  addScrap(amount) {
    this.techScraps += Math.max(0, amount);
    this.save();
  }

  recordHumanSaved() {
    this.totalHumansSaved++;
    this.save();
  }

  recordMissionCompletion(rewardScraps = 180) {
    this.missionsCompleted++;
    this.addScrap(rewardScraps);
    this.checkLevelUp();
    this.save();
  }

  checkLevelUp() {
    const newLevel = Math.min(5, Math.floor(this.missionsCompleted) + 1);
    if (newLevel > this.pilotLevel) {
      this.pilotLevel = newLevel;
      if (window.soundEngine) {
        window.soundEngine.playVictory();
      }
      return true;
    }
    return false;
  }

  save() {
    try {
      const data = {
        scraps: this.techScraps,
        level: this.pilotLevel,
        missions: this.missionsCompleted,
        kills: this.totalEnemiesDefeated,
        humansSaved: this.totalHumansSaved,
        levels: {}
      };
      for (let key in this.upgrades) {
        data.levels[key] = this.upgrades[key].level;
      }
      localStorage.setItem('ps_save_data_realistic', JSON.stringify(data));
    } catch(e) {}
  }

  load() {
    try {
      const raw = localStorage.getItem('ps_save_data_realistic');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.scraps !== undefined) this.techScraps = data.scraps;
      if (data.level !== undefined) this.pilotLevel = data.level;
      if (data.missions !== undefined) this.missionsCompleted = data.missions;
      if (data.kills !== undefined) this.totalEnemiesDefeated = data.kills;
      if (data.humansSaved !== undefined) this.totalHumansSaved = data.humansSaved;
      if (data.levels) {
        for (let key in data.levels) {
          if (this.upgrades[key]) {
            this.upgrades[key].level = data.levels[key];
          }
        }
      }
    } catch(e) {}
  }
}

window.upgradeManager = new UpgradeManager();
