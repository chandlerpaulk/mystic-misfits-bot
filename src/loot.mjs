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

// Create monsters array
export const monsters = [
  { name: 'Slime', health: 15, chance: 0.4 },
  { name: 'Goblin', health: 25, chance: 0.3 },
  { name: 'Ogre', health: 50, chance: 0.2 },
  { name: 'Dragon', health: 100, chance: 0.1 },
];

// Define items found in the user's shop
export const shopItems = [
  { name: 'Sword', type: 'weapon', cost: 100 },
  { name: 'Axe', type: 'weapon', cost: 150 },
  { name: 'Bow', type: 'weapon', cost: 200 },
];