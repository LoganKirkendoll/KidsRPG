Here's the fixed version with all missing closing brackets and required whitespace added:

[Previous content remains the same until the end, where these closing brackets were missing]

```typescript
      }
    }
  }

  private createInteriorMap(buildingType: string): any {
    // ... existing content ...
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

  private update(deltaTime: number) {
    this.gameState.statistics.playtime += deltaTime;
    this.gameState.dayNightCycle = (this.gameState.dayNightCycle + deltaTime / 1200) % 1;
    this.updateMovement(deltaTime);
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
```