import { GameMap, Tile, NPC, Enemy, LootableItem } from '../types/game';
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

export const createPath = (tiles: Tile[][], startX: number, startY: number, endX: number, endY: number) => {
  // Create a dirt path between two points
  const dx = Math.sign(endX - startX);
  const dy = Math.sign(endY - startY);
  
  let x = startX;
  let y = startY;
  
  while (x !== endX || y !== endY) {
    if (x < tiles[0].length && y < tiles.length && x >= 0 && y >= 0) {
      tiles[y][x] = createTile(x, y, 'dirt', true);
    }
    
    if (x !== endX) x += dx;
    if (y !== endY) y += dy;
  }
};

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

// CAPITAL WASTELAND - Starting area with major settlements
export const createCapitalWasteland = (): GameMap => {
  const width = 150;
  const height = 150;
  const tiles: Tile[][] = [];
  
  // Generate base terrain with more variety
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      const distanceFromCenter = Math.sqrt((x - width/2) ** 2 + (y - height/2) ** 2);
      const normalizedDistance = distanceFromCenter / (Math.sqrt(width ** 2 + height ** 2) / 2);
      
      let type = 'grass';
      let walkable = true;
      
      // Create terrain based on location and randomness
      if (normalizedDistance > 0.8) {
        // Outer wasteland - more dangerous
        if (random < 0.4) type = 'dirt';
        else if (random < 0.5) type = 'stone';
        else if (random < 0.6) type = 'ruins';
        else if (random < 0.65) { type = 'water'; walkable = false; }
      } else if (normalizedDistance > 0.5) {
        // Middle wasteland
        if (random < 0.3) type = 'dirt';
        else if (random < 0.4) type = 'stone';
        else if (random < 0.45) type = 'ruins';
        else if (random < 0.48) { type = 'water'; walkable = false; }
      } else {
        // Inner area - safer
        if (random < 0.2) type = 'dirt';
        else if (random < 0.25) type = 'stone';
        else if (random < 0.3) type = 'ruins';
        else if (random < 0.32) { type = 'water'; walkable = false; }
      }
      
      row.push(createTile(x, y, type, walkable));
    }
    tiles.push(row);
  }
  
  // Create a clear starting area around the player spawn point (50, 50)
  const startX = 50, startY = 50;
  for (let y = startY - 5; y <= startY + 5; y++) {
    for (let x = startX - 5; x <= startX + 5; x++) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        tiles[y][x] = createTile(x, y, 'grass', true);
      }
    }
  }
  
  // MEGATON - Major settlement (expanded)
  const megatonX = 40, megatonY = 40;
  createBuilding(tiles, megatonX, megatonY, 20, 15, 'settlement', 'Megaton');
  
  // Megaton internal structures
  createBuilding(tiles, megatonX + 2, megatonY + 2, 4, 3, 'house', 'Sheriff\'s House');
  createBuilding(tiles, megatonX + 8, megatonY + 2, 5, 4, 'clinic', 'Doc Church\'s Clinic');
  createBuilding(tiles, megatonX + 15, megatonY + 3, 4, 3, 'shop', 'Craterside Supply');
  createBuilding(tiles, megatonX + 2, megatonY + 7, 6, 4, 'bar', 'Moriarty\'s Saloon');
  createBuilding(tiles, megatonX + 10, megatonY + 8, 4, 3, 'house', 'Simms House');
  createBuilding(tiles, megatonX + 15, megatonY + 8, 4, 4, 'house', 'Jericho\'s House');
  createBuilding(tiles, megatonX + 3, megatonY + 12, 3, 2, 'workshop', 'Repair Shop');
  createBuilding(tiles, megatonX + 8, megatonY + 12, 8, 2, 'market', 'Water Processing');
  
  // VAULT 101 - Starting location
  const vault101X = 20, vault101Y = 20;
  createBuilding(tiles, vault101X, vault101Y, 12, 8, 'vault', 'Vault 101');
  
  // RIVET CITY - Major settlement
  const rivetCityX = 100, rivetCityY = 80;
  createBuilding(tiles, rivetCityX, rivetCityY, 25, 12, 'city', 'Rivet City');
  
  // Rivet City sections
  createBuilding(tiles, rivetCityX + 2, rivetCityY + 2, 6, 3, 'market', 'Rivet City Market');
  createBuilding(tiles, rivetCityX + 10, rivetCityY + 2, 8, 4, 'lab', 'Science Lab');
  createBuilding(tiles, rivetCityX + 20, rivetCityY + 2, 4, 3, 'security', 'Security Office');
  createBuilding(tiles, rivetCityX + 2, rivetCityY + 7, 10, 4, 'quarters', 'Living Quarters');
  createBuilding(tiles, rivetCityX + 15, rivetCityY + 7, 8, 4, 'bridge', 'Ship Bridge');
  
  // BROTHERHOOD CITADEL - Major faction base
  const citadelX = 120, citadelY = 30;
  createBuilding(tiles, citadelX, citadelY, 18, 15, 'citadel', 'The Citadel');
  
  // Citadel sections
  createBuilding(tiles, citadelX + 2, citadelY + 2, 6, 4, 'armory', 'Brotherhood Armory');
  createBuilding(tiles, citadelX + 10, citadelY + 2, 6, 4, 'laboratory', 'Research Lab');
  createBuilding(tiles, citadelX + 2, citadelY + 8, 8, 3, 'barracks', 'Knight Barracks');
  createBuilding(tiles, citadelX + 12, citadelY + 8, 5, 3, 'workshop', 'Tech Workshop');
  createBuilding(tiles, citadelX + 6, citadelY + 12, 6, 2, 'training', 'Training Grounds');
  
  // GALAXY NEWS RADIO
  const gnrX = 70, gnrY = 50;
  createBuilding(tiles, gnrX, gnrY, 8, 6, 'radio_station', 'Galaxy News Radio');
  
  // SUPER DUPER MART
  const martX = 60, martY = 70;
  createBuilding(tiles, martX, martY, 12, 8, 'supermarket', 'Super Duper Mart');
  
  // CANTERBURY COMMONS
  const canterburyX = 30, canterburyY = 100;
  createBuilding(tiles, canterburyX, canterburyY, 15, 10, 'settlement', 'Canterbury Commons');
  createBuilding(tiles, canterburyX + 2, canterburyY + 2, 4, 3, 'shop', 'Uncle Roe\'s Shop');
  createBuilding(tiles, canterburyX + 8, canterburyY + 2, 5, 3, 'clinic', 'Doc Hoff\'s Clinic');
  createBuilding(tiles, canterburyX + 2, canterburyY + 6, 6, 3, 'caravan', 'Caravan Stop');
  
  // AREFU - Small settlement
  const arefuX = 80, arefuY = 20;
  createBuilding(tiles, arefuX, arefuY, 10, 6, 'settlement', 'Arefu');
  createBuilding(tiles, arefuX + 2, arefuY + 2, 3, 2, 'house', 'West Residence');
  createBuilding(tiles, arefuX + 6, arefuY + 2, 3, 2, 'house', 'Ewers Residence');
  
  // TENPENNY TOWER
  const tenpennyX = 10, tenpennyY = 80;
  createBuilding(tiles, tenpennyX, tenpennyY, 8, 12, 'tower', 'Tenpenny Tower');
  
  // UNDERWORLD (Ghoul settlement)
  const underworldX = 90, underworldY = 110;
  createBuilding(tiles, underworldX, underworldY, 12, 8, 'underground', 'Underworld');
  createBuilding(tiles, underworldX + 2, underworldX + 2, 4, 3, 'bar', 'The Ninth Circle');
  createBuilding(tiles, underworldX + 7, underworldY + 2, 4, 3, 'clinic', 'Underworld Clinic');
  
  // SCRAPYARD
  const scrapyardX = 50, scrapyardY = 120;
  createBuilding(tiles, scrapyardX, scrapyardY, 15, 10, 'scrapyard', 'Scrapyard');
  
  // Create paths between major settlements
  createPath(tiles, vault101X + 6, vault101Y + 8, megatonX + 10, megatonY);
  createPath(tiles, megatonX + 20, megatonY + 7, gnrX, gnrY + 3);
  createPath(tiles, gnrX + 8, gnrY + 3, rivetCityX, rivetCityY + 6);
  createPath(tiles, rivetCityX + 12, rivetCityY, citadelX, citadelY + 7);
  createPath(tiles, megatonX + 10, megatonY + 15, canterburyX + 7, canterburyY);
  createPath(tiles, arefuX + 5, arefuY + 6, citadelX, citadelY);
  
  return {
    width,
    height,
    tiles,
    name: 'Capital Wasteland',
    bgMusic: 'wasteland_ambient',
    npcs: npcs.filter(npc => !npc.mapId || npc.mapId === 'capital_wasteland'),
    enemies: enemies.filter(enemy => !enemy.mapId || enemy.mapId === 'capital_wasteland'),
    lootables: createLootables(width, height)
  };
};

