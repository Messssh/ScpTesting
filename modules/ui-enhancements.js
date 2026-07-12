/**
 * UI_ENHANCEMENTS.JS
 * Enhanced UI components and panels for new systems.
 */

const UIEnhancements = (() => {
  'use strict';

  /**
   * Render the NPC stats panel.
   */
  function renderNPCPanel(npc) {
    return `
      <div class="npc-detail-panel">
        <h3>${npc.name} - ${npc.type.toUpperCase()}</h3>
        <div class="stat-row">
          <span class="stat-label">Job:</span>
          <span class="stat-value">${npc.job}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Health:</span>
          <div class="health-bar"><div style="width: ${npc.health}%"></div></div>
        </div>
        <div class="stat-row">
          <span class="stat-label">Energy:</span>
          <div class="energy-bar"><div style="width: ${npc.energy}%"></div></div>
        </div>
        <div class="stat-row">
          <span class="stat-label">Hunger:</span>
          <div class="hunger-bar"><div style="width: ${npc.hunger}%"></div></div>
        </div>
        <div class="stat-row">
          <span class="stat-label">Stress:</span>
          <div class="stress-bar"><div style="width: ${npc.stress}%"></div></div>
        </div>
        <div class="stat-row">
          <span class="stat-label">Morale:</span>
          <div class="morale-bar"><div style="width: ${npc.morale}%"></div></div>
        </div>
        <div class="stat-row">
          <span class="stat-label">Productivity:</span>
          <span class="stat-value">${(npc.getProductivity() * 100).toFixed(0)}%</span>
        </div>
      </div>
    `;
  }

  /**
   * Render the statistics dashboard.
   */
  function renderStatisticsDashboard(stats) {
    const report = stats.getReport();
    let html = '<div class="statistics-dashboard">';
    html += `<h2>Facility Statistics - Risk Level: ${stats.getRiskLevel()}</h2>`;
    html += '<div class="stats-grid">';

    for (const [label, value] of Object.entries(report)) {
      html += `
        <div class="stat-card">
          <span class="stat-label">${label}</span>
          <span class="stat-value">${value}</span>
        </div>
      `;
    }

    html += '</div></div>';
    return html;
  }

  /**
   * Render the research tree view.
   */
  function renderResearchTree(manager) {
    const available = manager.getAvailable();
    const current = manager.currentResearch ? manager.nodes.get(manager.currentResearch) : null;

    let html = '<div class="research-panel">';

    if (current) {
      html += `
        <div class="current-research">
          <h4>Currently Researching</h4>
          <p>${current.name}</p>
          <div class="progress-bar">
            <div style="width: ${current.progress}%"></div>
          </div>
        </div>
      `;
    }

    html += '<h4>Available Research</h4>';
    html += '<div class="research-list">';

    available.forEach(node => {
      html += `
        <div class="research-item">
          <span class="research-name">${node.name}</span>
          <span class="research-cost">${node.cost} pts</span>
          <button onclick="startResearch('${node.id}')">Start</button>
        </div>
      `;
    });

    html += '</div></div>';
    return html;
  }

  /**
   * Render incident log.
   */
  function renderIncidentLog(log) {
    const latest = log.getLatestIncidents(10);
    let html = '<div class="incident-log">';
    html += '<h3>Incident Report Log</h3>';
    html += `<p>Total Casualties: ${log.totalCasualties} | Total Financial Loss: $${log.totalFinancialLoss.toLocaleString()}</p>`;
    html += '<div class="incident-list">';

    latest.forEach(report => {
      html += `
        <div class="incident-item severity-${report.severity}">
          <span class="incident-type">${report.type.toUpperCase()}</span>
          <span class="incident-status">${report.status}</span>
          <p>${report.cause || 'No details'}</p>
        </div>
      `;
    });

    html += '</div></div>';
    return html;
  }

  /**
   * Render events alert.
   */
  function renderEventsAlert(events) {
    const active = events.getActive();
    if (active.length === 0) return '';

    let html = '<div class="events-alert">';
    active.forEach(event => {
      html += `
        <div class="event-alert severity-${event.severity}">
          <strong>${event.getName()}</strong> - ${event.severity.toUpperCase()}
          <span class="time-remaining">${Math.ceil((event.duration - (performance.now() - event.startTime)) / 1000)}s</span>
        </div>
      `;
    });
    html += '</div>';
    return html;
  }

  /**
   * Render lockdown status.
   */
  function renderLockdownStatus(lockdown) {
    const statusColors = {
      'None': '#5ad18a',
      'Yellow Alert': '#f0b23c',
      'Red Alert': '#e0605a',
      'Full Lockdown': '#8b2e2e'
    };

    const status = lockdown.getStatus();
    const color = statusColors[status] || '#ccc';

    return `
      <div class="lockdown-status" style="border-left: 4px solid ${color}">
        <span class="status-label">Facility Status:</span>
        <span class="status-value">${status}</span>
        <span class="doors-locked">${lockdown.doors.size} doors</span>
      </div>
    `;
  }

  return {
    renderNPCPanel,
    renderStatisticsDashboard,
    renderResearchTree,
    renderIncidentLog,
    renderEventsAlert,
    renderLockdownStatus
  };
})();