/**
 * NPC_SYSTEM.JS
 * Modular AI and staff management system.
 * Each NPC has: name, role, job, state, mood, energy, health, stress
 */

const NPCSystem = (() => {
  'use strict';

  const ROLE_ENUM = {
    SCIENTIST: 'scientist',
    SECURITY: 'security',
    ENGINEER: 'engineer',
    DOCTOR: 'doctor',
    CLASSD: 'classd',
    MTF: 'mtf'
  };

  const JOB_ENUM = {
    IDLE: 'idle',
    WALKING: 'walking',
    RESEARCHING: 'researching',
    TESTING: 'testing',
    HEALING: 'healing',
    PATROLLING: 'patrolling',
    REPAIRING: 'repairing',
    RESTING: 'resting',
    EATING: 'eating',
    ESCORTING: 'escorting',
    DEPLOYING: 'deploying',
    RECONTAINING: 'recontaining'
  };

  const STATE_ENUM = {
    IDLE: 'idle',
    WALKING: 'walking',
    WORKING: 'working',
    WAITING: 'waiting',
    RESTING: 'resting',
    INJURED: 'injured',
    STRESSED: 'stressed'
  };

  // NPC template class
  class NPC {
    constructor(typeId, x, y, name) {
      this.id = Math.random().toString(36).substr(2, 9);
      this.name = name || generateName(typeId);
      this.type = typeId;
      this.role = typeId;
      this.x = x;
      this.y = y;
      this.color = staffColorByType(typeId);

      // Needs
      this.energy = 100;
      this.hunger = 0;
      this.stress = 0;
      this.health = 100;
      this.morale = 100;

      // Job
      this.job = JOB_ENUM.IDLE;
      this.currentTarget = null;
      this.state = STATE_ENUM.IDLE;

      // Tracking
      this.path = null;
      this.pathIndex = 0;
      this.workTimer = 0;
      this.onArrive = null;
      this.onWorkDone = null;
      this.speed = 30 + Math.random() * 18;
      this.injured = false;
      this.hp = 100;
    }

    /**
     * Tick NPC state. Called every simulation step.
     */
    tick(dt) {
      // Degradation
      this.energy -= dt * 0.5; // Energy consumption
      this.hunger += dt * 0.3; // Hunger accumulation
      this.stress += dt * (this.morale < 40 ? 0.1 : 0.01); // Stress from low morale

      // Cap values
      this.energy = Math.max(0, Math.min(100, this.energy));
      this.hunger = Math.max(0, Math.min(100, this.hunger));
      this.stress = Math.max(0, Math.min(100, this.stress));

      // Health degradation if injured
      if (this.injured) {
        this.health -= dt * 3;
      }

      // Morale affected by stress and hunger
      this.morale = Math.max(0, Math.min(100,
        100 - (this.stress * 0.3 + this.hunger * 0.2)
      ));
    }

    /**
     * Set a job for this NPC.
     */
    assignJob(job, target = null) {
      this.job = job;
      this.currentTarget = target;
      this.state = STATE_ENUM.IDLE;
    }

    /**
     * Returns true if NPC is available for work (not resting, eating, stressed, or injured).
     */
    isAvailable() {
      return !this.injured && this.energy > 20 && this.hunger < 60 && this.stress < 70;
    }

    /**
     * Get NPC productivity based on needs.
     * Returns 0–1 multiplier.
     */
    getProductivity() {
      let mult = 1.0;
      mult *= 1.0 - (this.energy === 0 ? 0.5 : 0);
      mult *= 1.0 - (this.hunger > 70 ? 0.3 : 0);
      mult *= 1.0 - (this.stress > 70 ? 0.4 : 0);
      mult *= this.morale / 100;
      return Math.max(0, mult);
    }

    /**
     * Returns a description of what the NPC needs most.
     */
    getPriorityNeed() {
      if (this.health < 50) return 'medical';
      if (this.energy < 30) return 'rest';
      if (this.hunger > 70) return 'food';
      if (this.stress > 70) return 'break';
      if (this.morale < 40) return 'morale_boost';
      return 'none';
    }
  }

  /**
   * Generate a random name for an NPC.
   */
  function generateName(typeId) {
    const names = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Taylor',
      'Sam', 'Quinn', 'Drew', 'Jamie', 'Cameron', 'Blake'];
    const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
      'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const first = names[Math.floor(Math.random() * names.length)];
    const last = surnames[Math.floor(Math.random() * surnames.length)];
    return `${first} ${last}`;
  }

  /**
   * Get staff color by type.
   */
  function staffColorByType(typeId) {
    const colors = {
      scientist: '#f2f3f0',
      classd: '#f5943a',
      security: '#22385a',
      engineer: '#c9a227',
      doctor: '#5b6b7c',
      mtf: '#787f89'
    };
    return colors[typeId] || '#ffffff';
  }

  return {
    NPC,
    ROLE_ENUM,
    JOB_ENUM,
    STATE_ENUM,
    generateName,
    staffColorByType
  };
})();