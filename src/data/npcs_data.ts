import { NPC } from '../types/game';
import { items } from './items_data';

export const npcs: NPC[] = [
  // VAULT 101 NPCs
  {
    id: 'overseer_almodovar',
    name: 'Overseer Almodovar',
    type: 'quest_giver',
    mapId: 'capital_wasteland',
    position: { x: 26 * 32 + 16, y: 24 * 32 + 16 },
    sprite: 'overseer',
    dialogue: [
      {
        id: 'greeting',
        text: 'You! You\'re the one who opened the vault door! Your father has doomed us all!',
        choices: [
          { id: 'explain', text: 'I had to find my father', nextNode: 'explanation' },
          { id: 'apologize', text: 'I\'m sorry for the trouble', nextNode: 'apology' },
          { id: 'defiant', text: 'The vault was a prison', nextNode: 'defiance' }
        ]
      },
      {
        id: 'explanation',
        text: 'Your father broke the most sacred rule of Vault 101. No one enters, no one leaves. Now look what\'s happened!',
        choices: [
          { id: 'leave', text: 'I need to go find him', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'apology',
        text: 'Sorry won\'t fix what\'s been done. The vault is in chaos because of your family.',
        choices: [
          { id: 'leave', text: 'I\'ll leave and never return', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'defiance',
        text: 'A prison? This vault has protected us for 200 years! And now... now it\'s all falling apart.',
        choices: [
          { id: 'leave', text: 'Maybe it\'s time for change', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Get out. Get out and never come back!',
        choices: []
      }
    ],
    faction: 'vault_101',
    isHostile: false
  },

  {
    id: 'amata',
    name: 'Amata Almodovar',
    type: 'neutral',
    mapId: 'capital_wasteland',
    position: { x: 24 * 32 + 16, y: 22 * 32 + 16 },
    sprite: 'amata',
    dialogue: [
      {
        id: 'greeting',
        text: 'I can\'t believe you\'re really leaving. After everything we\'ve been through...',
        choices: [
          { id: 'stay', text: 'Maybe I should stay', nextNode: 'stay_response' },
          { id: 'come_with', text: 'Come with me', nextNode: 'come_response' },
          { id: 'must_go', text: 'I have to find my father', nextNode: 'understanding' }
        ]
      },
      {
        id: 'stay_response',
        text: 'You can\'t. My father will never forgive you, and the vault is divided. It\'s not safe.',
        choices: [
          { id: 'must_go', text: 'Then I have no choice', nextNode: 'understanding' }
        ]
      },
      {
        id: 'come_response',
        text: 'I can\'t abandon the vault. Someone needs to try to hold things together here.',
        choices: [
          { id: 'understand', text: 'I understand', nextNode: 'understanding' }
        ]
      },
      {
        id: 'understanding',
        text: 'Take this. It\'s not much, but it might help you out there. And... be careful.',
        choices: [
          { id: 'thanks', text: 'Thank you, Amata', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'I\'ll never forget you. Maybe someday... maybe things will be different.',
        choices: []
      }
    ],
    inventory: [
      items.find(i => i.id === 'stimpak')!,
      items.find(i => i.id === 'pip_boy')!
    ],
    faction: 'vault_101',
    isHostile: false
  },

  // MEGATON NPCs
  {
    id: 'sheriff_lucas',
    name: 'Sheriff Lucas Simms',
    type: 'quest_giver',
    mapId: 'capital_wasteland',
    position: { x: 44 * 32 + 16, y: 44 * 32 + 16 },
    sprite: 'sheriff',
    dialogue: [
      {
        id: 'greeting',
        text: 'Well, well. Another vault dweller. Don\'t see many of your kind around here. Welcome to Megaton, stranger.',
        choices: [
          { id: 'about_town', text: 'Tell me about this town', nextNode: 'town_info' },
          { id: 'about_bomb', text: 'Is that really an atomic bomb?', nextNode: 'bomb_info' },
          { id: 'father_question', text: 'Have you seen my father?', nextNode: 'father_info' },
          { id: 'leave', text: 'Thanks, I\'ll look around', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'town_info',
        text: 'Megaton\'s been here since right after the bombs fell. Built around that atomic bomb for protection. Ironic, ain\'t it?',
        choices: [
          { id: 'about_bomb', text: 'About that bomb...', nextNode: 'bomb_info' },
          { id: 'father_question', text: 'Have you seen my father?', nextNode: 'father_info' },
          { id: 'leave', text: 'Interesting place', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'bomb_info',
        text: 'That old thing? Been here for 200 years and hasn\'t gone off yet. Some folks want it disarmed, others... well, let\'s just say they have different ideas.',
        choices: [
          { id: 'disarm_offer', text: 'I could try to disarm it', nextNode: 'disarm_quest' },
          { id: 'father_question', text: 'Have you seen my father?', nextNode: 'father_info' },
          { id: 'leave', text: 'I see', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'father_info',
        text: 'Middle-aged fellow? Vault suit? Yeah, he came through here a few days ago. Asked about the old monuments in D.C. Try Galaxy News Radio - Three Dog knows everything that happens in the wasteland.',
        choices: [
          { id: 'gnr_directions', text: 'How do I get to Galaxy News Radio?', nextNode: 'gnr_info' },
          { id: 'thanks', text: 'Thank you for the information', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'disarm_quest',
        text: 'You\'d do that? It\'d take someone with real technical know-how. If you can disarm that bomb, I\'ll make sure you\'re rewarded proper.',
        choices: [
          { id: 'accept_bomb', text: 'I\'ll see what I can do', action: 'give_quest' },
          { id: 'maybe_later', text: 'Let me think about it', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'gnr_info',
        text: 'Head northeast from here, past the Super Duper Mart. Can\'t miss it - big radio tower. But be careful, that area\'s crawling with super mutants.',
        choices: [
          { id: 'thanks', text: 'Thanks for the warning', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Stay safe out there, vault dweller. And remember - Megaton\'s always got room for good folks.',
        choices: []
      }
    ],
    quests: [
      {
        id: 'the_power_of_atom',
        title: 'The Power of the Atom',
        description: 'Sheriff Simms wants the atomic bomb in Megaton disarmed for the safety of the town.',
        objectives: [
          {
            id: 'examine_bomb',
            description: 'Examine the atomic bomb in Megaton',
            type: 'explore',
            target: 'megaton_bomb',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'disarm_bomb',
            description: 'Disarm the atomic bomb',
            type: 'explore',
            target: 'bomb_disarm',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 300 },
          { type: 'gold', value: 500 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'combat_armor') }
        ],
        status: 'available',
        requiredLevel: 3
      }
    ],
    faction: 'megaton',
    isHostile: false
  },

  {
    id: 'moira_brown',
    name: 'Moira Brown',
    type: 'quest_giver',
    mapId: 'capital_wasteland',
    position: { x: 57 * 32 + 16, y: 45 * 32 + 16 },
    sprite: 'moira',
    dialogue: [
      {
        id: 'greeting',
        text: 'Oh my! A real live vault dweller! This is so exciting! I\'m Moira Brown, and I run Craterside Supply. Say, you wouldn\'t be interested in helping with a little project of mine, would you?',
        choices: [
          { id: 'project', text: 'What kind of project?', nextNode: 'project_info' },
          { id: 'trade', text: 'I\'d like to see your goods', action: 'open_trade' },
          { id: 'not_interested', text: 'Not really interested', nextNode: 'disappointed' }
        ]
      },
      {
        id: 'project_info',
        text: 'I\'m writing the Wasteland Survival Guide! The definitive handbook for post-nuclear survival! But I need someone to test my theories. Someone brave, resourceful... someone like you!',
        choices: [
          { id: 'accept_guide', text: 'Sounds interesting, I\'ll help', action: 'give_quest' },
          { id: 'dangerous', text: 'Sounds dangerous', nextNode: 'safety_assurance' },
          { id: 'trade', text: 'Maybe later. Can I see your goods?', action: 'open_trade' }
        ]
      },
      {
        id: 'safety_assurance',
        text: 'Oh, don\'t worry! I\'ve calculated all the risks. Well, most of them. Okay, some of them. But think of the knowledge we\'ll gain!',
        choices: [
          { id: 'accept_guide', text: 'Alright, I\'ll do it', action: 'give_quest' },
          { id: 'decline', text: 'I think I\'ll pass', nextNode: 'disappointed' }
        ]
      },
      {
        id: 'disappointed',
        text: 'Oh, well that\'s disappointing. But if you change your mind, I\'ll be right here!',
        choices: [
          { id: 'trade', text: 'Can I see your goods?', action: 'open_trade' },
          { id: 'leave', text: 'I\'ll think about it', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Come back anytime! And remember - knowledge is the ultimate weapon against ignorance!',
        choices: []
      }
    ],
    inventory: [
      { ...items.find(i => i.id === 'stimpak')!, quantity: 5 },
      { ...items.find(i => i.id === 'rad_away')!, quantity: 3 },
      items.find(i => i.id === 'combat_knife')!,
      { ...items.find(i => i.id === 'scrap_metal')!, quantity: 8 },
      items.find(i => i.id === 'assault_rifle')!
    ],
    quests: [
      {
        id: 'wasteland_survival_guide',
        title: 'The Wasteland Survival Guide',
        description: 'Help Moira Brown research and write the definitive guide to wasteland survival.',
        objectives: [
          {
            id: 'radiation_research',
            description: 'Research the effects of radiation',
            type: 'explore',
            target: 'radiation_exposure',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'injury_research',
            description: 'Research injury treatment',
            type: 'explore',
            target: 'injury_treatment',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'food_research',
            description: 'Research wasteland food sources',
            type: 'collect',
            target: 'wasteland_food',
            current: 0,
            required: 3,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 400 },
          { type: 'gold', value: 300 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'combat_armor') }
        ],
        status: 'available',
        requiredLevel: 2
      }
    ],
    faction: 'megaton',
    isHostile: false
  },

  {
    id: 'colin_moriarty',
    name: 'Colin Moriarty',
    type: 'trader',
    mapId: 'capital_wasteland',
    position: { x: 46 * 32 + 16, y: 49 * 32 + 16 },
    sprite: 'moriarty',
    dialogue: [
      {
        id: 'greeting',
        text: 'Well, well. What have we here? Another lost soul looking for answers in the bottom of a bottle? Or maybe you\'re looking for information?',
        choices: [
          { id: 'information', text: 'I\'m looking for information', nextNode: 'info_price' },
          { id: 'drink', text: 'I could use a drink', nextNode: 'drink_offer' },
          { id: 'father', text: 'I\'m looking for my father', nextNode: 'father_info' }
        ]
      },
      {
        id: 'info_price',
        text: 'Information ain\'t free, kid. But for the right price, I might know something useful.',
        choices: [
          { id: 'pay_100', text: 'Here\'s 100 caps', nextNode: 'info_paid' },
          { id: 'father', text: 'I\'m looking for my father', nextNode: 'father_info' },
          { id: 'leave', text: 'Never mind', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'father_info',
        text: 'Middle-aged guy in a vault suit? Yeah, he was here. Asking about Project Purity and the Jefferson Memorial. Cost him 100 caps for that information.',
        choices: [
          { id: 'project_purity', text: 'What\'s Project Purity?', nextNode: 'purity_info' },
          { id: 'pay_info', text: 'Here\'s 100 caps for more info', nextNode: 'father_details' },
          { id: 'leave', text: 'That\'s all I need', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'purity_info',
        text: 'Some pre-war project to clean up the water. Your dad seemed real interested in it. That\'ll be 50 caps.',
        choices: [
          { id: 'pay_50', text: 'Here\'s 50 caps', nextNode: 'purity_details' },
          { id: 'leave', text: 'I don\'t have the caps', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'father_details',
        text: 'Your old man was asking about Dr. Madison Li at Rivet City. Seems they worked together before the war. He was heading there next.',
        choices: [
          { id: 'rivet_city', text: 'How do I get to Rivet City?', nextNode: 'rivet_directions' },
          { id: 'thanks', text: 'Thanks for the information', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'rivet_directions',
        text: 'Southeast of here, on the Potomac. Big aircraft carrier, can\'t miss it. Watch out for super mutants along the way.',
        choices: [
          { id: 'thanks', text: 'Thanks', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'drink_offer',
        text: 'Beer\'s 10 caps, whiskey\'s 15. What\'ll it be?',
        choices: [
          { id: 'beer', text: 'Beer sounds good', nextNode: 'serve_beer' },
          { id: 'whiskey', text: 'Whiskey', nextNode: 'serve_whiskey' },
          { id: 'nothing', text: 'Actually, nothing', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Come back when you\'ve got caps to spend.',
        choices: []
      }
    ],
    inventory: [
      { ...items.find(i => i.id === 'nuka_cola')!, quantity: 10 },
      { ...items.find(i => i.id === 'purified_water')!, quantity: 5 },
      items.find(i => i.id === 'combat_knife')!
    ],
    faction: 'megaton',
    isHostile: false
  },

  {
    id: 'doc_church',
    name: 'Doc Church',
    type: 'trader',
    mapId: 'capital_wasteland',
    position: { x: 50 * 32 + 16, y: 44 * 32 + 16 },
    sprite: 'doctor',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome to my clinic. I can patch you up or sell you medical supplies. What do you need?',
        choices: [
          { id: 'healing', text: 'I need medical attention', action: 'heal_player' },
          { id: 'trade', text: 'Show me your medical supplies', action: 'open_trade' },
          { id: 'advice', text: 'Any medical advice for the wasteland?', nextNode: 'advice' }
        ]
      },
      {
        id: 'advice',
        text: 'Always carry Stimpaks and Rad-Away. The wasteland is full of radiation and danger. And remember - prevention is better than cure.',
        choices: [
          { id: 'trade', text: 'I\'ll take some supplies', action: 'open_trade' },
          { id: 'thanks', text: 'Thanks for the advice', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Stay healthy out there.',
        choices: []
      }
    ],
    inventory: [
      { ...items.find(i => i.id === 'stimpak')!, quantity: 8 },
      { ...items.find(i => i.id === 'rad_away')!, quantity: 5 },
      { ...items.find(i => i.id === 'mentats')!, quantity: 2 },
      { ...items.find(i => i.id === 'buffout')!, quantity: 2 }
    ],
    faction: 'megaton',
    isHostile: false
  },

  {
    id: 'jericho',
    name: 'Jericho',
    type: 'recruitable',
    mapId: 'capital_wasteland',
    position: { x: 57 * 32 + 16, y: 50 * 32 + 16 },
    sprite: 'jericho',
    dialogue: [
      {
        id: 'greeting',
        text: 'What do you want, vault boy? I ain\'t got time for tourists.',
        choices: [
          { id: 'recruit', text: 'I could use a partner', nextNode: 'recruit_offer' },
          { id: 'info', text: 'Tell me about yourself', nextNode: 'background' },
          { id: 'leave', text: 'Nothing, sorry', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'recruit_offer',
        text: 'You want me to watch your back? I ain\'t cheap. 1000 caps up front, and I get a share of whatever we find.',
        choices: [
          { id: 'accept', text: 'Deal', action: 'recruit_companion' },
          { id: 'expensive', text: 'That\'s pretty expensive', nextNode: 'negotiate' },
          { id: 'decline', text: 'Never mind', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'background',
        text: 'I\'ve been around this wasteland longer than most. Used to run with raiders before I settled down here. Still got the skills, though.',
        choices: [
          { id: 'recruit', text: 'I could use those skills', nextNode: 'recruit_offer' },
          { id: 'leave', text: 'Interesting', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'negotiate',
        text: 'Fine. 500 caps, but I still get my share of the loot. Take it or leave it.',
        choices: [
          { id: 'accept', text: 'Alright, 500 caps', action: 'recruit_companion' },
          { id: 'decline', text: 'I\'ll think about it', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Whatever. I\'ll be here if you change your mind.',
        choices: []
      }
    ],
    faction: 'megaton',
    isHostile: false
  },

  // RIVET CITY NPCs
  {
    id: 'dr_madison_li',
    name: 'Dr. Madison Li',
    type: 'quest_giver',
    mapId: 'capital_wasteland',
    position: { x: 112 * 32 + 16, y: 84 * 32 + 16 },
    sprite: 'scientist',
    dialogue: [
      {
        id: 'greeting',
        text: 'You... you look familiar. Wait, you\'re James\'s child, aren\'t you? I worked with your father on Project Purity before you were born.',
        choices: [
          { id: 'father_location', text: 'Where is my father now?', nextNode: 'father_info' },
          { id: 'project_purity', text: 'Tell me about Project Purity', nextNode: 'project_info' },
          { id: 'past', text: 'You knew my father before the war?', nextNode: 'past_info' }
        ]
      },
      {
        id: 'father_info',
        text: 'James came here a few days ago. He was determined to restart Project Purity at the Jefferson Memorial. I tried to talk him out of it - the place is overrun with super mutants.',
        choices: [
          { id: 'memorial_location', text: 'Where is the Jefferson Memorial?', nextNode: 'memorial_directions' },
          { id: 'why_dangerous', text: 'Why is it so dangerous?', nextNode: 'danger_explanation' },
          { id: 'project_purity', text: 'What exactly is Project Purity?', nextNode: 'project_info' }
        ]
      },
      {
        id: 'project_info',
        text: 'Project Purity was your father\'s dream - a way to purify all the water in the Tidal Basin, providing clean water to the entire wasteland. We were so close to success when...',
        choices: [
          { id: 'what_happened', text: 'What happened?', nextNode: 'project_failure' },
          { id: 'father_location', text: 'Where is my father now?', nextNode: 'father_info' }
        ]
      },
      {
        id: 'project_failure',
        text: 'Super mutants attacked. We lost good people that day. I thought the dream died with them, but James... he never gave up hope.',
        choices: [
          { id: 'help_father', text: 'I want to help my father', nextNode: 'offer_help' },
          { id: 'memorial_location', text: 'How do I get to the Memorial?', nextNode: 'memorial_directions' }
        ]
      },
      {
        id: 'offer_help',
        text: 'If you\'re determined to go, take this. It\'s research data from the original project. James will need it.',
        choices: [
          { id: 'accept_data', text: 'Thank you', action: 'give_quest' },
          { id: 'memorial_location', text: 'How do I get there?', nextNode: 'memorial_directions' }
        ]
      },
      {
        id: 'memorial_directions',
        text: 'The Jefferson Memorial is in the heart of D.C., near the Tidal Basin. Be very careful - super mutants have made it their stronghold.',
        choices: [
          { id: 'thanks', text: 'Thank you for the warning', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Be careful out there. And... bring James home safely.',
        choices: []
      }
    ],
    quests: [
      {
        id: 'scientific_pursuits',
        title: 'Scientific Pursuits',
        description: 'Dr. Li has given you research data to take to your father at the Jefferson Memorial.',
        objectives: [
          {
            id: 'reach_memorial',
            description: 'Travel to the Jefferson Memorial',
            type: 'explore',
            target: 'jefferson_memorial',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'find_james',
            description: 'Find your father James',
            type: 'talk',
            target: 'james',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 400 },
          { type: 'gold', value: 300 }
        ],
        status: 'available',
        requiredLevel: 5
      }
    ],
    faction: 'rivet_city',
    isHostile: false
  },

  {
    id: 'abraham_washington',
    name: 'Abraham Washington',
    type: 'quest_giver',
    mapId: 'capital_wasteland',
    position: { x: 104 * 32 + 16, y: 82 * 32 + 16 },
    sprite: 'historian',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome to Rivet City! I\'m Abraham Washington, head of the Rivet City Historical Society. Are you interested in pre-war American history?',
        choices: [
          { id: 'interested', text: 'Yes, I find history fascinating', nextNode: 'history_enthusiasm' },
          { id: 'not_really', text: 'Not particularly', nextNode: 'disappointed' },
          { id: 'what_do_you_need', text: 'Do you need any help?', nextNode: 'quest_offer' }
        ]
      },
      {
        id: 'history_enthusiasm',
        text: 'Wonderful! A kindred spirit! I\'ve been trying to preserve what\'s left of American history. In fact, I have a special request...',
        choices: [
          { id: 'what_request', text: 'What kind of request?', nextNode: 'quest_offer' }
        ]
      },
      {
        id: 'quest_offer',
        text: 'The Declaration of Independence! It\'s still in the National Archives, but the building is overrun with super mutants. If someone could retrieve it...',
        choices: [
          { id: 'accept_quest', text: 'I\'ll get it for you', action: 'give_quest' },
          { id: 'dangerous', text: 'Sounds dangerous', nextNode: 'danger_acknowledgment' },
          { id: 'decline', text: 'I can\'t help with that', nextNode: 'disappointed' }
        ]
      },
      {
        id: 'danger_acknowledgment',
        text: 'Oh, it absolutely is! But think of the historical significance! I\'d pay handsomely for such a treasure.',
        choices: [
          { id: 'accept_quest', text: 'Alright, I\'ll do it', action: 'give_quest' },
          { id: 'decline', text: 'Sorry, too risky', nextNode: 'disappointed' }
        ]
      },
      {
        id: 'disappointed',
        text: 'I understand. Not everyone appreciates the value of preserving history.',
        choices: [
          { id: 'goodbye', text: 'Maybe another time', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Feel free to browse our historical exhibits anytime!',
        choices: []
      }
    ],
    quests: [
      {
        id: 'stealing_independence',
        title: 'Stealing Independence',
        description: 'Abraham Washington wants you to retrieve the Declaration of Independence from the National Archives.',
        objectives: [
          {
            id: 'reach_archives',
            description: 'Travel to the National Archives',
            type: 'explore',
            target: 'national_archives',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'clear_mutants',
            description: 'Clear super mutants from the Archives',
            type: 'kill',
            target: 'super_mutant',
            current: 0,
            required: 8,
            completed: false
          },
          {
            id: 'find_declaration',
            description: 'Find the Declaration of Independence',
            type: 'collect',
            target: 'declaration_independence',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 450 },
          { type: 'gold', value: 600 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'plasma_rifle') }
        ],
        status: 'available',
        requiredLevel: 8
      }
    ],
    faction: 'rivet_city',
    isHostile: false
  },

  {
    id: 'seagrave_holmes',
    name: 'Seagrave Holmes',
    type: 'trader',
    mapId: 'capital_wasteland',
    position: { x: 104 * 32 + 16, y: 84 * 32 + 16 },
    sprite: 'trader',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome to Rivet City\'s marketplace! I\'ve got the finest goods this side of the Potomac. What can I get for you?',
        choices: [
          { id: 'trade', text: 'Show me what you have', action: 'open_trade' },
          { id: 'info', text: 'Tell me about Rivet City', nextNode: 'city_info' },
          { id: 'leave', text: 'Just looking around', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'city_info',
        text: 'Rivet City\'s the safest place in the wasteland. Built in an old aircraft carrier, well-defended, and we\'ve got the best scientists around.',
        choices: [
          { id: 'trade', text: 'Sounds impressive. Let\'s trade', action: 'open_trade' },
          { id: 'leave', text: 'Good to know', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Come back anytime! Rivet City\'s always open for business.',
        choices: []
      }
    ],
    inventory: [
      items.find(i => i.id === 'assault_rifle')!,
      items.find(i => i.id === 'combat_armor')!,
      { ...items.find(i => i.id === 'stimpak')!, quantity: 6 },
      { ...items.find(i => i.id === 'rad_away')!, quantity: 4 },
      { ...items.find(i => i.id === 'scrap_metal')!, quantity: 12 },
      { ...items.find(i => i.id === 'electronics')!, quantity: 5 }
    ],
    faction: 'rivet_city',
    isHostile: false
  },

  // BROTHERHOOD OF STEEL NPCs
  {
    id: 'elder_lyons',
    name: 'Elder Owyn Lyons',
    type: 'quest_giver',
    mapId: 'capital_wasteland',
    position: { x: 128 * 32 + 16, y: 37 * 32 + 16 },
    sprite: 'elder_lyons',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome to the Citadel, outsider. I am Elder Lyons of the Brotherhood of Steel. What brings you to our stronghold?',
        choices: [
          { id: 'father_help', text: 'I need help finding my father', nextNode: 'father_assistance' },
          { id: 'join_brotherhood', text: 'I want to join the Brotherhood', nextNode: 'recruitment' },
          { id: 'about_brotherhood', text: 'Tell me about the Brotherhood', nextNode: 'brotherhood_info' }
        ]
      },
      {
        id: 'father_assistance',
        text: 'Your father... James, isn\'t it? He came to us seeking help with Project Purity. A noble goal, but the Jefferson Memorial is heavily fortified by super mutants.',
        choices: [
          { id: 'offer_help', text: 'I want to help clear it out', nextNode: 'mission_offer' },
          { id: 'project_purity', text: 'What do you know about Project Purity?', nextNode: 'purity_knowledge' }
        ]
      },
      {
        id: 'mission_offer',
        text: 'Admirable. If you can prove yourself worthy, the Brotherhood might assist you. But first, you must demonstrate your commitment to our cause.',
        choices: [
          { id: 'accept_trial', text: 'What do I need to do?', action: 'give_quest' },
          { id: 'what_cause', text: 'What is your cause?', nextNode: 'brotherhood_mission' }
        ]
      },
      {
        id: 'brotherhood_info',
        text: 'We are the Brotherhood of Steel, dedicated to preserving technology and protecting the innocent from the dangers of the wasteland.',
        choices: [
          { id: 'join_brotherhood', text: 'I want to help', nextNode: 'recruitment' },
          { id: 'father_help', text: 'I\'m looking for my father', nextNode: 'father_assistance' }
        ]
      },
      {
        id: 'recruitment',
        text: 'The Brotherhood does not accept outsiders lightly. You must prove your worth through action, not words.',
        choices: [
          { id: 'prove_worth', text: 'How can I prove myself?', nextNode: 'mission_offer' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Ad Victoriam, citizen. May your path be righteous.',
        choices: []
      }
    ],
    quests: [
      {
        id: 'brotherhood_trial',
        title: 'The Brotherhood\'s Trial',
        description: 'Elder Lyons wants you to prove your worth by eliminating super mutant threats in the D.C. area.',
        objectives: [
          {
            id: 'eliminate_mutants',
            description: 'Eliminate super mutant threats',
            type: 'kill',
            target: 'super_mutant',
            current: 0,
            required: 15,
            completed: false
          },
          {
            id: 'report_back',
            description: 'Report back to Elder Lyons',
            type: 'talk',
            target: 'elder_lyons',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 500 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'brotherhood_armor') },
          { type: 'item', value: 1, item: items.find(i => i.id === 'laser_rifle') }
        ],
        status: 'available',
        requiredLevel: 8
      }
    ],
    faction: 'brotherhood_of_steel',
    isHostile: false
  },

  {
    id: 'sentinel_lyons',
    name: 'Sentinel Sarah Lyons',
    type: 'recruitable',
    mapId: 'capital_wasteland',
    position: { x: 124 * 32 + 16, y: 39 * 32 + 16 },
    sprite: 'sentinel_lyons',
    dialogue: [
      {
        id: 'greeting',
        text: 'You\'re the vault dweller everyone\'s talking about. I\'m Sentinel Sarah Lyons, leader of Lyons\' Pride. You\'ve got guts coming here.',
        choices: [
          { id: 'lyons_pride', text: 'Tell me about Lyons\' Pride', nextNode: 'pride_info' },
          { id: 'recruit', text: 'I could use a skilled soldier', nextNode: 'recruitment_consideration' },
          { id: 'respect', text: 'I\'ve heard about your reputation', nextNode: 'reputation_response' }
        ]
      },
      {
        id: 'pride_info',
        text: 'Lyons\' Pride is an elite unit of the Brotherhood. We handle the most dangerous missions in the Capital Wasteland. Super mutants, Enclave, you name it.',
        choices: [
          { id: 'recruit', text: 'I could use someone like you', nextNode: 'recruitment_consideration' },
          { id: 'missions', text: 'What kind of missions?', nextNode: 'mission_details' }
        ]
      },
      {
        id: 'recruitment_consideration',
        text: 'You want me to leave my unit? That\'s... unexpected. I\'d need Elder Lyons\' permission, and you\'d have to prove you\'re worthy of a Brotherhood soldier.',
        choices: [
          { id: 'prove_worthy', text: 'How do I prove myself?', nextNode: 'worthiness_test' },
          { id: 'understand', text: 'I understand', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'worthiness_test',
        text: 'Complete the trial my father sets for you. Show the Brotherhood you\'re committed to our cause. Then we\'ll talk.',
        choices: [
          { id: 'accept', text: 'I\'ll prove myself', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Stay sharp out there, vault dweller. The wasteland doesn\'t forgive mistakes.',
        choices: []
      }
    ],
    faction: 'brotherhood_of_steel',
    isHostile: false
  },

  {
    id: 'scribe_rothchild',
    name: 'Scribe Rothchild',
    type: 'trader',
    mapId: 'capital_wasteland',
    position: { x: 132 * 32 + 16, y: 34 * 32 + 16 },
    sprite: 'scribe',
    dialogue: [
      {
        id: 'greeting',
        text: 'Ah, a visitor to our archives. I am Scribe Rothchild, keeper of the Brotherhood\'s technological knowledge. How may I assist you?',
        choices: [
          { id: 'technology', text: 'I\'m interested in technology', nextNode: 'tech_discussion' },
          { id: 'trade', text: 'Do you have any equipment for trade?', action: 'open_trade' },
          { id: 'archives', text: 'Tell me about these archives', nextNode: 'archives_info' }
        ]
      },
      {
        id: 'tech_discussion',
        text: 'Excellent! The Brotherhood exists to preserve and protect technology from those who would misuse it. We have quite a collection here.',
        choices: [
          { id: 'trade', text: 'Could I see some of it?', action: 'open_trade' },
          { id: 'mission', text: 'How does the Brotherhood use technology?', nextNode: 'brotherhood_mission' }
        ]
      },
      {
        id: 'archives_info',
        text: 'These archives contain centuries of technological knowledge. Pre-war science, engineering blueprints, weapon schematics - all carefully preserved.',
        choices: [
          { id: 'trade', text: 'Impressive. Do you trade any technology?', action: 'open_trade' },
          { id: 'goodbye', text: 'Fascinating', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Knowledge is power. Use it wisely.',
        choices: []
      }
    ],
    inventory: [
      items.find(i => i.id === 'laser_rifle')!,
      items.find(i => i.id === 'plasma_rifle')!,
      items.find(i => i.id === 'brotherhood_armor')!,
      { ...items.find(i => i.id === 'electronics')!, quantity: 10 },
      { ...items.find(i => i.id === 'rare_earth')!, quantity: 3 }
    ],
    faction: 'brotherhood_of_steel',
    isHostile: false
  },

  // GALAXY NEWS RADIO NPCs
  {
    id: 'three_dog',
    name: 'Three Dog',
    type: 'quest_giver',
    mapId: 'capital_wasteland',
    position: { x: 74 * 32 + 16, y: 52 * 32 + 16 },
    sprite: 'three_dog',
    dialogue: [
      {
        id: 'greeting',
        text: 'Well, well, well! If it isn\'t the famous vault dweller! Three Dog here, and you\'re listening to Galaxy News Radio. What brings you to my humble radio station?',
        choices: [
          { id: 'father_search', text: 'I\'m looking for my father', nextNode: 'father_info' },
          { id: 'about_radio', text: 'Tell me about your radio station', nextNode: 'radio_info' },
          { id: 'news', text: 'What\'s the news in the wasteland?', nextNode: 'wasteland_news' }
        ]
      },
      {
        id: 'father_info',
        text: 'Your old man? Yeah, I know about him. James, right? Word is he\'s trying to get that old water purifier working again. But here\'s the thing - I scratch your back, you scratch mine.',
        choices: [
          { id: 'what_want', text: 'What do you want?', nextNode: 'favor_request' },
          { id: 'just_tell_me', text: 'Just tell me where he is', nextNode: 'information_price' }
        ]
      },
      {
        id: 'favor_request',
        text: 'My radio signal doesn\'t reach as far as it should. There\'s a relay dish that needs fixing. Do that for me, and I\'ll tell you everything I know about your father.',
        choices: [
          { id: 'accept_quest', text: 'Alright, I\'ll fix your dish', action: 'give_quest' },
          { id: 'refuse', text: 'I don\'t have time for that', nextNode: 'information_price' }
        ]
      },
      {
        id: 'information_price',
        text: 'Look, kid, information is my business. I help you, you help me. That\'s how it works in the wasteland. No free rides.',
        choices: [
          { id: 'accept_quest', text: 'Fine, I\'ll help with the dish', action: 'give_quest' },
          { id: 'leave', text: 'I\'ll find another way', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'radio_info',
        text: 'Galaxy News Radio - bringing truth, justice, and the American way to the Capital Wasteland! I keep folks informed about what\'s really going on out there.',
        choices: [
          { id: 'father_search', text: 'Speaking of information, I\'m looking for my father', nextNode: 'father_info' },
          { id: 'news', text: 'What kind of news?', nextNode: 'wasteland_news' }
        ]
      },
      {
        id: 'wasteland_news',
        text: 'Super mutant movements, raider activity, safe trading routes - you name it. Knowledge is power, and power keeps people alive.',
        choices: [
          { id: 'father_search', text: 'I need information about my father', nextNode: 'father_info' },
          { id: 'goodbye', text: 'Keep up the good work', nextNode: 'goodbye' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Keep fighting the good fight, and remember - this is Three Dog, and you\'re listening to Galaxy News Radio!',
        choices: []
      }
    ],
    quests: [
      {
        id: 'galaxy_news_radio',
        title: 'Galaxy News Radio',
        description: 'Three Dog wants you to fix the radio relay dish to boost GNR\'s signal range.',
        objectives: [
          {
            id: 'reach_relay',
            description: 'Travel to the radio relay tower',
            type: 'explore',
            target: 'radio_relay',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'clear_mutants',
            description: 'Clear super mutants from the tower',
            type: 'kill',
            target: 'super_mutant',
            current: 0,
            required: 5,
            completed: false
          },
          {
            id: 'fix_dish',
            description: 'Repair the radio dish',
            type: 'explore',
            target: 'dish_repair',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 300 },
          { type: 'gold', value: 200 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'combat_armor') }
        ],
        status: 'available',
        requiredLevel: 4
      }
    ],
    faction: 'gnr',
    isHostile: false
  },

  // CANTERBURY COMMONS NPCs
  {
    id: 'uncle_roe',
    name: 'Uncle Roe',
    type: 'trader',
    mapId: 'capital_wasteland',
    position: { x: 34 * 32 + 16, y: 102 * 32 + 16 },
    sprite: 'uncle_roe',
    dialogue: [
      {
        id: 'greeting',
        text: 'Welcome to Canterbury Commons, traveler! I\'m Uncle Roe, and this here\'s the hub of wasteland commerce. What can I do for you?',
        choices: [
          { id: 'trade', text: 'I\'d like to see your goods', action: 'open_trade' },
          { id: 'town_problem', text: 'I heard you have some problems here', nextNode: 'superhero_problem' },
          { id: 'caravan_info', text: 'Tell me about the caravans', nextNode: 'caravan_details' }
        ]
      },
      {
        id: 'superhero_problem',
        text: 'Oh, you heard about our... situation. We\'ve got two costumed lunatics fighting each other, and we\'re caught in the middle. The AntAgonizer and the Mechanist.',
        choices: [
          { id: 'help_offer', text: 'Maybe I can help', nextNode: 'help_request' },
          { id: 'more_info', text: 'Tell me more about them', nextNode: 'superhero_details' }
        ]
      },
      {
        id: 'help_request',
        text: 'Would you? That\'d be a godsend! If you can end this conflict, I\'ll make it worth your while. The whole town would be grateful.',
        choices: [
          { id: 'accept_help', text: 'I\'ll see what I can do', action: 'give_quest' },
          { id: 'more_info', text: 'First, tell me about these characters', nextNode: 'superhero_details' }
        ]
      },
      {
        id: 'superhero_details',
        text: 'The AntAgonizer controls giant ants, lives in some kind of lair. The Mechanist has robots. They keep fighting, and we keep getting caught in the crossfire.',
        choices: [
          { id: 'accept_help', text: 'I\'ll put a stop to this', action: 'give_quest' },
          { id: 'trade', text: 'Let me think about it. Can I see your goods?', action: 'open_trade' }
        ]
      },
      {
        id: 'caravan_details',
        text: 'Canterbury Commons is the center of the wasteland trade network. Caravans from all over stop here to rest and resupply.',
        choices: [
          { id: 'trade', text: 'Speaking of supplies...', action: 'open_trade' },
          { id: 'town_problem', text: 'What about this superhero problem?', nextNode: 'superhero_problem' }
        ]
      },
      {
        id: 'goodbye',
        text: 'Safe travels, and remember - Canterbury Commons is always open for business!',
        choices: []
      }
    ],
    inventory: [
      items.find(i => i.id === 'assault_rifle')!,
      items.find(i => i.id === 'combat_armor')!,
      { ...items.find(i => i.id === 'stimpak')!, quantity: 8 },
      { ...items.find(i => i.id === 'rad_away')!, quantity: 5 },
      { ...items.find(i => i.id === 'scrap_metal')!, quantity: 15 },
      { ...items.find(i => i.id === 'purified_water')!, quantity: 10 }
    ],
    quests: [
      {
        id: 'the_superhuman_gambit',
        title: 'The Superhuman Gambit',
        description: 'Canterbury Commons is caught between two costumed characters. End their conflict.',
        objectives: [
          {
            id: 'investigate_antagonizer',
            description: 'Investigate the AntAgonizer',
            type: 'explore',
            target: 'antagonizer_lair',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'investigate_mechanist',
            description: 'Investigate the Mechanist',
            type: 'explore',
            target: 'mechanist_lair',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'resolve_conflict',
            description: 'End the conflict between the two',
            type: 'talk',
            target: 'superhero_resolution',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'experience', value: 350 },
          { type: 'gold', value: 400 },
          { type: 'item', value: 1, item: items.find(i => i.id === 'power_armor') }
        ],
        status: 'available',
        requiredLevel: 6
      }
    ],
    faction: 'canterbury_commons',
    isHostile: false
  }
];