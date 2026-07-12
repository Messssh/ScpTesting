/**
 * FACILITY_STATISTICS.JS
 * Comprehensive facility statistics and analysis panel.
 */

const FacilityStatistics = (() => {
  'use strict';

  class StatisticsTracker {
    constructor() {
      this.totalStaff = 0;
      this.totalSCPs = 0;
      this.casualties = 0;
      this.researchCompleted = 0;
      this.totalIncome = 0;
      this.totalExpenses = 0;
      this.containmentRating = 100;
      this.powerUsage = 0;
      this.facilityEfficiency = 100;
      this.activeEmergencies = 0;
      this.breachesHandled = 0;
      this.averageStaffMorale = 100;
      this.staffTurnover = 0;
      this.scpBreaches = 0;
      this.uptime = 100;
    }

    /**
     * Update statistics based on current game state.
     */
    update(state, power, events) {
      // Staff count
      this.totalStaff = state.staff.length;
      const alive = state.staff.filter(s => s.health > 0).length;
      this.casualties = this.totalStaff - alive;

      // SCP count
      this.totalSCPs = state.scps.length;
      this.scpBreaches = state.scps.filter(s => s.breached).length;

      // Money
      this.totalIncome = state.money > 0 ? state.money : 0;

      // Power
      this.powerUsage = power.demand;
      if (power.deficit > 0) {
        this.uptime = Math.max(0, this.uptime - 0.1);
      } else {
        this.uptime = Math.min(100, this.uptime + 0.05);
      }

      // Events
      this.activeEmergencies = events.getActive().length;

      // Efficiency
      this.facilityEfficiency = this._calculateEfficiency();
      this.containmentRating = this._calculateContainmentRating();
      this.averageStaffMorale = this._calculateAverageMorale(state);
    }

    /**
     * Calculate facility efficiency based on power and staffing.
     */
    _calculateEfficiency() {
      const baseEfficiency = 100;
      const staffFactor = this.totalStaff > 0 ? Math.min(1, this.totalStaff / 50) : 0;
      const moraleFactor = this.averageStaffMorale / 100;
      return Math.round(baseEfficiency * (staffFactor * 0.5 + moraleFactor * 0.5));
    }

    /**
     * Calculate containment rating based on SCPs and breaches.
     */
    _calculateContainmentRating() {
      let rating = 100;
      rating -= this.scpBreaches * 10;
      const totalSCPs = this.totalSCPs || 1;
      rating -= (this.casualties / this.totalStaff) * 50;
      return Math.max(0, Math.min(100, rating));
    }

    /**
     * Calculate average staff morale.
     */
    _calculateAverageMorale(state) {
      if (state.staff.length === 0) return 100;
      const total = state.staff.reduce((sum, s) => sum + (s.morale || 100), 0);
      return Math.round(total / state.staff.length);
    }

    /**
     * Get human-readable statistics report.
     */
    getReport() {
      return {
        'Active Staff': this.totalStaff,
        'Casualties': this.casualties,
        'Contained SCPs': Math.max(0, this.totalSCPs - this.scpBreaches),
        'Breached SCPs': this.scpBreaches,
        'Research Completed': this.researchCompleted,
        'Facility Efficiency': this.facilityEfficiency + '%',
        'Containment Rating': this.containmentRating + '%',
        'Power Usage': this.powerUsage.toFixed(1) + ' MW',
        'Facility Uptime': this.uptime.toFixed(1) + '%',
        'Average Staff Morale': this.averageStaffMorale + '%',
        'Active Emergencies': this.activeEmergencies
      };
    }

    /**
     * Get risk assessment level.
     */
    getRiskLevel() {
      if (this.containmentRating >= 80) return 'LOW';
      if (this.containmentRating >= 60) return 'MODERATE';
      if (this.containmentRating >= 40) return 'HIGH';
      return 'CRITICAL';
    }
  }

  return {
    StatisticsTracker
  };
})();