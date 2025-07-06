Here's the fixed version with all missing closing brackets and proper whitespace:

```typescript
import { GameState, Position, Character, Enemy, NPC, Tile, GameMap } from '../types/game';
import { maps } from '../data/maps';
import { getBuildingByPosition, getBuildingById } from '../data/buildings';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private settings: any;
  private keys: { [key: string]: boolean } = {};
  private lastTime = 0;
  private animationId: number | null = null;
  private stateChangeCallback?: (newState: GameState) => void;
  private lootableCallback?: (lootable: any) => void;
  private loadedMaps: { [key: string]: GameMap } = {};
  private isTransitioning = false;
  private transitionCooldown = 0;
  private edgeTimer = 0;
  private isAtEdge = false;
  private edgeDirection: 'north' | 'south' | 'east' | 'west' | null = null;
  
  // Performance optimization properties
  private frameCount = 0;
  private lastFpsTime = 0;
  private targetFps = 60;
  private frameInterval = 1000 / this.targetFps;
  private lastRenderTime = 0;
  private visibleTileCache: { [key: string]: boolean } = {};
  private lastCameraPosition = { x: -1, y: -1 };
  private renderBounds = { startX: 0, startY: 0, endX: 0, endY: 0 };
  private isLowPerformanceDevice = false;
  private tileRenderCache: ImageData | null = null;
  private cacheInvalidated = true;
  private lastPlayerPosition = { x: -1, y: -1 };
  private renderSkipCounter = 0;
  private maxRenderSkip = 2;

  constructor(canvas: HTMLCanvasElement, initialGameState: GameState, settings?: any) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gameState = { ...initialGameState };
    this.settings = settings || { lowGraphicsMode: false };
    
    this.canvas.width = 800;
    this.canvas.height = 600;
    
    // Detect low performance devices
    this.detectPerformance();
    
    // Load only current map initially
    this.loadedMaps[this.gameState.currentMap.id] = this.gameState.currentMap;
    
    this.setupEventListeners();
    this.gameLoop(0);
  }

  private detectPerformance() {
    // Simple performance detection based on user agent and hardware
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isOldBrowser = !window.requestAnimationFrame || !window.performance;
    
    // Check for hardware acceleration
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const hasWebGL = !!gl;
    
    this.isLowPerformanceDevice = isMobile || isOldBrowser || !hasWebGL;
    
    if (this.isLowPerformanceDevice) {
      this.targetFps = 30; // Lower FPS for low-end devices
      this.frameInterval = 1000 / this.targetFps;
      this.settings.lowGraphicsMode = true;
      this.maxRenderSkip = 3; // Skip more frames on low-end devices
    }
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

    // Handle visibility change to pause/resume game
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseGame();
      } else {
        this.resumeGame();
      }
    });
  }

  private pauseGame() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private resumeGame() {
    if (!this.animationId) {
      this.lastTime = performance.now();
      this.gameLoop(this.lastTime);
    }
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
      case 'escape':
        // Exit building if in interior
        if (this.gameState.currentMap.isInterior && this.gameState.previousMap) {
          this.exitBuilding();
        }
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
    const interactionRange = 64; // 2 tiles for better building detection
    
    // Check for enterable buildings first
    const playerTileX = Math.floor(playerPos.x / 32);
    const playerTileY = Math.floor(playerPos.y / 32);
    
    // Check surrounding tiles for enterable buildings
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const checkY = playerTileY + dy;
        const checkX = playerTileX + dx;
        const tile = this.gameState.currentMap.tiles[checkY]?.[checkX];
        
        if (tile?.isEnterable && tile.buildingId) {
          this.enterBuilding(tile.buildingId);
          return;
        }
      }
    }
    
    // Check for nearby building entrances
    const nearbyBuilding = getBuildingByPosition(playerPos, interactionRange);
    if (nearbyBuilding) {
      this.enterBuilding(nearbyBuilding.id);
      return;
    }

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
    const nearbyLootable = this.gameState.currentMap.lootables.find((lootable, index) => {
      if (lootable.looted) return false;
      const distance = Math.sqrt(
        Math.pow(lootable.position.x - playerPos.x, 2) + 
        Math.pow(lootable.position.y - playerPos.y, 2)
      );
      if (distance <= interactionRange) {
        lootable.looted = true;
        return true;
      }
      return false;
    });

    if (nearbyLootable && this.lootableCallback) {
      this.lootableCallback(nearbyLootable);
      
      setTimeout(() => {
        const lootIndex = this.gameState.currentMap.lootables.findIndex(l => l.id === nearbyLootable.id);
        if (lootIndex >= 0) {
          this.gameState.currentMap.lootables.splice(lootIndex, 1);
          this.notifyStateChange();
        }
      }, 100);
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
    if (this.isTransitioning) return;

    if (this.transitionCooldown > 0) {
      this.transitionCooldown -= deltaTime;
    }

    // Reduce movement speed slightly for smoother movement
    const speed = this.isLowPerformanceDevice ? 96 : 112;
    const moveDistance = speed * (deltaTime / 1000);
    
    let newX = this.gameState.player.position.x;
    let newY = this.gameState.player.position.y;
    let moved = false;

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
      const mapWidth = this.gameState.currentMap.width * 32;
      const mapHeight = this.gameState.currentMap.height * 32;
      
      const atEdge = newX < 16 || newX >= mapWidth - 16 || newY < 16 || newY >= mapHeight - 16;
      
      if (atEdge && this.transitionCooldown <= 0) {
        let currentEdgeDirection: 'north' | 'south' | 'east' | 'west' | null = null;
        if (newX < 16) currentEdgeDirection = 'west';
        else if (newX >= mapWidth - 16) currentEdgeDirection = 'east';
        else if (newY < 16) currentEdgeDirection = 'north';
        else if (newY >= mapHeight - 16) currentEdgeDirection = 'south';
        
        if (!this.isAtEdge || this.edgeDirection !== currentEdgeDirection) {
          this.isAtEdge = true;
          this.edgeDirection = currentEdgeDirection;
          this.edgeTimer = 0;
        } else {
          this.edgeTimer += deltaTime;
          
          if (this.edgeTimer >= 2000) {
            this.handleMapTransition(newX, newY, mapWidth, mapHeight);
            return;
          }
        }
      } else {
        this.isAtEdge = false;
        this.edgeDirection = null;
        this.edgeTimer = 0;
      }

      const tileX = Math.floor(newX / 32);
      const tileY = Math.floor(newY / 32);
      
      if (this.isValidPosition(tileX, tileY)) {
        this.gameState.player.position.x = newX;
        this.gameState.player.position.y = newY;
        this.gameState.player.isMoving = true;
        
        // Only update camera and visibility if player moved significantly
        const playerMoved = Math.abs(newX - this.lastPlayerPosition.x) > 8 || 
                           Math.abs(newY - this.lastPlayerPosition.y) > 8;
        
        if (playerMoved) {
          this.updateCamera();
          this.updateVisibility();
          this.lastPlayerPosition = { x: newX, y: newY };
          this.cacheInvalidated = true;
        }
        
        this.gameState.statistics.distanceTraveled += moveDistance;
      }
    } else {
      this.gameState.player.isMoving = false;
    }
  }

  private handleMapTransition(newX: number, newY: number, mapWidth: number, mapHeight: number) {
    if (this.isTransitioning || this.transitionCooldown > 0) return;
    
    this.isAtEdge = false;
    this.edgeDirection = null;
    this.edgeTimer = 0;
    
    this.isTransitioning = true;
    this.transitionCooldown = 1000;
    
    let direction: 'north' | 'south' | 'east' | 'west' | null = null;
    
    if (newX < 16) direction = 'west';
    else if (newX >= mapWidth - 16) direction = 'east';
    else if (newY < 16) direction = 'north';
    else if (newY >= mapHeight - 16) direction = 'south';
    
    if (!direction) {
      this.isTransitioning = false;
      return;
    }
    
    const connection = this.gameState.currentMap.connections.find(conn => conn.direction === direction);
    if (!connection) {
      this.isTransitioning = false;
      return;
    }
    
    let targetMap = this.loadedMaps[connection.targetMapId];
    if (!targetMap) {
      const createMapFn = maps[connection.targetMapId as keyof typeof maps];
      if (createMapFn) {
        targetMap = createMapFn();
        this.loadedMaps[connection.targetMapId] = targetMap;
      } else {
        this.isTransitioning = false;
        return;
      }
    }
    
    let targetPosition: Position;
    const safeMargin = 64;
    
    switch (direction) {
      case 'north':
        targetPosition = { 
          x: Math.max(safeMargin, Math.min(connection.toPosition.x, (targetMap.width - 2) * 32)), 
          y: (targetMap.height - 3) * 32 
        };
        break;
      case 'south':
        targetPosition = { 
          x: Math.max(safeMargin, Math.min(connection.toPosition.x, (targetMap.width - 2) * 32)), 
          y: safeMargin 
        };
        break;
      case 'east':
        targetPosition = { 
          x: safeMargin, 
          y: Math.max(safeMargin, Math.min(connection.toPosition.y, (targetMap.height - 2) * 32)) 
        };
        break;
      case 'west':
        targetPosition = { 
          x: (targetMap.width - 3) * 32, 
          y: Math.max(safeMargin, Math.min(connection.toPosition.y, (targetMap.height - 2) * 32)) 
        };
        break;
      default:
        this.isTransitioning = false;
        return;
    }
    
    this.gameState.currentMap = targetMap;
    this.gameState.player.position = { ...targetPosition };
    
    const tileX = Math.floor(this.gameState.player.position.x / 32);
    const tileY = Math.floor(this.gameState.player.position.y / 32);
    
    if (!this.isValidPosition(tileX, tileY)) {
      let found = false;
      for (let radius = 1; radius <= 10 && !found; radius++) {
        for (let dy = -radius; dy <= radius && !found; dy++) {
          for (let dx = -radius; dx <= radius && !found; dx++) {
            if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
              const checkX = tileX + dx;
              const checkY = tileY + dy;
              if (this.isValidPosition(checkX, checkY)) {
                this.gameState.player.position.x = checkX * 32 + 16;
                this.gameState.player.position.y = checkY * 32 + 16;
                found = true;
              }
            }
          }
        }
      }
    }
    
    // Clear caches for new map
    this.visibleTileCache = {};
    this.lastCameraPosition = { x: -1, y: -1 };
    
    this.updateCamera();
    this.updateVisibility();
    this.notifyStateChange();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500);
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
    
    const newCameraX = this.gameState.player.position.x - centerX;
    const newCameraY = this.gameState.player.position.y - centerY;
    
    // Use actual tile array dimensions instead of declared map dimensions
    const actualMapHeight = this.gameState.currentMap.tiles.length;
    const actualMapWidth = this.gameState.currentMap.tiles[0]?.length || 0;
    const mapWidth = actualMapWidth * 32;
    const mapHeight = actualMapHeight * 32;
    
    this.gameState.camera.x = Math.max(0, Math.min(newCameraX, mapWidth - this.canvas.width));
    this.gameState.camera.y = Math.max(0, Math.min(newCameraY, mapHeight - this.canvas.height));

    // Update render bounds only if camera moved significantly (increased threshold)
    if (Math.abs(this.gameState.camera.x - this.lastCameraPosition.x) > 32 || 
        Math.abs(this.gameState.camera.y - this.lastCameraPosition.y) > 32) {
      
      this.renderBounds.startX = Math.max(0, Math.floor(this.gameState.camera.x / 32) - 1);
      this.renderBounds.startY = Math.max(0, Math.floor(this.gameState.camera.y / 32) - 1);
      this.renderBounds.endX = Math.min(this.renderBounds.startX + Math.ceil(this.canvas.width / 32) + 2, actualMapWidth);
      this.renderBounds.endY = Math.min(this.renderBounds.startY + Math.ceil(this.canvas.height / 32) + 2, actualMapHeight);
      
      this.lastCameraPosition = { ...this.gameState.camera };
      this.cacheInvalidated = true;
    }
  }

  private updateVisibility() {
    const playerTileX = Math.floor(this.gameState.player.position.x / 32);
    const playerTileY = Math.floor(this.gameState.player.position.y / 32);
    const visionRange = this.isLowPerformanceDevice ? 6 : 8; // Reduce vision range on low-end devices
    
    const actualMapHeight = this.gameState.currentMap.tiles.length;
    const actualMapWidth = this.gameState.currentMap.tiles[0]?.length || 0;
    
    if (!this.gameState.visibilityMap || this.gameState.visibilityMap.length !== actualMapHeight) {
      this.gameState.visibilityMap = Array(actualMapHeight)
        .fill(null)
        .map(() => Array(actualMapWidth).fill(false));
    }
    
    // Only update visibility for tiles in a smaller area around player
    const visibilityBounds = {
      startX: Math.max(0, playerTileX - visionRange - 2),
      startY: Math.max(0, playerTileY - visionRange - 2),
      endX: Math.min(actualMapWidth, playerTileX + visionRange + 3),
      endY: Math.min(actualMapHeight, playerTileY + visionRange + 3)
    };
    
    for (let y = visibilityBounds.startY; y < visibilityBounds.endY; y++) {
      for (let x = visibilityBounds.startX; x < visibilityBounds.endX; x++) {
        if (y >= 0 && y < actualMapHeight && x >= 0 && x < actualMapWidth) {
          this.gameState.currentMap.tiles[y][x].visible = false;
        }
      }
    }
    
    // Set visibility around player
    const minY = Math.max(0, playerTileY - visionRange);
    const maxY = Math.min(actualMapHeight, playerTileY + visionRange + 1);
    const minX = Math.max(0, playerTileX - visionRange);
    const maxX = Math.min(actualMapWidth, playerTileX + visionRange + 1);
    
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        if (y >= 0 && y < actualMapHeight && x >= 0 && x < actualMapWidth) {
          const distance = Math.sqrt(Math.pow(x - playerTileX, 2) + Math.pow(y - playerTileY, 2));
          if (distance <= visionRange) {
            this.gameState.currentMap.tiles[y][x].visible = true;
            this.gameState.currentMap.tiles[y][x].discovered = true;
            this.gameState.visibilityMap[y][x] = true;
          }
        }
      }
    }
  }

  private gameLoop(currentTime: number) {
    // Improved frame rate limiting with skip logic
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= this.frameInterval) {
      this.lastTime = currentTime - (deltaTime % this.frameInterval);
      
      // Update game logic
      this.updatePlayerMovement(deltaTime);
      this.updateGameTime(deltaTime);

      // Smart rendering - skip frames when performance is poor
      const shouldRender = this.renderSkipCounter >= this.maxRenderSkip || 
                          (currentTime - this.lastRenderTime >= this.frameInterval * 2);
      
      if (shouldRender) {
        this.render();
        this.lastRenderTime = currentTime;
        this.renderSkipCounter = 0;
      } else {
        this.renderSkipCounter++;
      }
    }

    // Continue loop
    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  private updateGameTime(deltaTime: number) {
    this.gameState.gameTime += deltaTime / 1000;
    this.gameState.statistics.playtime += deltaTime / 1000;
    
    const dayLength = 24 * 60;
    this.gameState.dayNightCycle = (this.gameState.gameTime % dayLength) / dayLength;
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Always use optimized rendering
    if (true) { // Force optimized rendering for better performance
      this.renderLowGraphics();
    } else {
      this.renderTiles();
      this.renderNPCs();
      this.renderEnemies();
      this.renderLootables();
      this.renderPlayer();
      this.renderUI();
    }
    
    if (this.isAtEdge && this.edgeTimer > 0) {
      this.renderEdgeTimer();
    }
  }
  
  private renderEdgeTimer() {
    const progress = this.edgeTimer / 2000;
    const barWidth = 200;
    const barHeight = 20;
    const x = (this.canvas.width - barWidth) / 2;
    const y = 50;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(x - 10, y - 10, barWidth + 20, barHeight + 20);
    
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(x, y, barWidth, barHeight);
    
    this.ctx.fillStyle = '#ffaa00';
    this.ctx.fillRect(x, y, barWidth * progress, barHeight);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      `Transitioning to ${this.edgeDirection}... ${Math.ceil((2000 - this.edgeTimer) / 1000)}s`,
      this.canvas.width / 2,
      y + barHeight + 25
    );
  }
  
  private renderLowGraphics() {
    // Ensure we have valid render bounds
    const actualMapHeight = this.gameState.currentMap.tiles.length;
    const actualMapWidth = this.gameState.currentMap.tiles[0]?.length || 0;
    
    // Clamp render bounds to actual map size
    const startY = Math.max(0, Math.min(this.renderBounds.startY, actualMapHeight - 1));
    const endY = Math.min(this.renderBounds.endY, actualMapHeight);
    const startX = Math.max(0, Math.min(this.renderBounds.startX, actualMapWidth - 1));
    const endX = Math.min(this.renderBounds.endX, actualMapWidth);
    
    // Batch rendering for better performance
    this.ctx.save();
    
    // Pre-calculate colors to avoid repeated function calls
    const colorCache = new Map<string, string>();
    
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if (!this.gameState.currentMap.tiles[y] || !this.gameState.currentMap.tiles[y][x]) {
          continue;
        }
        
        const tile = this.gameState.currentMap.tiles[y][x];
        
        // For interior maps, always render tiles
        if (!this.gameState.currentMap.isInterior && !tile.discovered) continue;

        const screenX = x * 32 - this.gameState.camera.x;
        const screenY = y * 32 - this.gameState.camera.y;
        
        // Skip tiles that are completely off-screen
        if (screenX < -32 || screenX > this.canvas.width || 
            screenY < -32 || screenY > this.canvas.height) continue;

        const cacheKey = `${tile.type}_${tile.visible}_${this.gameState.currentMap.isInterior}`;
        let color = colorCache.get(cacheKey);
        
        if (!color) {
          color = this.getTileColor(tile.type);
          if (!this.gameState.currentMap.isInterior && !tile.visible) {
            color = this.darkenColor(color, 0.5);
          }
          colorCache.set(cacheKey, color);
        }

        this.ctx.fillStyle = color;
        this.ctx.fillRect(screenX, screenY, 32, 32);
      }
    }
    
    this.ctx.restore();
    
    this.renderPlayer();
    this.renderNearbyEntities();
    this.renderSimpleUI();