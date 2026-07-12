/**
 * ENHANCED_INDEX_INTEGRATION.JS
 * Adapter code to integrate new systems with existing index.html
 * Place this at the end of the main script, after all existing code.
 */

// Initialize simulation manager after DOM is ready
function initializeSimulationSystems() {
  if (typeof IntegrationLayer === 'undefined') {
    console.error('SimulationManager not loaded');
    return;
  }

  // Create simulation manager instance
  window.simulationManager = new IntegrationLayer.SimulationManager(
    state,
    ROOMS,
    STAFF
  );

  console.log('✓ Simulation systems initialized');
}

// Hook into main game loop
const originalGameLoop = window.gameLoop || (() => {});

function enhancedGameLoop(now) {
  const dt = (now - state.lastFrame) / 1000;
  state.lastFrame = now;

  // Run original game loop
  if (originalGameLoop) {
    originalGameLoop(now);
  }

  // Run new simulation systems
  if (window.simulationManager) {
    window.simulationManager.tick(dt);
  }

  requestAnimationFrame(enhancedGameLoop);
}

// Hook into save system
const originalSave = window.saveGame || (() => {});

function enhancedSave() {
  if (originalSave) originalSave();

  // Save simulation state
  if (window.simulationManager) {
    const simData = window.simulationManager.serialize();
    const saveData = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    saveData.simulation = simData;
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    console.log('✓ Simulation state saved');
  }
}

// Hook into load system
const originalLoad = window.loadGame || (() => {});

function enhancedLoad() {
  if (originalLoad) originalLoad();

  // Load simulation state
  if (window.simulationManager) {
    const saveData = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    if (saveData.simulation) {
      window.simulationManager.deserialize(saveData.simulation);
      console.log('✓ Simulation state loaded');
    }
  }
}

// Replace global functions
window.gameLoop = enhancedGameLoop;
window.saveGame = enhancedSave;
window.loadGame = enhancedLoad;

// Auto-initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSimulationSystems);
} else {
  initializeSimulationSystems();
}