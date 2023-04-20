import 'dotenv/config';
import { InstallGlobalCommands } from './utils.mjs';

const WELCOME_COMMAND = {
  name: 'welcome',
  description: 'Your Glyph will tell you hello',
  type: 1,
};

const ROLL_COMMAND = {
  name: 'roll',
  description: 'Roll a dice using NdS format (e.g. 3d6)',
  options: [
    {
      name: 'dice',
      type: 3, // Type 3 means it takes a string
      description: 'Dice notation, for example: 3d6',
      required: true,
    }
  ],
};

const ACTIONS = ['fish', 'mine', 'chop'];

const ACTION_COMMANDS = ACTIONS.map((action) => ({
  name: action,
  description: `Perform a ${action} action to obtain resources.`,
  type: 1,
}));

const HUNT_COMMAND = {
  name: 'hunt',
  description: 'Go on a hunt to obtain resources.',
  type: 1,
};

const INVENTORY_COMMAND = {
  name: 'inventory',
  description: 'Check your current current inventory.',
  type: 1,
};

const SHOP_COMMAND = {
  name: 'shop',
  description: 'Interact with the shop to buy weapons or sell resources',
  options: [
    {
      name: 'action',
      description: 'The action you want to perform (buy/sell)',
      type: 3, // String
      required: true,
      choices: [
        { name: 'Buy', value: 'buy' },
        { name: 'Sell', value: 'sell' },
      ],
    },
    {
      name: 'item',
      description: 'The item you want to buy',
      type: 3, // String
      required: false,
      choices: [
        { name: 'Sword', value: 'Sword' },
        { name: 'Axe', value: 'Axe' },
        { name: 'Bow', value: 'Bow' },
      ],
    },
    {
      name: 'resource',
      description: 'The resource you want to sell',
      type: 3, // String
      required: false,
      choices: [
        { name: 'salmon', tier: 'Common', value: 'salmon' },
        { name: 'tuna', tier: 'Uncommon', value: 'tuna' },
        { name: 'swordfish', tier: 'Rare', value: 'swordfish' },
        { name: 'shark', tier: 'Epic', value: 'shark' },
        { name: 'giant squid', tier: 'Legendary', value: 'giant squid' },
        { name: 'kraken', tier: 'Mythic', value: 'kraken' },
        { name: 'stone', tier: 'Common', value: 'stone' },
        { name: 'copper', tier: 'Common', value: 'copper' },
        { name: 'iron', tier: 'Uncommon', value: 'iron' },
        { name: 'silver', tier: 'Uncommon', value: 'silver' },
        { name: 'gold', tier: 'Rare', value: 'gold' },
        { name: 'platinum', tier: 'Rare', value: 'platinum' },
        { name: 'diamond', tier: 'Epic', value: 'diamond' },
        { name: 'ruby', tier: 'Epic', value: 'ruby' },
        { name: 'emerald', tier: 'Legendary', value: 'emerald' },
        { name: 'sapphire', tier: 'Legendary', value: 'sapphire' },
        { name: 'magic crystal', tier: 'Mythic', value: 'magic crystal' },
        { name: 'arcane gem', tier: 'Mythic', value: 'arcane gem' },
        { name: 'oak', tier: 'Common', value: 'oak' },
        { name: 'birch', tier: 'Uncommon', value: 'birch' },
        { name: 'maple', tier: 'Rare', value: 'maple' },
        { name: 'mahogany', tier: 'Epic', value: 'mahogany' },
        { name: 'ancient oak', tier: 'Legendary', value: 'ancient oak' },
        { name: 'enchanted tree', tier: 'Mythic', value: 'enchanted tree' },
      ],
    },
    {
      name: 'amount',
      description: 'The amount of the resource you want to sell',
      type: 4, // integer
      required: false,
    },
  ],
};

const ALL_COMMANDS = [
  WELCOME_COMMAND,
  HUNT_COMMAND,
  ROLL_COMMAND,
  ...ACTION_COMMANDS,
  INVENTORY_COMMAND,
  SHOP_COMMAND,
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);