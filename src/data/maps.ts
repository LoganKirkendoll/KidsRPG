import { GameMap, Tile, NPC, Enemy, LootableItem, MapConnection } from '../types/game';
import { items } from './items_data';
import { npcs } from './npcs_data';
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

// CAPITAL WASTELAND - Starting area (reduced size)
export const createCapitalWasteland = (): GameMap => {
  const width = 60;
  const height = 60;
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
  createBuilding(tiles, 25, 45, 5, 4, 'trader_post', 'Craterside Supply');
  
  const connections: MapConnection[] = [
    {
      direction: 'north',
      targetMapId: 'northern_wasteland',
      fromPosition: { x: 30 * 32, y: 0 },
      toPosition: { x: 30 * 32, y: 59 * 32 }
    },
    {
      direction: 'south',
      targetMapId: 'southern_ruins',
      fromPosition: { x: 30 * 32, y: 59 * 32 },
      toPosition: { x: 30 * 32, y: 0 }
    },
    {
      direction: 'east',
      targetMapId: 'eastern_districts',
      fromPosition: { x: 59 * 32, y: 30 * 32 },
      toPosition: { x: 0, y: 30 * 32 }
    },
    {
      direction: 'west',
      targetMapId: 'western_outskirts',
      fromPosition: { x: 0, y: 30 * 32 },
      toPosition: { x: 59 * 32, y: 30 * 32 }
    }
  ];
  
  return {
    id: 'capital_wasteland',
    width,
    height,
    tiles,
    name: 'Capital Wasteland',
    bgMusic: 'wasteland_ambient',
    npcs: npcs.filter(npc => !npc.mapId || npc.mapId === 'capital_wasteland'),
    enemies: enemies.filter(enemy => !enemy.mapId || enemy.mapId === 'capital_wasteland'),
    lootables: createLootables(width, height),
    connections
  };
};

// NORTHERN WASTELAND - Industrial area
export const createNorthernWasteland = (): GameMap => {
  const width = 60;
  const height = 60;
  const tiles: Tile[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      let type = 'dirt';
      let walkable = true;
      
      if (random < 0.2) type = 'ruins';
      else if (random < 0.3) type = 'stone';
      else if (random < 0.35) { type = 'water'; walkable = false; }
      else if (random < 0.4) type = 'building';
      
      row.push(createTile(x, y, type, walkable));
    }
    tiles.push(row);
  }
  
  // Industrial buildings
  createBuilding(tiles, 20, 20, 12, 8, 'factory', 'Old Factory');
  createBuilding(tiles, 40, 35, 8, 6, 'power_plant', 'Power Station');
  createBuilding(tiles, 10, 45, 6, 4, 'warehouse', 'Supply Depot');
  
  const connections: MapConnection[] = [
    {
      direction: 'south',
      targetMapId: 'capital_wasteland',
      fromPosition: { x: 30 * 32, y: 59 * 32 },
      toPosition: { x: 30 * 32, y: 0 }
    },
    {
      direction: 'north',
      targetMapId: 'the_pitt',
      fromPosition: { x: 30 * 32, y: 0 },
      toPosition: { x: 30 * 32, y: 59 * 32 }
    }
  ];
  
  return {
    id: 'northern_wasteland',
    width,
    height,
    tiles,
    name: 'Northern Wasteland',
    bgMusic: 'industrial_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'northern_wasteland'),
    enemies: enemies.filter(enemy => enemy.mapId === 'northern_wasteland'),
    lootables: createLootables(width, height, 0.03),
    connections
  };
};

// SOUTHERN RUINS - Urban decay
export const createSouthernRuins = (): GameMap => {
  const width = 60;
  const height = 60;
  const tiles: Tile[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      let type = 'ruins';
      let walkable = true;
      
      if (random < 0.3) type = 'building';
      else if (random < 0.4) type = 'stone';
      else if (random < 0.5) type = 'dirt';
      
      if (type === 'building' && Math.random() < 0.7) walkable = false;
      
      row.push(createTile(x, y, type, walkable));
    }
    tiles.push(row);
  }
  
  // Urban ruins
  createBuilding(tiles, 15, 15, 10, 8, 'city_hall', 'Ruined City Hall');
  createBuilding(tiles, 35, 25, 8, 6, 'hospital', 'Abandoned Hospital');
  createBuilding(tiles, 45, 45, 6, 4, 'school', 'Old School');
  
  const connections: MapConnection[] = [
    {
      direction: 'north',
      targetMapId: 'capital_wasteland',
      fromPosition: { x: 30 * 32, y: 0 },
      toPosition: { x: 30 * 32, y: 59 * 32 }
    },
    {
      direction: 'south',
      targetMapId: 'point_lookout',
      fromPosition: { x: 30 * 32, y: 59 * 32 },
      toPosition: { x: 30 * 32, y: 0 }
    }
  ];
  
  return {
    id: 'southern_ruins',
    width,
    height,
    tiles,
    name: 'Southern Ruins',
    bgMusic: 'ruins_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'southern_ruins'),
    enemies: enemies.filter(enemy => enemy.mapId === 'southern_ruins'),
    lootables: createLootables(width, height, 0.04),
    connections
  };
};

