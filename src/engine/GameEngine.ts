import { GameState, Character, Enemy, CombatState, Skill, Position, Tile, Item } from '../types/game';
import { enemyTypes, items } from '../data/gameData';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private keys: { [key: string]: boolean } = {};
  private lastTime = 0;
  private animationId: number | null = null;
  private stateChangeCallback?: (state: GameState) => void;
  private lootableCallback?: (lootable: any) => void;
  private isInputActive = false;

  constructor(canvas: HTMLCanvasElement, initialState: GameState) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gameState = { ...initialState };
    
    // Set canvas size
    this.canvas.width = 800;
    this.canvas.height = 600;
    
    this.setupEventListeners();
    this.startGameLoop();
  }

  setStateChangeCallback(callback: (state: GameState) => void) {
    this.stateChangeCallback = callback;
  }

  setLootableCallback(callback: (lootable: any) => void) {
    this.lootableCallback = callback;
  }

  setGameState(newState: GameState) {
    this.gameState = { ...newState };
  }

  getGameState(): GameState {
    return { ...this.gameState };
  }

  private setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      // Don't handle hotkeys if input is active or in certain game modes
      if (this.shouldIgnoreHotkeys()) {
        return;
      }
      
      this.keys[e.key.toLowerCase()] = true;
      this.handleKeyPress(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
      if (this.shouldIgnoreHotkeys()) {
        return;
      }
      
      this.keys[e.key.toLowerCase()] = false;
    });

    // Canvas click events
    this.canvas.addEventListener('click', (e) => {
      this.handleCanvasClick(e);
    });
    
    // Listen for input focus/blur events
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        this.isInputActive = true;
      }
    });
    
    document.addEventListener('focusout', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        this.isInputActive = false;
      }
    });
  }
  
  private shouldIgnoreHotkeys(): boolean {
    // Ignore hotkeys if:
    // 1. An input field is focused
    // 2. In certain game modes where hotkeys shouldn't work
    // 3. Dev mode is open and enabled
    
    if (this.isInputActive) {
      return true;
    }
    
    const gameMode = this.gameState.gameMode;
    const ignoredModes = ['inventory', 'equipment', 'character', 'quests', 'map', 'dialogue', 'combat'];
    
    if (ignoredModes.includes(gameMode)) {
      return true;
    }
    
    // Check if dev mode is open
    if (this.gameState.devMode?.enabled) {
      return true;
    }
    
    return false;
  }

  private handleKeyPress(key: string) {
    // Additional check for specific keys that should always work
    const alwaysAllowedKeys = ['escape', 'f1'];
    
    if (!alwaysAllowedKeys.includes(key) && this.shouldIgnoreHotkeys()) {
      return;
    }

    switch (key) {
      case 'escape':
        this.handleEscapeKey();
        break;
      case 'f1':
        this.toggleDevMode();
        break;
      case 'i':
        this.gameState.gameMode = 'inventory';
        this.notifyStateChange();
        break;
      case 'e':
        this.gameState.gameMode = 'equipment';
        this.notifyStateChange();
        break;
      case 'c':
        this.gameState.gameMode = 'character';
        this.notifyStateChange();
        break;
      case 'q':
        this.gameState.gameMode = 'quests';
        this.notifyStateChange();
        break;
      case 'm':
        this.gameState.gameMode = 'map';
        this.notifyStateChange();
        break;
      case ' ':
      case 'f':
        this.handleInteraction();
        break;
    }
  }
  
  private handleEscapeKey() {
    // Handle escape key based on current context
    if (this.gameState.devMode?.enabled) {
      this.gameState.devMode.enabled = false;
      this.notifyStateChange();
    } else if (this.gameState.gameMode !== 'exploration') {
      // Return to exploration mode from any menu
      this.gameState.gameMode = 'exploration';
      this.notifyStateChange();
    }
  }

  private handleCanvasClick(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert screen coordinates to world coordinates
    const worldX = x + this.gameState.camera.x;
    const worldY = y + this.gameState.camera.y;
    
    // Check for interactions
    this.checkInteractionAt(worldX, worldY);
  }

  private checkInteractionAt(x: number, y: number) {
    // Check for building entrances
    const tileX = Math.floor(x / 32);
    const tileY = Math.floor(y / 32);
    const tile = this.gameState.currentMap.tiles[tileY]?.[tileX];
    
    if (tile?.isEntrance && (tile.buildingType || tile.regionType)) {
      if (tile.buildingType) {
        this.enterBuilding(tile.buildingType, tile.buildingName);
      } else if (tile.regionType) {
        this.enterRegion(tile.regionType, tile.regionName);
      }
      return;
    }

    // Check for NPCs
    for (const npc of this.gameState.currentMap.npcs) {
      const distance = Math.sqrt(
        Math.pow(x - npc.position.x, 2) + Math.pow(y - npc.position.y, 2)
      );
      
      if (distance < 32) {
        this.startDialogue(npc.id);
        return;
      }
    }

    // Check for enemies
    for (const enemy of this.gameState.currentMap.enemies) {
      const distance = Math.sqrt(
        Math.pow(x - enemy.position.x, 2) + Math.pow(y - enemy.position.y, 2)
      );
      
      if (distance < 32) {
        this.startCombat([enemy]);
        return;
      }
    }

    // Check for lootables
    for (const lootable of this.gameState.currentMap.lootables) {
      const distance = Math.sqrt(
        Math.pow(x - lootable.position.x, 2) + Math.pow(y - lootable.position.y, 2)
      );
      
      if (distance < 32 && !lootable.looted) {
        if (this.lootableCallback) {
          this.lootableCallback(lootable);
        }
        return;
      }
    }
  }

  private enterBuilding(buildingType: string, buildingName?: string) {
    // Create a simple interior map for buildings
    const interiorMap = this.createInteriorMap(buildingType);
    
    // Store the current map position
    this.gameState.previousMap = {
      map: this.gameState.currentMap,
      position: { ...this.gameState.player.position }
    };
    
    // Switch to interior
    this.gameState.currentMap = interiorMap;
    this.gameState.player.position = { x: 160, y: 280 }; // Near the entrance
    
    this.updateCamera();
    this.updateVisibility();
    this.notifyStateChange();
  }

  private enterRegion(regionType: string, regionName?: string) {
    // Create a new region map
    const regionMap = this.createRegionMap(regionType);
    
    // Store the current map position
    this.gameState.previousMap = {
      map: this.gameState.currentMap,
      position: { ...this.gameState.player.position }
    };
    
    // Switch to region
    this.gameState.currentMap = regionMap;
    this.gameState.player.position = { x: 160, y: 280 }; // Near the entrance
    
    this.updateCamera();
    this.updateVisibility();
    this.notifyStateChange();
  }
  private createInteriorMap(buildingType: string): any {
    const width = 15;
    const height = 10;
    const tiles = [];
    
    // Create interior tiles
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        let type = 'building';
        let walkable = true;
        
        // Create walls around the edges
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
          walkable = false;
        }
        
        // Create entrance at bottom center
        if (x === Math.floor(width / 2) && y === height - 1) {
          walkable = true;
          type = 'building'; // Exit tile
        }
        
        row.push({
          x,
          y,
          type,
          walkable,
          sprite: type,
          discovered: true,
          visible: true,
          description: 'Interior floor',
          isExit: x === Math.floor(width / 2) && y === height - 1
        });
      }
      tiles.push(row);
    }
    
    // Add interior-specific NPCs and items based on building type
    const npcs: any[] = [];
    const lootables: any[] = [];
    const enemies: any[] = [];
    
    if (buildingType === 'clinic') {
      // Add medical supplies
      lootables.push({
        id: 'clinic_supplies',
        position: { x: 5 * 32, y: 3 * 32 },
        items: [
          { ...items.find(i => i.id === 'stimpak')!, quantity: 2 },
          items.find(i => i.id === 'rad_away')!
        ],
        type: 'container',
        sprite: 'medical_cabinet',
        discovered: true,
        looted: false
      });
    } else if (buildingType === 'workshop') {
      // Add crafting materials
      lootables.push({
        id: 'workshop_supplies',
        position: { x: 8 * 32, y: 4 * 32 },
        items: [
          { ...items.find(i => i.id === 'scrap_metal')!, quantity: 5 },
          { ...items.find(i => i.id === 'electronics')!, quantity: 2 }
        ],
        type: 'container',
        sprite: 'toolbox',
        discovered: true,
        looted: false
      });
    } else if (buildingType === 'tech_facility') {
      // Add robots and high-tech loot
      enemies.push({
        ...enemyTypes.find(e => e.id === 'robot')!,
        id: 'facility_robot_1',
        position: { x: 6 * 32, y: 3 * 32 }
      });
      
      lootables.push({
        id: 'tech_loot',
        position: { x: 10 * 32, y: 2 * 32 },
        items: [
          items.find(i => i.id === 'plasma_rifle')!,
          { ...items.find(i => i.id === 'electronics')!, quantity: 3 }
        ],
        type: 'container',
        sprite: 'tech_cache',
        discovered: true,
        looted: false
      });
    }
    
    return {
      width,
      height,
      tiles,
      name: `${buildingType} Interior`,
      bgMusic: 'interior_ambient',
      npcs,
      enemies,
      lootables,
      isInterior: true
    };
  }

  private createRegionMap(regionType: string): any {
    let width = 50;
    let height = 50;
    let tiles = [];
    
    // Create region-specific terrain
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        let type = 'grass';
        let walkable = true;
        let description = 'Unknown terrain';
        
        // Create walls around the edges for caves and tunnels
        if ((regionType === 'cave' || regionType === 'tunnel') && 
            (x === 0 || x === width - 1 || y === 0 || y === height - 1)) {
          type = 'stone';
          walkable = false;
          description = 'Rock wall';
        } else {
          // Set terrain based on region type
          const random = Math.random();
          switch (regionType) {
            case 'cave':
              type = random < 0.1 ? 'water' : random < 0.3 ? 'stone' : 'dirt';
              description = type === 'water' ? 'Underground pool' : 
                           type === 'stone' ? 'Cave wall' : 'Cave floor';
              if (type === 'stone') walkable = false;
              break;
            case 'tunnel':
              type = random < 0.05 ? 'stone' : 'dirt';
              description = type === 'stone' ? 'Tunnel wall' : 'Tunnel floor';
              if (type === 'stone') walkable = false;
              break;
            case 'forest':
              type = random < 0.2 ? 'ruins' : random < 0.1 ? 'water' : 'grass';
              description = type === 'ruins' ? 'Overgrown ruins' : 
                           type === 'water' ? 'Forest stream' : 'Forest floor';
              if (type === 'water') walkable = false;
              break;
            case 'desert':
              type = random < 0.1 ? 'stone' : random < 0.05 ? 'ruins' : 'sand';
              description = type === 'stone' ? 'Desert rock' : 
                           type === 'ruins' ? 'Desert ruins' : 'Desert sand';
              if (type === 'stone') walkable = false;
              break;
            case 'swamp':
              type = random < 0.4 ? 'water' : random < 0.2 ? 'ruins' : 'grass';
              description = type === 'water' ? 'Swamp water' : 
                           type === 'ruins' ? 'Sunken ruins' : 'Swamp ground';
              if (type === 'water') walkable = false;
              break;
          }
        }
        
        // Create entrance at bottom center
        if (x === Math.floor(width / 2) && y === height - 1) {
          walkable = true;
          type = regionType === 'cave' || regionType === 'tunnel' ? 'dirt' : type;
        }
        
        row.push({
          x,
          y,
          type,
          walkable,
          sprite: type,
          discovered: true,
          visible: true,
          description,
          isExit: x === Math.floor(width / 2) && y === height - 1
        });
      }
      tiles.push(row);
    }
    
    // Add region-specific content
    const npcs: any[] = [];
    const lootables: any[] = [];
    const enemies: any[] = [];
    
    // Add enemies based on region type
    const enemyCount = Math.floor(Math.random() * 8) + 3;
    for (let i = 0; i < enemyCount; i++) {
      const x = Math.floor(Math.random() * (width - 4)) + 2;
      const y = Math.floor(Math.random() * (height - 4)) + 2;
      
      if (tiles[y][x].walkable) {
        let enemyTemplate;
        switch (regionType) {
          case 'cave':
          case 'tunnel':
            enemyTemplate = enemyTypes[Math.random() < 0.6 ? 1 : 2]; // Mutants or robots
            break;
          case 'forest':
          case 'swamp':
            enemyTemplate = enemyTypes[Math.random() < 0.7 ? 0 : 1]; // Raiders or mutants
            break;
          case 'desert':
            enemyTemplate = enemyTypes[Math.random() < 0.5 ? 0 : 3]; // Raiders or bosses
            break;
          default:
            enemyTemplate = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        }
        
        enemies.push({
          ...enemyTemplate,
          id: `${enemyTemplate.id}_${regionType}_${i}`,
          position: { x: x * 32 + 16, y: y * 32 + 16 }
        });
      }
    }
    
    // Add lootables
    const lootableCount = Math.floor(Math.random() * 6) + 2;
    for (let i = 0; i < lootableCount; i++) {
      const x = Math.floor(Math.random() * (width - 4)) + 2;
      const y = Math.floor(Math.random() * (height - 4)) + 2;
      
      if (tiles[y][x].walkable) {
        const lootType = Math.random() < 0.4 ? 'corpse' : 'container';
        const lootItems = [];
        const numItems = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < numItems; j++) {
          const randomItem = items[Math.floor(Math.random() * items.length)];
          lootItems.push({
            ...randomItem,
            quantity: randomItem.stackable ? Math.floor(Math.random() * 3) + 1 : 1
          });
        }
        
        lootables.push({
          id: `${regionType}_loot_${i}`,
          position: { x: x * 32 + 16, y: y * 32 + 16 },
          items: lootItems,
          type: lootType,
          sprite: lootType,
          discovered: true,
          looted: false
        });
      }
    }
    
    return {
      width,
      height,
      tiles,
      name: `${regionType.charAt(0).toUpperCase() + regionType.slice(1)} Region`,
      bgMusic: `${regionType}_ambient`,
      npcs,
      enemies,
      lootables,
      isInterior: true
    };
  }
  private handleInteraction() {
    const playerPos = this.gameState.player.position;
    
    // Check for exit if in interior
    if (this.gameState.currentMap.isInterior) {
      const tileX = Math.floor(playerPos.x / 32);
      const tileY = Math.floor(playerPos.y / 32);
      const tile = this.gameState.currentMap.tiles[tileY]?.[tileX];
      
      if (tile?.isExit && this.gameState.previousMap) {
        // Exit building
        this.gameState.currentMap = this.gameState.previousMap.map;
        this.gameState.player.position = this.gameState.previousMap.position;
        this.gameState.previousMap = undefined;
        
        this.updateCamera();
        this.updateVisibility();
        this.notifyStateChange();
        return;
      }
    }
    
    // Check for building entrances
    const tileX = Math.floor(playerPos.x / 32);
    const tileY = Math.floor(playerPos.y / 32);
    const tile = this.gameState.currentMap.tiles[tileY]?.[tileX];
    
    if (tile?.isEntrance && (tile.buildingType || tile.regionType)) {
      if (tile.buildingType) {
        this.enterBuilding(tile.buildingType, tile.buildingName);
      } else if (tile.regionType) {
        this.enterRegion(tile.regionType, tile.regionName);
      }
      return;
    }

    // Check for nearby NPCs
    for (const npc of this.gameState.currentMap.npcs) {
      const distance = Math.sqrt(
        Math.pow(playerPos.x - npc.position.x, 2) + Math.pow(playerPos.y - npc.position.y, 2)
      );
      
      if (distance < 64) {
        this.startDialogue(npc.id);
        this.updateQuestProgress('first_steps', 'talk_to_npc');
        return;
      }
    }

    // Check for nearby enemies
    for (const enemy of this.gameState.currentMap.enemies) {
      const distance = Math.sqrt(
        Math.pow(playerPos.x - enemy.position.x, 2) + Math.pow(playerPos.y - enemy.position.y, 2)
      );
      
      if (distance < 64) {
        this.startCombat([enemy]);
        return;
      }
    }

    // Check for nearby lootables
    for (const lootable of this.gameState.currentMap.lootables) {
      const distance = Math.sqrt(
        Math.pow(playerPos.x - lootable.position.x, 2) + Math.pow(playerPos.y - lootable.position.y, 2)
      );
      
      if (distance < 64 && !lootable.looted) {
        if (this.lootableCallback) {
          this.lootableCallback(lootable);
          this.updateQuestProgress('first_steps', 'collect_items');
        }
        return;
      }
    }
  }

  private startDialogue(npcId: string) {
    const npc = this.gameState.currentMap.npcs.find(n => n.id === npcId);
    if (!npc || npc.dialogue.length === 0) return;

    this.gameState.dialogue = {
      npcId,
      currentNode: npc.dialogue[0].id,
      history: [`${npc.name}: ${npc.dialogue[0].text}`],
      choices: npc.dialogue[0].choices
    };
    this.gameState.gameMode = 'dialogue';
    this.notifyStateChange();
  }

  private updateQuestProgress(questId: string, objectiveId: string, amount: number = 1) {
    const quest = this.gameState.quests.find(q => q.id === questId);
    if (quest && quest.status === 'active') {
      const objective = quest.objectives.find(obj => obj.id === objectiveId);
      if (objective && !objective.completed) {
        objective.current = Math.min(objective.current + amount, objective.required);
        if (objective.current >= objective.required) {
          objective.completed = true;
        }
        this.notifyStateChange();
      }
    }
  }

  private startCombat(enemies: Enemy[]) {
    const participants = [this.gameState.player, ...enemies];
    
    // Sort by initiative (agility for now)
    const turnOrder = [...participants].sort((a, b) => {
      const aInit = 'stats' in a ? a.stats.agility : 10;
      const bInit = 'stats' in b ? b.stats.agility : 10;
      return bInit - aInit;
    });

    // Create simple battlefield
    const battleground: Tile[][] = [];
    for (let y = 0; y < 8; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < 8; x++) {
        row.push({
          x,
          y,
          type: 'grass',
          walkable: true,
          sprite: 'grass',
          discovered: true,
          visible: true
        });
      }
      battleground.push(row);
    }

    this.gameState.combat = {
      participants,
      turnOrder,
      currentTurn: 0,
      round: 1,
      selectedAction: '',
      selectedTargets: [],
      animations: [],
      battleground,
      weather: 'clear',
      timeOfDay: 'day',
      isPlayerTurn: turnOrder[0] === this.gameState.player,
      combatLog: ['Combat begins!']
    };

    this.gameState.gameMode = 'combat';
    this.notifyStateChange();

    // If first turn is enemy, process it immediately
    if (!this.gameState.combat.isPlayerTurn) {
      setTimeout(() => this.processEnemyTurn(), 1000);
    }
  }

  public handleCombatAction(action: string, targetIndex?: number) {
    if (!this.gameState.combat || !this.gameState.combat.isPlayerTurn) return;

    const currentActor = this.gameState.combat.turnOrder[this.gameState.combat.currentTurn] as Character;
    
    // Handle consumable items
    if (action.startsWith('use_')) {
      const itemId = action.replace('use_', '');
      this.useItemInCombat(currentActor, itemId, targetIndex);
      this.nextTurn();
      return;
    }
    
    const skill = currentActor.skills.find(s => s.id === action);
    
    if (!skill || currentActor.energy < skill.energyCost) {
      return;
    }

    if (targetIndex !== undefined && targetIndex >= 0) {
      const target = this.gameState.combat.participants[targetIndex];
      this.executeSkill(currentActor, skill, target);
    }

    this.nextTurn();
  }

  private useItemInCombat(user: Character, itemId: string, targetIndex?: number) {
    const item = this.gameState.inventory.find(i => i.id === itemId);
    if (!item || item.type !== 'consumable') return;

    let target = user; // Default to self
    if (targetIndex !== undefined && targetIndex >= 0) {
      target = this.gameState.combat!.participants[targetIndex] as Character;
    }

    let logMessage = `${user.name} uses ${item.name}`;

    // Apply item effects
    switch (itemId) {
      case 'stimpak':
        const healing = 50;
        const oldHealth = target.health;
        target.health = Math.min(target.maxHealth, target.health + healing);
        const actualHealing = target.health - oldHealth;
        logMessage += ` healing ${target.name} for ${actualHealing} HP`;
        break;
        
      case 'rad_away':
        target.radiation = Math.max(0, target.radiation - 100);
        logMessage += ` reducing ${target.name}'s radiation`;
        break;
        
      case 'psycho':
        target.statusEffects.push({
          type: 'damage_boost',
          duration: 5,
          value: 25,
          source: 'Psycho'
        });
        logMessage += ` boosting ${target.name}'s damage`;
        break;
        
      case 'buffout':
        target.statusEffects.push({
          type: 'stat_boost',
          duration: 5,
          value: 3,
          source: 'Buffout'
        });
        logMessage += ` boosting ${target.name}'s strength`;
        break;
        
      case 'mentats':
        target.statusEffects.push({
          type: 'intelligence_boost',
          duration: 5,
          value: 3,
          source: 'Mentats'
        });
        logMessage += ` boosting ${target.name}'s intelligence`;
        break;
    }

    // Remove item from inventory
    const itemIndex = this.gameState.inventory.findIndex(i => i.id === itemId);
    if (itemIndex >= 0) {
      const inventoryItem = this.gameState.inventory[itemIndex];
      if (inventoryItem.quantity && inventoryItem.quantity > 1) {
        inventoryItem.quantity--;
      } else {
        this.gameState.inventory.splice(itemIndex, 1);
      }
    }

    this.gameState.combat!.combatLog.push(logMessage);
    this.notifyStateChange();
  }

  private executeSkill(actor: Character | Enemy, skill: Skill, target: Character | Enemy) {
    if (!this.gameState.combat) return;

    // Consume energy
    actor.energy = Math.max(0, actor.energy - skill.energyCost);

    let logMessage = `${actor.name} uses ${skill.name}`;

    if (skill.damage) {
      // Calculate damage
      let damage = skill.damage;
      
      // Add equipment bonuses for characters
      if ('stats' in actor) {
        const character = actor as Character;
        const strengthBonus = Math.floor(character.stats.strength / 2);
        const equipmentDamage = (character as any).equipmentBonuses?.damage || 0;
        
        // Check for damage boost status effects
        const damageBoost = character.statusEffects.find(e => e.type === 'damage_boost');
        const boostMultiplier = damageBoost ? (1 + damageBoost.value / 100) : 1;
        
        damage = Math.floor((damage + strengthBonus + equipmentDamage) * boostMultiplier);
      }
      
      // Calculate defense
      let finalDamage = damage;
      if ('class' in target) {
        const character = target as Character;
        const equipmentDefense = (character as any).equipmentBonuses?.defense || 0;
        finalDamage = Math.max(1, damage - equipmentDefense);
      }
      
      // Apply final damage
      target.health = Math.max(0, target.health - finalDamage);
      logMessage += ` dealing ${finalDamage} damage to ${target.name}`;
      
      // Check if target died
      if (target.health <= 0) {
        logMessage += ` - ${target.name} is defeated!`;
        
        // Remove from combat if it's an enemy
        if (!('class' in target)) {
          const enemyIndex = this.gameState.currentMap.enemies.findIndex(e => e.id === target.id);
          if (enemyIndex >= 0) {
            this.gameState.currentMap.enemies.splice(enemyIndex, 1);
            
            // Update quest progress for killing enemies
            const enemyType = (target as Enemy).type;
            if (enemyType === 'raider') {
              this.updateQuestProgress('raider_threat', 'kill_raiders');
            }
            if (enemyType === 'robot') {
              this.updateQuestProgress('water_chip_quest', 'defeat_security');
            }
          }
        }
      }
    }

    if (skill.healing) {
      // Apply healing
      const healing = skill.healing;
      const oldHealth = target.health;
      target.health = Math.min(target.maxHealth, target.health + healing);
      const actualHealing = target.health - oldHealth;
      logMessage += ` healing ${target.name} for ${actualHealing} HP`;
    }

    // Apply skill effects
    if (skill.effect) {
      target.statusEffects.push({
        type: skill.effect.type,
        duration: skill.effect.duration,
        value: skill.effect.value,
        source: actor.name
      });
      logMessage += ` applying ${skill.effect.type}`;
    }

    // Set cooldown
    skill.currentCooldown = skill.cooldown;

    this.gameState.combat.combatLog.push(logMessage);
    this.notifyStateChange();
  }

  private processEnemyTurn() {
    if (!this.gameState.combat || this.gameState.combat.isPlayerTurn) return;

    const currentEnemy = this.gameState.combat.turnOrder[this.gameState.combat.currentTurn] as Enemy;
    
    if (currentEnemy.health <= 0) {
      this.nextTurn();
      return;
    }

    // Simple AI: attack a random player character
    const playerCharacters = this.gameState.combat.participants.filter(p => 'class' in p && p.health > 0);
    
    if (playerCharacters.length === 0) {
      this.endCombat(false); // Player lost
      return;
    }

    const target = playerCharacters[Math.floor(Math.random() * playerCharacters.length)];
    const availableSkills = currentEnemy.skills.filter(s => 
      currentEnemy.energy >= s.energyCost && s.currentCooldown <= 0
    );

    if (availableSkills.length > 0) {
      const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
      this.executeSkill(currentEnemy, skill, target);
    } else {
      // Skip turn if no skills available
      this.gameState.combat.combatLog.push(`${currentEnemy.name} has no available actions`);
    }

    setTimeout(() => this.nextTurn(), 1500);
  }

  private nextTurn() {
    if (!this.gameState.combat) return;

    // Update cooldowns and status effects
    this.updateCombatEffects();

    // Check win/lose conditions
    const aliveEnemies = this.gameState.combat.participants.filter(p => !('class' in p) && p.health > 0);
    const aliveAllies = this.gameState.combat.participants.filter(p => 'class' in p && p.health > 0);

    if (aliveEnemies.length === 0) {
      this.endCombat(true); // Player won
      return;
    }

    if (aliveAllies.length === 0) {
      this.endCombat(false); // Player lost
      return;
    }

    // Move to next turn
    this.gameState.combat.currentTurn = (this.gameState.combat.currentTurn + 1) % this.gameState.combat.turnOrder.length;
    
    // Skip dead participants
    let attempts = 0;
    while (this.gameState.combat.turnOrder[this.gameState.combat.currentTurn].health <= 0 && attempts < 10) {
      this.gameState.combat.currentTurn = (this.gameState.combat.currentTurn + 1) % this.gameState.combat.turnOrder.length;
      attempts++;
    }

    // Check if new round
    if (this.gameState.combat.currentTurn === 0) {
      this.gameState.combat.round++;
    }

    // Determine if it's player turn
    const currentActor = this.gameState.combat.turnOrder[this.gameState.combat.currentTurn];
    this.gameState.combat.isPlayerTurn = 'class' in currentActor;

    this.notifyStateChange();

    // If it's an enemy turn, process it
    if (!this.gameState.combat.isPlayerTurn) {
      setTimeout(() => this.processEnemyTurn(), 1000);
    }
  }

  private updateCombatEffects() {
    if (!this.gameState.combat) return;

    for (const participant of this.gameState.combat.participants) {
      // Update skill cooldowns
      for (const skill of participant.skills) {
        if (skill.currentCooldown > 0) {
          skill.currentCooldown = Math.max(0, skill.currentCooldown - 1);
        }
      }

      // Update status effects
      participant.statusEffects = participant.statusEffects.filter(effect => {
        effect.duration -= 1;
        
        if (effect.duration <= 0) {
          return false; // Remove expired effects
        }

        // Apply effect
        if (effect.type === 'poison' && effect.value > 0) {
          participant.health = Math.max(0, participant.health - effect.value);
          this.gameState.combat!.combatLog.push(`${participant.name} takes ${effect.value} poison damage`);
        }

        return true;
      });

      // Regenerate energy
      participant.energy = Math.min(participant.maxEnergy, participant.energy + 5);
    }
  }

  private endCombat(playerWon: boolean) {
    if (!this.gameState.combat) return;

    if (playerWon) {
      this.gameState.combat.combatLog.push('Victory! You have defeated your enemies!');
      
      // Award experience and loot
      let totalExp = 0;
      for (const participant of this.gameState.combat.participants) {
        if (!('class' in participant)) {
          totalExp += (participant as Enemy).experience;
        }
      }
      
      this.gameState.player.experience += totalExp;
      this.gameState.combat.combatLog.push(`Gained ${totalExp} experience!`);
      
      // Check for level up
      while (this.gameState.player.experience >= this.gameState.player.experienceToNext) {
        this.gameState.player.experience -= this.gameState.player.experienceToNext;
        this.gameState.player.level++;
        this.gameState.player.experienceToNext = this.gameState.player.level * 100;
        this.gameState.player.maxHealth += 10;
        this.gameState.player.maxEnergy += 5;
        this.gameState.combat.combatLog.push(`Level up! You are now level ${this.gameState.player.level}!`);
      }
    } else {
      this.gameState.combat.combatLog.push('Defeat! You have been overcome...');
      // Reset player health to 1 to avoid game over
      this.gameState.player.health = 0; // Allow game over
    }

    // End combat after a delay
    setTimeout(() => {
      this.gameState.combat = undefined;
      this.gameState.gameMode = 'exploration';
      this.notifyStateChange();
    }, 3000);
  }

  private toggleDevMode() {
    if (!this.gameState.devMode) {
      this.gameState.devMode = {
        enabled: false,
        selectedTool: 'quest',
        questEditor: {
          id: '',
          title: '',
          description: '',
          objectives: [],
          rewards: [],
          requiredLevel: 1
        },
        npcEditor: {
          id: '',
          name: '',
          type: 'neutral',
          position: { x: 400, y: 400 },
          dialogue: [],
          inventory: [],
          faction: 'neutral',
          isHostile: false
        },
        itemEditor: {
          id: '',
          name: '',
          type: 'material',
          rarity: 'common',
          description: '',
          stats: {},
          value: 10,
          stackable: false
        }
      };
    }
    
    this.gameState.devMode.enabled = !this.gameState.devMode.enabled;
    this.notifyStateChange();
  }

  private updateMovement(deltaTime: number) {
    if (this.gameState.gameMode !== 'exploration' || this.shouldIgnoreHotkeys()) {
      return;
    }

    const speed = 128; // pixels per second
    const player = this.gameState.player;
    let moved = false;

    // Handle movement
    if (this.keys['arrowup'] || this.keys['w']) {
      const newY = player.position.y - speed * deltaTime;
      if (this.isValidPosition(player.position.x, newY)) {
        player.position.y = newY;
        player.direction = 'up';
        moved = true;
      }
    }
    if (this.keys['arrowdown'] || this.keys['s']) {
      const newY = player.position.y + speed * deltaTime;
      if (this.isValidPosition(player.position.x, newY)) {
        player.position.y = newY;
        player.direction = 'down';
        moved = true;
      }
    }
    if (this.keys['arrowleft'] || this.keys['a']) {
      const newX = player.position.x - speed * deltaTime;
      if (this.isValidPosition(newX, player.position.y)) {
        player.position.x = newX;
        player.direction = 'left';
        moved = true;
      }
    }
    if (this.keys['arrowright'] || this.keys['d']) {
      const newX = player.position.x + speed * deltaTime;
      if (this.isValidPosition(newX, player.position.y)) {
        player.position.x = newX;
        player.direction = 'right';
        moved = true;
      }
    }

    if (moved) {
      this.updateCamera();
      this.updateVisibility();
    }
  }

  private isValidPosition(x: number, y: number): boolean {
    const tileX = Math.floor(x / 32);
    const tileY = Math.floor(y / 32);
    
    if (tileX < 0 || tileX >= this.gameState.currentMap.width || 
        tileY < 0 || tileY >= this.gameState.currentMap.height) {
      return false;
    }
    
    const tile = this.gameState.currentMap.tiles[tileY][tileX];
    return tile.walkable;
  }

  private updateCamera() {
    const player = this.gameState.player;
    this.gameState.camera.x = player.position.x - this.canvas.width / 2;
    this.gameState.camera.y = player.position.y - this.canvas.height / 2;

    // Clamp camera to map bounds
    const mapWidth = this.gameState.currentMap.width * 32;
    const mapHeight = this.gameState.currentMap.height * 32;
    this.gameState.camera.x = Math.max(0, Math.min(mapWidth - this.canvas.width, this.gameState.camera.x));
    this.gameState.camera.y = Math.max(0, Math.min(mapHeight - this.canvas.height, this.gameState.camera.y));
  }

  private updateVisibility() {
    const player = this.gameState.player;
    const visionRange = 160; // pixels
    
    // Initialize visibility map if needed
    if (this.gameState.visibilityMap.length === 0) {
      for (let y = 0; y < this.gameState.currentMap.height; y++) {
        this.gameState.visibilityMap[y] = new Array(this.gameState.currentMap.width).fill(false);
      }
    }

    // Update tile visibility
    for (let y = 0; y < this.gameState.currentMap.height; y++) {
      for (let x = 0; x < this.gameState.currentMap.width; x++) {
        const tileX = x * 32 + 16;
        const tileY = y * 32 + 16;
        const distance = Math.sqrt(
          Math.pow(player.position.x - tileX, 2) + Math.pow(player.position.y - tileY, 2)
        );

        if (distance <= visionRange) {
          this.gameState.currentMap.tiles[y][x].discovered = true;
          this.gameState.currentMap.tiles[y][x].visible = true;
          this.gameState.visibilityMap[y][x] = true;
        } else {
          this.gameState.currentMap.tiles[y][x].visible = false;
        }
      }
    }
  }

  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.gameState.gameMode !== 'exploration') {
      // Show a simple message for non-exploration modes
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game View', this.canvas.width / 2, this.canvas.height / 2);
      return;
    }

    // Render map tiles
    this.renderMap();
    
    // Render entities
    this.renderEntities();
    
    // Render UI
    this.renderUI();
  }

  private renderMap() {
    const camera = this.gameState.camera;
    const tileSize = 32;
    
    const startX = Math.floor(camera.x / tileSize);
    const startY = Math.floor(camera.y / tileSize);
    const endX = Math.min(this.gameState.currentMap.width, startX + Math.ceil(this.canvas.width / tileSize) + 1);
    const endY = Math.min(this.gameState.currentMap.height, startY + Math.ceil(this.canvas.height / tileSize) + 1);

    for (let y = Math.max(0, startY); y < endY; y++) {
      for (let x = Math.max(0, startX); x < endX; x++) {
        const tile = this.gameState.currentMap.tiles[y][x];
        if (!tile.discovered) continue;

        const screenX = x * tileSize - camera.x;
        const screenY = y * tileSize - camera.y;

        // Choose color based on tile type
        let color = '#4a7c59'; // grass
        switch (tile.type) {
          case 'dirt': color = '#8b4513'; break;
          case 'stone': color = '#696969'; break;
          case 'water': color = '#4682b4'; break;
          case 'ruins': color = '#2f2f2f'; break;
          case 'building': color = '#654321'; break;
          case 'sand': color = '#f4a460'; break;
        }

        // Darken if not currently visible
        if (!tile.visible) {
          color = this.darkenColor(color, 0.5);
        }

        this.ctx.fillStyle = color;
        this.ctx.fillRect(screenX, screenY, tileSize, tileSize);

        // Add border
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(screenX, screenY, tileSize, tileSize);

        // Mark building entrances
        if (tile.isEntrance) {
          this.ctx.fillStyle = '#ffff00';
          this.ctx.fillRect(screenX + 8, screenY + 8, 16, 16);
          
          const name = tile.buildingName || tile.regionName;
          if (name) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(name, screenX + 16, screenY - 5);
          }
        }
      }
    }
  }

  private renderEntities() {
    const camera = this.gameState.camera;

    // Render lootables
    for (const lootable of this.gameState.currentMap.lootables) {
      if (lootable.looted) continue;
      
      const tileX = Math.floor(lootable.position.x / 32);
      const tileY = Math.floor(lootable.position.y / 32);
      const tile = this.gameState.currentMap.tiles[tileY]?.[tileX];
      
      if (!tile?.discovered) continue;

      const screenX = lootable.position.x - camera.x;
      const screenY = lootable.position.y - camera.y;

      this.ctx.fillStyle = lootable.type === 'corpse' ? '#8b0000' : '#daa520';
      this.ctx.fillRect(screenX - 8, screenY - 8, 16, 16);
    }

    // Render NPCs
    for (const npc of this.gameState.currentMap.npcs) {
      const tileX = Math.floor(npc.position.x / 32);
      const tileY = Math.floor(npc.position.y / 32);
      const tile = this.gameState.currentMap.tiles[tileY]?.[tileX];
      
      if (!tile?.discovered) continue;

      const screenX = npc.position.x - camera.x;
      const screenY = npc.position.y - camera.y;

      this.ctx.fillStyle = npc.isHostile ? '#ff4444' : '#44ff44';
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, 12, 0, Math.PI * 2);
      this.ctx.fill();

      // Name label
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(npc.name, screenX, screenY - 20);
    }

    // Render enemies
    for (const enemy of this.gameState.currentMap.enemies) {
      const tileX = Math.floor(enemy.position.x / 32);
      const tileY = Math.floor(enemy.position.y / 32);
      const tile = this.gameState.currentMap.tiles[tileY]?.[tileX];
      
      if (!tile?.discovered) continue;

      const screenX = enemy.position.x - camera.x;
      const screenY = enemy.position.y - camera.y;

      this.ctx.fillStyle = '#ff0000';
      this.ctx.fillRect(screenX - 10, screenY - 10, 20, 20);

      // Health bar
      const healthPercent = enemy.health / enemy.maxHealth;
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(screenX - 12, screenY - 18, 24, 4);
      this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
      this.ctx.fillRect(screenX - 12, screenY - 18, 24 * healthPercent, 4);
    }

    // Render player
    const player = this.gameState.player;
    const screenX = player.position.x - camera.x;
    const screenY = player.position.y - camera.y;

    this.ctx.fillStyle = '#0066ff';
    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY, 14, 0, Math.PI * 2);
    this.ctx.fill();

    // Player direction indicator
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    switch (player.direction) {
      case 'up':
        this.ctx.moveTo(screenX, screenY - 8);
        this.ctx.lineTo(screenX - 4, screenY + 4);
        this.ctx.lineTo(screenX + 4, screenY + 4);
        break;
      case 'down':
        this.ctx.moveTo(screenX, screenY + 8);
        this.ctx.lineTo(screenX - 4, screenY - 4);
        this.ctx.lineTo(screenX + 4, screenY - 4);
        break;
      case 'left':
        this.ctx.moveTo(screenX - 8, screenY);
        this.ctx.lineTo(screenX + 4, screenY - 4);
        this.ctx.lineTo(screenX + 4, screenY + 4);
        break;
      case 'right':
        this.ctx.moveTo(screenX + 8, screenY);
        this.ctx.lineTo(screenX - 4, screenY - 4);
        this.ctx.lineTo(screenX - 4, screenY + 4);
        break;
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  private renderUI() {
    // Health bar
    const player = this.gameState.player;
    const healthPercent = player.health / player.maxHealth;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 10, 200, 30);
    
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(15, 15, 190 * healthPercent, 20);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Health: ${player.health}/${player.maxHealth}`, 20, 30);

    // Energy bar
    const energyPercent = player.energy / player.maxEnergy;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 50, 200, 30);
    
    this.ctx.fillStyle = '#0066ff';
    this.ctx.fillRect(15, 55, 190 * energyPercent, 20);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`Energy: ${Math.floor(player.energy)}/${player.maxEnergy}`, 20, 70);

    // Level and experience
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 90, 200, 30);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`Level ${player.level} - ${player.experience}/${player.experienceToNext} XP`, 20, 110);

    // Current area
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 130, 200, 25);
    
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(this.gameState.currentMap.name, 15, 147);
  }

  private darkenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = Math.floor(parseInt(hex.substr(0, 2), 16) * factor);
    const g = Math.floor(parseInt(hex.substr(2, 2), 16) * factor);
    const b = Math.floor(parseInt(hex.substr(4, 2), 16) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }

  private startGameLoop() {
    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      this.update(deltaTime);
      this.render();

      this.animationId = requestAnimationFrame(gameLoop);
    };

    this.animationId = requestAnimationFrame(gameLoop);
  }

  private update(deltaTime: number) {
    this.updateMovement(deltaTime);
    
    // Update game time
    this.gameState.gameTime += deltaTime;
    this.gameState.statistics.playtime += deltaTime;
    
    // Update day/night cycle
    this.gameState.dayNightCycle = (this.gameState.dayNightCycle + deltaTime / 1200) % 1;
  }

  private notifyStateChange() {
    if (this.stateChangeCallback) {
      this.stateChangeCallback(this.getGameState());
    }
  }

  public destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    window.removeEventListener('keydown', this.handleKeyPress);
    window.removeEventListener('keyup', this.handleKeyPress);
  }
}