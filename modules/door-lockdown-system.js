/**
 * DOOR_LOCKDOWN_SYSTEM.JS
 * Functional doors and facility lockdown mechanics.
 */

const DoorLockdownSystem = (() => {
  'use strict';

  const DOOR_TYPES = {
    STANDARD: 'standard',      // Basic passage
    SECURITY: 'security',      // Restricted areas
    HEAVY: 'heavy',            // Containment zones
    BLAST: 'blast'             // Extreme containment
  };

  const CLEARANCE_LEVELS = {
    PUBLIC: 0,
    STAFF: 1,
    SECURITY: 2,
    RESEARCH: 3,
    SITE_COMMAND: 4,
    O5: 5
  };

  class Door {
    constructor(row, col, type, clearanceLevel) {
      this.id = Math.random().toString(36).substr(2, 9);
      this.row = row;
      this.col = col;
      this.type = type;
      this.clearanceLevel = clearanceLevel;
      this.open = true;
      this.locked = false;
      this.powered = true;
      this.animation = 0; // 0-1 for opening/closing
      this.power = { standard: 1, security: 2, heavy: 4, blast: 6 }[type];
    }

    /**
     * Open the door (if powered and not locked).
     */
    open() {
      if (this.powered && !this.locked) {
        this.open = true;
      }
    }

    /**
     * Close the door (if powered).
     */
    close() {
      if (this.powered) {
        this.open = false;
      }
    }

    /**
     * Lock the door (no movement possible).
     */
    lock() {
      this.locked = true;
    }

    /**
     * Unlock the door.
     */
    unlock() {
      this.locked = false;
    }

    /**
     * Check if staff can pass through.
     */
    canPass(staffMember) {
      if (!this.open) return false;
      if (this.locked) return false;
      return (staffMember.clearance || 0) >= this.clearanceLevel;
    }

    /**
     * Tick door animation and state.
     */
    tick(dt) {
      if (this.open) {
        this.animation = Math.min(1, this.animation + dt * 2);
      } else {
        this.animation = Math.max(0, this.animation - dt * 2);
      }
    }
  }

  class LockdownSystem {
    constructor() {
      this.doors = new Map(); // Map of door IDs
      this.lockdownActive = false;
      this.lockdownLevel = 0; // 0 = none, 1 = yellow, 2 = red, 3 = full
      this.breachesDetected = 0;
      this.lockdownStartTime = null;
      this.checkpointPositions = []; // Hardcoded security checkpoints
    }

    /**
     * Register a door.
     */
    addDoor(door) {
      this.doors.set(door.id, door);
    }

    /**
     * Activate facility lockdown.
     */
    activateLockdown(level = 3) {
      this.lockdownActive = true;
      this.lockdownLevel = level;
      this.lockdownStartTime = performance.now();

      // Close all doors based on lockdown level
      this.doors.forEach(door => {
        if (level >= 2 && door.type !== 'standard') {
          door.lock();
          door.close();
        }
        if (level >= 3) {
          door.lock();
          door.close();
        }
      });
    }

    /**
     * Deactivate lockdown.
     */
    deactivateLockdown() {
      this.lockdownActive = false;
      this.lockdownLevel = 0;
      this.breachesDetected = 0;

      // Unlock all doors
      this.doors.forEach(door => {
        door.unlock();
        door.open();
      });
    }

    /**
     * Escalate lockdown level (yellow -> red -> full).
     */
    escalate() {
      if (this.lockdownLevel < 3) {
        this.activateLockdown(this.lockdownLevel + 1);
      }
    }

    /**
     * Get doors by type.
     */
    getDoorsByType(type) {
      const result = [];
      this.doors.forEach(door => {
        if (door.type === type) result.push(door);
      });
      return result;
    }

    /**
     * Get doors in a specific area.
     */
    getDoorsInArea(row, col, radius) {
      const result = [];
      this.doors.forEach(door => {
        if (Math.hypot(door.row - row, door.col - col) <= radius) {
          result.push(door);
        }
      });
      return result;
    }

    /**
     * Tick all doors.
     */
    tick(dt) {
      this.doors.forEach(door => door.tick(dt));
    }

    /**
     * Get lockdown status.
     */
    getStatus() {
      const levels = ['None', 'Yellow Alert', 'Red Alert', 'Full Lockdown'];
      return levels[this.lockdownLevel];
    }
  }

  return {
    DOOR_TYPES,
    CLEARANCE_LEVELS,
    Door,
    LockdownSystem
  };
})();