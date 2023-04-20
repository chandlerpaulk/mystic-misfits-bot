// Define possible resources for each action
export const actions = {
  fish: [
    { name: 'missed action', tier: 'Missed', chance: 0.15, min: 1, max: 1, value: 0},
    { name: 'salmon', tier: 'Common', chance: 0.40, min: 1, max: 3, value: 10 },
    { name: 'tuna', tier: 'Uncommon', chance: 0.25, min: 1, max: 2, value: 15 },
    { name: 'swordfish', tier: 'Rare', chance: 0.10, min: 1, max: 1, value: 25 },
    { name: 'shark', tier: 'Epic', chance: 0.05, min: 1, max: 1, value: 50 },
    { name: 'giant squid', tier: 'Legendary', chance: 0.04, min: 1, max: 1, value: 100 },
    { name: 'kraken', tier: 'Mythic', chance: 0.01, min: 1, max: 1, value: 200 },
  ],
  mine: [
    { name: 'missed action', tier: 'Missed', chance: 0.15, min:1, max:1, value: 0},
    { name: 'stone', tier: 'Common', chance: 0.2, min: 1, max: 3, value: 5 },
    { name: 'copper', tier: 'Uncommon', chance: 0.2, min: 1, max: 3, value: 7 },
    { name: 'iron', tier: 'Uncommon', chance: 0.125, min: 1, max: 2, value: 10 },
    { name: 'silver', tier: 'Uncommon', chance: 0.125, min: 1, max: 2, value: 12 },
    { name: 'gold', tier: 'Rare', chance: 0.05, min: 1, max: 1, value: 20 },
    { name: 'platinum', tier: 'Rare', chance: 0.05, min: 1, max: 1, value: 22 },
    { name: 'diamond', tier: 'Epic', chance: 0.025, min: 1, max: 1, value: 100 },
    { name: 'ruby', tier: 'Epic', chance: 0.025, min: 1, max: 1, value: 110 },
    { name: 'emerald', tier: 'Legendary', chance: 0.02, min: 1, max: 1, value: 200 },
    { name: 'sapphire', tier: 'Legendary', chance: 0.02, min: 1, max: 1, value: 210 },
    { name: 'magic crystal', tier: 'Mythic', chance: 0.005, min: 1, max: 1, value: 400 },
    { name: 'arcane gem', tier: 'Mythic', chance: 0.005, min: 1, max: 1, value: 420 },
  ],
  chop: [
    { name: 'missed action', tier: 'Missed', chance: 0.15, min:1, max:1, value: 0},
    { name: 'oak', tier: 'Common', chance: 0.40, min: 1, max: 5, value: 5 },
    { name: 'birch', tier: 'Uncommon', chance: 0.25, min: 1, max: 5, value: 10 },
    { name: 'maple', tier: 'Rare', chance: 0.10, min: 1, max: 5, value: 15 },
    { name: 'mahogany', tier: 'Epic', chance: 0.05, min: 1, max: 5, value: 25 },
    { name: 'ancient oak', tier: 'Legendary', chance: 0.04, min: 1, max: 5, value: 50 },
    { name: 'enchanted tree', tier: 'Mythic', chance: 0.01, min: 1, max: 5, value: 100 },
  ],
};

