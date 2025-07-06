import { GameState, Character, Position, Tile, Enemy, NPC } from '../types/game';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private keys: Set<string> = new Set();
  private lastUpdateTime = 0;
  private animationId: number | null = null;
  private stateChangeCallback?: (newState: GameState) => void;
  private lootableCallback?: (lootable: any) => void;

  constructor(canvas: HTMLCanvasElement, initialGameState: GameState) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gameState = JSON.parse(JSON.stringify(initialGameState));
    
    // Set canvas size
    this.canvas.width = 800;
    this.canvas.height = 600;
    
    this.setupEventListeners();
    this.initializeVisibilityMap();
    this.gameLoop();
  }

  private setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      this.handleKeyPress(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });

    // Prevent default behavior for game keys
    window.addEventListener('keydown', (e) => {
      const gameKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'f', 'i', 'e', 'c', 'q', 'm'];
      if (gameKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    });
  }

  private handleKeyPress(key: string) {
    if (!this.gameState || this.gameState.gameMode !== 'exploration') return;

    switch (key) {
      case ' ':
      case 'f':
        this.handleInteraction();
        break;
      case 'i':
        this.openInventory();
        break;
      case 'e':
        this.openEquipment();
        break;
      case 'c':
        this.openCharacterScreen();
        break;
      case 'q':
        this.openQuestScreen();
        break;
      case 'm':
        this.openMapScreen();
        break;
      case 'f1':
        this.toggleDevMode();
        break;
      case 'escape':
        this.openMainMenu();
        break;
    }
  }

  private gameLoop = (currentTime: number = 0) => {
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number) {
    if (!this.gameState || this.gameState.gameMode !== 'exploration') return;

    // Update game time
    this.gameState.gameTime += deltaTime / 1000;
    this.gameState.dayNightCycle = (this.gameState.gameTime / 300) % 1; // 5 minute day cycle

    // Handle player movement
    this.updatePlayerMovement(deltaTime);

    // Update NPCs and enemies
    this.updateNPCs(deltaTime);
    this.updateEnemies(deltaTime);

    // Update visibility
    this.updateVisibility();

    // Update skill cooldowns
    this.updateSkillCooldowns(deltaTime);

    // Update statistics
    this.gameState.statistics.playtime += deltaTime / 1000;
  }

  private updatePlayerMovement(deltaTime: number) {
    if (!this.gameState.player || this.gameState.player.isMoving) return;

    const moveSpeed = 128; // pixels per second
    const tileSize = 32;
    let newX = this.gameState.player.position.x;
    let newY = this.gameState.player.position.y;
    let moved = false;

    // Check movement keys
    if (this.keys.has('w') || this.keys.has('arrowup')) {
      newY -= moveSpeed * (deltaTime / 1000);
      this.gameState.player.direction = 'up';
      moved = true;
    }
    if (this.keys.has('s') || this.keys.has('arrowdown')) {
      newY += moveSpeed * (deltaTime / 1000);
      this.gameState.player.direction = 'down';
      moved = true;
    }
    if (this.keys.has('a') || this.keys.has('arrowleft')) {
      newX -= moveSpeed * (deltaTime / 1000);
      this.gameState.player.direction = 'left';
      moved = true;
    }
    if (this.keys.has('d') || this.keys.has('arrowright')) {
      newX += moveSpeed * (deltaTime / 1000);
      this.gameState.player.direction = 'right';
      moved = true;
    }

    if (moved) {
      // Check if the new position is valid
      const tileX = Math.floor(newX / tileSize);
      const tileY = Math.floor(newY / tileSize);

      if (this.isValidPosition(tileX, tileY)) {
        this.gameState.player.position.x = newX;
        this.gameState.player.position.y = newY;
        this.gameState.player.isMoving = true;

        // Update camera to follow player
        this.updateCamera();

        // Update statistics
        const distance = Math.sqrt(
          Math.pow(newX - this.gameState.player.position.x, 2) +
          Math.pow(newY - this.gameState.player.position.y, 2)
        );
        this.gameState.statistics.distanceTraveled += distance;

        // Mark tile as discovered
        this.discoverTile(tileX, tileY);
      }

      // Reset moving state after a short delay
      setTimeout(() => {
        if (this.gameState.player) {
          this.gameState.player.isMoving = false;
        }
      }, 100);
    }
  }

  private isValidPosition(tileX: number, tileY: number): boolean {
    if (!this.gameState.currentMap) return false;

    const map = this.gameState.currentMap;
    
    // Check bounds
    if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) {
      return false;
    }

    // Check if tile is walkable
    const tile = map.tiles[tileY][tileX];
    return tile.walkable;
  }

  private updateCamera() {
    if (!this.gameState.player) return;

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    this.gameState.camera.x = this.gameState.player.position.x - centerX;
    this.gameState.camera.y = this.gameState.player.position.y - centerY;

    // Clamp camera to map bounds
    const mapPixelWidth = this.gameState.currentMap.width * 32;
    const mapPixelHeight = this.gameState.currentMap.height * 32;

    this.gameState.camera.x = Math.max(0, Math.min(this.gameState.camera.x, mapPixelWidth - this.canvas.width));
    this.gameState.camera.y = Math.max(0, Math.min(this.gameState.camera.y, mapPixelHeight - this.canvas.height));
  }

  private updateNPCs(deltaTime: number) {
    // NPCs are mostly stationary in this implementation
    // Could add patrol behavior here
  }

  private updateEnemies(deltaTime: number) {
    if (!this.gameState.currentMap.enemies) return;

    this.gameState.currentMap.enemies.forEach(enemy => {
      if (enemy.ai.type === 'patrol') {
        // Simple patrol movement
        const moveSpeed = enemy.ai.speed;
        const direction = Math.random() < 0.5 ? 1 : -1;
        
        if (Math.random() < 0.01) { // 1% chance to change direction each frame
          enemy.position.x += direction * moveSpeed * (deltaTime / 1000);
          enemy.position.y += direction * moveSpeed * (deltaTime / 1000);
        }
      }
    });
  }

  private updateVisibility() {
    if (!this.gameState.player || !this.gameState.currentMap) return;

    const playerTileX = Math.floor(this.gameState.player.position.x / 32);
    const playerTileY = Math.floor(this.gameState.player.position.y / 32);
    const visionRange = 8;

    // Clear current visibility
    for (let y = 0; y < this.gameState.currentMap.height; y++) {
      for (let x = 0; x < this.gameState.currentMap.width; x++) {
        this.gameState.currentMap.tiles[y][x].visible = false;
      }
    }

    // Set visibility around player
    for (let y = playerTileY - visionRange; y <= playerTileY + visionRange; y++) {
      for (let x = playerTileX - visionRange; x <= playerTileX + visionRange; x++) {
        if (x >= 0 && x < this.gameState.currentMap.width && 
            y >= 0 && y < this.gameState.currentMap.height) {
          const distance = Math.sqrt((x - playerTileX) ** 2 + (y - playerTileY) ** 2);
          if (distance <= visionRange) {
            this.gameState.currentMap.tiles[y][x].visible = true;
            this.discoverTile(x, y);
          }
        }
      }
    }

    // Update visibility map for UI
    this.updateVisibilityMap();
  }

  private discoverTile(x: number, y: number) {
    if (x >= 0 && x < this.gameState.currentMap.width && 
        y >= 0 && y < this.gameState.currentMap.height) {
      this.gameState.currentMap.tiles[y][x].discovered = true;
    }
  }

  private updateVisibilityMap() {
    if (!this.gameState.currentMap) return;

    this.gameState.visibilityMap = [];
    for (let y = 0; y < this.gameState.currentMap.height; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < this.gameState.currentMap.width; x++) {
        row.push(this.gameState.currentMap.tiles[y][x].visible);
      }
      this.gameState.visibilityMap.push(row);
    }
  }

  private updateSkillCooldowns(deltaTime: number) {
    if (!this.gameState.player) return;

    this.gameState.player.skills.forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown = Math.max(0, skill.currentCooldown - deltaTime / 1000);
      }
    });
  }

  private initializeVisibilityMap() {
    if (!this.gameState.currentMap) return;

    this.gameState.visibilityMap = [];
    for (let y = 0; y < this.gameState.currentMap.height; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < this.gameState.currentMap.width; x++) {
        row.push(false);
      }
      this.gameState.visibilityMap.push(row);
    }
  }

  private render() {
    if (!this.gameState || !this.gameState.currentMap) return;

    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render map
    this.renderMap();

    // Render entities
    this.renderNPCs();
    this.renderEnemies();
    this.renderPlayer();

    // Render UI
    this.renderUI();
  }

  private renderMap() {
    const map = this.gameState.currentMap;
    const tileSize = 32;
    const camera = this.gameState.camera;

    const startX = Math.floor(camera.x / tileSize);
    const startY = Math.floor(camera.y / tileSize);
    const endX = Math.min(startX + Math.ceil(this.canvas.width / tileSize) + 1, map.width);
    const endY = Math.min(startY + Math.ceil(this.canvas.height / tileSize) + 1, map.height);

    for (let y = Math.max(0, startY); y < endY; y++) {
      for (let x = Math.max(0, startX); x < endX; x++) {
        const tile = map.tiles[y][x];
        if (!tile.discovered) continue;

        const screenX = x * tileSize - camera.x;
        const screenY = y * tileSize - camera.y;

        // Get tile color based on type
        let color = this.getTileColor(tile.type);
        
        // Darken if not visible
        if (!tile.visible) {
          color = this.darkenColor(color, 0.5);
        }

        this.ctx.fillStyle = color;
        this.ctx.fillRect(screenX, screenY, tileSize, tileSize);

        // Draw tile borders for buildings
        if (tile.type === 'building') {
          this.ctx.strokeStyle = '#444444';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(screenX, screenY, tileSize, tileSize);
        }
      }
    }
  }

  private getTileColor(type: string): string {
    switch (type) {
      case 'grass': return '#4a7c59';
      case 'dirt': return '#8b4513';
      case 'stone': return '#696969';
      case 'water': return '#4682b4';
      case 'ruins': return '#2f2f2f';
      case 'building': return '#654321';
      case 'sand': return '#f4a460';
      default: return '#333333';
    }
  }

  private darkenColor(color: string, factor: number): string {
    const hex = color.replace('#', '');
    const r = Math.floor(parseInt(hex.substr(0, 2), 16) * factor);
    const g = Math.floor(parseInt(hex.substr(2, 2), 16) * factor);
    const b = Math.floor(parseInt(hex.substr(4, 2), 16) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }

  private renderPlayer() {
    if (!this.gameState.player) return;

    const camera = this.gameState.camera;
    const screenX = this.gameState.player.position.x - camera.x;
    const screenY = this.gameState.player.position.y - camera.y;

    // Draw player as a colored circle
    this.ctx.fillStyle = '#ff4444';
    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY, 12, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw direction indicator
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    let dirX = 0, dirY = 0;
    switch (this.gameState.player.direction) {
      case 'up': dirY = -8; break;
      case 'down': dirY = 8; break;
      case 'left': dirX = -8; break;
      case 'right': dirX = 8; break;
    }
    this.ctx.arc(screenX + dirX, screenY + dirY, 3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private renderNPCs() {
    if (!this.gameState.currentMap.npcs) return;

    const camera = this.gameState.camera;

    this.gameState.currentMap.npcs.forEach(npc => {
      const tileX = Math.floor(npc.position.x / 32);
      const tileY = Math.floor(npc.position.y / 32);
      const tile = this.gameState.currentMap.tiles[tileY]?.[tileX];
      
      if (!tile?.visible) return;

      const screenX = npc.position.x - camera.x;
      const screenY = npc.position.y - camera.y;

      // Draw NPC as a colored circle
      this.ctx.fillStyle = npc.isHostile ? '#ff8800' : '#44ff44';
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, 10, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw name above NPC
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(npc.name, screenX, screenY - 15);
    });
  }

  private renderEnemies() {
    if (!this.gameState.currentMap.enemies) return;

    const camera = this.gameState.camera;

    this.gameState.currentMap.enemies.forEach(enemy => {
      const tileX = Math.floor(enemy.position.x / 32);
      const tileY = Math.floor(enemy.position.y / 32);
      const tile = this.gameState.currentMap.tiles[tileY]?.[tileX];
      
      if (!tile?.visible) return;

      const screenX = enemy.position.x - camera.x;
      const screenY = enemy.position.y - camera.y;

      // Draw enemy as a colored circle
      this.ctx.fillStyle = '#ff0000';
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, 8, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  private renderUI() {
    // Health bar
    const healthPercent = this.gameState.player.health / this.gameState.player.maxHealth;
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(10, 10, 200 * healthPercent, 20);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.strokeRect(10, 10, 200, 20);

    // Energy bar
    const energyPercent = this.gameState.player.energy / this.gameState.player.maxEnergy;
    this.ctx.fillStyle = '#0066ff';
    this.ctx.fillRect(10, 35, 200 * energyPercent, 15);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.strokeRect(10, 35, 200, 15);

    // Level and experience
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Level ${this.gameState.player.level}`, 10, 70);
    this.ctx.fillText(`XP: ${this.gameState.player.experience}/${this.gameState.player.experienceToNext}`, 10, 85);

    // Position info
    const tileX = Math.floor(this.gameState.player.position.x / 32);
    const tileY = Math.floor(this.gameState.player.position.y / 32);
    this.ctx.fillText(`Position: ${tileX}, ${tileY}`, 10, 100);

    // Time of day
    const timeOfDay = this.gameState.dayNightCycle < 0.25 ? 'Night' :
                     this.gameState.dayNightCycle < 0.5 ? 'Morning' :
                     this.gameState.dayNightCycle < 0.75 ? 'Day' : 'Evening';
    this.ctx.fillText(`Time: ${timeOfDay}`, 10, 115);
  }

  private handleInteraction() {
    if (!this.gameState.player) return;

    const playerTileX = Math.floor(this.gameState.player.position.x / 32);
    const playerTileY = Math.floor(this.gameState.player.position.y / 32);

    // Check for NPCs in adjacent tiles
    const npc = this.findNearbyNPC(playerTileX, playerTileY);
    if (npc) {
      this.startDialogue(npc);
      return;
    }

    // Check for enemies in adjacent tiles
    const enemy = this.findNearbyEnemy(playerTileX, playerTileY);
    if (enemy) {
      this.startCombat([enemy]);
      return;
    }

    // Check for lootables
    const lootable = this.findNearbyLootable(playerTileX, playerTileY);
    if (lootable && !lootable.looted) {
      if (this.lootableCallback) {
        this.lootableCallback(lootable);
      }
      return;
    }
  }

  private findNearbyNPC(playerX: number, playerY: number): NPC | null {
    if (!this.gameState.currentMap.npcs) return null;

    return this.gameState.currentMap.npcs.find(npc => {
      const npcTileX = Math.floor(npc.position.x / 32);
      const npcTileY = Math.floor(npc.position.y / 32);
      const distance = Math.abs(npcTileX - playerX) + Math.abs(npcTileY - playerY);
      return distance <= 1;
    }) || null;
  }

  private findNearbyEnemy(playerX: number, playerY: number): Enemy | null {
    if (!this.gameState.currentMap.enemies) return null;

    return this.gameState.currentMap.enemies.find(enemy => {
      const enemyTileX = Math.floor(enemy.position.x / 32);
      const enemyTileY = Math.floor(enemy.position.y / 32);
      const distance = Math.abs(enemyTileX - playerX) + Math.abs(enemyTileY - playerY);
      return distance <= 1;
    }) || null;
  }

  private findNearbyLootable(playerX: number, playerY: number): any | null {
    if (!this.gameState.currentMap.lootables) return null;

    return this.gameState.currentMap.lootables.find(lootable => {
      const lootTileX = Math.floor(lootable.position.x / 32);
      const lootTileY = Math.floor(lootable.position.y / 32);
      const distance = Math.abs(lootTileX - playerX) + Math.abs(lootTileY - playerY);
      return distance <= 1;
    }) || null;
  }

  private startDialogue(npc: NPC) {
    this.gameState.dialogue = {
      npcId: npc.id,
      currentNode: 'greeting',
      history: [],
      choices: npc.dialogue.find(d => d.id === 'greeting')?.choices || []
    };
    this.gameState.gameMode = 'dialogue';
    this.notifyStateChange();
  }

  private startCombat(enemies: Enemy[]) {
    this.gameState.combat = {
      participants: [this.gameState.player, ...enemies],
      turnOrder: [this.gameState.player, ...enemies],
      currentTurn: 0,
      round: 1,
      selectedTargets: [],
      animations: [],
      battleground: [],
      weather: this.gameState.weather,
      timeOfDay: 'day',
      isPlayerTurn: true,
      combatLog: [`Combat begins against ${enemies.map(e => e.name).join(', ')}!`]
    };
    this.gameState.gameMode = 'combat';
    this.notifyStateChange();
  }

  private openInventory() {
    this.gameState.gameMode = 'inventory';
    this.notifyStateChange();
  }

  private openEquipment() {
    this.gameState.gameMode = 'equipment';
    this.notifyStateChange();
  }

  private openCharacterScreen() {
    this.gameState.gameMode = 'character';
    this.notifyStateChange();
  }

  private openQuestScreen() {
    this.gameState.gameMode = 'quests';
    this.notifyStateChange();
  }

  private openMapScreen() {
    this.gameState.gameMode = 'map';
    this.notifyStateChange();
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

  private openMainMenu() {
    // This would typically pause the game and show a menu
    console.log('Main menu requested');
  }

  public setStateChangeCallback(callback: (newState: GameState) => void) {
    this.stateChangeCallback = callback;
  }

  public setLootableCallback(callback: (lootable: any) => void) {
    this.lootableCallback = callback;
  }

  private notifyStateChange() {
    if (this.stateChangeCallback) {
      this.stateChangeCallback(JSON.parse(JSON.stringify(this.gameState)));
    }
  }

  public setGameState(newState: GameState) {
    this.gameState = JSON.parse(JSON.stringify(newState));
  }

  public getGameState(): GameState {
    return JSON.parse(JSON.stringify(this.gameState));
  }

  public handleCombatAction(action: string, targetIndex?: number) {
    // Combat action handling would go here
    console.log('Combat action:', action, targetIndex);
  }

  public destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}