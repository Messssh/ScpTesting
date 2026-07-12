/**
 * INTEGRATION_LAYER.JS
 * Connects all simulation systems to the main game loop.
 * Maintains backward compatibility with existing save system.
 */

const IntegrationLayer = (() => {
  'use strict';

  class SimulationManager {
    constructor(gameState, ROOMS, STAFF) {
      this.gameState = gameState;
      this.ROOMS = ROOMS;
      this.STAFF = STAFF;

      // Initialize all subsystems
      this.npcSystem = NPCSystem;
      this.powerSystem = PowerSystem;
      this.scpBehaviors = SCPBehaviors;
      this.researchTree = new ResearchTree.ResearchManager();
      this.eventsSystem = new EventsSystem.EventsManager();
      this.incidentLog = new IncidentReporting.IncidentLog();
      this.lockdownSystem = new DoorLockdownSystem.LockdownSystem();
      this.statistics = new FacilityStatistics.StatisticsTracker();

      // NPC instances (converted from old staff system)
      this.npcs = [];
      this.convertLegacyStaff();

      // Event tracking
      this.lastEventCheck = performance.now();
      this.eventCheckInterval = 1000; // Check for random events every 1s
    }

    /**
     * Convert legacy staff dots to new NPC system.
     */
    convertLegacyStaff() {
      this.gameState.staff.forEach(oldStaff => {
        const npc = new this.npcSystem.NPC(
          oldStaff.type,
          oldStaff.x,
          oldStaff.y,
          oldStaff.name || this.npcSystem.generateName(oldStaff.type)
        );
        // Copy over old properties
        npc.injured = oldStaff.injured || false;
        npc.hp = oldStaff.hp || 100;
        npc.health = oldStaff.hp || 100;
        npc.path = oldStaff.path;
        npc.pathIndex = oldStaff.pathIndex;
        npc.state = oldStaff.state;
        npc.job = oldStaff.job;
        npc.speed = oldStaff.speed;
        this.npcs.push(npc);
      });
    }

    /**
     * Main simulation tick. Called every game frame.
     */
    tick(dt) {
      // Cap dt to prevent huge jumps
      dt = Math.min(dt, 0.1);

      // 1. Update NPC needs and behaviors
      this.tickNPCs(dt);

      // 2. Compute power system
      const powerState = PowerSystem.computePower(
        this.gameState.grid,
        this.gameState.batteryCharge,
        this.ROOMS
      );
      this.gameState.power = powerState;
      this.gameState.batteryCharge = powerState.batteryCharge;

      // 3. Degrade rooms
      PowerSystem.degradeRooms(this.gameState.grid, this.ROOMS);

      // 4. Tick SCP behaviors
      this.tickSCPBehaviors(dt);

      // 5. Tick research
      this.researchTree.tick(dt);

      // 6. Tick events and check for new random events
      this.eventsSystem.tick(dt);
      this.checkForRandomEvents();
      this.applyActiveEventEffects();

      // 7. Tick doors and lockdown
      this.lockdownSystem.tick(dt);

      // 8. Update statistics
      this.statistics.update(this.gameState, this.gameState.power, this.eventsSystem);

      // 9. Apply NPC productivity to income
      this.updateIncome();

      // 10. Handle casualties and staff death
      this.cleanupDeadStaff();
    }

    /**
     * Tick all NPCs.
     */
    tickNPCs(dt) {
      this.npcs.forEach(npc => {
        npc.tick(dt);

        // Assign jobs based on needs
        const need = npc.getPriorityNeed();
        if (need === 'rest') {
          npc.assignJob(this.npcSystem.JOB_ENUM.RESTING);
        } else if (need === 'food') {
          npc.assignJob(this.npcSystem.JOB_ENUM.EATING);
        } else if (need === 'medical') {
          npc.assignJob(this.npcSystem.JOB_ENUM.HEALING);
        }

        // Role-specific behavior
        this.tickNPCRole(npc, dt);
      });
    }

    /**
     * Tick NPC-specific job logic.
     */
    tickNPCRole(npc, dt) {
      switch (npc.type) {
        case 'scientist':
          if (npc.isAvailable() && npc.job === this.npcSystem.JOB_ENUM.IDLE) {
            // Find an SCP to research
            const scp = this.gameState.scps.find(s => !s.breached && !s.researching);
            if (scp) {
              npc.assignJob(this.npcSystem.JOB_ENUM.RESEARCHING, scp);
              scp.researching = true;
            }
          }
          break;

        case 'security':
          // Patrol and detect breaches
          if (npc.isAvailable() && npc.job === this.npcSystem.JOB_ENUM.IDLE) {
            npc.assignJob(this.npcSystem.JOB_ENUM.PATROLLING);
          }
          break;

        case 'engineer':
          // Find damaged rooms to repair
          if (npc.isAvailable() && npc.job === this.npcSystem.JOB_ENUM.IDLE) {
            const damagedRoom = this.findDamagedRoom();
            if (damagedRoom) {
              npc.assignJob(this.npcSystem.JOB_ENUM.REPAIRING, damagedRoom);
            }
          }
          break;

        case 'doctor':
          // Find injured staff to heal
          if (npc.isAvailable() && npc.job === this.npcSystem.JOB_ENUM.IDLE) {
            const injured = this.npcs.find(s => s.health < 100 && s !== npc);
            if (injured) {
              npc.assignJob(this.npcSystem.JOB_ENUM.HEALING, injured);
            }
          }
          break;

        case 'classd':
          // Stay in holding or do testing
          if (npc.job === this.npcSystem.JOB_ENUM.IDLE) {
            npc.assignJob(this.npcSystem.JOB_ENUM.WAITING);
          }
          break;

        case 'mtf':
          // Deploy during emergencies
          if (this.lockdownSystem.lockdownActive) {
            npc.assignJob(this.npcSystem.JOB_ENUM.DEPLOYING);
          } else if (npc.job === this.npcSystem.JOB_ENUM.IDLE) {
            npc.assignJob(this.npcSystem.JOB_ENUM.WAITING);
          }
          break;
      }
    }

    /**
     * Find a damaged room that needs repairs.
     */
    findDamagedRoom() {
      for (let r = 0; r < this.gameState.grid.length; r++) {
        for (let c = 0; c < this.gameState.grid[r].length; c++) {
          const cell = this.gameState.grid[r][c];
          if (cell && (cell.health || 100) < 70) {
            return { row: r, col: c, cell };
          }
        }
      }
      return null;
    }

    /**
     * Tick SCP behavior systems.
     */
    tickSCPBehaviors(dt) {
      this.gameState.scps.forEach(scp => {
        const behavior = this.scpBehaviors.getBehavior(scp.scpId);
        if (behavior) {
          if (scp.breached) {
            behavior.tickBreach(scp, dt, this.gameState.grid, this.npcs);
          } else {
            behavior.tickContained(scp, dt, this.gameState.grid, this.npcs);
          }
        }
      });
    }

    /**
     * Check for random facility events.
     */
    checkForRandomEvents() {
      const now = performance.now();
      if (now - this.lastEventCheck > this.eventCheckInterval) {
        this.lastEventCheck = now;

        // Small chance of random event
        if (Math.random() < 0.01) { // 1% chance per second
          const event = this.eventsSystem.triggerRandomEvent();
          console.log(`Event triggered: ${event.getName()}`);
        }
      }
    }

    /**
     * Apply active event effects to the facility.
     */
    applyActiveEventEffects() {
      const activeEvents = this.eventsSystem.getActive();
      activeEvents.forEach(event => {
        this.eventsSystem.applyEffects(event, this.gameState.grid, this.npcs, this.gameState);
      });
    }

    /**
     * Update income based on NPC productivity.
     */
    updateIncome() {
      let income = 0;
      this.npcs.forEach(npc => {
        if (npc.type === 'scientist' && npc.job === this.npcSystem.JOB_ENUM.RESEARCHING) {
          income += 5 * npc.getProductivity();
        }
      });

      // SCP income
      this.gameState.scps.forEach(scp => {
        if (!scp.breached) {
          const scpDef = this.gameState.scps.find(s => s.scpId === scp.scpId);
          if (scpDef) {
            income += scpDef.income * 0.01; // Per tick basis
          }
        }
      });

      return income;
    }

    /**
     * Remove dead staff from the simulation.
     */
    cleanupDeadStaff() {
      this.npcs = this.npcs.filter(npc => npc.health > 0);
      this.gameState.staff = this.gameState.staff.filter(s => s.hp > 0 || s.health > 0);
    }

    /**
     * Trigger a breach of an SCP.
     */
    triggerBreach(scpId) {
      const scp = this.gameState.scps.find(s => s.scpId === scpId && !s.breached);
      if (scp) {
        scp.breached = true;
        this.lockdownSystem.escalate();
        const report = this.incidentLog.record(
          IncidentReporting.INCIDENT_TYPES.BREACH,
          `SCP containment failure`,
          [scpId]
        );
        return report;
      }
      return null;
    }

    /**
     * Handle a recontainment action.
     */
    recontainSCP(scpId) {
      const scp = this.gameState.scps.find(s => s.scpId === scpId && s.breached);
      if (scp) {
        scp.breached = false;
        // Check if all breaches are resolved
        const anyBreached = this.gameState.scps.some(s => s.breached);
        if (!anyBreached) {
          this.lockdownSystem.deactivateLockdown();
        }
        return true;
      }
      return false;
    }

    /**
     * Serialize simulation state for save.
     */
    serialize() {
      return {
        npcs: this.npcs.map(npc => ({
          id: npc.id,
          name: npc.name,
          type: npc.type,
          x: npc.x,
          y: npc.y,
          energy: npc.energy,
          hunger: npc.hunger,
          stress: npc.stress,
          health: npc.health,
          morale: npc.morale,
          job: npc.job
        })),
        researchCompleted: this.researchTree.completed,
        statistics: {
          casualties: this.statistics.casualties,
          totalIncome: this.statistics.totalIncome,
          scpBreaches: this.statistics.scpBreaches
        }
      };
    }

    /**
     * Deserialize simulation state from save.
     */
    deserialize(data) {
      if (!data) return;
      if (data.researchCompleted) {
        this.researchTree.completed = data.researchCompleted;
      }
      // NPC data would be reconstructed from gameState.staff
    }
  }

  return {
    SimulationManager
  };
})();