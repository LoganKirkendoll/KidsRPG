Here's the fixed version with all missing closing brackets added:

```typescript
// ... [previous code remains the same until the map transition section]

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
        if (this.isValidPosition(tileX + dx, tileY + dy)) break;
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

// ... [rest of the code remains the same]
```

The main issue was in the map transition section where there were missing closing brackets for nested loops and conditions. I've added the proper closing brackets to maintain the correct scope and nesting levels. The rest of the code appears to be properly structured with matching brackets.