import 'dotenv/config';
import './commands.mjs'
import UserModel from './database.mjs';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
} from 'discord-interactions';
import { VerifyDiscordRequest, DiscordRequest } from './utils.mjs';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Mock implementation of the user's currency storage
// const userInventory = {};

const shopItems = [
  { name: 'Sword', type: 'weapon', cost: 100 },
  { name: 'Axe', type: 'weapon', cost: 150 },
  { name: 'Bow', type: 'weapon', cost: 200 },
];

app.post('/interactions', async function (req, res) {
  try {
    const { type, id, data } = req.body;

    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;
      const user = req.body.member?.user ?? req.body.user;

      console.log('Data:', data);

      // Define possible resources for each action
      const actions = {
        fish: [
          { name: 'salmon', chance: 0.5, min: 1, max: 3 },
          { name: 'tuna', chance: 0.3, min: 1, max: 2 },
          { name: 'swordfish', chance: 0.1, min: 1, max: 1 },
          { name: 'shark', chance: 0.1, min: 1, max: 1 },
        ],
        mine: [
          { name: 'coal', chance: 0.5, min: 1, max: 3 },
          { name: 'iron', chance: 0.3, min: 1, max: 2 },
          { name: 'gold', chance: 0.1, min: 1, max: 1 },
          { name: 'diamond', chance: 0.05, min: 1, max: 1 },
        ],
        chop: [
          { name: 'oak', chance: 0.5, min: 1, max: 5 },
          { name: 'birch', chance: 0.4, min: 1, max: 5 },
        ],
      };

      // "mine", "chop", and "fish" commands
      if (Object.keys(actions).includes(name)) {
        // Get the user's nickname or fallback to the username if the nickname is not set
        const displayName = req.body.member ? (req.body.member.nick || user.username) : user.username;

        // Find the resource type and amount for the action
        const actionResources = actions[name];
        let randomValue = Math.random();
        let selectedResource;
        for (const resource of actionResources) {
          if (randomValue < resource.chance) {
            selectedResource = resource;
            break;
          }
          randomValue -= resource.chance;
        }

        const amount = Math.floor(Math.random() * (selectedResource.max - selectedResource.min + 1)) + selectedResource.min;

        // Store the resource for the user
        const userId = user.id;

        // Find or create a user in the database
        const userDoc = await UserModel.findOneAndUpdate(
          { userId },
          { $inc: { [`inventory.items.${selectedResource.name}`]: amount } },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Send a message with the resource and amount earned
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `**${displayName}** performed a **${name}** action and obtained **${amount} ${selectedResource.name}**.`,
          },
        });
      }

      // "welcome" command
      if (name === 'welcome') {

        // Get the user's nickname or fallback to the username if the nickname is not set
        const displayName = req.body.member ? (req.body.member.nick || user.username) : user.username;

        // Send a message into the channel where command was triggered from
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Hello, ${displayName}! Welcome to the server!`,
          },
        });
      }

      // "inventory" command
      if (name === 'inventory') {
        const userId = user.id;

        try {
          const userRecord = await UserModel.findOne({ userId: userId });
          const inventory = userRecord ? userRecord.inventory : {};

          // Create an inventory display string
          let inventoryDisplay = '';
          for (const [item, amount] of Object.entries(inventory.items || {})) {
            inventoryDisplay += `**${item}**: ${amount}\n`;
          }

          // If inventory is empty, display a message
          if (!inventoryDisplay) {
            inventoryDisplay = 'Your inventory is empty.';
          }

          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Your inventory:\n${inventoryDisplay}`,
              flags: 64, // Make the message ephemeral (Private only to the user themselves)
            },
          });
        } catch (err) {
          console.error('Error fetching user inventory:', err);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `An error occurred while fetching your inventory. Please try again later.`,
              flags: 64, // Make the message ephemeral
            },
          });
        }
      }

      //"roll" command
      if (name === 'roll') {
        const { options } = data;
        const dice = options.find(option => option.name === 'dice').value;

        // Calculate the result of the dice roll
        const result = dice.split('d').reduce((prev, curr) => {
          const rolls = parseInt(prev);
          const sides = parseInt(curr);
          return Array.from({ length: rolls }, () => Math.floor(Math.random() * sides) + 1).reduce((a, b) => a + b);
        });

        // Send a message with the result of the dice roll
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `You rolled ${dice} and got ${result}.`,
          },
        });
      }

      // "shop" command
      if (name === 'shop') {
        const action = data.options?.find(option => option.name === 'action')?.value;

        // Get the user's inventory or initialize it
        const userId = user.id;

        try {
          const userRecord = await UserModel.findOne({ userId: userId });
          const inventory = userRecord ? userRecord.inventory : {};

          if (action === 'buy') {
            const item = data.options.find(option => option.name === 'item')?.value;

            const shopItem = shopItems.find(shopItem => shopItem.name === item);
            if (!shopItem) {
              return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: `**${item}** is not available in the shop.`,
                  flags: 64, // Make the message ephemeral
                },
              });
            }

            if (inventory.currency >= shopItem.cost) {
              await UserModel.findOneAndUpdate(
                { userId },
                {
                  $inc: {
                    'inventory.currency': -shopItem.cost,
                    [`inventory.items.${item}`]: 1
                  },
                }
              );

              return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: `You have successfully purchased **${item}** for **${shopItem.cost}** currency.`,
                  flags: 64, // Make the message ephemeral
                },
              });
            } else {
              return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: `You do not have enough currency to purchase **${item}**.`,
                  flags: 64, // Make the message ephemeral
                },
              });
            }
          } else if (action === 'sell') {
            const resource = data.options.find(option => option.name === 'resource')?.value;
            const amount = data.options.find(option => option.name === 'amount')?.value;

            if (!inventory.items[resource] || inventory.items[resource] < amount) {
              return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: `You do not have enough **${resource}** to sell.`,
                  flags: 64, // Make the message ephemeral
                },
              });
            }

            const resourceInfo = actions[name]?.find(r => r.name === resource);
            const value = resourceInfo.value * amount;

            await UserModel.findOneAndUpdate(
              { userId },
              {
                $inc: {
                  'inventory.currency': value,
                  [`inventory.items.${resource}`]: -amount,
                },
              }
            );

            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `You have successfully sold **${amount} ${resource}** for **${value}** currency.`,
                flags: 64, // Make the message ephemeral
              },
            });
          } else {
            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `Welcome to the shop! Use the following command options to buy or sell items:\n` +
                  `• \`/shop action:buy item:Sword\` - Buy a Sword for 100 currency\n` +
                  `• \`/shop action:buy item:Axe\` - Buy an Axe for 150 currency\n` +
                  `• \`/shop action:buy item:Bow\` - Buy a Bow for 200 currency\n` +
                  `• \`/shop action:sell resource:Coal amount:1\` - Sell 1 Coal resource\n` +
                  `• \`/shop action:sell resource:Iron amount:1\` - Sell 1 Iron resource`,
                flags: 64, // Make the message ephemeral
              },
            });
          }
        } catch (err) {
          console.error('Error in shop command:', err);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `An error occurred while processing your request. Please try again later.`,
              flags: 64, // Make the message ephemeral
            },
          });
        }
      }
    }
  } catch (err) {
    console.error('Error processing interaction:', err);
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `An error occurred while processing your request. Please try again later.`,
        flags: 64, // Make the message ephemeral
      },
    });
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});