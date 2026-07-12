/**
 * README_INTEGRATION.md
 * Instructions for integrating the deep-simulation systems into index.html
 */

# Deep Simulation System Integration Guide

## Overview

This overhaul adds 10 major systems to the SCP Facility Management game while maintaining 100% backward compatibility with existing saves and gameplay.

## Files Added

### Core Systems (modules/)

1. **npc-system.js** - NPC AI with names, roles, mood, energy, health, stress
2. **power-system.js** - Expanded power management with degradation
3. **incident-reporting.js** - Incident tracking and reporting
4. **scp-behaviors.js** - Unique behavior scripts for each SCP
5. **research-tree.js** - Technology tree with 6 categories
6. **events-system.js** - Random facility events with consequences
7. **door-lockdown-system.js** - Doors and facility lockdown mechanics
8. **facility-statistics.js** - Comprehensive statistics tracking
9. **ui-enhancements.js** - UI rendering functions for new systems
10. **integration-layer.js** - Connects all systems to main game loop
11. **enhanced-index-integration.js** - Adapter for existing index.html

## Integration Steps

### Step 1: Add Module Scripts to index.html

Add these `<script>` tags in the `<head>` section BEFORE the main game script:

```html
<!-- Deep Simulation Systems -->
<script src="modules/npc-system.js"></script>
<script src="modules/power-system.js"></script>
<script src="modules/incident-reporting.js"></script>
<script src="modules/scp-behaviors.js"></script>
<script src="modules/research-tree.js"></script>
<script src="modules/events-system.js"></script>
<script src="modules/door-lockdown-system.js"></script>
<script src="modules/facility-statistics.js"></script>
<script src="modules/ui-enhancements.js"></script>
<script src="modules/integration-layer.js"></script>
<script src="modules/enhanced-index-integration.js"></script>
```

### Step 2: Update Main Game Loop

In your existing game loop function, the integration adapter will automatically hook in.
No changes needed to existing code!

### Step 3: Add CSS for New Components

Add to the `<style>` section:

```css
/* NPC Panel */
.npc-detail-panel {
  background: var(--panel-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px;
  font-size: 11px;
}

.npc-detail-panel h3 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: var(--accent);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.stat-label {
  color: var(--text-muted);
  font-weight: 600;
}

.stat-value {
  color: var(--text);
  font-weight: 700;
}

.health-bar, .energy-bar, .hunger-bar, .stress-bar, .morale-bar {
  height: 6px;
  background: var(--border-soft);
  border-radius: 3px;
  overflow: hidden;
  flex: 1;
}

.health-bar > div { background: #5ad18a; }
.energy-bar > div { background: #f0b23c; }
.hunger-bar > div { background: #e0605a; }
.stress-bar > div { background: #e0605a; }
.morale-bar > div { background: #45c9bd; }

/* Statistics Dashboard */
.statistics-dashboard {
  background: var(--panel-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}

.statistics-dashboard h2 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--accent-2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.stat-card {
  background: var(--panel);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-sm);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Events Alert */
.events-alert {
  position: fixed;
  top: 80px;
  right: 18px;
  max-width: 300px;
  z-index: 15;
}

.event-alert {
  background: var(--panel-2);
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--text);
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: toast-in 0.3s ease-out;
}

.event-alert.severity-critical { border-left-color: #e0605a; }
.event-alert.severity-high { border-left-color: #f0b23c; }
.event-alert.severity-moderate { border-left-color: #45c9bd; }
.event-alert.severity-low { border-left-color: #5ad18a; }

/* Lockdown Status */
.lockdown-status {
  background: var(--panel-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.lockdown-status .status-value {
  font-weight: 700;
  color: var(--accent-2);
}

.lockdown-status .doors-locked {
  color: var(--text-muted);
  font-size: 10px;
}
```

### Step 4: Test Integration

Open the browser console and you should see:
```
✓ Simulation systems initialized
```

## How Systems Work

### NPC System
- Each staff member now has energy, hunger, stress, morale, and health
- NPCs have names and unique personalities
- Jobs are assigned based on needs and role-specific logic
- Productivity is reduced by poor conditions

### Power System Expansion
- Rooms without power stop functioning
- Power generators can be damaged
- Batteries store excess power
- Failed rooms impact facility efficiency

### SCP Behaviors
- SCP-173: Moves when unobserved, can kill nearby staff
- SCP-096: Enters rage mode if viewed, hunts observers
- SCP-049: Hunts Class-D, can infect them
- SCP-999: Increases morale of nearby staff
- SCP-682: Slowly damages containment, adapts over time
- SCP-131: Safe, curious, low threat

### Research Tree
- 20+ researches across 6 categories
- Each research unlocks upgrades and bonuses
- Prerequisites must be completed first
- Research takes time and research points

### Dynamic Events
- Random facility events with varying severity
- Power failures, fires, riots, generator explosions, earthquakes, gas leaks
- Events affect gameplay with real consequences
- Incident reports track casualties and costs

### Door/Lockdown System
- Functional doors with clearance levels
- Automatic lockdown during breaches
- Progressive lockdown levels (Yellow/Red/Full)
- Doors require power to operate

### Facility Statistics
- Real-time tracking of key metrics
- Risk assessment levels
- Efficiency calculations
- Uptime monitoring

## Backward Compatibility

✓ All existing save data works unchanged
✓ Existing game loop continues to function
✓ New systems integrate transparently
✓ No breaking changes to existing mechanics
✓ Can be disabled by not loading the modules

## Extending the Systems

### Adding a New SCP Behavior

```javascript
class SCPNewSCP extends SCPBehaviors.SCPBehavior {
  constructor() {
    super('scp999');
  }

  tickContained(scp, dt, grid, staff) {
    // Custom behavior here
  }
}

SCPBehaviors.registerBehavior('scpnew', SCPNewSCP);
```

### Adding a New Event Type

Simply add to `EVENT_TYPES` in events-system.js and implement `_yourEventType()` method.

### Adding a New Research Node

```javascript
const newResearch = new ResearchTree.ResearchNode(
  'my_research',
  'My Research Name',
  ResearchTree.RESEARCH_CATEGORIES.CONTAINMENT,
  300, // cost
  60,  // duration
  ['contain_basic'] // prerequisites
);
ResearchTree.RESEARCH_TREE.push(newResearch);
```

## Performance Notes

- Systems are optimized to handle 100+ NPCs
- Pathfinding uses memoization
- Event checks are throttled
- Statistics updates are efficient
- All code is modular for easy optimization

## Troubleshooting

**Q: Systems not loading?**
A: Check browser console for errors. Ensure all module files are in the correct path.

**Q: Save compatibility broken?**
A: The systems maintain the SAVE_KEY and add `simulation` sub-object. Old saves continue to work.

**Q: Performance issues?**
A: Reduce eventCheckInterval or disable certain subsystems as needed.

## License

All systems are modular and extensible. Feel free to customize!
