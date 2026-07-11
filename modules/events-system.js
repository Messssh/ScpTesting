/**
 * EVENTS_SYSTEM.JS
 * Random facility events and emergencies.
 */

const EventsSystem = (() => {
  'use strict';

  const EVENT_TYPES = {
    POWER_FAILURE: 'power_failure',
    FIRE: 'fire',
    CLASSD_RIOT: 'classd_riot',
    FOUNDATION_INSPECTION: 'foundation_inspection',
    GENERATOR_EXPLOSION: 'generator_explosion',
    EARTHQUAKE: 'earthquake',
    GAS_LEAK: 'gas_leak',
    UNKNOWN_ANOMALY: 'unknown_anomaly',
    MULTI_BREACH: 'multi_breach'
  };

  class FacilityEvent {
    constructor(type, severity = 'moderate') {
      this.id = Math.random().toString(36).substr(2, 9);
      this.type = type;
      this.severity = severity; // low, moderate, high, critical
      this.active = true;
      this.startTime = performance.now();
      this.duration = 30000; // milliseconds
      this.affectedAreas = []; // Grid cells affected
      this.effects = {}; // Custom effects by event type
    }

    /**
     * Check if event is still active.
     */
    isActive() {
      return performance.now() - this.startTime < this.duration;
    }

    /**
     * Get human-readable name.
     */
    getName() {
      const names = {
        power_failure: 'Power Grid Failure',
        fire: 'Facility Fire',
        classd_riot: 'Class-D Riot',
        foundation_inspection: 'Foundation Inspection',
        generator_explosion: 'Generator Explosion',
        earthquake: 'Seismic Event',
        gas_leak: 'Hazardous Gas Leak',
        unknown_anomaly: 'Unknown Anomaly Detected',
        multi_breach: 'Multiple Containment Breach'
      };
      return names[this.type] || 'Unknown Event';
    }
  }

  class EventsManager {
    constructor() {
      this.events = [];
      this.history = [];
      this.eventFrequency = 0.0001; // Chance per tick of random event
    }

    /**
     * Trigger a random event.
     */
    triggerRandomEvent() {
      const eventTypes = Object.values(EVENT_TYPES);
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const severity = ['low', 'moderate', 'high', 'critical'][Math.floor(Math.random() * 4)];
      return this.triggerEvent(type, severity);
    }

    /**
     * Trigger a specific event.
     */
    triggerEvent(type, severity = 'moderate') {
      const event = new FacilityEvent(type, severity);

      // Set duration and effects based on severity
      const durationMap = { low: 15000, moderate: 30000, high: 45000, critical: 60000 };
      event.duration = durationMap[severity] || 30000;

      this.events.push(event);
      this.history.push(event);
      return event;
    }

    /**
     * Apply event effects to the facility.
     */
    applyEffects(event, grid, staff, state) {
      switch (event.type) {
        case EVENT_TYPES.POWER_FAILURE:
          this._powerFailure(event, grid);
          break;
        case EVENT_TYPES.FIRE:
          this._fire(event, grid);
          break;
        case EVENT_TYPES.CLASSD_RIOT:
          this._classDBreach(event, grid, staff);
          break;
        case EVENT_TYPES.GENERATOR_EXPLOSION:
          this._generatorExplosion(event, grid);
          break;
        case EVENT_TYPES.EARTHQUAKE:
          this._earthquake(event, grid);
          break;
        case EVENT_TYPES.GAS_LEAK:
          this._gasLeak(event, grid, staff);
          break;
        case EVENT_TYPES.MULTI_BREACH:
          this._multiBreaches(event, state);
          break;
      }
    }

    /**
     * Tick all active events.
     */
    tick(dt) {
      this.events = this.events.filter(e => {
        if (!e.isActive()) {
          e.active = false;
          return false;
        }
        return true;
      });
    }

    // Event-specific implementations
    _powerFailure(event, grid) {
      // Shut down all power
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          if (grid[r][c]) grid[r][c].powered = false;
        }
      }
    }

    _fire(event, grid) {
      // Random cells catch fire
      for (let i = 0; i < 5; i++) {
        const r = Math.floor(Math.random() * grid.length);
        const c = Math.floor(Math.random() * grid[r].length);
        if (grid[r][c]) {
          grid[r][c].onFire = true;
          grid[r][c].health = Math.max(0, grid[r][c].health - 50);
        }
      }
    }

    _classDBreach(event, grid, staff) {
      // Class-D become hostile
      staff.forEach(s => {
        if (s.type === 'classd') {
          s.job = 'rioting';
          s.state = 'aggressive';
          s.stress = 100;
        }
      });
    }

    _generatorExplosion(event, grid) {
      // Find a generator and destroy it
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          if (grid[r][c] && grid[r][c].type === 'generator') {
            grid[r][c].health = 0;
            grid[r][c].onFire = true;
            return; // Only one generator explodes
          }
        }
      }
    }

    _earthquake(event, grid) {
      // Random structural damage
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          if (grid[r][c] && Math.random() < 0.1) {
            grid[r][c].health = Math.max(0, grid[r][c].health - 30);
          }
        }
      }
    }

    _gasLeak(event, grid, staff) {
      // Staff take damage
      staff.forEach(s => {
        s.health = Math.max(0, s.health - 10);
        s.stress += 30;
      });
    }

    _multiBreaches(event, state) {
      // Trigger multiple SCP breaches
      const numBreaches = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numBreaches; i++) {
        const scp = state.scps[Math.floor(Math.random() * state.scps.length)];
        if (scp && !scp.breached) {
          scp.breached = true;
        }
      }
    }

    /**
     * Get active events.
     */
    getActive() {
      return this.events.filter(e => e.active);
    }

    /**
     * Get latest events.
     */
    getLatestEvents(count = 5) {
      return this.history.slice(-count);
    }
  }

  return {
    EVENT_TYPES,
    FacilityEvent,
    EventsManager
  };
})();