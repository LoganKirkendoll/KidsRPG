import { GameMap, Tile, NPC, Item, Position } from '../types/game';
import { items } from './items_data';

export interface Building {
  id: string;
  name: string;
  type: string;
  description: string;
  interiorMap: GameMap;
  entrancePosition: Position;
  exitPosition: Position;
}

const createTile = (x: number, y: number, type: string, walkable: boolean = true): Tile => ({
  x,
  y,
  type: type as any,
  walkable,
  sprite: type,
  discovered: false,
  visible: false,
  description: `${type} terrain`
});

// MEGATON CRATERSIDE SUPPLY
export const createCratersideSupply = (): Building => {
  const width = 15;
  const height = 12;
  const tiles: Tile[][] = [];
  
  // Initialize with wooden floor
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push(createTile(x, y, 'stone', true));
    }
    tiles.push(row);
  }
  
  // Add walls around the perimeter
  for (let x = 0; x < width; x++) {
    tiles[0][x] = createTile(x, 0, 'building', false); // Top wall
    tiles[height - 1][x] = createTile(x, height - 1, 'building', false); // Bottom wall
  }
  for (let y = 0; y < height; y++) {
    tiles[y][0] = createTile(0, y, 'building', false); // Left wall
    tiles[y][width - 1] = createTile(width - 1, y, 'building', false); // Right wall
  }
  
  // Create entrance at bottom center
  const entranceX = Math.floor(width / 2);
  tiles[height - 1][entranceX] = createTile(entranceX, height - 1, 'stone', true);
  tiles[height - 1][entranceX].isEntrance = true;
  
  // Add some interior details (counters, shelves)
  tiles[3][3] = createTile(3, 3, 'building', false); // Counter
  tiles[3][4] = createTile(3, 4, 'building', false);
  tiles[3][5] = createTile(3, 5, 'building', false);
  
  tiles[8][2] = createTile(8, 2, 'building', false); // Shelf
  tiles[9][2] = createTile(9, 2, 'building', false);
  tiles[10][2] = createTile(10, 2, 'building', false);
  
  const npcs: NPC[] = [
    {
      id: 'moira_brown',
      name: 'Moira Brown',
      type: 'trader',
      position: { x: 4 * 32 + 16, y: 4 * 32 + 16 },
      sprite: 'trader_female',
      dialogue: [
        {
          id: 'greeting',
          text: 'Welcome to Craterside Supply! I have everything a wasteland wanderer needs. What can I do for you?',
          choices: [
            { id: 'trade', text: 'Show me your wares', action: 'open_trade' },
            { id: 'repair', text: 'Can you repair my equipment?', nextNode: 'repair_info' },
            { id: 'quest', text: 'I heard you\'re writing a book?', nextNode: 'survival_guide' },
            { id: 'leave', text: 'Just browsing', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'repair_info',
          text: 'Of course! I can fix most anything. Bring me the broken item and some scrap metal, and I\'ll have it working like new!',
          choices: [
            { id: 'trade', text: 'Let me see what you have', action: 'open_trade' },
            { id: 'leave', text: 'I\'ll think about it', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'survival_guide',
          text: 'Oh yes! The Wasteland Survival Guide! It\'s going to be the definitive manual for post-nuclear survival. I could use someone to help me test some theories...',
          choices: [
            { id: 'accept_guide', text: 'I\'d be happy to help', action: 'give_quest' },
            { id: 'trade', text: 'Maybe later. What do you sell?', action: 'open_trade' },
            { id: 'leave', text: 'Sounds dangerous', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'goodbye',
          text: 'Come back anytime! And remember - knowledge is the ultimate weapon!',
          choices: []
        }
      ],
      inventory: [
        { ...items.find(i => i.id === 'stimpak')!, quantity: 8 },
        { ...items.find(i => i.id === 'rad_away')!, quantity: 5 },
        { ...items.find(i => i.id === 'combat_knife')!, quantity: 2 },
        { ...items.find(i => i.id === 'combat_armor')!, quantity: 1 },
        { ...items.find(i => i.id === 'scrap_metal')!, quantity: 15 },
        { ...items.find(i => i.id === 'electronics')!, quantity: 8 },
        items.find(i => i.id === 'assault_rifle')!,
        items.find(i => i.id === 'buffout')!,
        items.find(i => i.id === 'mentats')!
      ],
      faction: 'megaton',
      isHostile: false
    }
  ];
  
  const interiorMap: GameMap = {
    id: 'craterside_supply_interior',
    width,
    height,
    tiles,
    name: 'Craterside Supply',
    bgMusic: 'shop_ambient',
    npcs,
    enemies: [],
    lootables: [],
    isInterior: true,
    parentMapId: 'capital_wasteland',
    exitPosition: { x: 35 * 32 + 16, y: 25 * 32 + 16 }, // Position outside the building
    connections: []
  };
  
  return {
    id: 'craterside_supply',
    name: 'Craterside Supply',
    type: 'trader_post',
    description: 'Moira Brown\'s general store in Megaton',
    interiorMap,
    entrancePosition: { x: 37 * 32 + 16, y: 27 * 32 + 16 }, // Center of building
    exitPosition: { x: entranceX * 32 + 16, y: (height - 1) * 32 + 16 }
  };
};

// MEGATON CLINIC
export const createMegatonClinic = (): Building => {
  const width = 12;
  const height = 10;
  const tiles: Tile[][] = [];
  
  // Initialize with clean floor
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push(createTile(x, y, 'stone', true));
    }
    tiles.push(row);
  }
  
  // Add walls
  for (let x = 0; x < width; x++) {
    tiles[0][x] = createTile(x, 0, 'building', false);
    tiles[height - 1][x] = createTile(x, height - 1, 'building', false);
  }
  for (let y = 0; y < height; y++) {
    tiles[y][0] = createTile(0, y, 'building', false);
    tiles[y][width - 1] = createTile(width - 1, y, 'building', false);
  }
  
  // Entrance
  const entranceX = Math.floor(width / 2);
  tiles[height - 1][entranceX] = createTile(entranceX, height - 1, 'stone', true);
  tiles[height - 1][entranceX].isEntrance = true;
  
  // Medical equipment
  tiles[2][2] = createTile(2, 2, 'building', false); // Medical bed
  tiles[2][3] = createTile(2, 3, 'building', false);
  tiles[8][2] = createTile(8, 2, 'building', false); // Medicine cabinet
  tiles[8][3] = createTile(8, 3, 'building', false);
  
  const npcs: NPC[] = [
    {
      id: 'doc_church',
      name: 'Doc Church',
      type: 'trader',
      position: { x: 6 * 32 + 16, y: 4 * 32 + 16 },
      sprite: 'doctor',
      dialogue: [
        {
          id: 'greeting',
          text: 'Welcome to my clinic. I can patch you up or sell you medical supplies. What do you need?',
          choices: [
            { id: 'heal', text: 'I need healing', action: 'heal_player' },
            { id: 'trade', text: 'Show me your medical supplies', action: 'open_trade' },
            { id: 'radiation', text: 'Can you treat radiation poisoning?', nextNode: 'radiation_treatment' },
            { id: 'leave', text: 'I\'m fine, thanks', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'radiation_treatment',
          text: 'Radiation sickness is serious business out here. I can treat it, but it\'ll cost you. Or you can buy some Rad-Away and treat it yourself.',
          choices: [
            { id: 'treat_radiation', text: 'Please treat my radiation (50 caps)', action: 'cure_radiation' },
            { id: 'trade', text: 'I\'ll buy some Rad-Away', action: 'open_trade' },
            { id: 'leave', text: 'I\'ll manage', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'goodbye',
          text: 'Stay safe out there. The wasteland is dangerous.',
          choices: []
        }
      ],
      inventory: [
        { ...items.find(i => i.id === 'stimpak')!, quantity: 12 },
        { ...items.find(i => i.id === 'rad_away')!, quantity: 8 },
        { ...items.find(i => i.id === 'buffout')!, quantity: 3 },
        { ...items.find(i => i.id === 'mentats')!, quantity: 3 },
        { ...items.find(i => i.id === 'psycho')!, quantity: 2 }
      ],
      faction: 'megaton',
      isHostile: false
    }
  ];
  
  const interiorMap: GameMap = {
    id: 'megaton_clinic_interior',
    width,
    height,
    tiles,
    name: 'Megaton Clinic',
    bgMusic: 'medical_ambient',
    npcs,
    enemies: [],
    lootables: [],
    isInterior: true,
    parentMapId: 'capital_wasteland',
    exitPosition: { x: 40 * 32 + 16, y: 35 * 32 + 16 },
    connections: []
  };
  
  return {
    id: 'megaton_clinic',
    name: 'Megaton Clinic',
    type: 'clinic',
    description: 'Doc Church\'s medical clinic in Megaton',
    interiorMap,
    entrancePosition: { x: 42 * 32 + 16, y: 37 * 32 + 16 }, // Center of building
    exitPosition: { x: entranceX * 32 + 16, y: (height - 1) * 32 + 16 }
  };
};

// RIVET CITY MARKET
export const createRivetCityMarket = (): Building => {
  const width = 20;
  const height = 15;
  const tiles: Tile[][] = [];
  
  // Initialize with metal floor
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push(createTile(x, y, 'stone', true));
    }
    tiles.push(row);
  }
  
  // Add walls
  for (let x = 0; x < width; x++) {
    tiles[0][x] = createTile(x, 0, 'building', false);
    tiles[height - 1][x] = createTile(x, height - 1, 'building', false);
  }
  for (let y = 0; y < height; y++) {
    tiles[y][0] = createTile(0, y, 'building', false);
    tiles[y][width - 1] = createTile(width - 1, y, 'building', false);
  }
  
  // Multiple entrances
  tiles[height - 1][5] = createTile(5, height - 1, 'stone', true);
  tiles[height - 1][5].isEntrance = true;
  tiles[height - 1][15] = createTile(15, height - 1, 'stone', true);
  tiles[height - 1][15].isEntrance = true;
  
  // Market stalls
  for (let x = 3; x <= 5; x++) {
    tiles[3][x] = createTile(x, 3, 'building', false);
  }
  for (let x = 8; x <= 10; x++) {
    tiles[3][x] = createTile(x, 3, 'building', false);
  }
  for (let x = 13; x <= 15; x++) {
    tiles[3][x] = createTile(x, 3, 'building', false);
  }
  
  const npcs: NPC[] = [
    {
      id: 'seagrave_holmes',
      name: 'Seagrave Holmes',
      type: 'trader',
      position: { x: 4 * 32 + 16, y: 5 * 32 + 16 },
      sprite: 'trader_male',
      dialogue: [
        {
          id: 'greeting',
          text: 'Welcome to Rivet City Market! I deal in weapons and armor. Quality gear for quality people.',
          choices: [
            { id: 'trade', text: 'Show me your weapons', action: 'open_trade' },
            { id: 'info', text: 'Tell me about Rivet City', nextNode: 'city_info' },
            { id: 'leave', text: 'Just looking around', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'city_info',
          text: 'Rivet City is the jewel of the Capital Wasteland. Built in an old aircraft carrier, it\'s the safest place for miles around.',
          choices: [
            { id: 'trade', text: 'Impressive. What do you sell?', action: 'open_trade' },
            { id: 'leave', text: 'Thanks for the info', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'goodbye',
          text: 'Come back when you need quality equipment!',
          choices: []
        }
      ],
      inventory: [
        items.find(i => i.id === 'assault_rifle')!,
        items.find(i => i.id === 'combat_armor')!,
        items.find(i => i.id === 'combat_knife')!,
        { ...items.find(i => i.id === 'scrap_metal')!, quantity: 20 },
        { ...items.find(i => i.id === 'electronics')!, quantity: 10 }
      ],
      faction: 'rivet_city',
      isHostile: false
    },
    {
      id: 'bella_mack',
      name: 'Bella Mack',
      type: 'trader',
      position: { x: 9 * 32 + 16, y: 5 * 32 + 16 },
      sprite: 'trader_female',
      dialogue: [
        {
          id: 'greeting',
          text: 'Fresh food and supplies! Best prices in the wasteland!',
          choices: [
            { id: 'trade', text: 'What food do you have?', action: 'open_trade' },
            { id: 'leave', text: 'Maybe later', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'goodbye',
          text: 'Don\'t go hungry out there!',
          choices: []
        }
      ],
      inventory: [
        { ...items.find(i => i.id === 'stimpak')!, quantity: 6 },
        { ...items.find(i => i.id === 'purified_water')!, quantity: 10 },
        { ...items.find(i => i.id === 'nuka_cola')!, quantity: 8 }
      ],
      faction: 'rivet_city',
      isHostile: false
    },
    {
      id: 'flak_shrapnel',
      name: 'Flak & Shrapnel',
      type: 'trader',
      position: { x: 14 * 32 + 16, y: 5 * 32 + 16 },
      sprite: 'trader_male',
      dialogue: [
        {
          id: 'greeting',
          text: 'We buy and sell anything! Weapons, armor, junk - if it has value, we want it!',
          choices: [
            { id: 'trade', text: 'Show me what you have', action: 'open_trade' },
            { id: 'leave', text: 'I\'ll be back', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'goodbye',
          text: 'Remember - one person\'s junk is another\'s treasure!',
          choices: []
        }
      ],
      inventory: [
        items.find(i => i.id === 'plasma_rifle')!,
        items.find(i => i.id === 'power_armor')!,
        { ...items.find(i => i.id === 'rare_earth')!, quantity: 5 },
        { ...items.find(i => i.id === 'electronics')!, quantity: 15 }
      ],
      faction: 'rivet_city',
      isHostile: false
    }
  ];
  
  const interiorMap: GameMap = {
    id: 'rivet_city_market_interior',
    width,
    height,
    tiles,
    name: 'Rivet City Market',
    bgMusic: 'market_ambient',
    npcs,
    enemies: [],
    lootables: [],
    isInterior: true,
    parentMapId: 'capital_wasteland',
    exitPosition: { x: 80 * 32 + 16, y: 65 * 32 + 16 },
    connections: []
  };
  
  return {
    id: 'rivet_city_market',
    name: 'Rivet City Market',
    type: 'market',
    description: 'The bustling marketplace of Rivet City',
    interiorMap,
    entrancePosition: { x: 84 * 32 + 16, y: 67 * 32 + 16 }, // Center of building
    exitPosition: { x: 10 * 32 + 16, y: (height - 1) * 32 + 16 }
  };
};

// CANTERBURY COMMONS TRADING POST
export const createCanterburyTradingPost = (): Building => {
  const width = 16;
  const height = 12;
  const tiles: Tile[][] = [];
  
  // Initialize with wooden floor
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      row.push(createTile(x, y, 'dirt', true));
    }
    tiles.push(row);
  }
  
  // Add walls
  for (let x = 0; x < width; x++) {
    tiles[0][x] = createTile(x, 0, 'building', false);
    tiles[height - 1][x] = createTile(x, height - 1, 'building', false);
  }
  for (let y = 0; y < height; y++) {
    tiles[y][0] = createTile(0, y, 'building', false);
    tiles[y][width - 1] = createTile(width - 1, y, 'building', false);
  }
  
  // Entrance
  const entranceX = Math.floor(width / 2);
  tiles[height - 1][entranceX] = createTile(entranceX, height - 1, 'dirt', true);
  tiles[height - 1][entranceX].isEntrance = true;
  
  // Trading counters
  for (let x = 3; x <= 6; x++) {
    tiles[4][x] = createTile(x, 4, 'building', false);
  }
  for (let x = 9; x <= 12; x++) {
    tiles[4][x] = createTile(x, 4, 'building', false);
  }
  
  const npcs: NPC[] = [
    {
      id: 'uncle_roe',
      name: 'Uncle Roe',
      type: 'trader',
      position: { x: 5 * 32 + 16, y: 6 * 32 + 16 },
      sprite: 'trader_old',
      dialogue: [
        {
          id: 'greeting',
          text: 'Welcome to Canterbury Commons! I\'m Uncle Roe, and I run the caravan trade around these parts.',
          choices: [
            { id: 'trade', text: 'What do you have for trade?', action: 'open_trade' },
            { id: 'caravan', text: 'Tell me about the caravans', nextNode: 'caravan_info' },
            { id: 'trouble', text: 'Any trouble around here?', nextNode: 'superhero_trouble' },
            { id: 'leave', text: 'Safe travels', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'caravan_info',
          text: 'I coordinate trade routes across the wasteland. My caravans bring goods to settlements that need them. Dangerous work, but profitable.',
          choices: [
            { id: 'trade', text: 'What goods do you have?', action: 'open_trade' },
            { id: 'leave', text: 'Interesting business', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'superhero_trouble',
          text: 'We\'ve got a real problem here. Two costumed lunatics are fighting in the streets - the AntAgonizer and the Mechanist. It\'s bad for business!',
          choices: [
            { id: 'help_heroes', text: 'Maybe I can help with that', action: 'give_quest' },
            { id: 'trade', text: 'That\'s rough. What do you sell?', action: 'open_trade' },
            { id: 'leave', text: 'Good luck with that', nextNode: 'goodbye' }
          ]
        },
        {
          id: 'goodbye',
          text: 'May the road rise up to meet you, traveler.',
          choices: []
        }
      ],
      inventory: [
        { ...items.find(i => i.id === 'stimpak')!, quantity: 10 },
        { ...items.find(i => i.id === 'rad_away')!, quantity: 6 },
        items.find(i => i.id === 'combat_armor')!,
        items.find(i => i.id === 'assault_rifle')!,
        { ...items.find(i => i.id === 'scrap_metal')!, quantity: 25 },
        { ...items.find(i => i.id === 'purified_water')!, quantity: 8 }
      ],
      faction: 'canterbury',
      isHostile: false
    }
  ];
  
  const interiorMap: GameMap = {
    id: 'canterbury_trading_post_interior',
    width,
    height,
    tiles,
    name: 'Canterbury Commons Trading Post',
    bgMusic: 'trading_ambient',
    npcs,
    enemies: [],
    lootables: [],
    isInterior: true,
    parentMapId: 'capital_wasteland',
    exitPosition: { x: 65 * 32 + 16, y: 80 * 32 + 16 },
    connections: []
  };
  
  return {
    id: 'canterbury_trading_post',
    name: 'Canterbury Commons Trading Post',
    type: 'trader_post',
    description: 'Uncle Roe\'s caravan trading headquarters',
    interiorMap,
    entrancePosition: { x: 67 * 32 + 16, y: 81 * 32 + 16 }, // Center of building
    exitPosition: { x: entranceX * 32 + 16, y: (height - 1) * 32 + 16 }
  };
};

export const buildings: Building[] = [
  createCratersideSupply(),
  createMegatonClinic(),
  createRivetCityMarket(),
  createCanterburyTradingPost()
];

export const getBuildingById = (id: string): Building | undefined => {
  return buildings.find(building => building.id === id);
};

export const getBuildingByPosition = (position: Position, tolerance: number = 32): Building | undefined => {
  return buildings.find(building => {
    const distance = Math.sqrt(
      Math.pow(building.entrancePosition.x - position.x, 2) + 
      Math.pow(building.entrancePosition.y - position.y, 2)
    );
    return distance <= tolerance;
  });
};