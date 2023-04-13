import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

const WELCOME_COMMAND = {
  name: 'welcome',
  description: 'Glyph will tell you everything he can do',
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
  description: `Perform a ${action} action to earn currency.`,
  type: 1,
}));

const CURRENCY_COMMAND = {
  name: 'currency',
  description: 'Check your current currency balance.',
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
        { name: 'Coal', value: 'Coal' },
        { name: 'Iron', value: 'Iron' },
        { name: 'Gold', value: 'Gold' },
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
  ROLL_COMMAND,
  ...ACTION_COMMANDS,
  CURRENCY_COMMAND,
  SHOP_COMMAND,
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);