// THE PITT - Industrial wasteland
export const createThePitt = (): GameMap => {
  const width = 120;
  const height = 100;
  const tiles: Tile[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      let type = 'dirt';
      let walkable = true;
      
      if (random < 0.3) type = 'ruins';
      else if (random < 0.4) type = 'stone';
      else if (random < 0.45) { type = 'water'; walkable = false; }
      else if (random < 0.5) type = 'building';
      
      row.push(createTile(x, y, type, walkable));
    }
    tiles.push(row);
  }
  
  // THE MILL - Main industrial complex
  const millX = 40, millY = 30;
  createBuilding(tiles, millX, millY, 25, 15, 'steel_mill', 'The Mill');
  createBuilding(tiles, millX + 2, millY + 2, 8, 4, 'foundry', 'Steel Foundry');
  createBuilding(tiles, millX + 12, millY + 2, 6, 4, 'workshop', 'Tool Shop');
  createBuilding(tiles, millX + 20, millY + 2, 4, 4, 'office', 'Supervisor Office');
  createBuilding(tiles, millX + 2, millY + 8, 10, 3, 'storage', 'Material Storage');
  createBuilding(tiles, millX + 15, millY + 8, 8, 3, 'quarters', 'Worker Quarters');
  
  // HAVEN - Slave settlement
  const havenX = 20, havenY = 60;
  createBuilding(tiles, havenX, havenY, 15, 12, 'settlement', 'Haven');
  createBuilding(tiles, havenX + 2, havenY + 2, 4, 3, 'clinic', 'Haven Clinic');
  createBuilding(tiles, havenX + 8, havenY + 2, 5, 3, 'quarters', 'Slave Quarters');
  createBuilding(tiles, havenX + 2, havenY + 7, 6, 4, 'workshop', 'Repair Station');
  
  // UPTOWN - Elite area
  const uptownX = 80, uptownY = 20;
  createBuilding(tiles, uptownX, uptownY, 12, 10, 'uptown', 'Uptown');
  createBuilding(tiles, uptownX + 2, uptownY + 2, 4, 3, 'mansion', 'Ashur\'s Palace');
  createBuilding(tiles, uptownX + 7, uptownY + 2, 4, 3, 'quarters', 'Elite Quarters');
  createBuilding(tiles, uptownX + 2, uptownY + 6, 8, 3, 'garden', 'Rooftop Garden');
  
  // STEELYARD - Dangerous industrial area
  const steelyardX = 60, steelyardY = 70;
  createBuilding(tiles, steelyardX, steelyardY, 20, 15, 'steelyard', 'The Steelyard');
  
  // Create industrial paths
  createPath(tiles, havenX + 7, havenY, millX, millY + 7);
  createPath(tiles, millX + 12, millY, uptownX + 6, uptownY + 10);
  createPath(tiles, millX + 12, millY + 15, steelyardX + 10, steelyardY);
  
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
  const width = 100;
  const height = 100;
  const tiles: Tile[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      let type = 'grass';
      let walkable = true;
      
      // Create swampy terrain
      if (random < 0.4) type = 'water';
      else if (random < 0.5) type = 'dirt';
      else if (random < 0.55) type = 'ruins';
      else if (random < 0.6) type = 'sand';
      
      if (type === 'water' && Math.random() < 0.6) walkable = false;
      
      row.push(createTile(x, y, type, walkable));
    }
    tiles.push(row);
  }
  
  // CALVERT MANSION
  const mansionX = 20, mansionY = 20;
  createBuilding(tiles, mansionX, mansionY, 15, 12, 'mansion', 'Calvert Mansion');
  createBuilding(tiles, mansionX + 2, mansionY + 2, 6, 4, 'library', 'Mansion Library');
  createBuilding(tiles, mansionX + 10, mansionY + 2, 4, 4, 'laboratory', 'Secret Lab');
  createBuilding(tiles, mansionX + 2, mansionY + 8, 8, 3, 'quarters', 'Living Quarters');
  
  // TRIBAL VILLAGE
  const villageX = 60, villageY = 40;
  createBuilding(tiles, villageX, villageY, 12, 10, 'tribal_village', 'Tribal Village');
  createBuilding(tiles, villageX + 2, villageY + 2, 3, 3, 'hut', 'Chief\'s Hut');
  createBuilding(tiles, villageX + 6, villageY + 2, 3, 3, 'hut', 'Shaman\'s Hut');
  createBuilding(tiles, villageX + 9, villageY + 2, 2, 2, 'hut', 'Storage Hut');
  createBuilding(tiles, villageX + 2, villageY + 6, 8, 3, 'ceremonial', 'Ceremonial Ground');
  
  // POINT LOOKOUT LIGHTHOUSE
  const lighthouseX = 80, lighthouseY = 70;
  createBuilding(tiles, lighthouseX, lighthouseY, 6, 8, 'lighthouse', 'Point Lookout Lighthouse');
  
  // PIER AND BOARDWALK
  const pierX = 30, pierY = 80;
  createBuilding(tiles, pierX, pierY, 20, 8, 'boardwalk', 'The Pier');
  createBuilding(tiles, pierX + 2, pierY + 2, 4, 3, 'shop', 'Bait Shop');
  createBuilding(tiles, pierX + 8, pierY + 2, 6, 3, 'bar', 'Smuggler\'s End');
  createBuilding(tiles, pierX + 16, pierY + 2, 3, 3, 'warehouse', 'Storage');
  
  // DESMOND'S HIDEOUT
  const desmondX = 10, desmondY = 60;
  createBuilding(tiles, desmondX, desmondY, 8, 6, 'hideout', 'Desmond\'s Hideout');
  
  // Create swamp paths
  createPath(tiles, mansionX + 7, mansionY + 12, villageX, villageY + 5);
  createPath(tiles, villageX + 6, villageY + 10, pierX + 10, pierY);
  createPath(tiles, pierX + 20, pierY + 4, lighthouseX, lighthouseY + 4);
  
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
  const width = 80;
  const height = 60;
  const tiles: Tile[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const type = 'building'; // All alien ship interior
      row.push(createTile(x, y, type, true));
    }
    tiles.push(row);
  }
  
  // CRYO LAB
  const cryoX = 15, cryoY = 15;
  createBuilding(tiles, cryoX, cryoY, 12, 8, 'cryo_lab', 'Cryogenic Laboratory');
  createBuilding(tiles, cryoX + 2, cryoY + 2, 4, 3, 'cryo_chamber', 'Cryo Chambers');
  createBuilding(tiles, cryoX + 7, cryoY + 2, 4, 3, 'control_room', 'Cryo Control');
  
  // SHIP BRIDGE
  const bridgeX = 40, bridgeY = 10;
  createBuilding(tiles, bridgeX, bridgeY, 15, 10, 'bridge', 'Ship Bridge');
  createBuilding(tiles, bridgeX + 2, bridgeY + 2, 6, 3, 'command', 'Command Center');
  createBuilding(tiles, bridgeX + 10, bridgeY + 2, 4, 3, 'navigation', 'Navigation');
  createBuilding(tiles, bridgeX + 5, bridgeY + 6, 5, 3, 'weapons', 'Weapon Control');
  
  // ENGINE ROOM
  const engineX = 50, engineY = 35;
  createBuilding(tiles, engineX, engineY, 12, 10, 'engine_room', 'Engine Core');
  createBuilding(tiles, engineX + 2, engineY + 2, 8, 6, 'reactor', 'Power Core');
  
  // EXPERIMENTATION LAB
  const labX = 20, labY = 35;
  createBuilding(tiles, labX, labY, 15, 12, 'experimentation', 'Experimentation Lab');
  createBuilding(tiles, labX + 2, labY + 2, 5, 4, 'surgery', 'Surgery Room');
  createBuilding(tiles, labX + 8, labY + 2, 6, 4, 'specimen', 'Specimen Storage');
  createBuilding(tiles, labX + 2, labY + 7, 11, 4, 'research', 'Research Area');
  
  // ARMORY
  const armoryX = 10, armoryY = 50;
  createBuilding(tiles, armoryX, armoryY, 10, 8, 'armory', 'Alien Armory');
  
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

