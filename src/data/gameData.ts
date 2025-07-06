import { Character, Skill, Item, Enemy, GameMap, Quest, Achievement, NPC } from '../types/game';
import { maps } from './maps';
import { allQuests } from './quests';

export const characterClasses = {
  warrior: {
    name: 'Warrior',
    description: 'A tough melee fighter with high health and strength',
    baseStats: { strength: 15, agility: 8, intelligence: 6, endurance: 14, luck: 7, perception: 8, charisma: 6 },
    startingSkills: ['slash', 'power_strike', 'defensive_stance'],
    sprite: 'warrior'
  },
  ranger: {
    name: 'Ranger',
    description: 'A skilled marksman with high agility and perception',
    baseStats: { strength: 10, agility: 15, intelligence: 10, endurance: 10, luck: 10, perception: 14, charisma: 8 },
    startingSkills: ['aimed_shot', 'quick_shot', 'explosive_shot'],
    sprite: 'ranger'
  },
  medic: {
    name: 'Medic',
    description: 'A healer with knowledge of medicine and technology',
    baseStats: { strength: 7, agility: 9, intelligence: 15, endurance: 11, luck: 8, perception: 10, charisma: 12 },
    startingSkills: ['heal', 'poison_dart', 'adrenaline_shot'],
    sprite: 'medic'
  },
  engineer: {
    name: 'Engineer',
    description: 'A tech specialist who can craft and repair equipment',
    baseStats: { strength: 9, agility: 11, intelligence: 14, endurance: 9, luck: 12, perception: 11, charisma: 7 },
    startingSkills: ['emp_blast', 'turret_deploy', 'shock_trap'],
    sprite: 'engineer'
  }
};

export const backgrounds = [
  {
    id: 'vault_dweller',
    name: 'Vault Dweller',
    description: 'Raised in the safety of an underground vault',
    bonuses: { intelligence: 2, endurance: 1 },
    penalties: { charisma: -1 },
    startingItems: ['pip_boy', 'vault_suit']
  },
  {
    id: 'wasteland_wanderer',
    name: 'Wasteland Wanderer',
    description: 'Born and raised in the harsh wasteland',
    bonuses: { endurance: 2, perception: 1 },
    penalties: { intelligence: -1 },
    startingItems: ['leather_jacket', 'water_bottle']
  },
  {
    id: 'tribal',
    name: 'Tribal',
    description: 'Member of a primitive post-war tribe',
    bonuses: { strength: 2, agility: 1 },
    penalties: { intelligence: -1 },
    startingItems: ['tribal_spear', 'healing_powder']
  },
  {
    id: 'raider',
    name: 'Ex-Raider',
    description: 'Former member of a raider gang seeking redemption',
    bonuses: { strength: 1, agility: 1, luck: 1 },
    penalties: { charisma: -2 },
    startingItems: ['sawed_off_shotgun', 'leather_armor']
  }
];

export const traits = [
  {
    id: 'fast_metabolism',
    name: 'Fast Metabolism',
    description: 'Your body processes food and chems quickly',
    bonus: 'Healing items are 50% more effective',
    penalty: 'Radiation damage is 25% higher'
  },
  {
    id: 'heavy_handed',
    name: 'Heavy Handed',
    description: 'You swing weapons with great force',
    bonus: '+4 melee damage',
    penalty: '-30% critical hit chance'
  },
  {
    id: 'small_frame',
    name: 'Small Frame',
    description: 'You are not quite as big as other people',
    bonus: '+1 Agility',
    penalty: 'Limbs are easier to cripple'
  },
  {
    id: 'one_hander',
    name: 'One Hander',
    description: 'You excel with one-handed weapons',
    bonus: '+20% accuracy with one-handed weapons',
    penalty: '-40% accuracy with two-handed weapons'
  }
];

