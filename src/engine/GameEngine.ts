Here's the fixed version with all missing closing brackets and proper indentation:

```typescript
// Previous code remains the same until the handleMapTransition method

private handleMapTransition(newX: number, newY: number, mapWidth: number, mapHeight: number) {
    if (this.isTransitioning) return; // Prevent multiple transitions
    
    this.isTransitioning = true;
    
    let direction: 'north' | 'south' | 'east' | 'west' | null = null;
    
    // Use a smaller buffer for transition detection
    const transitionBuffer = 8;
    
    if (newX < -transitionBuffer) direction = 'west';
    else if (newX >= mapWidth + transitionBuffer) direction = 'east';
    else if (newY < -transitionBuffer) direction = 'north';
    else if (newY >= mapHeight + transitionBuffer) direction = 'south';
    
    if (!direction) return;
    
    // Find connection for this direction
    const connection = this.gameState.currentMap.connections.find(conn => conn.direction === direction);
    if (!connection) {
      this.isTransitioning = false;
      return;
    }
    
    // Load target map if not already loaded
    let targetMap = this.loadedMaps[connection.targetMapId];
    if (!targetMap) {
      // Create the map on demand
      const createMapFn = maps[connection.targetMapId];
      if (createMapFn) {
        targetMap = createMapFn();
        this.loadedMaps[connection.targetMapId] = targetMap;
      } else {
        this.isTransitioning = false;
        return;
      }
    }
    
    // Calculate proper target position based on direction
    let targetPosition: Position;
    switch (direction) {
      case 'north':
        targetPosition = { x: connection.toPosition.x, y: (targetMap.height - 3) * 32 };
        break;
      case 'south':
        targetPosition = { x: connection.toPosition.x, y: 2 * 32 };
        break;
      case 'east':
        targetPosition = { x: 2 * 32, y: connection.toPosition.y };
        break;
      case 'west':
        targetPosition = { x: (targetMap.width - 3) * 32, y: connection.toPosition.y };
        break;
      default:
        targetPosition = { ...connection.toPosition };
    }
    
    // Unload previous map to save memory (keep only current and adjacent)
    const currentMapId = this.gameState.currentMap.id;
    Object.keys(this.loadedMaps).forEach(mapId => {
      if (mapId !== connection.targetMapId && mapId !== currentMapId) {
        delete this.loadedMaps[mapId];
      }
    });
    
    // Switch to new map
    this.gameState.currentMap = targetMap;
    
    // Update available maps to include the new map
    this.gameState.availableMaps[connection.targetMapId] = targetMap;
    
    // Set player position with proper offset from edge
    this.gameState.player.position = { ...targetPosition };
    
    // Ensure player is on a walkable tile
    const tileX = Math.floor(this.gameState.player.position.x / 32);
    const tileY = Math.floor(this.gameState.player.position.y / 32);
    
    if (!this.isValidPosition(tileX, tileY)) {
      // Find nearest walkable tile
      for (let radius = 1; radius <= 10; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const checkX = tileX + dx;
            const checkY = tileY + dy;
            if (this.isValidPosition(checkX, checkY)) {
              this.gameState.player.position.x = checkX * 32 + 16;
              this.gameState.player.position.y = checkY * 32 + 16;
              break;
            }
          }
          if (this.isValidPosition(tileX, tileY)) break;
        }
      }
    }
    
    // Update camera and visibility
    this.updateCamera();
    this.updateVisibility();
    
    // Notify state change
    this.notifyStateChange();
    
    // Reset transition flag after a delay to ensure smooth transition
    setTimeout(() => {
      this.isTransitioning = false;
    }, 200);
}

// Rest of the code remains the same
```

The main fixes were:
1. Added missing closing bracket for the nested loop in handleMapTransition method
2. Fixed indentation in the nested loops
3. Removed an extra closing bracket that was causing issues
4. Ensured proper alignment of the code blocks

The rest of the class implementation remains unchanged.