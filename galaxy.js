// Planet Saver - Realistic Galaxy & Celestial Renderer
// Headquarters: Earth (Terra - Sol III) -> Interplanetary Expedition Systems

class GalaxyManager {
  constructor() {
    this.planets = [
      {
        id: 'mars',
        name: 'Mars (Ares-1 Colony)',
        system: 'Sol IV // Inner Solar System',
        distanceAU: '0.52 AU from Earth',
        type: 'Terraformed Desert World',
        level: 1,
        color: '#d64527',
        glowColor: 'rgba(214, 69, 39, 0.4)',
        atmosphereColor: 'rgba(255, 140, 100, 0.2)',
        bgColor: '#150604',
        cloudColor: 'rgba(240, 180, 150, 0.25)',
        surfaceFeatures: 'canyons',
        threatLevel: 'MODERATE // XENO-BURROWERS',
        description: 'Subterranean insectoid swarms have emerged from the Valles Marineris fissures, breaching the hydroponic bio-domes of Ares Colony One. Human mining engineers and researchers are trapped.',
        colonyName: 'Ares Prime Bio-Dome',
        colonyMaxHealth: 1000,
        humanCount: 6,
        waves: 3,
        bossName: 'Xeno-Gargant Burrower'
      },
      {
        id: 'europa',
        name: 'Europa (Lab Thalassa)',
        system: 'Sol V-b // Jovian Moon',
        distanceAU: '4.20 AU from Earth',
        type: 'Sub-Glacial Ocean Moon',
        level: 2,
        color: '#8ecae6',
        glowColor: 'rgba(142, 202, 230, 0.45)',
        atmosphereColor: 'rgba(200, 240, 255, 0.3)',
        bgColor: '#041018',
        cloudColor: 'rgba(255, 255, 255, 0.3)',
        surfaceFeatures: 'ice_cracks',
        hasParentPlanet: 'jupiter',
        threatLevel: 'HIGH // CEPHALOPOD BIO-CRUISERS',
        description: 'Bioluminescent deep-sea alien lifeforms broke through the ice shelf and are dismantling the sub-glacial research complex. Human marine astrobiologists are pinned in the staging airlocks.',
        colonyName: 'Thalassa Deep Ocean Lab',
        colonyMaxHealth: 1200,
        humanCount: 8,
        waves: 4,
        bossName: 'Leviathan Bio-Cruiser'
      },
      {
        id: 'titan',
        name: 'Titan (Kraken Outpost)',
        system: 'Sol VI-f // Saturnian Moon',
        distanceAU: '9.58 AU from Earth',
        type: 'Hydrocarbon Methane World',
        level: 3,
        color: '#e07a5f',
        glowColor: 'rgba(224, 122, 95, 0.45)',
        atmosphereColor: 'rgba(255, 160, 60, 0.35)',
        bgColor: '#140802',
        cloudColor: 'rgba(255, 190, 100, 0.4)',
        surfaceFeatures: 'methane_lakes',
        hasParentPlanet: 'saturn',
        threatLevel: 'VERY HIGH // TOXIC BIO-SWARM',
        description: 'Dense nitrogen-methane storms have masked an airborne invasion of winged alien bio-horrors targeting the refinery anchors. Human engineers must be defended from abduction.',
        colonyName: 'Kraken Methane Refinery',
        colonyMaxHealth: 1400,
        humanCount: 10,
        waves: 4,
        bossName: 'Titan Queen Vesper'
      },
      {
        id: 'proxima',
        name: 'Proxima b (New Eden)',
        system: 'Alpha Centauri // Exoplanet System',
        distanceAU: '4.24 Light Years from Earth',
        type: 'Habitable Red-Dwarf World',
        level: 4,
        color: '#7209b7',
        glowColor: 'rgba(114, 9, 183, 0.5)',
        atmosphereColor: 'rgba(180, 50, 220, 0.35)',
        bgColor: '#0c0214',
        cloudColor: 'rgba(210, 150, 255, 0.3)',
        surfaceFeatures: 'red_dwarf',
        threatLevel: 'CRITICAL // ARMORED XENOPHAGE',
        description: 'Our first interstellar human settlement is under full planetary siege by an armored xenophage brood. Atmospheric terraforming towers are crumbling under corrosive bio-mortar fire.',
        colonyName: 'New Eden Colony Hab-1',
        colonyMaxHealth: 1600,
        humanCount: 12,
        waves: 5,
        bossName: 'Xenophage Brood Tyrant'
      },
      {
        id: 'xenoprime',
        name: 'Xeno-Prime (The Hive Core)',
        system: 'Dark Rift Sector // Alien Homeworld',
        distanceAU: 'Classified Coordinates',
        type: 'Bioluminescent Hive Planet',
        level: 5,
        color: '#39ff14',
        glowColor: 'rgba(57, 255, 20, 0.5)',
        atmosphereColor: 'rgba(40, 200, 30, 0.35)',
        bgColor: '#030d04',
        cloudColor: 'rgba(80, 255, 60, 0.3)',
        surfaceFeatures: 'hive_veins',
        threatLevel: 'MAXIMUM EXTREME // HIVE EMPRESS',
        description: 'The origin of the alien menace. The Supreme Hive Empress is preparing biological spore seeds to infect Earth itself. Human vanguard strike team must destroy the central bio-core!',
        colonyName: 'Human Forward Outpost Bravo',
        colonyMaxHealth: 2000,
        humanCount: 14,
        waves: 5,
        bossName: 'Supreme Hive Empress Xylok'
      }
    ];

    this.currentPlanetIndex = 0;
    this.maxUnlockedLevel = 1;

    try {
      const savedLevel = localStorage.getItem('ps_unlocked_level');
      if (savedLevel) this.maxUnlockedLevel = Math.max(1, parseInt(savedLevel));
    } catch(e) {}

    // Parallax Starfields
    this.stars = [];
    this.initCosmos();

    // Spaceflight Launch & Transit State
    this.isLaunching = false;
    this.launchProgress = 0;
    this.launchDuration = 3.2; // seconds
    this.warpStars = [];
    this.initWarpStars();

    this.earthRotation = 0;
  }