export const items: Item[] = [
  // Weapons
  {
    id: 'rusty_pipe',
    name: 'Rusty Pipe',
    type: 'weapon',
    rarity: 'common',
    description: 'A makeshift weapon from the old world',
    stats: { damage: 8, criticalChance: 5 },
    value: 10,
    sprite: 'rusty_pipe',
    stackable: false
  },
  {
    id: 'combat_knife',
    name: 'Combat Knife',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'A sharp military-grade knife',
    stats: { damage: 12, criticalChance: 15, agility: 2 },
    value: 25,
    sprite: 'combat_knife',
    stackable: false
  },
  {
    id: 'assault_rifle',
    name: 'Assault Rifle',
    type: 'weapon',
    rarity: 'rare',
    description: 'A reliable automatic weapon',
    stats: { damage: 20, criticalChance: 10, strength: 1 },
    value: 150,
    sprite: 'assault_rifle',
    stackable: false
  },
  {
    id: 'plasma_rifle',
    name: 'Plasma Rifle',
    type: 'weapon',
    rarity: 'epic',
    description: 'An advanced energy weapon',
    stats: { damage: 35, criticalChance: 20, intelligence: 3 },
    value: 500,
    sprite: 'plasma_rifle',
    stackable: false
  },
  
  // Armor
  {
    id: 'leather_jacket',
    name: 'Leather Jacket',
    type: 'armor',
    rarity: 'common',
    description: 'Worn but protective leather armor',
    stats: { defense: 5, endurance: 1 },
    value: 15,
    sprite: 'leather_jacket',
    stackable: false
  },
  {
    id: 'combat_armor',
    name: 'Combat Armor',
    type: 'armor',
    rarity: 'uncommon',
    description: 'Military-grade protective gear',
    stats: { defense: 12, strength: 2, endurance: 2 },
    value: 75,
    sprite: 'combat_armor',
    stackable: false
  },
  {
    id: 'power_armor',
    name: 'Power Armor',
    type: 'armor',
    rarity: 'legendary',
    description: 'Advanced powered exoskeleton',
    stats: { defense: 25, strength: 5, endurance: 5, agility: -2 },
    value: 1000,
    sprite: 'power_armor',
    stackable: false
  },
  
  // Consumables
  {
    id: 'stimpak',
    name: 'Stimpak',
    type: 'consumable',
    rarity: 'common',
    description: 'Instantly restores health',
    quantity: 1,
    value: 20,
    sprite: 'stimpak',
    stackable: true
  },
  {
    id: 'rad_away',
    name: 'Rad-Away',
    type: 'consumable',
    rarity: 'uncommon',
    description: 'Removes radiation poisoning',
    quantity: 1,
    value: 30,
    sprite: 'rad_away',
    stackable: true
  },
  {
    id: 'psycho',
    name: 'Psycho',
    type: 'consumable',
    rarity: 'rare',
    description: 'Increases damage but causes addiction',
    quantity: 1,
    value: 50,
    sprite: 'psycho',
    stackable: true
  },
  {
    id: 'buffout',
    name: 'Buffout',
    type: 'consumable',
    rarity: 'uncommon',
    description: 'Temporarily increases strength and endurance',
    quantity: 1,
    value: 40,
    sprite: 'buffout',
    stackable: true
  },
  {
    id: 'mentats',
    name: 'Mentats',
    type: 'consumable',
    rarity: 'uncommon',
    description: 'Temporarily increases intelligence and perception',
    quantity: 1,
    value: 35,
    sprite: 'mentats',
    stackable: true
  },
  
  // Materials
  {
    id: 'scrap_metal',
    name: 'Scrap Metal',
    type: 'material',
    rarity: 'common',
    description: 'Useful for crafting and repairs',
    quantity: 1,
    value: 2,
    sprite: 'scrap_metal',
    stackable: true
  },
  {
    id: 'electronics',
    name: 'Electronics',
    type: 'material',
    rarity: 'uncommon',
    description: 'Complex electronic components',
    quantity: 1,
    value: 10,
    sprite: 'electronics',
    stackable: true
  },
  {
    id: 'rare_earth',
    name: 'Rare Earth Elements',
    type: 'material',
    rarity: 'rare',
    description: 'Precious materials for advanced crafting',
    quantity: 1,
    value: 50,
    sprite: 'rare_earth',
    stackable: true
  }
];

