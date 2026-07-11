/**
 * INCIDENT_REPORTING.JS
 * Generate and track incident reports for major facility events.
 */

const IncidentReporting = (() => {
  'use strict';

  const INCIDENT_TYPES = {
    BREACH: 'breach',
    CASUALTY: 'casualty',
    FIRE: 'fire',
    POWER_FAILURE: 'power_failure',
    PROPERTY_DAMAGE: 'property_damage',
    UNAUTHORIZED_ACCESS: 'unauthorized_access',
    EXPERIMENT_FAILURE: 'experiment_failure'
  };

  class IncidentReport {
    constructor(type, timestamp) {
      this.id = Math.random().toString(36).substr(2, 9);
      this.type = type;
      this.timestamp = timestamp;
      this.day = 1;
      this.scps_involved = [];
      this.casualties = 0;
      this.property_damage = 0;
      this.financial_cost = 0;
      this.time_to_recontain = 0;
      this.cause = '';
      this.severity = 'minor'; // minor, moderate, severe, critical
      this.status = 'ongoing'; // ongoing, resolved
    }

    /**
     * Get human-readable summary.
     */
    getSummary() {
      return `[Day ${this.day}] ${this.type.toUpperCase()}: ${this.cause || 'Unknown cause'} | ` +
        `Cost: $${this.financial_cost.toLocaleString()} | Casualties: ${this.casualties}`;
    }
  }

  class IncidentLog {
    constructor() {
      this.reports = [];
      this.totalCasualties = 0;
      this.totalFinancialLoss = 0;
    }

    /**
     * Record a new incident.
     */
    record(type, cause = '', scpsInvolved = []) {
      const report = new IncidentReport(type, performance.now());
      report.cause = cause;
      report.scps_involved = scpsInvolved;
      this.reports.push(report);
      return report;
    }

    /**
     * Close an incident and calculate final costs.
     */
    closeIncident(reportId, casualties = 0, damage = 0, cost = 0, recontainTime = 0) {
      const report = this.reports.find(r => r.id === reportId);
      if (report) {
        report.status = 'resolved';
        report.casualties = casualties;
        report.property_damage = damage;
        report.financial_cost = cost;
        report.time_to_recontain = recontainTime;
        this.totalCasualties += casualties;
        this.totalFinancialLoss += cost;
      }
    }

    /**
     * Get all open incidents.
     */
    getOpenIncidents() {
      return this.reports.filter(r => r.status === 'ongoing');
    }

    /**
     * Get latest incidents.
     */
    getLatestIncidents(count = 10) {
      return this.reports.slice(-count);
    }
  }

  return {
    INCIDENT_TYPES,
    IncidentReport,
    IncidentLog
  };
})();