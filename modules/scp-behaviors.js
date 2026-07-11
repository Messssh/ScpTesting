/**
 * SCP_BEHAVIORS.JS
 * Unique behavior scripts for each SCP type.
 * Extensible system for adding custom SCP mechanics.
 */

const SCPBehaviors = (() => {
  'use strict';

  /**
   * Base SCP Behavior class.
   * Override methods to implement custom behavior.
   */
  class SCPBehavior {
    constructor(scpId) {
      this.scpId = scpId;
      this.active = false;
    }

    /**
     * Called when SCP is placed in containment.
     */
    onContain(scp) { }

    /**
     * Called when breach occurs.
     */
    onBreach(scp) { }

    /**
     * Called every tick while contained.
     */
    tickContained(scp, dt, grid, staff) { }

    /**
     * Called every tick while breached.
     */
    tickBreach(scp, dt, grid, staff) { }

    /**
     * Get custom properties display.
     */
    getProperties(scp) {
      return [];
    }
  }

  // SCP-173: The Sculpture
  class SCP173 extends SCPBehavior {
    constructor() {
      super('scp173');
      this.observing = false;
      this.lastObserved = 0;
      this.moveSpeed = 15;
    }

    onContain(scp) {
      scp.custom = { observationTime: 0, observersCount: 0 };
    }

    tickContained(scp, dt, grid, staff) {
      // Count observers (staff in same cell)
      scp.custom.observersCount = 0;
      staff.forEach(s => {
        if (Math.hypot(s.x - scp.x, s.y - scp.y) < 50) {
          scp.custom.observersCount++;
        }
      });

      if (scp.custom.observersCount > 0) {
        scp.custom.observationTime += dt;
      } else {
        // Move when unobserved
        if (Math.random() < 0.01) {
          const newRow = Math.floor(Math.random() * grid.length);
          const newCol = Math.floor(Math.random() * grid[0].length);
          scp.x = newCol * 40 + 20;
          scp.y = newRow * 40 + 20;
          // Possible kill
          staff.forEach(s => {
            if (Math.hypot(s.x - scp.x, s.y - scp.y) < 40) {
              if (Math.random() < 0.3) {
                s.health = 0;
              }
            }
          });
        }
      }
    }

    getProperties(scp) {
      return [
        { label: 'Observed', value: scp.custom.observersCount > 0 ? 'YES' : 'NO' },
        { label: 'Observation Time', value: Math.floor(scp.custom.observationTime) + 's' }
      ];
    }
  }

  // SCP-096: Shy Guy
  class SCP096 extends SCPBehavior {
    constructor() {
      super('scp096');
    }

    onContain(scp) {
      scp.custom = { angry: false, angryTarget: null, rageDuration: 0 };
    }

    tickContained(scp, dt, grid, staff) {
      // Check if anyone is looking at SCP-096 (viewing face)
      staff.forEach(s => {
        if (Math.random() < 0.02) { // 2% chance per tick to trigger rage
          scp.custom.angry = true;
          scp.custom.angryTarget = s;
          scp.custom.rageDuration = 30; // 30 seconds
        }
      });

      if (scp.custom.angry) {
        scp.custom.rageDuration -= dt;
        if (scp.custom.rageDuration <= 0) {
          scp.custom.angry = false;
          scp.custom.angryTarget = null;
        } else if (scp.custom.angryTarget) {
          // Chase target
          const dx = scp.custom.angryTarget.x - scp.x;
          const dy = scp.custom.angryTarget.y - scp.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0) {
            scp.x += (dx / dist) * 50 * dt;
            scp.y += (dy / dist) * 50 * dt;
          }
          // Kill if caught
          if (dist < 30) {
            scp.custom.angryTarget.health = 0;
          }
        }
      }
    }

    getProperties(scp) {
      return [
        { label: 'State', value: scp.custom.angry ? 'ENRAGED' : 'Calm' },
        { label: 'Rage Timer', value: Math.floor(scp.custom.rageDuration) + 's' }
      ];
    }
  }

  // SCP-049: Plague Doctor
  class SCP049 extends SCPBehavior {
    constructor() {
      super('scp049');
    }

    onContain(scp) {
      scp.custom = { infectionSpread: 0, victims: [] };
    }

    tickContained(scp, dt, grid, staff) {
      // Hunt Class-D personnel
      const classDStaff = staff.filter(s => s.type === 'classd');
      classDStaff.forEach(victim => {
        if (Math.hypot(victim.x - scp.x, victim.y - scp.y) < 200) {
          // Move toward Class-D
          const dx = victim.x - scp.x;
          const dy = victim.y - scp.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0) {
            scp.x += (dx / dist) * 25 * dt;
            scp.y += (dy / dist) * 25 * dt;
          }
          // Infect if caught
          if (dist < 30 && !scp.custom.victims.includes(victim)) {
            scp.custom.victims.push(victim);
            victim.infected = true;
            victim.stress += 50;
          }
        }
      });
    }

    getProperties(scp) {
      return [
        { label: 'Infected Personnel', value: scp.custom.victims.length }
      ];
    }
  }

  // SCP-999: Tickle Monster (positive effect)
  class SCP999 extends SCPBehavior {
    constructor() {
      super('scp999');
    }

    onContain(scp) {
      scp.custom = { moraleBuff: true };
    }

    tickContained(scp, dt, grid, staff) {
      // Increase morale of nearby staff
      staff.forEach(s => {
        if (Math.hypot(s.x - scp.x, s.y - scp.y) < 150) {
          s.morale = Math.min(100, s.morale + dt * 5);
          s.stress = Math.max(0, s.stress - dt * 2);
        }
      });
    }

    getProperties(scp) {
      return [
        { label: 'Effect', value: 'Morale +5/s in range' }
      ];
    }
  }

  // SCP-682: Hard-to-Destroy Reptile (destructive)
  class SCP682 extends SCPBehavior {
    constructor() {
      super('scp682');
    }

    onContain(scp) {
      scp.custom = { wallDamage: 0, adaptationLevel: 1 };
    }

    tickContained(scp, dt, grid, staff) {
      // Slowly damage containment
      scp.custom.wallDamage += dt * 0.5;

      // Breach if damage too high
      if (scp.custom.wallDamage > 100) {
        scp.breached = true;
        scp.custom.wallDamage = 0;
      }

      // Increase adaptation
      scp.custom.adaptationLevel = Math.min(10, scp.custom.adaptationLevel + dt * 0.1);
    }

    tickBreach(scp, dt, grid, staff) {
      // Actively destroy nearby cells
      const cellRow = Math.floor(scp.y / 40);
      const cellCol = Math.floor(scp.x / 40);
      if (grid[cellRow] && grid[cellRow][cellCol]) {
        grid[cellRow][cellCol].health = Math.max(0, (grid[cellRow][cellCol].health || 100) - dt * 2);
      }
    }

    getProperties(scp) {
      return [
        { label: 'Containment Damage', value: Math.floor(scp.custom.wallDamage) + '%' },
        { label: 'Adaptation Level', value: scp.custom.adaptationLevel.toFixed(1) }
      ];
    }
  }

  // SCP-131: Eye Pods (safe, low threat)
  class SCP131 extends SCPBehavior {
    constructor() {
      super('scp131');
    }

    onContain(scp) {
      scp.custom = { behavior: 'curious' };
    }

    tickContained(scp, dt, grid, staff) {
      // Occasionally move around curiously
      if (Math.random() < 0.005) {
        scp.x += (Math.random() - 0.5) * 100;
        scp.y += (Math.random() - 0.5) * 100;
      }
    }

    getProperties(scp) {
      return [
        { label: 'Behavior', value: 'Docile' }
      ];
    }
  }

  // Registry
  const behaviors = {
    scp173: new SCP173(),
    scp096: new SCP096(),
    scp049: new SCP049(),
    scp999: new SCP999(),
    scp682: new SCP682(),
    scp131: new SCP131()
  };

  /**
   * Register a new SCP behavior.
   */
  function registerBehavior(scpId, behaviorClass) {
    behaviors[scpId] = new behaviorClass();
  }

  /**
   * Get behavior for an SCP.
   */
  function getBehavior(scpId) {
    return behaviors[scpId] || null;
  }

  return {
    SCPBehavior,
    registerBehavior,
    getBehavior,
    behaviors
  };
})();