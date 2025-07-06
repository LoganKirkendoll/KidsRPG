import { GameMap, Tile, NPC, Enemy, LootableItem } from '../types/game';
import { items } from './gameData';
import { npcs } from './npcs';
import { enemies } from './enemies';

export const createTile = (x: number, y: number, type: string, walkable: boolean = true): Tile => ({
  x,
  y,
  type: type as any,
  walkable,
  sprite: type,
  discovered: false,
  visible: false,
  description: `${type} terrain`
});

export const createBuilding = (tiles: Tile[][], x: number, y: number, width: number, height: number, type: string, name: string) => {
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const tileX = x + dx;
      const tileY = y + dy;
      if (tileX < tiles[0].length && tileY < tiles.length) {
        tiles[tileY][tileX] = {
          ...tiles[tileY][tileX],
          type: 'building' as any,
          walkable: false,
          buildingType: type,
          buildingName: name,
          description: `${name} - ${type}`
        };
        
        // Create entrance
        if (dx === Math.floor(width / 2) && dy === height - 1) {
          tiles[tileY][tileX].walkable = true;
          tiles[tileY][tileX].isEntrance = true;
        }
      }
    }
  }
};

export const createLootables = (width: number, height: number, density: number = 0.02): LootableItem[] => {
  const lootables: LootableItem[] = [];
  const count = Math.floor(width * height * density);
  
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    
    const lootTypes = ['container', 'corpse', 'cache'];
    const lootType = lootTypes[Math.floor(Math.random() * lootTypes.length)];
    
    const numItems = Math.floor(Math.random() * 3) + 1;
    const lootItems = [];
    
    for (let j = 0; j < numItems; j++) {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      lootItems.push({
        ...randomItem,
        quantity: randomItem.stackable ? Math.floor(Math.random() * 3) + 1 : 1
      });
    }
    
    lootables.push({
      id: `loot_${i}`,
      position: { x: x * 32 + 16, y: y * 32 + 16 },
      items: lootItems,
      type: lootType as any,
      sprite: lootType,
      discovered: false,
      looted: false
    });
  }
  
  return lootables;
};

// CAPITAL WASTELAND - Starting area
export const createCapitalWasteland = (): GameMap => {
  const width = 120;
  const height = 120;
  const tiles: Tile[][] = [];
  
  // Generate base terrain
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      let type = 'grass';
      let walkable = true;
      
      if (random < 0.3) type = 'dirt';
      else if (random < 0.4) type = 'stone';
      else if (random < 0.45) type = 'ruins';
      else if (random < 0.48) { type = 'water'; walkable = false; }
      
      row.push(createTile(x, y, type, walkable));
    }
    tiles.push(row);
  }
  
  // Create settlements and buildings
  createBuilding(tiles, 15, 15, 8, 6, 'vault', 'Vault 101');
  createBuilding(tiles, 40, 20, 6, 4, 'settlement', 'Megaton');
  createBuilding(tiles, 70, 30, 4, 3, 'clinic', 'Doc Church\'s Clinic');
  createBuilding(tiles, 25, 50, 5, 4, 'trader_post', 'Craterside Supply');
  createBuilding(tiles, 80, 80, 10, 8, 'city', 'Rivet City');
  createBuilding(tiles, 10, 90, 6, 5, 'brotherhood', 'Brotherhood Outpost');
  createBuilding(tiles, 100, 20, 7, 5, 'enclave', 'Enclave Facility');
  createBuilding(tiles, 50, 70, 4, 4, 'workshop', 'Scrapyard');
  
  return {
    width,
    height,
    tiles,
    name: 'Capital Wasteland',
    bgMusic: 'wasteland_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'capital_wasteland'),
    enemies: enemies.filter(enemy => enemy.mapId === 'capital_wasteland'),
    lootables: createLootables(width, height)
  };
};

// THE PITT - Industrial wasteland
export const createThePitt = (): GameMap => {
  const width = 100;
  const height = 80;
  const tiles: Tile[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      let type = 'dirt';
      let walkable = true;
      
      if (random < 0.2) type = 'ruins';
      else if (random < 0.3) type = 'stone';
      else if (random < 0.35) { type = 'lava'; walkable = false; }
      else if (random < 0.4) type = 'building';
      
      row.push(createTile(x, y, type, walkable));
    }
    tiles.push(row);
  }
  
  // Industrial buildings
  createBuilding(tiles, 20, 20, 12, 8, 'steel_mill', 'The Mill');
  createBuilding(tiles, 50, 30, 8, 6, 'slave_quarters', 'Worker Barracks');
  createBuilding(tiles, 70, 15, 6, 4, 'haven', 'Haven');
  createBuilding(tiles, 30, 60, 10, 6, 'foundry', 'Steel Foundry');
  createBuilding(tiles, 80, 50, 5, 4, 'uptown', 'Uptown');
  
  return {
    width,
    height,
    tiles,
    name: 'The Pitt',
    bgMusic: 'industrial_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'the_pitt'),
    enemies: enemies.filter(enemy => enemy.mapId === 'the_pitt'),
    lootables: createLootables(width, height, 0.03)
  };
};

