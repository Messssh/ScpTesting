/**
 * RESEARCH_TREE.JS
 * Technology tree system for facility upgrades.
 */

const ResearchTree = (() => {
  'use strict';

  const RESEARCH_CATEGORIES = {
    CONTAINMENT: 'containment',
    SECURITY: 'security',
    PERSONNEL: 'personnel',
    ENGINEERING: 'engineering',
    MEDICAL: 'medical',
    POWER: 'power'
  };

  class ResearchNode {
    constructor(id, name, category, cost, duration, prerequisites = []) {
      this.id = id;
      this.name = name;
      this.category = category;
      this.cost = cost; // Research points or money
      this.duration = duration; // in seconds
      this.prerequisites = prerequisites; // Array of research IDs
      this.completed = false;
      this.progress = 0;
      this.unlocks = []; // Rooms or items this unlocks
      this.bonuses = {}; // Gameplay bonuses
    }

    /**
     * Check if prerequisites are met.
     */
    canResearch(completedResearch) {
      return this.prerequisites.every(id => completedResearch.includes(id));
    }

    /**
     * Get human-readable description.
     */
    getDescription() {
      return `${this.name} (${this.category}) - ${this.cost} points, ${this.duration}s duration`;
    }
  }

  // Define the research tree
  const RESEARCH_TREE = [
    // Containment branch
    new ResearchNode(
      'contain_basic',
      'Basic Containment Protocols',
      RESEARCH_CATEGORIES.CONTAINMENT,
      200, 30,
      []
    ),
    new ResearchNode(
      'contain_enhanced',
      'Enhanced Cell Design',
      RESEARCH_CATEGORIES.CONTAINMENT,
      400, 60,
      ['contain_basic']
    ),
    new ResearchNode(
      'contain_heavy_upgrade',
      'Heavy Containment Reinforcement',
      RESEARCH_CATEGORIES.CONTAINMENT,
      600, 90,
      ['contain_enhanced']
    ),
    new ResearchNode(
      'contain_soundproof',
      'Acoustic Isolation',
      RESEARCH_CATEGORIES.CONTAINMENT,
      300, 45,
      ['contain_basic']
    ),

    // Security branch
    new ResearchNode(
      'sec_cameras',
      'Advanced Surveillance',
      RESEARCH_CATEGORIES.SECURITY,
      250, 40,
      []
    ),
    new ResearchNode(
      'sec_elite_mtf',
      'Elite MTF Training',
      RESEARCH_CATEGORIES.SECURITY,
      500, 80,
      ['sec_cameras']
    ),
    new ResearchNode(
      'sec_lockdown',
      'Automated Lockdown System',
      RESEARCH_CATEGORIES.SECURITY,
      350, 60,
      ['sec_cameras']
    ),

    // Personnel branch
    new ResearchNode(
      'pers_faster_scientists',
      'Enhanced Researcher Training',
      RESEARCH_CATEGORIES.PERSONNEL,
      200, 35,
      []
    ),
    new ResearchNode(
      'pers_improved_morale',
      'Better Staff Accommodations',
      RESEARCH_CATEGORIES.PERSONNEL,
      300, 50,
      ['pers_faster_scientists']
    ),
    new ResearchNode(
      'pers_rapid_response',
      'Rapid Response Protocols',
      RESEARCH_CATEGORIES.PERSONNEL,
      400, 70,
      ['pers_improved_morale']
    ),

    // Engineering branch
    new ResearchNode(
      'eng_maintenance',
      'Preventative Maintenance',
      RESEARCH_CATEGORIES.ENGINEERING,
      200, 40,
      []
    ),
    new ResearchNode(
      'eng_room_repairs',
      'Automated Repairs',
      RESEARCH_CATEGORIES.ENGINEERING,
      350, 60,
      ['eng_maintenance']
    ),
    new ResearchNode(
      'eng_reinforced_walls',
      'Reinforced Structures',
      RESEARCH_CATEGORIES.ENGINEERING,
      300, 50,
      ['eng_maintenance']
    ),

    // Medical branch
    new ResearchNode(
      'med_field_medicine',
      'Field Medicine Training',
      RESEARCH_CATEGORIES.MEDICAL,
      200, 35,
      []
    ),
    new ResearchNode(
      'med_trauma_surgery',
      'Trauma Surgery Protocols',
      RESEARCH_CATEGORIES.MEDICAL,
      400, 70,
      ['med_field_medicine']
    ),
    new ResearchNode(
      'med_mental_health',
      'Stress Management Programs',
      RESEARCH_CATEGORIES.MEDICAL,
      250, 45,
      ['med_field_medicine']
    ),

    // Power branch
    new ResearchNode(
      'pow_efficient_batteries',
      'High-Capacity Batteries',
      RESEARCH_CATEGORIES.POWER,
      250, 50,
      []
    ),
    new ResearchNode(
      'pow_nuclear_gen',
      'Nuclear Generator Design',
      RESEARCH_CATEGORIES.POWER,
      600, 120,
      ['pow_efficient_batteries']
    ),
    new ResearchNode(
      'pow_emergency_system',
      'Emergency Power Protocols',
      RESEARCH_CATEGORIES.POWER,
      300, 60,
      ['pow_efficient_batteries']
    )
  ];

  class ResearchManager {
    constructor() {
      this.nodes = new Map();
      this.completed = [];
      this.currentResearch = null;
      this.researchPoints = 0;

      // Initialize tree
      RESEARCH_TREE.forEach(node => {
        this.nodes.set(node.id, node);
      });
    }

    /**
     * Start researching a node.
     */
    startResearch(nodeId) {
      const node = this.nodes.get(nodeId);
      if (!node) return false;
      if (node.completed) return false;
      if (!node.canResearch(this.completed)) return false;

      this.currentResearch = nodeId;
      return true;
    }

    /**
     * Complete current research.
     */
    completeResearch() {
      if (!this.currentResearch) return null;
      const node = this.nodes.get(this.currentResearch);
      if (node) {
        node.completed = true;
        node.progress = 100;
        this.completed.push(node.id);
        this.currentResearch = null;
        return node;
      }
      return null;
    }

    /**
     * Tick research progress.
     */
    tick(dt) {
      if (!this.currentResearch) return;
      const node = this.nodes.get(this.currentResearch);
      if (node) {
        node.progress += (dt / node.duration) * 100;
        if (node.progress >= 100) {
          this.completeResearch();
        }
      }
    }

    /**
     * Get available research options.
     */
    getAvailable() {
      const available = [];
      this.nodes.forEach((node, id) => {
        if (!node.completed && node.canResearch(this.completed)) {
          available.push(node);
        }
      });
      return available;
    }

    /**
     * Check if a research is completed.
     */
    isCompleted(researchId) {
      return this.completed.includes(researchId);
    }
  }

  return {
    RESEARCH_CATEGORIES,
    ResearchNode,
    ResearchManager,
    RESEARCH_TREE
  };
})();