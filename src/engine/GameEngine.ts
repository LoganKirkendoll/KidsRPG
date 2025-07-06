import { GameState, Position, Character, Enemy, NPC, Tile, GameMap } from '../types/game';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private keys: { [key: string]: boolean } = {};
  private lastTime = 0;
  private animationId: number | null = null;
  private stateChangeCallback?: (newState: GameState) => void;
  private lootableCallback?: (lootable: any) => void;

  constructor(canvas: HTMLCanvasElement, initialGameState: GameState) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gameState = { ...initialGameState };
    
    this.canvas.width = 800;
    this.canvas.height = 600;
    
    this.setupEventListeners();
    this.gameLoop(0);
  }

  private setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.handleKeyPress(e.key.toLowerCase());
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Prevent default behavior for game keys
    window.addEventListener('keydown', (e) => {
      const gameKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'f', 'i', 'e', 'c', 'q', 'm', 'escape'];
      if (gameKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    });
  }

  private handleKeyPress(key: string) {
    if (this.gameState.gameMode !== 'exploration') return;

    switch (key) {
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
      case 'f1':
        this.gameState.devMode = this.gameState.devMode || {
          enabled: false,
          selectedTool: 'quest',
          questEditor: { id: '', title: '', description: '', objectives: [], rewards: [], requiredLevel: 1 },
          npcEditor: { id: '', name: '', type: 'neutral', position: { x: 400, y: 400 }, dialogue: [], inventory: [], faction: 'neutral', isHostile: false },
          itemEditor: { id: '', name: '', type: 'material', rarity: 'common', description: '', stats: {}, value: 10, stackable: false }
        };
        this.gameState.devMode.enabled = !this.gameState.devMode.enabled;
        this.notifyStateChange();
        break;
      case ' ':
      case 'f':
        this.handleInteraction();
        break;
    }
  }

  private handleInteraction() {
    const playerPos = this.gameState.player.position;
    const interactionRange = 48; // 1.5 tiles

    // Check for NPCs
    const nearbyNPC = this.gameState.currentMap.npcs.find(npc => {
      const distance = Math.sqrt(
        Math.pow(npc.position.x - playerPos.x, 2) + 
        Math.pow(npc.position.y - playerPos.y, 2)
      );
      return distance <= interactionRange;
    });

    if (nearbyNPC) {
      this.startDialogue(nearbyNPC);
      return;
    }

    // Check for enemies (start combat)
    const nearbyEnemy = this.gameState.currentMap.enemies.find(enemy => {
      const distance = Math.sqrt(
        Math.pow(enemy.position.x - playerPos.x, 2) + 
        Math.pow(enemy.position.y - playerPos.y, 2)
      );
      return distance <= interactionRange;
    });

    if (nearbyEnemy) {
      this.startCombat([nearbyEnemy]);
      return;
    }

    // Check for lootables
    const nearbyLootable = this.gameState.currentMap.lootables.find(lootable => {
      if (lootable.looted) return false;
      const distance = Math.sqrt(
        Math.pow(lootable.position.x - playerPos.x, 2) + 
        Math.pow(lootable.position.y - playerPos.y, 2)
      );
      return distance <= interactionRange;
    });

    if (nearbyLootable && this.lootableCallback) {
      this.lootableCallback(nearbyLootable);
      return;
    }
  }

  private startDialogue(npc: NPC) {
    if (npc.dialogue.length > 0) {
      const firstNode = npc.dialogue[0];
      this.gameState.dialogue = {
        npcId: npc.id,
        currentNode: firstNode.id,
        history: [`${npc.name}: ${firstNode.text}`],
        choices: firstNode.choices
      };
      this.gameState.gameMode = 'dialogue';
      this.notifyStateChange();
    }
  }

  private startCombat(enemies: Enemy[]) {
    const participants = [this.gameState.player, ...enemies];
    const turnOrder = [...participants].sort((a, b) => {
      const aAgility = 'stats' in a ? a.stats.agility : 5;
      const bAgility = 'stats' in b ? b.stats.agility : 5;
      return bAgility - aAgility;
    });

    this.gameState.combat = {
      participants,
      turnOrder,
      currentTurn: 0,
      round: 1,
      selectedTargets: [],
      animations: [],
      battleground: this.gameState.currentMap.tiles,
      weather: this.gameState.weather,
      timeOfDay: 'day',
      isPlayerTurn: turnOrder[0] === this.gameState.player,
      combatLog: ['Combat begins!']
    };
    
    this.gameState.gameMode = 'combat';
    this.notifyStateChange();
  }

  private updatePlayerMovement(deltaTime: number) {
    if (this.gameState.gameMode !== 'exploration') return;

    const speed = 128; // pixels per second
    const moveDistance = speed * (deltaTime / 1000);
    
    let newX = this.gameState.player.position.x;
    let newY = this.gameState.player.position.y;
    let moved = false;

    // Handle movement
    if (this.keys['w'] || this.keys['arrowup']) {
      newY -= moveDistance;
      this.gameState.player.direction = 'up';
      moved = true;
    }
    if (this.keys['s'] || this.keys['arrowdown']) {
      newY += moveDistance;
      this.gameState.player.direction = 'down';
      moved = true;
    }
    if (this.keys['a'] || this.keys['arrowleft']) {
      newX -= moveDistance;
      this.gameState.player.direction = 'left';
      moved = true;
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      newX += moveDistance;
      this.gameState.player.direction = 'right';
      moved = true;
    }

    if (moved) {
      // Check map boundaries and handle transitions
      const mapWidth = this.gameState.currentMap.width * 32;
      const mapHeight = this.gameState.currentMap.height * 32;
      
      // Check for map transitions
      if (newX < 0 || newX >= mapWidth || newY < 0 || newY >= mapHeight) {
        this.handleMapTransition(newX, newY, mapWidth, mapHeight);
        return;
      }

      // Check collision with tiles
      const tileX = Math.floor(newX / 32);
      const tileY = Math.floor(newY / 32);
      
      // Add bounds checking to prevent getting stuck
      if (tileX >= 0 && tileY >= 0 && 
          tileX < this.gameState.currentMap.width && 
          tileY < this.gameState.currentMap.height &&
          this.isValidPosition(tileX, tileY)) {
        this.gameState.player.position.x = newX;
        this.gameState.player.position.y = newY;
        this.gameState.player.isMoving = true;
        
        // Update camera to follow player
        this.updateCamera();
        
        // Update visibility
        this.updateVisibility();
        
        // Update statistics
        this.gameState.statistics.distanceTraveled += moveDistance;
      }
    } else {
      this.gameState.player.isMoving = false;
    }
  }

  private handleMapTransition(newX: number, newY: number, mapWidth: number, mapHeight: number) {
    let direction: 'north' | 'south' | 'east' | 'west' | null = null;
    
    if (newX < -16) direction = 'west';
    else if (newX >= mapWidth + 16) direction = 'east';
    else if (newY < -16) direction = 'north';
    else if (newY >= mapHeight + 16) direction = 'south';
    
    if (!direction) return;
    
    // Find connection for this direction
    const connection = this.gameState.currentMap.connections.find(conn => conn.direction === direction);
    if (!connection) return;
    
    // Get target map
    const targetMap = this.gameState.availableMaps[connection.targetMapId];
    if (!targetMap) return;
    
    // Store previous map
    this.gameState.previousMap = {
      map: this.gameState.currentMap,
      position: { ...this.gameState.player.position }
    };
    
    // Switch to new map
    this.gameState.currentMap = targetMap;
    
    // Set player position at the connection point
    this.gameState.player.position = { ...connection.toPosition };
    
    // Update camera and visibility
    this.updateCamera();
    this.updateVisibility();
    
    // Notify state change
    this.notifyStateChange();
  }

  private isValidPosition(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileY < 0 || 
        tileY >= this.gameState.currentMap.tiles.length || 
        tileX >= this.gameState.currentMap.tiles[0].length) {
      return false;
    }
    
    const tile = this.gameState.currentMap.tiles[tileY][tileX];
    return tile.walkable;
  }

  private updateCamera() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    this.gameState.camera.x = this.gameState.player.position.x - centerX;
    this.gameState.camera.y = this.gameState.player.position.y - centerY;
    
    // Clamp camera to map bounds
    const mapWidth = this.gameState.currentMap.width * 32;
    const mapHeight = this.gameState.currentMap.height * 32;
    
    this.gameState.camera.x = Math.max(0, Math.min(this.gameState.camera.x, mapWidth - this.canvas.width));
    this.gameState.camera.y = Math.max(0, Math.min(this.gameState.camera.y, mapHeight - this.canvas.height));
  }

  private updateVisibility() {
    const playerTileX = Math.floor(this.gameState.player.position.x / 32);
    const playerTileY = Math.floor(this.gameState.player.position.y / 32);
    const visionRange = 8;
    
    // Initialize visibility map if needed
    if (!this.gameState.visibilityMap || this.gameState.visibilityMap.length !== this.gameState.currentMap.height) {
      this.gameState.visibilityMap = Array(this.gameState.currentMap.height)
        .fill(null)
        .map(() => Array(this.gameState.currentMap.width).fill(false));
    }
    
    // Clear current visibility
    for (let y = 0; y < this.gameState.currentMap.height; y++) {
      for (let x = 0; x < this.gameState.currentMap.width; x++) {
        this.gameState.currentMap.tiles[y][x].visible = false;
      }
    }
    
    // Set visibility around player
    for (let y = Math.max(0, playerTileY - visionRange); 
         y < Math.min(this.gameState.currentMap.height, playerTileY + visionRange + 1); 
         y++) {
      for (let x = Math.max(0, playerTileX - visionRange); 
           x < Math.min(this.gameState.currentMap.width, playerTileX + visionRange + 1); 
           x++) {
        const distance = Math.sqrt(Math.pow(x - playerTileX, 2) + Math.pow(y - playerTileY, 2));
        if (distance <= visionRange) {
          this.gameState.currentMap.tiles[y][x].visible = true;
          this.gameState.currentMap.tiles[y][x].discovered = true;
          this.gameState.visibilityMap[y][x] = true;
        }
      }
    }
  }

  private gameLoop(currentTime: number) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Update game logic
    this.updatePlayerMovement(deltaTime);
    this.updateGameTime(deltaTime);

    // Render
    this.render();

    // Continue loop
    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  private updateGameTime(deltaTime: number) {
    this.gameState.gameTime += deltaTime / 1000;
    this.gameState.statistics.playtime += deltaTime / 1000;
    
    // Update day/night cycle (24 minutes = 1 day)
    const dayLength = 24 * 60; // 24 minutes in seconds
    this.gameState.dayNightCycle = (this.gameState.gameTime % dayLength) / dayLength;
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render tiles
    this.renderTiles();
    
    // Render entities
    this.renderNPCs();
    this.renderEnemies();
    this.renderLootables();
    
    // Render player
    this.renderPlayer();
    
    // Render UI
    this.renderUI();
  }

  private renderTiles() {
    const startX = Math.floor(this.gameState.camera.x / 32);
    const startY = Math.floor(this.gameState.camera.y / 32);
    const endX = Math.min(startX + Math.ceil(this.canvas.width / 32) + 1, this.gameState.currentMap.width);
    const endY = Math.min(startY + Math.ceil(this.canvas.height / 32) + 1, this.gameState.currentMap.height);

    for (let y = Math.max(0, startY); y < endY; y++) {
      for (let x = Math.max(0, startX); x < endX; x++) {
        const tile = this.gameState.currentMap.tiles[y][x];
        if (!tile.discovered) continue;

        const screenX = x * 32 - this.gameState.camera.x;
        const screenY = y * 32 - this.gameState.camera.y;

        // Get tile color based on type
        let color = this.getTileColor(tile.type);
        
        // Darken if not visible
        if (!tile.visible) {
          color = this.darkenColor(color, 0.5);
        }

        this.ctx.fillStyle = color;
        this.ctx.fillRect(screenX, screenY, 32, 32);

        // Draw tile border
        this.ctx.strokeStyle = this.darkenColor(color, 0.8);
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(screenX, screenY, 32, 32);
      }
    }
  }

  private getTileColor(type: string): string {
    switch (type) {
      case 'grass': return '#4a7c59';
      case 'dirt': return '#8b4513';
      case 'stone': return '#696969';
      case 'water': return '#4682b4';
      case 'lava': return '#ff4500';
      case 'ice': return '#b0e0e6';
      case 'sand': return '#f4a460';
      case 'ruins': return '#2f2f2f';
      case 'building': return '#654321';
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
    const screenX = this.gameState.player.position.x - this.gameState.camera.x;
    const screenY = this.gameState.player.position.y - this.gameState.camera.y;

    // Player body
    this.ctx.fillStyle = '#4a90e2';
    this.ctx.fillRect(screenX - 12, screenY - 12, 24, 24);
    
    // Player direction indicator
    this.ctx.fillStyle = '#ffffff';
    switch (this.gameState.player.direction) {
      case 'up':
        this.ctx.fillRect(screenX - 4, screenY - 12, 8, 4);
        break;
      case 'down':
        this.ctx.fillRect(screenX - 4, screenY + 8, 8, 4);
        break;
      case 'left':
        this.ctx.fillRect(screenX - 12, screenY - 4, 4, 8);
        break;
      case 'right':
        this.ctx.fillRect(screenX + 8, screenY - 4, 4, 8);
        break;
    }

    // Player name
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.gameState.player.name, screenX, screenY - 20);
  }

  private renderNPCs() {
    this.gameState.currentMap.npcs.forEach(npc => {
      const screenX = npc.position.x - this.gameState.camera.x;
      const screenY = npc.position.y - this.gameState.camera.y;

      // Only render if on screen and in discovered area
      if (screenX < -32 || screenX > this.canvas.width + 32 || 
          screenY < -32 || screenY > this.canvas.height + 32) return;

      const tileX = Math.floor(npc.position.x / 32);
      const tileY = Math.floor(npc.position.y / 32);
      if (!this.gameState.currentMap.tiles[tileY]?.[tileX]?.discovered) return;

      // NPC body
      this.ctx.fillStyle = npc.isHostile ? '#ff4444' : '#44ff44';
      this.ctx.fillRect(screenX - 10, screenY - 10, 20, 20);

      // NPC name
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(npc.name, screenX, screenY - 15);
    });
  }

  private renderEnemies() {
    this.gameState.currentMap.enemies.forEach(enemy => {
      const screenX = enemy.position.x - this.gameState.camera.x;
      const screenY = enemy.position.y - this.gameState.camera.y;

      // Only render if on screen and in discovered area
      if (screenX < -32 || screenX > this.canvas.width + 32 || 
          screenY < -32 || screenY > this.canvas.height + 32) return;

      const tileX = Math.floor(enemy.position.x / 32);
      const tileY = Math.floor(enemy.position.y / 32);
      if (!this.gameState.currentMap.tiles[tileY]?.[tileX]?.discovered) return;

      // Enemy body
      this.ctx.fillStyle = '#ff0000';
      this.ctx.fillRect(screenX - 10, screenY - 10, 20, 20);

      // Health bar
      const healthPercent = enemy.health / enemy.maxHealth;
      this.ctx.fillStyle = '#333333';
      this.ctx.fillRect(screenX - 12, screenY - 18, 24, 4);
      this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
      this.ctx.fillRect(screenX - 12, screenY - 18, 24 * healthPercent, 4);

      // Enemy name
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(enemy.name, screenX, screenY + 25);
    });
  }

  private renderLootables() {
    this.gameState.currentMap.lootables.forEach(lootable => {
      if (lootable.looted) return;

      const screenX = lootable.position.x - this.gameState.camera.x;
      const screenY = lootable.position.y - this.gameState.camera.y;

      // Only render if on screen and in discovered area
      if (screenX < -32 || screenX > this.canvas.width + 32 || 
          screenY < -32 || screenY > this.canvas.height + 32) return;

      const tileX = Math.floor(lootable.position.x / 32);
      const tileY = Math.floor(lootable.position.y / 32);
      if (!this.gameState.currentMap.tiles[tileY]?.[tileX]?.discovered) return;

      // Lootable container
      this.ctx.fillStyle = '#ffaa00';
      this.ctx.fillRect(screenX - 8, screenY - 8, 16, 16);
      
      // Loot indicator
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('?', screenX, screenY + 4);
    });
  }

  private renderUI() {
    // Health bar
    const healthPercent = this.gameState.player.health / this.gameState.player.maxHealth;
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(10, 10, 200, 20);
    this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
    this.ctx.fillRect(10, 10, 200 * healthPercent, 20);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Health: ${this.gameState.player.health}/${this.gameState.player.maxHealth}`, 15, 25);

    // Energy bar
    const energyPercent = this.gameState.player.energy / this.gameState.player.maxEnergy;
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(10, 35, 200, 20);
    this.ctx.fillStyle = '#0088ff';
    this.ctx.fillRect(10, 35, 200 * energyPercent, 20);
    this.ctx.fillText(`Energy: ${Math.floor(this.gameState.player.energy)}/${this.gameState.player.maxEnergy}`, 15, 50);

    // Level and XP
    this.ctx.fillText(`Level: ${this.gameState.player.level}`, 15, 75);
    this.ctx.fillText(`XP: ${this.gameState.player.experience}/${this.gameState.player.experienceToNext}`, 15, 90);

    // Current map
    this.ctx.fillText(`Location: ${this.gameState.currentMap.name}`, 15, 110);

    // Mini-map
    this.renderMiniMap();
  }

  private renderMiniMap() {
    const miniMapSize = 120;
    const miniMapX = this.canvas.width - miniMapSize - 10;
    const miniMapY = 10;
    
    // Mini-map background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.strokeRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
    
    // Calculate scale
    const scaleX = miniMapSize / this.gameState.currentMap.width;
    const scaleY = miniMapSize / this.gameState.currentMap.height;
    
    // Draw discovered tiles
    for (let y = 0; y < this.gameState.currentMap.height; y++) {
      for (let x = 0; x < this.gameState.currentMap.width; x++) {
        const tile = this.gameState.currentMap.tiles[y][x];
        if (!tile.discovered) continue;
        
        const pixelX = miniMapX + x * scaleX;
        const pixelY = miniMapY + y * scaleY;
        
        this.ctx.fillStyle = tile.visible ? '#888888' : '#444444';
        this.ctx.fillRect(pixelX, pixelY, Math.max(1, scaleX), Math.max(1, scaleY));
      }
    }
    
    // Draw player position
    const playerX = miniMapX + (this.gameState.player.position.x / 32) * scaleX;
    const playerY = miniMapY + (this.gameState.player.position.y / 32) * scaleY;
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(playerX - 1, playerY - 1, 3, 3);
  }

  public setStateChangeCallback(callback: (newState: GameState) => void) {
    this.stateChangeCallback = callback;
  }

  public setLootableCallback(callback: (lootable: any) => void) {
    this.lootableCallback = callback;
  }

  private notifyStateChange() {
    if (this.stateChangeCallback) {
      this.stateChangeCallback({ ...this.gameState });
    }
  }

  public setGameState(newState: GameState) {
    this.gameState = { ...newState };
  }

  public getGameState(): GameState {
    return { ...this.gameState };
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