// Add new items for the expanded world
export const additionalItems: Item[] = [
  // Alien Technology
  {
    id: 'alien_blaster',
    name: 'Alien Blaster',
    type: 'weapon',
    rarity: 'legendary',
    description: 'An otherworldly energy weapon of unknown origin',
    stats: { damage: 50, criticalChance: 25, intelligence: 2 },
    value: 2000,
    sprite: 'alien_blaster',
    stackable: false
  },
  {
    id: 'alien_power_cell',
    name: 'Alien Power Cell',
    type: 'material',
    rarity: 'rare',
    description: 'Advanced alien energy storage device',
    quantity: 1,
    value: 100,
    sprite: 'alien_power_cell',
    stackable: true
  },
  
  // Vault-Tec Equipment
  {
    id: 'pip_boy',
    name: 'Pip-Boy 3000',
    type: 'accessory',
    rarity: 'epic',
    description: 'Personal Information Processor from Vault-Tec',
    stats: { intelligence: 3, perception: 2 },
    value: 1500,
    sprite: 'pip_boy',
    stackable: false
  },
  {
    id: 'vault_suit',
    name: 'Vault 101 Jumpsuit',
    type: 'armor',
    rarity: 'uncommon',
    description: 'Standard issue Vault-Tec jumpsuit',
    stats: { defense: 3, endurance: 1 },
    value: 50,
    sprite: 'vault_suit',
    stackable: false
  },
  
  // Brotherhood Technology
  {
    id: 'brotherhood_armor',
    name: 'Brotherhood Combat Armor',
    type: 'armor',
    rarity: 'rare',
    description: 'Advanced combat armor used by the Brotherhood of Steel',
    stats: { defense: 18, strength: 2, endurance: 3 },
    value: 400,
    sprite: 'brotherhood_armor',
    stackable: false
  },
  {
    id: 'laser_rifle',
    name: 'Laser Rifle',
    type: 'weapon',
    rarity: 'rare',
    description: 'Military-grade energy weapon',
    stats: { damage: 28, criticalChance: 15, intelligence: 1 },
    value: 300,
    sprite: 'laser_rifle',
    stackable: false
  },
  
  // Enclave Equipment
  {
    id: 'enclave_armor',
    name: 'Enclave Power Armor',
    type: 'armor',
    rarity: 'epic',
    description: 'Advanced power armor used by Enclave forces',
    stats: { defense: 30, strength: 6, endurance: 6, agility: -3 },
    value: 1500,
    sprite: 'enclave_armor',
    stackable: false
  },
  
  // Special Quest Items
  {
    id: 'geck',
    name: 'G.E.C.K.',
    type: 'quest',
    rarity: 'legendary',
    description: 'Garden of Eden Creation Kit - the key to Project Purity',
    value: 0,
    sprite: 'geck',
    stackable: false
  },
  {
    id: 'declaration_independence',
    name: 'Declaration of Independence',
    type: 'quest',
    rarity: 'legendary',
    description: 'The founding document of the United States of America',
    value: 0,
    sprite: 'declaration',
    stackable: false
  },
  {
    id: 'water_chip',
    name: 'Water Chip',
    type: 'quest',
    rarity: 'epic',
    description: 'Essential component for water purification systems',
    value: 0,
    sprite: 'water_chip',
    stackable: false
  },
  
  // Consumables
  {
    id: 'nuka_cola',
    name: 'Nuka-Cola',
    type: 'consumable',
    rarity: 'common',
    description: 'The refreshing taste of the old world',
    quantity: 1,
    value: 15,
    sprite: 'nuka_cola',
    stackable: true
  },
  {
    id: 'purified_water',
    name: 'Purified Water',
    type: 'consumable',
    rarity: 'uncommon',
    description: 'Clean, radiation-free water',
    quantity: 1,
    value: 25,
    sprite: 'purified_water',
    stackable: true
  }
];

// Combine original items with additional items
items.push(...additionalItems);