// EASTERN DISTRICTS - Commercial area
export const createEasternDistricts = (): GameMap => {
  const width = 60;
  const height = 60;
  const tiles: Tile[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      let type = 'stone';
      let walkable = true;
      
      if (random < 0.3) type = 'building';
      else if (random < 0.4) type = 'ruins';
      else if (random < 0.5) type = 'grass';
      
      if (type === 'building' && Math.random() < 0.6) walkable = false;
      
      row.push(createTile(x, y, type, walkable));
    }
    tiles.push(row);
  }
  
  // Commercial buildings
  createBuilding(tiles, 20, 20, 15, 10, 'rivet_city', 'Rivet City');
  createBuilding(tiles, 10, 40, 8, 6, 'market', 'Trading Post');
  createBuilding(tiles, 45, 15, 6, 4, 'clinic', 'Medical Center');
  
  const connections: MapConnection[] = [
    {
      direction: 'west',
      targetMapId: 'capital_wasteland',
      fromPosition: { x: 0, y: 30 * 32 },
      toPosition: { x: 59 * 32, y: 30 * 32 }
    },
    {
      direction: 'east',
      targetMapId: 'citadel',
      fromPosition: { x: 59 * 32, y: 30 * 32 },
      toPosition: { x: 0, y: 30 * 32 }
    }
  ];
  
  return {
    id: 'eastern_districts',
    width,
    height,
    tiles,
    name: 'Eastern Districts',
    bgMusic: 'city_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'eastern_districts'),
    enemies: enemies.filter(enemy => enemy.mapId === 'eastern_districts'),
    lootables: createLootables(width, height, 0.025),
    connections
  };
};

// WESTERN OUTSKIRTS - Wilderness
export const createWesternOutskirts = (): GameMap => {
  const width = 60;
  const height = 60;
  const tiles: Tile[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      let type = 'grass';
      let walkable = true;
      
      if (random < 0.4) type = 'dirt';
      else if (random < 0.5) type = 'stone';
      else if (random < 0.55) { type = 'water'; walkable = false; }
      else if (random < 0.6) type = 'ruins';
      
      row.push(createTile(x, y, type, walkable));
    }
    tiles.push(row);
  }
  
  // Wilderness outposts
  createBuilding(tiles, 15, 25, 6, 4, 'ranger_station', 'Ranger Outpost');
  createBuilding(tiles, 40, 35, 5, 3, 'cabin', 'Survivor\'s Cabin');
  createBuilding(tiles, 25, 50, 4, 3, 'bunker', 'Hidden Bunker');
  
  const connections: MapConnection[] = [
    {
      direction: 'east',
      targetMapId: 'capital_wasteland',
      fromPosition: { x: 59 * 32, y: 30 * 32 },
      toPosition: { x: 0, y: 30 * 32 }
    },
    {
      direction: 'west',
      targetMapId: 'metro_tunnels',
      fromPosition: { x: 0, y: 30 * 32 },
      toPosition: { x: 59 * 32, y: 30 * 32 }
    }
  ];
  
  return {
    id: 'western_outskirts',
    width,
    height,
    tiles,
    name: 'Western Outskirts',
    bgMusic: 'wilderness_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'western_outskirts'),
    enemies: enemies.filter(enemy => enemy.mapId === 'western_outskirts'),
    lootables: createLootables(width, height, 0.02),
    connections
  };
};

