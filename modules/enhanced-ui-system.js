/**
 * ENHANCED_UI_SYSTEM.JS
 * Tooltip system, control panels, and interactive UI enhancements
 */

const EnhancedUI = (() => {
  'use strict';

  /**
   * Initialize tooltip system
   */
  function initTooltips() {
    const tooltipEl = document.createElement('div');
    tooltipEl.id = 'ui-tooltip';
    tooltipEl.style.cssText = `
      position: fixed;
      background: var(--panel-2);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 11px;
      color: var(--text);
      display: none;
      z-index: 1000;
      max-width: 200px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      pointer-events: none;
      white-space: normal;
    `;
    document.body.appendChild(tooltipEl);

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (!target) {
        tooltipEl.style.display = 'none';
        return;
      }

      const text = target.dataset.tooltip;
      tooltipEl.textContent = text;
      tooltipEl.style.display = 'block';

      const rect = target.getBoundingClientRect();
      tooltipEl.style.left = Math.max(0, rect.left) + 'px';
      tooltipEl.style.top = (rect.bottom + 8) + 'px';
    });

    document.addEventListener('mouseout', () => {
      tooltipEl.style.display = 'none';
    });

    return tooltipEl;
  }

  /**
   * Create pause and speed controls in topbar
   */
  function createGameControls(simulationEngine) {
    const topbar = document.getElementById('topbar');

    const controlBar = document.createElement('div');
    controlBar.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
      margin-left: auto;
      margin-right: 20px;
    `;

    // Pause button
    const pauseBtn = document.createElement('button');
    pauseBtn.textContent = '⏸ Pause';
    pauseBtn.style.cssText = `
      padding: 6px 10px;
      background: var(--panel-2);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 11px;
      font-weight: 600;
      transition: all 0.15s;
    `;
    pauseBtn.addEventListener('click', () => {
      const paused = simulationEngine.togglePause();
      pauseBtn.textContent = paused ? '▶ Resume' : '⏸ Pause';
      pauseBtn.style.color = paused ? 'var(--accent)' : 'var(--text-muted)';
    });

    // Speed label
    const speedLabel = document.createElement('span');
    speedLabel.textContent = 'Speed:';
    speedLabel.style.cssText = `
      font-size: 11px;
      color: var(--text-muted);
      margin-left: 8px;
    `;

    // Speed buttons
    const speeds = [0.5, 1, 2, 4];
    const speedBtns = speeds.map(speed => {
      const btn = document.createElement('button');
      btn.textContent = `${speed}x`;
      btn.style.cssText = `
        padding: 6px 8px;
        background: ${speed === 1 ? 'var(--accent)' : 'var(--panel-2)'};
        color: ${speed === 1 ? 'black' : 'var(--text-muted)'};
        border: 1px solid var(--border);
        border-radius: 4px;
        cursor: pointer;
        font-size: 10px;
        font-weight: 600;
        transition: all 0.15s;
      `;
      btn.addEventListener('click', () => {
        simulationEngine.setGameSpeed(speed);
        speedBtns.forEach(b => {
          b.style.background = b === btn ? 'var(--accent)' : 'var(--panel-2)';
          b.style.color = b === btn ? 'black' : 'var(--text-muted)';
        });
      });
      return btn;
    });

    controlBar.appendChild(pauseBtn);
    controlBar.appendChild(speedLabel);
    speedBtns.forEach(btn => controlBar.appendChild(btn));

    // Insert before stat-cluster
    const statCluster = topbar.querySelector('.stat-cluster');
    topbar.insertBefore(controlBar, statCluster);

    return { pauseBtn, speedBtns };
  }

  /**
   * Add tooltips to UI elements
   */
  function addTooltips() {
    const tooltips = {
      '#room-list': 'Select a room to build. Click a grid cell to place it.',
      '#staff-list': 'Hire personnel to run your facility.',
      '#scp-lists': 'Manage contained anomalies. Research to unlock new ones.',
      '#research-panel': 'Research new technologies and upgrades.',
      '#power-room-list': 'Monitor power generation and distribution.',
      '#demolish-btn': 'Reclaim 50% of a room\'s cost. Click to enable, then click a room to demolish.',
      '#save-btn': 'Save your facility to browser storage.',
      '#reset-btn': 'Start a new game from scratch.',
      '#status-pill': 'Facility status indicator.',
      '#overlay-btn': 'Toggle power grid visualization overlay.',
    };

    Object.entries(tooltips).forEach(([selector, text]) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute('data-tooltip', text);
    });
  }

  /**
   * Create status indicator banner
   */
  function updateStatusBanner(gameState, power) {
    const statusPill = document.getElementById('status-pill');
    const statusText = document.getElementById('status-text');

    if (gameState.scps.some(s => s.breached)) {
      statusPill.className = 'status-pill breach';
      statusText.textContent = 'BREACH ALERT';
    } else if (power.deficit > 0) {
      statusPill.className = 'status-pill warn';
      statusText.textContent = 'POWER CRISIS';
    } else {
      statusPill.className = 'status-pill';
      statusText.textContent = 'Operational';
    }
  }

  /**
   * Show floating notification
   */
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: var(--panel-2);
      border: 1px solid var(--border);
      border-left: 3px solid ${type === 'error' ? 'var(--danger)' : type === 'success' ? 'var(--good)' : 'var(--accent)'};
      border-radius: 4px;
      padding: 12px 16px;
      color: var(--text);
      font-size: 12px;
      z-index: 500;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Create quick stats panel
   */
  function createQuickStats(gameState, power, statistics) {
    const panel = document.createElement('div');
    panel.id = 'quick-stats-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      width: 280px;
      font-size: 11px;
      color: var(--text-muted);
      z-index: 100;
      display: none;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      max-height: 400px;
      overflow-y: auto;
    `;

    const title = document.createElement('h4');
    title.style.cssText = `
      margin: 0 0 12px 0;
      color: var(--text);
      font-size: 12px;
    `;
    title.textContent = '📊 Quick Stats';
    panel.appendChild(title);

    const updateStats = () => {
      const statsHtml = `
        <div style="display: grid; gap: 8px;">
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-soft);">
            <span>Staff:</span>
            <span style="color: var(--text);">${gameState.staff.length}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-soft);">
            <span>SCPs Contained:</span>
            <span style="color: var(--text);">${gameState.scps.filter(s => !s.breached).length}/${gameState.scps.length}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-soft);">
            <span>Power Supply:</span>
            <span style="color: ${power.deficit > 0 ? 'var(--danger)' : 'var(--good)'};">${power.supply.toFixed(1)}MW</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-soft);">
            <span>Power Demand:</span>
            <span style="color: var(--text);">${power.demand.toFixed(1)}MW</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-soft);">
            <span>Battery Charge:</span>
            <span style="color: var(--accent-2);">${power.batteryCharge.toFixed(0)}/${power.batteryCapacity.toFixed(0)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0;">
            <span>Money:</span>
            <span style="color: var(--accent);">$${Math.round(gameState.money).toLocaleString()}</span>
          </div>
        </div>
      `;
      const statsContent = panel.querySelector('#stats-content');
      if (statsContent) {
        statsContent.innerHTML = statsHtml;
      }
    };

    const statsContent = document.createElement('div');
    statsContent.id = 'stats-content';
    panel.appendChild(statsContent);
    updateStats();

    // Toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--accent);
      color: black;
      border: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      font-size: 20px;
      cursor: pointer;
      z-index: 99;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    toggleBtn.textContent = '📊';
    toggleBtn.addEventListener('click', () => {
      const visible = panel.style.display !== 'none';
      panel.style.display = visible ? 'none' : 'block';
      if (!visible) {
        updateStats();
      }
    });

    document.body.appendChild(panel);
    document.body.appendChild(toggleBtn);

    return { panel, toggleBtn, updateStats };
  }

  return {
    initTooltips,
    createGameControls,
    addTooltips,
    updateStatusBanner,
    showNotification,
    createQuickStats
  };
})();