  getCurrentPlanet() {
    return this.planets[this.currentPlanetIndex] || this.planets[0];
  }

  unlockNextPlanet() {
    if (this.currentPlanetIndex + 1 >= this.maxUnlockedLevel) {
      this.maxUnlockedLevel = Math.min(this.planets.length, this.currentPlanetIndex + 2);
      try {
        localStorage.setItem('ps_unlocked_level', this.maxUnlockedLevel.toString());
      } catch(e) {}
    }
  }

  initCosmos() {
    this.stars = [];
    for (let i = 0; i < 220; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * 4500,
        y: (Math.random() - 0.5) * 4500,
        size: Math.random() * 1.5 + 0.5,
        layer: 0.08,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.05 + 0.01,
        color: Math.random() > 0.4 ? '#ffffff' : (Math.random() > 0.5 ? '#b8d8ff' : '#ffe8c2')
      });
    }

    for (let i = 0; i < 140; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * 4000,
        y: (Math.random() - 0.5) * 4000,
        size: Math.random() * 2 + 1,
        layer: 0.22,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.08 + 0.02,
        color: '#ffffff'
      });
    }
  }

  initWarpStars() {
    this.warpStars = [];
    for (let i = 0; i < 300; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 900 + 10;
      this.warpStars.push({
        angle: angle,
        dist: dist,
        speed: Math.random() * 28 + 18,
        length: Math.random() * 45 + 25,
        color: Math.random() > 0.35 ? '#00f0ff' : '#ffffff'
      });
    }
  }

  startExpedition(targetPlanetIndex, onComplete) {
    this.isLaunching = true;
    this.launchProgress = 0;
    this.targetPlanetIndex = targetPlanetIndex;
    this.onLaunchComplete = onComplete;
    if (window.soundEngine) {
      window.soundEngine.playWarp();
    }
  }

  updateWarp(dt) {
    if (!this.isLaunching) return;
    this.launchProgress += dt / this.launchDuration;

    for (let ws of this.warpStars) {
      ws.dist += ws.speed * (1 + this.launchProgress * 5);
      if (ws.dist > 1200) {
        ws.dist = Math.random() * 40;
        ws.angle = Math.random() * Math.PI * 2;
      }
    }

    if (this.launchProgress >= 1.0) {
      this.isLaunching = false;
      this.currentPlanetIndex = this.targetPlanetIndex;
      if (this.onLaunchComplete) {
        this.onLaunchComplete();
      }
    }
  }

  // Draw Background Cosmos & Active Planet
  drawBackground(ctx, camera, width, height) {
    const planet = this.getCurrentPlanet();

    // Space void gradient
    const bgGrad = ctx.createRadialGradient(
      width / 2, height / 2, 50,
      width / 2, height / 2, Math.max(width, height)
    );
    bgGrad.addColorStop(0, planet.bgColor || '#040814');
    bgGrad.addColorStop(1, '#010307');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Stars
    const now = Date.now() * 0.001;
    for (let s of this.stars) {
      let sx = (s.x - camera.x * s.layer) % (width * 2);
      let sy = (s.y - camera.y * s.layer) % (height * 2);

      if (sx < -100) sx += width * 2;
      if (sx > width + 100) sx -= width * 2;
      if (sy < -100) sy += height * 2;
      if (sy > height + 100) sy -= height * 2;

      const alpha = s.alpha + Math.sin(now * s.twinkleSpeed * 8) * 0.15;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Render Parent Planet in Sky if present (e.g. Jupiter on Europa, Saturn on Titan)
    if (planet.hasParentPlanet === 'jupiter') {
      this.drawJupiterSky(ctx, camera, width, height);
    } else if (planet.hasParentPlanet === 'saturn') {
      this.drawSaturnSky(ctx, camera, width, height);
    }

    // Render Realistic Destination Planet
    this.drawRealisticPlanet(ctx, camera, width, height, planet);
  }

  // Realistic Earth Rendering for Headquarters
  drawRealisticEarth(ctx, cx, cy, radius) {
    ctx.save();
    this.earthRotation += 0.001;

    // Atmospheric Rayleigh Scattering Outer Glow
    const atmoGlow = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.35);
    atmoGlow.addColorStop(0, 'rgba(0, 180, 255, 0.5)');
    atmoGlow.addColorStop(0.5, 'rgba(0, 120, 255, 0.2)');
    atmoGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = atmoGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // Planet Sphere Clipping
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Deep Blue Oceans
    const oceanGrad = ctx.createRadialGradient(
      cx - radius * 0.35, cy - radius * 0.35, radius * 0.1,
      cx, cy, radius
    );
    oceanGrad.addColorStop(0, '#10528c');
    oceanGrad.addColorStop(0.7, '#07244a');
    oceanGrad.addColorStop(1, '#020b18');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    // Continental Landmasses (Africa, Europe, Americas approximations)
    ctx.fillStyle = '#2d6a4f'; // Lush green/brown terrain
    const rot = this.earthRotation;

    // Landmass blobs with rotation
    for (let i = -2; i <= 2; i++) {
      const lx = cx + Math.sin(rot + i * 1.2) * (radius * 0.7);
      const ly = cy + (i * radius * 0.28);
      ctx.beginPath();
      ctx.ellipse(lx, ly, radius * 0.35, radius * 0.22, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Realistic Cloud Bands
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let c = -3; c <= 3; c++) {
      const clx = cx + Math.sin(rot * 1.3 + c) * (radius * 0.5);
      const cly = cy + c * (radius * 0.24);
      ctx.beginPath();
      ctx.ellipse(clx, cly, radius * 0.85, radius * 0.12, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Day/Night Terminator Shadow
    const shadowGrad = ctx.createRadialGradient(
      cx - radius * 0.25, cy - radius * 0.25, radius * 0.4,
      cx + radius * 0.4, cy + radius * 0.4, radius * 1.05
    );
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
    shadowGrad.addColorStop(0.75, 'rgba(0, 5, 15, 0.8)');
    shadowGrad.addColorStop(1, 'rgba(0, 2, 8, 0.98)');
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    // Night City Lights (Golden amber web of human civilization)
    ctx.fillStyle = '#ffb703';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffd166';
    for (let k = 0; k < 35; k++) {
      const nx = cx + radius * 0.2 + (Math.sin(k * 7) * radius * 0.4);
      const ny = cy + radius * 0.1 + (Math.cos(k * 13) * radius * 0.4);
      ctx.fillRect(nx, ny, 2, 2);
    }

    ctx.restore();
  }

  // Realistic Target Planet Rendering in Orbit View
  drawRealisticPlanet(ctx, camera, width, height, planet) {
    ctx.save();

    const px = width * 0.85 - camera.x * 0.03;
    const py = height * 0.30 - camera.y * 0.03;
    const radius = Math.min(width, height) * 0.36;

    // Atmospheric Glow
    const glowGrad = ctx.createRadialGradient(px, py, radius * 0.92, px, py, radius * 1.35);
    glowGrad.addColorStop(0, planet.glowColor);
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(px, py, radius * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // Planet Sphere
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.clip();

    // Base Surface Gradient
    const sphereGrad = ctx.createRadialGradient(
      px - radius * 0.35, py - radius * 0.35, radius * 0.1,
      px, py, radius
    );
    sphereGrad.addColorStop(0, planet.color);
    sphereGrad.addColorStop(0.65, planet.bgColor);
    sphereGrad.addColorStop(1, '#000000');
    ctx.fillStyle = sphereGrad;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);

    // Planet Specific Surface Textures
    if (planet.surfaceFeatures === 'canyons') { // Mars
      ctx.strokeStyle = '#521408';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(px - radius * 0.5, py + radius * 0.1);
      ctx.bezierCurveTo(px, py + radius * 0.2, px + radius * 0.2, py - radius * 0.1, px + radius * 0.6, py + radius * 0.05);
      ctx.stroke();
      // Polar Ice Cap
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(px, py - radius * 0.85, radius * 0.45, radius * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (planet.surfaceFeatures === 'ice_cracks') { // Europa
      ctx.strokeStyle = '#2a6f97';
      ctx.lineWidth = 2;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(px - radius * 0.8, py + i * 40);
        ctx.lineTo(px + radius * 0.8, py + i * 35 + 20);
        ctx.stroke();
      }
    } else if (planet.surfaceFeatures === 'hive_veins') { // Xeno-Prime
      ctx.strokeStyle = '#39ff14';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#39ff14';
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(px + (i - 2.5) * 35, py + Math.sin(i) * 30, 25, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Clouds
    ctx.fillStyle = planet.cloudColor;
    for (let c = -2; c <= 2; c++) {
      ctx.beginPath();
      ctx.ellipse(px, py + c * (radius * 0.3), radius * 0.95, radius * 0.12, 0.05, 0, Math.PI * 2);
      ctx.fill();
    }

    // Day/Night Terminator Shadow
    const shadowGrad = ctx.createRadialGradient(
      px - radius * 0.2, py - radius * 0.2, radius * 0.4,
      px + radius * 0.35, py + radius * 0.35, radius * 1.08
    );
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
    shadowGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.7)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.96)');
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);

    ctx.restore();
  }

  // Giant Banded Jupiter in Background Sky
  drawJupiterSky(ctx, camera, width, height) {
    const jx = width * 0.25 - camera.x * 0.015;
    const jy = height * 0.22 - camera.y * 0.015;
    const r = 90;

    ctx.save();
    ctx.beginPath();
    ctx.arc(jx, jy, r, 0, Math.PI * 2);
    ctx.clip();

    const jGrad = ctx.createLinearGradient(jx - r, jy, jx + r, jy);
    jGrad.addColorStop(0, '#c38e70');
    jGrad.addColorStop(0.5, '#e3c2aa');
    jGrad.addColorStop(1, '#684535');
    ctx.fillStyle = jGrad;
    ctx.fillRect(jx - r, jy - r, r * 2, r * 2);

    // Great Red Spot
    ctx.fillStyle = '#b04a30';
    ctx.beginPath();
    ctx.ellipse(jx + 20, jy + 25, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Saturn with Rings in Background Sky
  drawSaturnSky(ctx, camera, width, height) {
    const sx = width * 0.22 - camera.x * 0.015;
    const sy = height * 0.22 - camera.y * 0.015;
    const r = 60;

    ctx.save();
    // Back half of rings
    ctx.strokeStyle = 'rgba(230, 200, 160, 0.6)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.ellipse(sx, sy, r * 2.2, r * 0.6, -0.3, Math.PI, 0);
    ctx.stroke();

    // Planet Body
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#e2c598';
    ctx.fill();

    // Front half of rings
    ctx.beginPath();
    ctx.ellipse(sx, sy, r * 2.2, r * 0.6, -0.3, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  // Earth Launch & Interplanetary Transit Sequence
  drawWarpSequence(ctx, width, height) {
    if (!this.isLaunching) return;

    ctx.save();
    ctx.fillStyle = `rgba(3, 8, 20, ${Math.min(0.92, this.launchProgress * 1.3)})`;
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    // Warping Star Streaks
    for (let ws of this.warpStars) {
      const x1 = cx + Math.cos(ws.angle) * ws.dist;
      const y1 = cy + Math.sin(ws.angle) * ws.dist;
      const length = ws.length * (1 + this.launchProgress * 6);
      const x2 = cx + Math.cos(ws.angle) * (ws.dist + length);
      const y2 = cy + Math.sin(ws.angle) * (ws.dist + length);

      ctx.strokeStyle = ws.color;
      ctx.lineWidth = Math.min(4, 1 + this.launchProgress * 3.5);
      ctx.shadowBlur = 8;
      ctx.shadowColor = ws.color;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Realistic Telemetry HUD during Flight
    ctx.fillStyle = '#00ff88';
    ctx.font = '700 24px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff88';
    ctx.fillText('EARTH ORBITAL ASCENT // TRANSIT BURN', cx, cy - 80);

    const targetPlanet = this.planets[this.targetPlanetIndex];
    ctx.font = '600 17px "Rajdhani", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`TRAJECTORY VECTOR: ${targetPlanet.name.toUpperCase()} // DISTANCE: ${targetPlanet.distanceAU}`, cx, cy - 45);

    // Burn progress bar
    const barW = 340;
    const barH = 8;
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - barW / 2, cy + 60, barW, barH);
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(cx - barW / 2 + 2, cy + 62, (barW - 4) * this.launchProgress, barH - 4);

    // Reentry atmospheric flame flash
    if (this.launchProgress > 0.82) {
      const flashAlpha = (this.launchProgress - 0.82) / 0.18;
      ctx.fillStyle = `rgba(255, 140, 50, ${flashAlpha * 0.8})`;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }
}

window.galaxyManager = new GalaxyManager();