// METRO TUNNELS - Underground network
export const createMetroTunnels = (): GameMap => {
  const width = 200;
  const height = 80;
  const tiles: Tile[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const random = Math.random();
      let type = 'ruins';
      let walkable = true;
      
      if (random < 0.2) { type = 'water'; walkable = false; }
      else if (random < 0.3) type = 'building';
      else if (random < 0.4) type = 'stone';
      
      row.push(createTile(x, y, type, walkable));
    }
    tiles.push(row);
  }
  
  // Create main tunnel path
  for (let x = 10; x < width - 10; x++) {
    for (let y = 35; y < 45; y++) {
      tiles[y][x] = createTile(x, y, 'dirt', true);
    }
  }
  
  // DUPONT CIRCLE STATION
  const dupontX = 30, dupontY = 30;
  createBuilding(tiles, dupontX, dupontY, 15, 20, 'metro_station', 'Dupont Circle Station');
  createBuilding(tiles, dupontX + 2, dupontY + 2, 6, 4, 'platform', 'Platform A');
  createBuilding(tiles, dupontX + 9, dupontY + 2, 5, 4, 'platform', 'Platform B');
  createBuilding(tiles, dupontX + 2, dupontY + 8, 11, 4, 'concourse', 'Main Concourse');
  createBuilding(tiles, dupontX + 2, dupontY + 14, 5, 4, 'office', 'Station Office');
  createBuilding(tiles, dupontX + 8, dupontY + 14, 6, 4, 'maintenance', 'Maintenance');
  
  // GALLERY PLACE STATION
  const galleryX = 80, galleryY = 25;
  createBuilding(tiles, galleryX, galleryY, 18, 25, 'metro_station', 'Gallery Place Station');
  createBuilding(tiles, galleryX + 2, galleryY + 2, 7, 5, 'platform', 'Red Line Platform');
  createBuilding(tiles, galleryX + 10, galleryY + 2, 7, 5, 'platform', 'Blue Line Platform');
  createBuilding(tiles, galleryX + 2, galleryY + 9, 14, 6, 'concourse', 'Main Concourse');
  createBuilding(tiles, galleryX + 2, galleryY + 17, 6, 4, 'shop', 'Station Shop');
  createBuilding(tiles, galleryX + 10, galleryY + 17, 7, 4, 'security', 'Security Office');
  
  // UNION STATION
  const unionX = 130, unionY = 20;
  createBuilding(tiles, unionX, unionY, 25, 30, 'metro_station', 'Union Station');
  createBuilding(tiles, unionX + 2, unionY + 2, 10, 6, 'platform', 'Main Platform');
  createBuilding(tiles, unionX + 14, unionY + 2, 10, 6, 'platform', 'Express Platform');
  createBuilding(tiles, unionX + 2, unionY + 10, 21, 8, 'concourse', 'Grand Concourse');
  createBuilding(tiles, unionX + 2, unionY + 20, 8, 5, 'restaurant', 'Station Restaurant');
  createBuilding(tiles, unionX + 12, unionY + 20, 6, 5, 'shop', 'Gift Shop');
  createBuilding(tiles, unionX + 19, unionY + 20, 5, 5, 'office', 'Administration');
  
  // CAPITOL SOUTH STATION
  const capitolX = 170, capitolY = 35;
  createBuilding(tiles, capitolX, capitolY, 12, 15, 'metro_station', 'Capitol South');
  createBuilding(tiles, capitolX + 2, capitolY + 2, 8, 4, 'platform', 'Platform');
  createBuilding(tiles, capitolX + 2, capitolY + 8, 8, 3, 'concourse', 'Concourse');
  createBuilding(tiles, capitolX + 2, capitolY + 12, 4, 2, 'office', 'Ticket Office');
  
  // Create connecting tunnels
  createPath(tiles, dupontX + 15, dupontY + 10, galleryX, galleryY + 12);
  createPath(tiles, galleryX + 18, galleryY + 12, unionX, unionY + 15);
  createPath(tiles, unionX + 25, unionY + 15, capitolX, capitolY + 7);
  
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
  metro_tunnels: createMetroTunnels
};