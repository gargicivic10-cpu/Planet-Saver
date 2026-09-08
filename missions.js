// Planet Saver - Earth Headquarters Mission Briefings & Story Dialogue
// Missions originate on Earth (United Earth Aerospace Command) before departing to distressed worlds

class MissionManager {
  constructor() {
    this.missions = [
      {
        id: 'mission_mars',
        planetId: 'mars',
        title: 'Operation Red Vanguard: Mars Defense',
        earthBriefing: `Attention Vanguard Strike Team. This is General Thorne speaking from United Earth Aerospace Command in Geneva. 

Subterranean insectoid alien swarms have breached the crust of Mars, invading Ares Colony One. Human mining engineers and researchers are pinned down inside the bio-domes while alien harvesters attempt to abduct our people for biological experimentation.

Your team will launch from Earth, execute an interplanetary burn to Mars, establish orbital air superiority, and rescue every human colonist. Dismissed!`,
        commander: 'General Robert Thorne',
        speakerRole: 'Supreme Commander, United Earth Defense',
        dialogueStart: [
          { speaker: 'Flight Control (Earth)', text: 'Atmospheric exit confirmed. Interplanetary trajectory locked for Mars. Godspeed, Vanguard.' },
          { speaker: 'Dr. Maya Lin (Earth)', text: 'Vanguard team: Bio-sensors confirm the aliens are organic insectoid predators. Watch for acidic projectile bile!' },
          { speaker: 'Ares Colony Commander Jax', text: 'Mayday, Earth Command! They are pulling scientists out of the airlocks! Send help!' }
        ],
        dialogueMid: [
          { speaker: 'Chief Engineer Jax', text: 'Vanguard, alien harvesters have deployed tractor beams over our ground team! Shoot them down!' }
        ],
        dialogueBoss: [
          { speaker: 'Dr. Maya Lin (Earth)', text: 'Seismic spike detected on Mars! A colossal Xeno-Gargant Burrower is breaking through the Martian bedrock!' }
        ],
        dialogueVictory: [
          { speaker: 'General Robert Thorne', text: 'Outstanding flying, Vanguard! The alien swarm on Mars has been routed, and our people are safe. Interplanetary return burn to Earth initiated!' },
          { speaker: 'Ares Colony Staff', text: 'You saved us! Earth Command sent the right team. Thank you, Vanguard!' }
        ],
        rewardCredits: 190
      },
      {
        id: 'mission_europa',
        planetId: 'europa',
        title: 'Operation Sub-Zero Tide: Europa',
        earthBriefing: `Team, satellite telemetry from the Jovian system is terrifying. Deep-ocean cephalopod bio-cruisers have cracked Europa's outer ice crust, flooding Sub-Glacial Lab Thalassa with freezing brine and alien bio-plasma. 

A team of eight human marine astrobiologists are sealed in the secondary airlocks with irreplaceable samples. Launch from Earth, burn across the asteroid belt to Europa, and extract our scientists before the ice shelf collapses.`,
        commander: 'Dr. Maya Lin',
        speakerRole: 'Chief Xenobiologist, Earth Science Council',
        dialogueStart: [
          { speaker: 'Flight Control (Earth)', text: 'Entering Jovian gravitational well. Europa orbital insertion complete.' },
          { speaker: 'Dr. Alistair (Europa)', text: 'They are inside the perimeter! The bioluminescent cruisers are slicing through our titanium bulkheads!' }
        ],
        dialogueMid: [
          { speaker: 'Dr. Maya Lin (Earth)', text: 'Their bio-shields utilize cryogenic resonance. Target their glowing mantle sacs!' }
        ],
        dialogueBoss: [
          { speaker: 'General Robert Thorne', text: 'Warning! The Leviathan Bio-Cruiser has breached the ice! Engage with heavy torpedoes!' }
        ],
        dialogueVictory: [
          { speaker: 'Dr. Alistair (Europa)', text: 'The airlocks held! You saved our research team from the abyss. Saluting you from Europa!' },
          { speaker: 'General Robert Thorne', text: 'Cruiser neutralized. Re-arm your ship on Earth for the Saturnian campaign.' }
        ],
        rewardCredits: 280
      },
      {
        id: 'mission_titan',
        planetId: 'titan',
        title: 'Operation Kraken Storm: Titan',
        earthBriefing: `Vanguard, the alien vanguard has reached Saturn's moon Titan. Winged bio-horrors adapted to liquid methane are attacking our Kraken Hydrocarbon Refinery. If the refinery anchors fail, Titan's atmospheric storms will incinerate over a hundred human workers. 

General Thorne has authorized heavy torpedo ordnance. Launch from Earth, penetrate Titan's orange smog, and protect the human refinery crews from abduction!`,
        commander: 'General Robert Thorne',
        speakerRole: 'Supreme Commander, United Earth Defense',
        dialogueStart: [
          { speaker: 'Flight Control (Earth)', text: 'Atmospheric descent into Titan. Warning: Optical sensors limited by dense methane haze.' },
          { speaker: 'Governor Lysandra', text: 'Earth Command, winged bio-horrors are swooping down on Platform Kraken! Our flak turrets are overrun!' }
        ],
        dialogueMid: [
          { speaker: 'Dr. Maya Lin (Earth)', text: 'The aliens are harvesting hydrocarbon fuel to power their mothership bio-drives!' }
        ],
        dialogueBoss: [
          { speaker: 'Titan Queen Vesper (Alien)', text: '*Eerie telepathic screech* ...Flesh creatures of Terra... your colonies will wither in our brood!' }
        ],
        dialogueVictory: [
          { speaker: 'Governor Lysandra', text: 'The Titan Queen has fallen! Platform Kraken is secure! Earth can be proud of its finest pilots!' },
          { speaker: 'General Robert Thorne', text: 'Superb execution. Prepare for our first interstellar expedition to Proxima Centauri.' }
        ],
        rewardCredits: 380
      },
      {
        id: 'mission_proxima',
        planetId: 'proxima',
        title: 'Operation Interstellar Dawn: Proxima b',
        earthBriefing: `This is our first interstellar mission. Proxima Centauri b, humanity's proudest exoplanet colony, is sending desperate SOS distress calls. 

An armored Xenophage brood has landed bio-pods across the planet's twilight zones, bombarding our New Eden agricultural domes with corrosive acid. Launch from Earth spaceport, engage hyper-drive, and protect our interstellar frontier!`,
        commander: 'General Robert Thorne',
        speakerRole: 'Supreme Commander, United Earth Defense',
        dialogueStart: [
          { speaker: 'Flight Control (Earth)', text: 'Interstellar warp exit at Alpha Centauri. Red dwarf star in direct visual.' },
          { speaker: 'Mayor Evans (New Eden)', text: 'Vanguard, thank God! Acid mortar rounds are melting our hydroponic glass! We have families trapped in Hab-1!' }
        ],
        dialogueMid: [
          { speaker: 'Dr. Maya Lin (Earth)', text: 'Their armored carapaces are immune to light lasers. Focus heavy kinetic railgun fire on their joint segments!' }
        ],
        dialogueBoss: [
          { speaker: 'General Robert Thorne', text: 'Massive organic war titan identified: The Xenophage Brood Tyrant is advancing on the human domes!' }
        ],
        dialogueVictory: [
          { speaker: 'Mayor Evans (New Eden)', text: 'The Tyrant is dead! New Eden will endure! Earth\'s vanguard saved humanity\'s future amongst the stars!' },
          { speaker: 'General Robert Thorne', text: 'We have located the alien origin homeworld: Xeno-Prime. The final battle for Earth is at hand.' }
        ],
        rewardCredits: 520
      },
      {
        id: 'mission_xenoprime',
        planetId: 'xenoprime',
        title: 'Operation Extinction Strike: Xeno-Prime',
        earthBriefing: `All personnel of United Earth Defense Command: this is General Thorne. 

We have pinpointed the alien hive homeworld, designated Xeno-Prime. Deep inside its living bio-crust, the Supreme Hive Empress is incubating billions of bio-spores designed to wipe out all human life on Earth. 

Your vanguard team carries Earth\'s ultimate hopes. Launch from Earth, penetrate the hive core, eliminate the Empress, and secure our galaxy forever. For Earth and humanity!`,
        commander: 'General Robert Thorne & Dr. Maya Lin',
        speakerRole: 'Unified Earth Defense Council',
        dialogueStart: [
          { speaker: 'General Robert Thorne', text: 'Every nation, every city on Earth is watching your telemetry. Strike deep into the hive!' },
          { speaker: 'Supreme Hive Empress (Alien)', text: '*Resonant cosmic hiss* ...You fragile Terrans... come to feed the Empress... you shall become our nourishment!' }
        ],
        dialogueMid: [
          { speaker: 'Dr. Maya Lin (Earth)', text: 'Target the glowing bio-luminescent egg sacs around the Empress! That is the nerve nexus!' }
        ],
        dialogueBoss: [
          { speaker: 'Supreme Hive Empress (Alien)', text: '*Deafening roar* ...I will tear your craft into scrap and feast upon your world!' }
        ],
        dialogueVictory: [
          { speaker: 'Dr. Maya Lin (Earth)', text: 'Confirmed! Bio-readings flatline! The Empress is destroyed and the hive mind has collapsed!' },
          { speaker: 'General Robert Thorne', text: 'Vanguard... you did it. Earth is saved! The human colonies are secure! All bells on Earth are ringing for your return. Welcome home, Earth Saviors!' }
        ],
        rewardCredits: 950
      }
    ];

    this.activeTransmission = null;
    this.transmissionQueue = [];
    this.transmissionTimer = 0;
  }

  getCurrentMission(planetIndex) {
    return this.missions[planetIndex] || this.missions[0];
  }

  queueDialogue(dialogueArray) {
    if (!dialogueArray || !dialogueArray.length) return;
    for (let d of dialogueArray) {
      this.transmissionQueue.push(d);
    }
    if (!this.activeTransmission) {
      this.showNextTransmission();
    }
  }

  showNextTransmission() {
    if (this.transmissionQueue.length === 0) {
      this.activeTransmission = null;
      return;
    }

    this.activeTransmission = this.transmissionQueue.shift();
    this.transmissionTimer = 4.8;

    if (window.soundEngine) {
      window.soundEngine.playRadioSquelch();
    }
  }

  update(dt) {
    if (this.activeTransmission) {
      this.transmissionTimer -= dt;
      if (this.transmissionTimer <= 0) {
        this.showNextTransmission();
      }
    }
  }
}

window.missionManager = new MissionManager();