export const skills: Skill[] = [
  // Warrior Skills
  {
    id: 'slash',
    name: 'Slash',
    description: 'A basic melee attack with a bladed weapon',
    energyCost: 2,
    damage: 15,
    range: 1,
    cooldown: 1,
    currentCooldown: 0,
    unlockLevel: 1,
    animation: 'slash'
  },
  {
    id: 'power_strike',
    name: 'Power Strike',
    description: 'A devastating melee attack that deals massive damage',
    energyCost: 5,
    damage: 35,
    range: 1,
    cooldown: 3,
    currentCooldown: 0,
    unlockLevel: 3,
    animation: 'power_strike'
  },
  {
    id: 'defensive_stance',
    name: 'Defensive Stance',
    description: 'Increases defense but reduces movement speed',
    energyCost: 3,
    effect: { type: 'buff', duration: 5, value: 10 },
    range: 0,
    cooldown: 5,
    currentCooldown: 0,
    unlockLevel: 2,
    animation: 'defensive_stance'
  },
  
  // Ranger Skills
  {
    id: 'aimed_shot',
    name: 'Aimed Shot',
    description: 'A precise ranged attack with increased critical chance',
    energyCost: 4,
    damage: 25,
    range: 5,
    cooldown: 2,
    currentCooldown: 0,
    unlockLevel: 1,
    animation: 'aimed_shot'
  },
  {
    id: 'quick_shot',
    name: 'Quick Shot',
    description: 'A fast ranged attack with reduced damage',
    energyCost: 2,
    damage: 12,
    range: 4,
    cooldown: 0.5,
    currentCooldown: 0,
    unlockLevel: 1,
    animation: 'quick_shot'
  },
  {
    id: 'explosive_shot',
    name: 'Explosive Shot',
    description: 'A shot that explodes on impact, dealing area damage',
    energyCost: 6,
    damage: 30,
    range: 5,
    cooldown: 4,
    currentCooldown: 0,
    unlockLevel: 3,
    animation: 'explosive_shot'
  },
  
  // Medic Skills
  {
    id: 'heal',
    name: 'Heal',
    description: 'Restore health to an ally',
    energyCost: 4,
    healing: 30,
    range: 2,
    cooldown: 1,
    currentCooldown: 0,
    unlockLevel: 1,
    animation: 'heal'
  },
  {
    id: 'poison_dart',
    name: 'Poison Dart',
    description: 'A ranged attack that poisons the target',
    energyCost: 3,
    damage: 10,
    effect: { type: 'poison', duration: 3, value: 5 },
    range: 3,
    cooldown: 2,
    currentCooldown: 0,
    unlockLevel: 2,
    animation: 'poison_dart'
  },
  {
    id: 'adrenaline_shot',
    name: 'Adrenaline Shot',
    description: 'Inject an ally with adrenaline, boosting their damage',
    energyCost: 5,
    effect: { type: 'buff', duration: 4, value: 15 },
    range: 2,
    cooldown: 5,
    currentCooldown: 0,
    unlockLevel: 3,
    animation: 'adrenaline_shot'
  },
  
  // Engineer Skills
  {
    id: 'emp_blast',
    name: 'EMP Blast',
    description: 'An electromagnetic pulse that damages robotic enemies',
    energyCost: 4,
    damage: 25,
    range: 3,
    cooldown: 3,
    currentCooldown: 0,
    unlockLevel: 1,
    animation: 'emp_blast'
  },
  {
    id: 'turret_deploy',
    name: 'Deploy Turret',
    description: 'Deploy a temporary turret that attacks enemies',
    energyCost: 8,
    damage: 15,
    range: 1,
    cooldown: 8,
    currentCooldown: 0,
    unlockLevel: 3,
    animation: 'turret_deploy'
  },
  {
    id: 'shock_trap',
    name: 'Shock Trap',
    description: 'Place an electric trap that stuns enemies',
    energyCost: 5,
    damage: 20,
    effect: { type: 'stun', duration: 2, value: 1 },
    range: 2,
    cooldown: 4,
    currentCooldown: 0,
    unlockLevel: 2,
    animation: 'shock_trap'
  },
  
  // Universal Skills
  {
    id: 'cure',
    name: 'Cure',
    description: 'Remove negative status effects from an ally',
    energyCost: 3,
    range: 2,
    cooldown: 2,
    currentCooldown: 0,
    unlockLevel: 2,
    animation: 'cure'
  },
  {
    id: 'stimpack',
    name: 'Stimpack',
    description: 'Quick healing injection',
    energyCost: 2,
    healing: 20,
    range: 1,
    cooldown: 1,
    currentCooldown: 0,
    unlockLevel: 1,
    animation: 'stimpack'
  }
];