// THE PITT - Industrial wasteland (smaller)
export const createThePitt = (): GameMap => {
  const width = 50;
  const height = 40;
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
  createBuilding(tiles, 15, 15, 8, 6, 'steel_mill', 'The Mill');
  createBuilding(tiles, 30, 20, 6, 4, 'slave_quarters', 'Worker Barracks');
  
  const connections: MapConnection[] = [
    {
      direction: 'south',
      targetMapId: 'northern_wasteland',
      fromPosition: { x: 25 * 32, y: 39 * 32 },
      toPosition: { x: 30 * 32, y: 0 }
    }
  ];
  
  return {
    id: 'the_pitt',
    width,
    height,
    tiles,
    name: 'The Pitt',
    bgMusic: 'industrial_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'the_pitt'),
    enemies: enemies.filter(enemy => enemy.mapId === 'the_pitt'),
    lootables: createLootables(width, height, 0.03),
    connections
  };
};

// POINT LOOKOUT - Swampland (smaller)
export const createPointLookout = (): GameMap => {
  const width = 45;
  const height = 45;
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
  createBuilding(tiles, 30, 25, 4, 3, 'lighthouse', 'Point Lookout Lighthouse');
  
  const connections: MapConnection[] = [
    {
      direction: 'north',
      targetMapId: 'southern_ruins',
      fromPosition: { x: 22 * 32, y: 0 },
      toPosition: { x: 30 * 32, y: 59 * 32 }
    }
  ];
  
  return {
    id: 'point_lookout',
    width,
    height,
    tiles,
    name: 'Point Lookout',
    bgMusic: 'swamp_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'point_lookout'),
    enemies: enemies.filter(enemy => enemy.mapId === 'point_lookout'),
    lootables: createLootables(width, height, 0.025),
    connections
  };
};

// CITADEL - Brotherhood stronghold (smaller)
export const createCitadel = (): GameMap => {
  const width = 40;
  const height = 40;
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
  createBuilding(tiles, 15, 15, 10, 8, 'citadel', 'The Citadel');
  createBuilding(tiles, 5, 5, 6, 4, 'armory', 'Brotherhood Armory');
  
  const connections: MapConnection[] = [
    {
      direction: 'west',
      targetMapId: 'eastern_districts',
      fromPosition: { x: 0, y: 20 * 32 },
      toPosition: { x: 59 * 32, y: 30 * 32 }
    }
  ];
  
  return {
    id: 'citadel',
    width,
    height,
    tiles,
    name: 'The Citadel',
    bgMusic: 'brotherhood_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'citadel'),
    enemies: enemies.filter(enemy => enemy.mapId === 'citadel'),
    lootables: createLootables(width, height, 0.015),
    connections
  };
};

// METRO TUNNELS - Underground system (smaller)
export const createMetroTunnels = (): GameMap => {
  const width = 60;
  const height = 40;
  const tiles: Tile[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      let type = 'ruins';
      let walkable = true;
      
      if (random < 0.1) { type = 'water'; walkable = false; }
      else if (random < 0.15) { type = 'building'; walkable = false; }
      else if (random < 0.3) type = 'stone';
      else if (random < 0.5) type = 'dirt';
      
      row.push(createTile(x, y, type, walkable));
    }
    tiles.push(row);
  }
  
  // Metro stations
  createBuilding(tiles, 10, 15, 8, 6, 'metro_station', 'Dupont Circle Station');
  createBuilding(tiles, 30, 20, 8, 6, 'metro_station', 'Gallery Place Station');
  createBuilding(tiles, 45, 10, 8, 6, 'metro_station', 'Union Station');
  
  const connections: MapConnection[] = [
    {
      direction: 'east',
      targetMapId: 'western_outskirts',
      fromPosition: { x: 59 * 32, y: 20 * 32 },
      toPosition: { x: 0, y: 30 * 32 }
    }
  ];
  
  return {
    id: 'metro_tunnels',
    width,
    height,
    tiles,
    name: 'Metro Tunnels',
    bgMusic: 'underground_ambient',
    npcs: npcs.filter(npc => npc.mapId === 'metro_tunnels'),
    enemies: enemies.filter(enemy => enemy.mapId === 'metro_tunnels'),
    lootables: createLootables(width, height, 0.035),
    connections
  };
};

export const maps = {
  capital_wasteland: createCapitalWasteland,
  northern_wasteland: createNorthernWasteland,
  southern_ruins: createSouthernRuins,
  eastern_districts: createEasternDistricts,
  western_outskirts: createWesternOutskirts,
  the_pitt: createThePitt,
  point_lookout: createPointLookout,
  citadel: createCitadel,
  metro_tunnels: createMetroTunnels
};

export const createAllMaps = (): { [key: string]: GameMap } => {
  const allMaps: { [key: string]: GameMap } = {};
  
  Object.entries(maps).forEach(([key, createMapFn]) => {
    allMaps[key] = createMapFn();
  });
  
  return allMaps;
};