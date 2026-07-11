/**
 * POWER_SYSTEM.JS
 * Expanded power management with degradation and room shutdowns.
 */

const PowerSystem = (() => {
  'use strict';

  const BASE_FREE_SUPPLY = 20;
  const POWER_PRIORITY = {
    electrical: 1, containment: 1, heavy: 1, control: 2, security: 2, medical: 2,
    lab: 3, barracks: 3, holding: 4, engineering: 4, office: 5, breakroom: 6,
    storage: 6, corridor: 0
  };

  /**
   * Compute power grid status.
   * @param {Array} grid - Game grid
   * @param {number} batteryCharge - Current battery charge
   * @param {Array} ROOMS - Room definitions
   * @returns {Object} Power state
   */
  function computePower(grid, batteryCharge, ROOMS) {
    let supply = BASE_FREE_SUPPLY;
    let backupSupply = 0;
    let demand = 0;
    let distributionBonus = 0;
    const cells = [];

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const cell = grid[r][c];
        if (!cell) continue;

        const room = ROOMS.find(rm => rm.id === cell.type);
        if (!room) continue;

        cells.push({ row: r, col: c, cell, room });
        const health = cell.health || 100;
        const healthMult = health / 100;

        if (room.power < 0) {
          // Power producer
          if (room.backup) {
            backupSupply += (-room.power) * healthMult;
          } else {
            supply += (-room.power) * healthMult;
          }
        } else {
          // Power consumer
          demand += room.power;
          if (room.id === 'electrical') {
            distributionBonus += (room.distributionBonus || 0.1) * healthMult;
          }
        }
      }
    }

    // Apply distribution bonus
    supply *= (1 + distributionBonus);

    let deficit = demand - supply;
    let usedBackup = 0;

    // Use backup generators if deficit
    if (deficit > 0) {
      usedBackup = Math.min(deficit, backupSupply);
      supply += usedBackup;
      deficit = demand - supply;
    }

    // Draw from batteries
    const capacity = calculateBatteryCapacity(grid, ROOMS);
    if (deficit > 0) {
      const draw = Math.min(deficit, batteryCharge);
      batteryCharge -= draw;
      supply += draw;
      deficit = demand - supply;
    } else {
      const surplus = supply - demand;
      batteryCharge = Math.min(capacity, batteryCharge + surplus * 0.5);
    }

    // Allocate power to rooms with priority
    if (deficit <= 0) {
      cells.forEach(({ cell }) => { cell.powered = true; });
    } else {
      let budget = Math.max(0, supply);
      const consumers = cells
        .filter(o => o.room.power > 0)
        .sort((a, b) => (POWER_PRIORITY[a.room.id] || 9) - (POWER_PRIORITY[b.room.id] || 9));

      consumers.forEach(o => {
        if (budget >= o.room.power) {
          o.cell.powered = true;
          budget -= o.room.power;
        } else {
          o.cell.powered = false;
        }
      });

      // Generators and batteries stay powered
      cells.filter(o => o.room.power <= 0).forEach(o => { o.cell.powered = true; });
    }

    return {
      supply,
      demand,
      deficit: Math.max(0, deficit),
      batteryCharge,
      batteryCapacity: capacity,
      backupActive: usedBackup > 0,
      cells
    };
  }

  /**
   * Calculate total battery storage capacity.
   */
  function calculateBatteryCapacity(grid, ROOMS) {
    let cap = 0;
    const room = ROOMS.find(r => r.id === 'battery');
    if (!room) return 0;

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const cell = grid[r][c];
        if (cell && cell.type === 'battery') {
          const health = cell.health || 100;
          cap += (room.capacity || 60) * (health / 100);
        }
      }
    }
    return cap;
  }

  /**
   * Degrade rooms over time, with higher rates for unpowered rooms.
   */
  function degradeRooms(grid, ROOMS) {
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const cell = grid[r][c];
        if (!cell) continue;

        const room = ROOMS.find(rm => rm.id === cell.type);
        if (!room) continue;

        // Base degradation
        let chance = 0.002;

        // Power generators degrade faster
        if (room.power < 0) chance = 0.01;

        // Unpowered rooms degrade much faster
        if (!cell.powered) chance = 0.03;

        // Containment cells with dangerous SCPs degrade faster
        if ((cell.type === 'containment' || cell.type === 'heavy') && cell.occupant) {
          chance += 0.01;
        }

        if (Math.random() < chance) {
          cell.health = Math.max(0, (cell.health || 100) - (10 + Math.random() * 15));
        }
      }
    }
  }

  /**
   * Identify rooms that have failed due to lack of power or damage.
   */
  function getFailedRooms(grid, ROOMS) {
    const failed = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const cell = grid[r][c];
        if (!cell) continue;

        if (!cell.powered || cell.health <= 0) {
          const room = ROOMS.find(rm => rm.id === cell.type);
          if (room) {
            failed.push({ row: r, col: c, room, cell });
          }
        }
      }
    }
    return failed;
  }

  return {
    computePower,
    calculateBatteryCapacity,
    degradeRooms,
    getFailedRooms,
    BASE_FREE_SUPPLY,
    POWER_PRIORITY
  };
})();