// POINT LOOKOUT - Swampland
export const createPointLookout = (): GameMap => {
  const width = 90;
  const height = 90;
  const tiles: Tile[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      let type = 'grass';
      let walkable = true;
      
      if (random < 0.4) type = 'water';
      else if (random < 0.5) type = 'dirt';
      else if (random < 0.6) type = 'ruins';
      
      if (type === 'water' && Math.random() < 0.7) walkable = false;
      
      row.push(createTile(x, y, type, walkable));
    }
    tiles.push(row);
  }
  
  // Swamp settlements
  createBuilding(tiles, 15, 15, 6, 4, 'mansion', 'Calvert Mansion');
  createBuilding(tiles, 40, 30, 5, 3, 'tribal_village', 'Tribal Huts');
  createBuilding(tiles, 60, 50, 4, 3, 'lighthouse', 'Point Lookout Lighthouse');
  createBuilding(tiles, 25, 70, 8, 5, 'boardwalk', 'Pier');
  
  return {
    width,
    height,
    tiles,
    name: 'Point Lookout',
    bgMusic: 'swamp_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'point_lookout'),
    enemies: enemies.filter(enemy => enemy.mapId === 'point_lookout'),
    lootables: createLootables(width, height, 0.025)
  };
};

// MOTHERSHIP ZETA - Alien ship
export const createMothershipZeta = (): GameMap => {
  const width = 60;
  const height = 40;
  const tiles: Tile[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const type = 'building'; // All alien ship interior
      row.push(createTile(x, y, type, true));
    }
    tiles.push(row);
  }
  
  // Alien ship sections
  createBuilding(tiles, 10, 10, 8, 6, 'cryo_lab', 'Cryogenic Laboratory');
  createBuilding(tiles, 30, 15, 6, 4, 'bridge', 'Ship Bridge');
  createBuilding(tiles, 45, 20, 5, 3, 'engine_room', 'Engine Core');
  createBuilding(tiles, 20, 30, 7, 5, 'experimentation', 'Experimentation Lab');
  
  return {
    width,
    height,
    tiles,
    name: 'Mothership Zeta',
    bgMusic: 'alien_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'mothership_zeta'),
    enemies: enemies.filter(enemy => enemy.mapId === 'mothership_zeta'),
    lootables: createLootables(width, height, 0.04)
  };
};

// BROKEN STEEL CITADEL - Brotherhood stronghold
export const createCitadel = (): GameMap => {
  const width = 80;
  const height = 80;
  const tiles: Tile[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      let type = 'stone';
      
      if (random < 0.3) type = 'building';
      else if (random < 0.4) type = 'ruins';
      
      row.push(createTile(x, y, type, true));
    }
    tiles.push(row);
  }
  
  // Brotherhood facilities
  createBuilding(tiles, 30, 30, 20, 15, 'citadel', 'The Citadel');
  createBuilding(tiles, 10, 10, 8, 6, 'armory', 'Brotherhood Armory');
  createBuilding(tiles, 60, 20, 6, 4, 'laboratory', 'Research Lab');
  createBuilding(tiles, 15, 60, 10, 8, 'barracks', 'Knight Barracks');
  createBuilding(tiles, 55, 55, 7, 5, 'workshop', 'Tech Workshop');
  
  return {
    width,
    height,
    tiles,
    name: 'The Citadel',
    bgMusic: 'brotherhood_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'citadel'),
    enemies: enemies.filter(enemy => enemy.mapId === 'citadel'),
    lootables: createLootables(width, height, 0.015)
  };
};

// UNDERGROUND METRO - Tunnel system
export const createMetroTunnels = (): GameMap => {
  const width = 150;
  const height = 50;
  const tiles: Tile[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      let type = 'ruins';
      let walkable = true;
      
      if (random < 0.2) { type = 'water'; walkable = false; }
      else if (random < 0.3) type = 'building';
      
      row.push(createTile(x, y, type, walkable));
    }
    tiles.push(row);
  }
  
  // Metro stations
  createBuilding(tiles, 20, 20, 8, 6, 'metro_station', 'Dupont Circle Station');
  createBuilding(tiles, 60, 15, 8, 6, 'metro_station', 'Gallery Place Station');
  createBuilding(tiles, 100, 25, 8, 6, 'metro_station', 'Union Station');
  createBuilding(tiles, 130, 20, 6, 4, 'metro_station', 'Capitol South');
  
  return {
    width,
    height,
    tiles,
    name: 'Metro Tunnels',
    bgMusic: 'underground_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'metro_tunnels'),
    enemies: enemies.filter(enemy => enemy.mapId === 'metro_tunnels'),
    lootables: createLootables(width, height, 0.035)
  };
};

export const maps = {
  capital_wasteland: createCapitalWasteland,
  the_pitt: createThePitt,
  point_lookout: createPointLookout,
  mothership_zeta: createMothershipZeta,
  citadel: createCitadel,
  metro_tunnels: createMetroTunnels
};