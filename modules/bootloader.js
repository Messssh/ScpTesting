/**
 * BOOTLOADER.JS
 * Core engine that initializes and integrates all simulation systems
 * Replaces/augments the main game loop
 */

const GameBootstrap = (() => {
  'use strict';

  class SimulationEngine {
    constructor(gameState, ROOMS, STAFF, SCPS) {
      this.gameState = gameState;
      this.ROOMS = ROOMS;
      this.STAFF = STAFF;
      this.SCPS = SCPS;

      // Settings
      this.gamePaused = false;
      this.gameSpeed = 1.0;
      this.debugMode = false;

      // Statistics
      this.tickCount = 0;
      this.incomLastTick = 0;

      console.log('[Bootstrap] Simulation engine initialized');
    }

    /**
     * Main tick - called once per frame
     */
    tick(dt) {
      if (this.gamePaused) return;

      dt *= this.gameSpeed;
      dt = Math.min(dt, 0.1); // Cap to prevent huge jumps

      // Power system computation
      this.tickPower(dt);

      // Room degradation
      this.tickRoomDegradation(dt);

      // SCP behaviors (if system available)
      this.tickSCPs(dt);

      // Income calculation
      this.tickIncome(dt);

      this.tickCount++;
    }

    /**
     * Compute and apply power system
     */
    tickPower(dt) {
      let supply = 20; // BASE_FREE_SUPPLY
      let backupSupply = 0;
      let demand = 0;
      let distributionBonus = 0;

      for (let r = 0; r < this.gameState.grid.length; r++) {
        for (let c = 0; c < this.gameState.grid[r].length; c++) {
          const cell = this.gameState.grid[r][c];
          if (!cell) continue;

          const room = this.ROOMS.find(rm => rm.id === cell.type);
          if (!room) continue;

          const health = cell.health ?? 100;
          const healthMult = health / 100;

          if (room.power < 0) {
            if (room.backup) {
              backupSupply += (-room.power) * healthMult;
            } else {
              supply += (-room.power) * healthMult;
            }
          } else {
            demand += room.power;
            if (room.id === 'electrical') {
              distributionBonus += (room.distributionBonus || 0.1) * healthMult;
            }
          }
        }
      }

      supply *= (1 + distributionBonus);

      let deficit = demand - supply;
      let usedBackup = 0;

      if (deficit > 0) {
        usedBackup = Math.min(deficit, backupSupply);
        supply += usedBackup;
        deficit = demand - supply;
      }

      // Battery system
      let capacity = 0;
      const batteryRoom = this.ROOMS.find(r => r.id === 'battery');
      if (batteryRoom) {
        for (let r = 0; r < this.gameState.grid.length; r++) {
          for (let c = 0; c < this.gameState.grid[r].length; c++) {
            const cell = this.gameState.grid[r][c];
            if (cell && cell.type === 'battery') {
              const health = cell.health ?? 100;
              capacity += (batteryRoom.capacity || 60) * (health / 100);
            }
          }
        }
      }

      if (deficit > 0) {
        const draw = Math.min(deficit, this.gameState.batteryCharge);
        this.gameState.batteryCharge -= draw;
        supply += draw;
        deficit = demand - supply;
      } else {
        const surplus = supply - demand;
        this.gameState.batteryCharge = Math.min(
          capacity,
          this.gameState.batteryCharge + surplus * 0.5
        );
      }

      // Power priority allocation
      const POWER_PRIORITY = {
        electrical: 1, containment: 1, heavy: 1, control: 2, security: 2,
        medical: 2, lab: 3, barracks: 3, holding: 4, engineering: 4,
        office: 5, breakroom: 6, storage: 6, corridor: 0
      };

      if (deficit <= 0) {
        for (let r = 0; r < this.gameState.grid.length; r++) {
          for (let c = 0; c < this.gameState.grid[r].length; c++) {
            const cell = this.gameState.grid[r][c];
            if (cell) cell.powered = true;
          }
        }
      } else {
        let budget = Math.max(0, supply);
        const cells = [];

        for (let r = 0; r < this.gameState.grid.length; r++) {
          for (let c = 0; c < this.gameState.grid[r].length; c++) {
            const cell = this.gameState.grid[r][c];
            if (!cell) continue;
            const room = this.ROOMS.find(rm => rm.id === cell.type);
            if (room) cells.push({ cell, room });
          }
        }

        const consumers = cells
          .filter(o => o.room.power > 0)
          .sort((a, b) => (POWER_PRIORITY[a.room.id] ?? 9) - (POWER_PRIORITY[b.room.id] ?? 9));

        consumers.forEach(o => {
          if (budget >= o.room.power) {
            o.cell.powered = true;
            budget -= o.room.power;
          } else {
            o.cell.powered = false;
          }
        });

        cells.filter(o => o.room.power <= 0).forEach(o => {
          o.cell.powered = true;
        });
      }

      this.gameState.power = {
        supply,
        demand,
        deficit: Math.max(0, deficit),
        batteryCharge: this.gameState.batteryCharge,
        batteryCapacity: capacity,
        backupActive: usedBackup > 0
      };
    }

    /**
     * Degrade rooms over time
     */
    tickRoomDegradation(dt) {
      for (let r = 0; r < this.gameState.grid.length; r++) {
        for (let c = 0; c < this.gameState.grid[r].length; c++) {
          const cell = this.gameState.grid[r][c];
          if (!cell) continue;

          const room = this.ROOMS.find(rm => rm.id === cell.type);
          if (!room) continue;

          let chance = 0.002;
          if (room.power < 0) chance = 0.01;
          if (!cell.powered) chance = 0.03;

          if (Math.random() < chance) {
            cell.health = Math.max(0, (cell.health ?? 100) - (10 + Math.random() * 15));
          }
        }
      }
    }

    /**
     * Tick SCP behaviors
     */
    tickSCPs(dt) {
      // Stub - actual SCP behavior managed in main game loop
    }

    /**
     * Calculate and apply income
     */
    tickIncome(dt) {
      let income = 0;

      // SCP income
      this.gameState.scps.forEach(scp => {
        if (!scp.breached) {
          const scpDef = this.SCPS.find(s => s.id === scp.scpId);
          if (scpDef) {
            income += scpDef.income * dt * 0.01;
          }
        }
      });

      // Scientist research income
      this.gameState.staff.forEach(staff => {
        if (staff.type === 'scientist' && staff.job && staff.job.includes('research')) {
          income += 5 * dt;
        }
      });

      // Upkeep
      const upkeep = this.gameState.staff.length * 4 * dt;
      income -= upkeep;

      this.gameState.money += income;
      this.incomLastTick = income;

      return income;
    }

    /**
     * Pause/resume
     */
    togglePause() {
      this.gamePaused = !this.gamePaused;
      return this.gamePaused;
    }

    /**
     * Set game speed (0.25x to 4x)
     */
    setGameSpeed(factor) {
      this.gameSpeed = Math.max(0.25, Math.min(4, factor));
    }

    /**
     * Serialize state for save
     */
    serialize() {
      return {
        gameState: this.gameState,
        tickCount: this.tickCount
      };
    }

    /**
     * Deserialize from save
     */
    deserialize(data) {
      if (!data) return;
      Object.assign(this.gameState, data.gameState);
      this.tickCount = data.tickCount || 0;
    }
  }

  return {
    SimulationEngine,
    create: (gameState, ROOMS, STAFF, SCPS) => new SimulationEngine(gameState, ROOMS, STAFF, SCPS)
  };
})();