export const enemyTypes: Enemy[] = [
  {
    id: 'raider',
    name: 'Wasteland Raider',
    type: 'raider',
    level: 1,
    health: 40,
    maxHealth: 40,
    energy: 10,
    maxEnergy: 10,
    defense: 2,
    damage: 12,
    experience: 15,
    loot: [
      { item: items.find(i => i.id === 'rusty_pipe')!, chance: 0.3, quantity: 1 },
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.8, quantity: 2 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'raider',
    ai: { type: 'aggressive', range: 5, speed: 64 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'slash')!]
  },
  {
    id: 'mutant',
    name: 'Irradiated Mutant',
    type: 'mutant',
    level: 3,
    health: 80,
    maxHealth: 80,
    energy: 15,
    maxEnergy: 15,
    defense: 5,
    damage: 18,
    experience: 35,
    loot: [
      { item: items.find(i => i.id === 'rad_away')!, chance: 0.4, quantity: 1 },
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.6, quantity: 3 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'mutant',
    ai: { type: 'aggressive', range: 6, speed: 48 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'slash')!, skills.find(s => s.id === 'poison_dart')!]
  },
  {
    id: 'robot',
    name: 'Security Robot',
    type: 'robot',
    level: 5,
    health: 120,
    maxHealth: 120,
    energy: 30,
    maxEnergy: 30,
    defense: 10,
    damage: 25,
    experience: 60,
    loot: [
      { item: items.find(i => i.id === 'electronics')!, chance: 0.7, quantity: 2 },
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 0.9, quantity: 5 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'robot',
    ai: { type: 'patrol', range: 8, speed: 32 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'aimed_shot')!, skills.find(s => s.id === 'emp_blast')!]
  },
  {
    id: 'raider_boss',
    name: 'Raider Chief',
    type: 'raider',
    level: 4,
    health: 100,
    maxHealth: 100,
    energy: 20,
    maxEnergy: 20,
    defense: 8,
    damage: 22,
    experience: 80,
    loot: [
      { item: items.find(i => i.id === 'combat_armor')!, chance: 0.6, quantity: 1 },
      { item: items.find(i => i.id === 'assault_rifle')!, chance: 0.4, quantity: 1 },
      { item: items.find(i => i.id === 'scrap_metal')!, chance: 1.0, quantity: 5 }
    ],
    position: { x: 0, y: 0 },
    direction: 'down',
    isMoving: false,
    sprite: 'raider_boss',
    ai: { type: 'aggressive', range: 6, speed: 56 },
    statusEffects: [],
    skills: [skills.find(s => s.id === 'power_strike')!, skills.find(s => s.id === 'aimed_shot')!]
  }
];