// Create creatures array
export const creatures = [
  {
    name: 'forest floor',
    health: 0,
    chance: 0.5,
    imageUrl: 'https://mystic-misfits-bot.onrender.com/img/forest.png',
    loot: [
      { name: 'missed action', tier: 'Missed', chance: 0, min: 1, max: 1, value: 0 },
      { name: 'stick', tier: 'Common', chance: 0, min: 0, max: 0, value: 0.25 },
      { name: 'stone', tier: 'Common', chance: 0, min: 0, max: 0, value: 5 },
      { name: 'mushroom', tier: 'Uncommon', chance: 0, min: 0, max: 0, value: 6 },
      { name: 'berry', tier: 'Uncommon', chance: 0, min: 0, max: 0, value: 10 },
      { name: 'herb', tier: 'Uncommon', chance: 0, min: 0, max: 0, value: 10 },
      { name: 'worm', tier: 'Uncommon', chance: 0, min: 0, max: 0, value: 0.10}
    ]
  },
  {
    name: 'Goblin',
    health: 10,
    chance: 0.4,
    imageUrl: 'https://mystic-misfits-bot.onrender.com/img/goblin.png',
    loot: [
      { name: 'Rusty Sword', chance: 0.5, min: 1, max: 2 },
      { name: 'Goblin Tooth', chance: 0.3, min: 1, max: 4 },
      { name: 'Goblin Armour', chance: 0.2, min: 1, max: 1 },
    ],
  },
  {
    name: 'Deer',
    health: 8,
    chance: 0.06,
    imageUrl: 'https://mystic-misfits-bot.onrender.com/img/deer.png',
    loot: [
      { name: 'Deer Antler', chance: 0.4, min: 1, max: 2 },
      { name: 'Deer Hide', chance: 0.5, min: 1, max: 4 },
      { name: 'Deer Meat', chance: 0.1, min: 1, max: 3 },
    ],
  },
  {
    name: 'Grouse',
    health: 5,
    chance: 0.05,
    imageUrl: 'https://mystic-misfits-bot.onrender.com/img/grouse.png',
    loot: [
      { name: 'Grouse Feather', chance: 0.6, min: 1, max: 3 },
      { name: 'Grouse Meat', chance: 0.4, min: 1, max: 2 },
    ],
  },
  {
    name: 'Fox',
    health: 7,
    chance: 0.05,
    imageUrl: 'https://mystic-misfits-bot.onrender.com/img/fox.png',
    loot: [
      { name: 'Fox Pelt', chance: 0.5, min: 1, max: 2 },
      { name: 'Fox Tail', chance: 0.4, min: 1, max: 1 },
      { name: 'Fox Meat', chance: 0.1, min: 1, max: 2 },
    ],
  },
  {
    name: 'Raccoon',
    health: 6,
    chance: 0.04,
    imageUrl: 'https://mystic-misfits-bot.onrender.com/img/raccoon.png',
    loot: [
      { name: 'Raccoon Pelt', chance: 0.5, min: 1, max: 2 },
      { name: 'Raccoon Tail', chance: 0.4, min: 1, max: 1 },
      { name: 'Raccoon Meat', chance: 0.1, min: 1, max: 2 },
    ],
  },
  {
    name: 'Bear',
    health: 25,
    chance: 0.03,
    imageUrl: 'https://mystic-misfits-bot.onrender.com/img/bear.png',
    loot: [
      { name: 'Bear Pelt', chance: 0.5, min: 1, max: 1 },
      { name: 'Bear Claw', chance: 0.3, min: 1, max: 2 },
      { name: 'Bear Meat', chance: 0.2, min: 1, max: 4 },
    ],
  },
  {
    name: 'Rabbit',
    health: 3,
    chance: 0.20,
    imageUrl: 'https://mystic-misfits-bot.onrender.com/img/rabbit.png',
    loot: [
      { name: 'Rabbit Pelt', chance: 0.6, min: 1, max: 2 },
      { name: 'Rabbit Foot', chance: 0.3, min: 1, max: 1 },
      { name: 'Rabbit Meat', chance: 0.1, min: 1, max: 2 },
    ],
  },
  {
    name: 'Squirrel',
    health: 2,
    chance: 0.15,
    imageUrl: 'https://mystic-misfits-bot.onrender.com/img/squirrel.png',
    loot: [
      { name: 'Squirrel Pelt', chance: 0.5, min: 1, max: 1 },
      { name: 'Squirrel Tail', chance: 0.4, min: 1, max: 1 },
      { name: 'Squirrel Meat', chance: 0.1, min: 1, max: 1 },
    ],
  },
  {
    name: 'Boar',
    health: 15,
    chance: 0.02,
    imageUrl: 'https://mystic-misfits-bot.onrender.com/img/boar.png',
    loot: [
      { name: 'Boar Tusk', chance: 0.4, min: 1, max: 2 },
      { name: 'Boar Hide', chance: 0.4, min: 1, max: 1 },
      { name: 'Boar Meat', chance: 0.2, min: 1, max: 3 },
    ],
  },
  {
    name: 'Wolf',
    health: 20,
    chance: 0.3,
    imageUrl: 'https://mystic-misfits-bot.onrender.com/img/wolf.png',
    loot: [
      { name: 'Wolf Pelt', chance: 0.6, min: 1, max: 3 },
      { name: 'Wolf Fang', chance: 0.3, min: 1, max: 2 },
      { name: 'Wolf Claw', chance: 0.1, min: 1, max: 3 },
    ],
  },
  {
    name: 'Ancient Rune',
    health: 50,
    chance: 0.001,
    imageUrl: 'https://mystic-misfits-bot.onrender.com/img/ancient-rune.png',
    loot: [
      { name: 'Dragon Scale', chance: 0.4, min: 1, max: 3 },
      { name: 'Dragon Bone', chance: 0.3, min: 1, max: 2 },
      { name: 'Dragon Tooth', chance: 0.2, min: 1, max: 2 },
      { name: 'Dragon Egg', chance: 0.1, min: 1, max: 1 },
    ],
  },
  {
    name: 'False Rune',
    health: 50,
    chance: 0.01,
    imageUrl: 'https://mystic-misfits-bot.onrender.com/img/false-rune.png',
    loot: [
      { name: 'False Rune'}
    ]
  },
  {
    name: 'Giant Spider',
    health: 30,
    chance: 0.019,
    imageUrl: 'https://mystic-misfits-bot.onrender.com/img/giant-spider.png',
    loot: [
      { name: 'Spider Silk', chance: 0.5, min: 1, max: 3 },
      { name: 'Spider Leg', chance: 0.4, min: 1, max: 2 },
      { name: 'Spider Venom', chance: 0.1, min: 1, max: 3 },
    ],
  },
];

// Define items found in the user's shop
export const shopItems = [
  { name: 'Sword', type: 'weapon', cost: 100 },
  { name: 'Axe', type: 'weapon', cost: 150 },
  { name: 'Bow', type: 'weapon', cost: 200 },
];