export const npcs: NPC[] = [
  {
    id: 'trader_joe',
    name: 'Trader Joe',
    type: 'trader',
    position: { x: 15 * 32 + 16, y: 20 * 32 + 16 },
    sprite: 'trader',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome, survivor! I have goods to trade. What can I do for you?',
        choices: [
          { id: 'trade', text: 'Show me your wares', action: 'open_trade' },
          { id: 'info', text: 'Tell me about this place', nextNode: 'info' },
          { id: 'leave', text: 'Maybe later', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'info',
        text: 'This wasteland is dangerous, but there are opportunities for those brave enough. I travel between settlements, trading supplies.',
        choices: [
          { id: 'trade', text: 'Show me your wares', action: 'open_trade' },
          { id: 'leave', text: 'Thanks for the info', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Safe travels, friend. Watch out for raiders!',
        choices: []
      }
    ],
    inventory: [
      items.find(i => i.id === 'stimpak')!,
      items.find(i => i.id === 'combat_knife')!,
      items.find(i => i.id === 'combat_armor')!,
      items.find(i => i.id === 'scrap_metal')!
    ],
    faction: 'neutral',
    isHostile: false
  },
  {
    id: 'quest_giver',
    name: 'Captain Sarah',
    type: 'quest_giver',
    position: { x: 30 * 32 + 16, y: 40 * 32 + 16 },
    sprite: 'captain',
    dialogue: [
      {
        id: 'greeting',
        text: 'Survivor! Our settlement is under constant threat from raiders. We need someone skilled to help us.',
        choices: [
          { id: 'accept', text: 'I\'ll help you deal with the raiders', action: 'give_quest' },
          { id: 'info', text: 'Tell me more about these raiders', nextNode: 'raider_info' },
          { id: 'decline', text: 'I\'m not ready for that', nextNode: 'disappointed' }
        ]
      },
      {
        id: 'raider_info',
        text: 'They\'ve set up camp to the north. Heavily armed and dangerous. They\'ve been attacking our supply convoys.',
        choices: [
          { id: 'accept', text: 'I\'ll take care of them', action: 'give_quest' },
          { id: 'decline', text: 'Sounds too dangerous', nextNode: 'disappointed' }
        ]
      },
      {
        id: 'disappointed',
        text: 'I understand. The wasteland is dangerous. Come back when you\'re ready.',
        choices: []
      },
      {
        id: 'quest_given',
        text: 'Thank you! Clear out that raider camp and we\'ll reward you well.',
        choices: []
      }
    ],
    quests: [
      {
        id: 'raider_threat',
        title: 'Clear the Raider Camp',
        description: 'Eliminate the raider threat near the settlement',
        objectives: [
          {
            id: 'kill_raiders',
            description: 'Eliminate the raider threat (Kill 5 raiders)',
            type: 'kill',
            target: 'raider',
            current: 0,
            required: 5,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 200 },
          { type: 'gold', value: 100 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'combat_armor') }
        ],
        status: 'available',
        requiredLevel: 1
      }
    ],
    faction: 'settlement',
    isHostile: false
  },
  {
    id: 'wanderer',
    name: 'Old Pete',
    type: 'neutral',
    position: { x: 10 * 32 + 16, y: 60 * 32 + 16 },
    sprite: 'wanderer',
    dialogue: [
      {
        id: 'greeting',
        text: 'Been wandering these wastes for decades, I have. Seen things that would make your hair white.',
        choices: [
          { id: 'stories', text: 'Tell me about what you\'ve seen', nextNode: 'stories' },
          { id: 'advice', text: 'Any advice for a fellow wanderer?', nextNode: 'advice' },
          { id: 'leave', text: 'Take care, old timer', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'stories',
        text: 'Raiders, mutants, machines that still work from before the bombs... This land is full of dangers and wonders.',
        choices: [
          { id: 'advice', text: 'Any survival tips?', nextNode: 'advice' },
          { id: 'leave', text: 'Thanks for sharing', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'advice',
        text: 'Always carry water, never trust a raider, and remember - in the wasteland, your reputation matters more than caps.',
        choices: [
          { id: 'leave', text: 'Wise words, thanks', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'May the road rise up to meet you, wanderer.',
        choices: []
      }
    ],
    faction: 'neutral',
    isHostile: false
  },
  {
    id: 'doctor_smith',
    name: 'Dr. Smith',
    type: 'trader',
    position: { x: 70 * 32 + 16, y: 30 * 32 + 16 },
    sprite: 'doctor',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome to my clinic! I have medical supplies and can treat your wounds.',
        choices: [
          { id: 'trade', text: 'Show me your medical supplies', action: 'open_trade' },
          { id: 'heal', text: 'I need healing', action: 'heal_player' },
          { id: 'quest', text: 'Do you need any help?', nextNode: 'quest_offer' },
          { id: 'leave', text: 'Maybe later', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'quest_offer',
        text: 'Actually, yes! I\'m running low on medical supplies. If you could bring me some Stimpaks, I\'d be very grateful.',
        choices: [
          { id: 'accept_quest', text: 'I\'ll help you gather supplies', action: 'give_quest' },
          { id: 'trade', text: 'Let me see what you have first', action: 'open_trade' },
          { id: 'leave', text: 'I\'ll think about it', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Stay safe out there. The wasteland is dangerous.',
        choices: []
      }
    ],
    inventory: [
      { ...items.find(i => i.id === 'stimpak')!, quantity: 3 },
      { ...items.find(i => i.id === 'rad_away')!, quantity: 2 },
      items.find(i => i.id === 'mentats')!
    ],
    quests: [
      {
        id: 'medical_supplies',
        title: 'Medical Emergency',
        description: 'Dr. Smith needs medical supplies for his clinic.',
        objectives: [
          {
            id: 'collect_stimpaks',
            description: 'Collect 5 Stimpaks',
            type: 'collect',
            target: 'stimpak',
            current: 0,
            required: 5,
            completed: false
          },
          {
            id: 'deliver_supplies',
            description: 'Deliver the supplies to Dr. Smith',
            type: 'talk',
            target: 'doctor_smith',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 150 },
          { type: 'gold', value: 75 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'rad_away') }
        ],
        status: 'available',
        requiredLevel: 1
      }
    ],
    faction: 'medical',
    isHostile: false
  },
  {
    id: 'mechanic_bob',
    name: 'Mechanic Bob',
    type: 'trader',
    position: { x: 50 * 32 + 16, y: 80 * 32 + 16 },
    sprite: 'mechanic',
    dialogue: [
      {
        id: 'greeting',
        text: 'Need some gear fixed or looking for quality weapons? You came to the right place!',
        choices: [
          { id: 'trade', text: 'Show me your wares', action: 'open_trade' },
          { id: 'repair', text: 'Can you repair my equipment?', nextNode: 'repair_info' },
          { id: 'quest', text: 'Got any work for me?', nextNode: 'quest_offer' },
          { id: 'leave', text: 'Just browsing', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'repair_info',
        text: 'I can fix most things, but it\'ll cost you. Bring me scrap metal and I\'ll make your gear good as new.',
        choices: [
          { id: 'trade', text: 'Let\'s see what you have', action: 'open_trade' },
          { id: 'leave', text: 'I\'ll think about it', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'quest_offer',
        text: 'I need someone to collect scrap and electronics for my projects. The wasteland is full of useful junk if you know where to look.',
        choices: [
          { id: 'accept_quest', text: 'I\'ll gather materials for you', action: 'give_quest' },
          { id: 'trade', text: 'What can you offer in return?', action: 'open_trade' },
          { id: 'leave', text: 'Not interested', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Come back when you need quality work done!',
        choices: []
      }
    ],
    inventory: [
      items.find(i => i.id === 'assault_rifle')!,
      items.find(i => i.id === 'combat_armor')!,
      { ...items.find(i => i.id === 'scrap_metal')!, quantity: 10 },
      { ...items.find(i => i.id === 'electronics')!, quantity: 3 }
    ],
    quests: [
      {
        id: 'scavenger_hunt',
        title: 'Scavenger\'s Dream',
        description: 'Collect valuable scrap materials for the settlement.',
        objectives: [
          {
            id: 'collect_scrap',
            description: 'Collect 10 Scrap Metal',
            type: 'collect',
            target: 'scrap_metal',
            current: 0,
            required: 10,
            completed: false
          },
          {
            id: 'collect_electronics',
            description: 'Collect 3 Electronics',
            type: 'collect',
            target: 'electronics',
            current: 0,
            required: 3,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 180 },
          { type: 'gold', value: 120 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'assault_rifle') }
        ],
        status: 'available',
        requiredLevel: 3
      }
    ],
    faction: 'mechanics',
    isHostile: false
  },
  {
    id: 'vault_overseer',
    name: 'Overseer Martinez',
    type: 'quest_giver',
    position: { x: 85 * 32 + 16, y: 15 * 32 + 16 },
    sprite: 'overseer',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome to Vault 101. We\'ve been monitoring the surface conditions. The situation is... concerning.',
        choices: [
          { id: 'situation', text: 'What kind of situation?', nextNode: 'vault_mission' },
          { id: 'vault_info', text: 'Tell me about this vault', nextNode: 'vault_info' },
          { id: 'leave', text: 'I should go', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'vault_mission',
        text: 'Our water purification system is failing. We need someone to venture into the old tech facility and retrieve a replacement water chip.',
        choices: [
          { id: 'accept_mission', text: 'I\'ll find your water chip', action: 'give_quest' },
          { id: 'vault_info', text: 'First, tell me about this place', nextNode: 'vault_info' },
          { id: 'decline', text: 'That sounds dangerous', nextNode: 'disappointed' }
        ]
      },
      {
        id: 'vault_info',
        text: 'Vault 101 was designed to house 1000 people indefinitely. We\'ve maintained our technology, but some systems are beginning to fail after all these years.',
        choices: [
          { id: 'accept_mission', text: 'I\'ll help with the water chip', action: 'give_quest' },
          { id: 'leave', text: 'Interesting. I\'ll consider it', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'disappointed',
        text: 'I understand your hesitation. The facility is heavily guarded by automated defenses. But without that chip, our people will die.',
        choices: [
          { id: 'accept_mission', text: 'Alright, I\'ll do it', action: 'give_quest' },
          { id: 'leave', text: 'I need time to think', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'The vault\'s doors are always open to you, surface dweller.',
        choices: []
      }
    ],
    quests: [
      {
        id: 'water_chip_quest',
        title: 'The Water Chip',
        description: 'Retrieve a water chip from the old tech facility to save Vault 101.',
        objectives: [
          {
            id: 'find_facility',
            description: 'Locate the old tech facility',
            type: 'explore',
            target: 'tech_facility',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'defeat_security',
            description: 'Disable the facility\'s security robots',
            type: 'kill',
            target: 'robot',
            current: 0,
            required: 3,
            completed: false
          },
          {
            id: 'retrieve_chip',
            description: 'Find and retrieve the water chip',
            type: 'collect',
            target: 'water_chip',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 300 },
          { type: 'gold', value: 200 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'power_armor') }
        ],
        status: 'available',
        requiredLevel: 5
      }
    ],
    faction: 'vault',
    isHostile: false
  }
];

export const createStartingCharacter = (name: string, characterClass: keyof typeof characterClasses): Character => {
  const classData = characterClasses[characterClass];
  const startingSkills = classData.startingSkills
    .map(skillId => skills.find(skill => skill.id === skillId))
    .filter(Boolean) as Skill[];
  
  const character = {
    id: 'player',
    name,
    background: 'vault_dweller',
    age: 25,
    gender: 'male' as const,
    class: characterClass,
    level: 1,
    experience: 0,
    experienceToNext: 100,
    health: 100,
    maxHealth: 100,
    energy: 50,
    maxEnergy: 50,
    radiation: 0,
    maxRadiation: 1000,
    stats: { ...classData.baseStats },
    derivedStats: {
      carryWeight: classData.baseStats.strength * 10,
      actionPoints: Math.floor(classData.baseStats.agility / 2),
      criticalChance: classData.baseStats.luck,
      damageResistance: 0,
      radiationResistance: classData.baseStats.endurance * 2
    },
    skills: startingSkills,
    perks: [],
    equipment: {
      weapon: items.find(i => i.id === 'rusty_pipe'),
      armor: items.find(i => i.id === 'leather_jacket')
    },
    isInParty: true,
    position: { x: 50 * 32, y: 50 * 32 },
    direction: 'down' as const,
    isMoving: false,
    sprite: classData.sprite,
    statusEffects: [],
    biography: '',
    traits: []
  };
  
  // Add equipment bonuses tracking
  (character as any).equipmentBonuses = {
    damage: 0,
    defense: 0,
    strength: 0,
    agility: 0,
    intelligence: 0,
    endurance: 0,
    luck: 0,
    criticalChance: 0
  };
  
  return character;
};

export const createStartingMap = (): GameMap => {
  // Use the new map creation system
  return maps.capital_wasteland();
};

export const achievements: Achievement[] = [
  {
    id: 'first_kill',
    name: 'First Blood',
    description: 'Kill your first enemy',
    icon: 'skull',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'level_up',
    name: 'Growing Stronger',
    description: 'Reach level 5',
    icon: 'star',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Discover 100 tiles',
    icon: 'map',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Find 50 items',
    icon: 'package',
    unlocked: false,
    progress: 0,
    maxProgress: 50
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Survive for 1 hour',
    icon: 'clock',
    unlocked: false,
    progress: 0,
    maxProgress: 3600
  },
  {
    id: 'quest_master',
    name: 'Quest Master',
    description: 'Complete 10 quests',
    icon: 'scroll',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'raider_slayer',
    name: 'Raider Slayer',
    description: 'Kill 25 raiders',
    icon: 'sword',
    unlocked: false,
    progress: 0,
    maxProgress: 25
  }
];

export const quests: Quest[] = [
  ...allQuests.filter(q => q.status === 'active')
];