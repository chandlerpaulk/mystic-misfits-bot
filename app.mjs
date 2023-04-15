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

      // Add health, stamina, and leveling system
      const MAX_HEALTH = 100;
      const MAX_STAMINA = 100;

      function getLevel(experience) {
        return Math.floor(Math.sqrt(experience / 100)) + 1;
      }

      // Define possible resources for each action
      const actions = {
        fish: [
          { name: 'missed actions', tier: 'Missed', chance: 0.15, min: 1, max: 1, value: 0},
          { name: 'salmon', tier: 'Common', chance: 0.45, min: 1, max: 3, value: 10 },
          { name: 'tuna', tier: 'Uncommon', chance: 0.3, min: 1, max: 2, value: 15 },
          { name: 'swordfish', tier: 'Rare', chance: 0.15, min: 1, max: 1, value: 25 },
          { name: 'shark', tier: 'Epic', chance: 0.07, min: 1, max: 1, value: 50 },
          { name: 'giant squid', tier: 'Legendary', chance: 0.03, min: 1, max: 1, value: 100 },
          { name: 'kraken', tier: 'Mythic', chance: 0.01, min: 1, max: 1, value: 200 },
        ],
        mine: [
          { name: 'missed action', tier: 'Missed', chance: 0.15, min:1, max:1, value: 0},
          { name: 'stone', tier: 'Common', chance: 0.45, min: 1, max: 3, value: 5 },
          { name: 'copper', tier: 'Common', chance: 0.45, min: 1, max: 3, value: 7 },
          { name: 'iron', tier: 'Uncommon', chance: 0.3, min: 1, max: 2, value: 10 },
          { name: 'silver', tier: 'Uncommon', chance: 0.3, min: 1, max: 2, value: 12 },
          { name: 'gold', tier: 'Rare', chance: 0.15, min: 1, max: 1, value: 20 },
          { name: 'platinum', tier: 'Rare', chance: 0.15, min: 1, max: 1, value: 22 },
          { name: 'diamond', tier: 'Epic', chance: 0.07, min: 1, max: 1, value: 100 },
          { name: 'ruby', tier: 'Epic', chance: 0.07, min: 1, max: 1, value: 110 },
          { name: 'emerald', tier: 'Legendary', chance: 0.03, min: 1, max: 1, value: 200 },
          { name: 'sapphire', tier: 'Legendary', chance: 0.03, min: 1, max: 1, value: 210 },
          { name: 'magic crystal', tier: 'Mythic', chance: 0.01, min: 1, max: 1, value: 400 },
          { name: 'arcane gem', tier: 'Mythic', chance: 0.01, min: 1, max: 1, value: 420 },
        ],
        chop: [
          { name: 'missed action', tier: 'Missed', chance: 0.15, min:1, max:1, value: 0},
          { name: 'oak', tier: 'Common', chance: 0.45, min: 1, max: 5, value: 5 },
          { name: 'birch', tier: 'Uncommon', chance: 0.3, min: 1, max: 5, value: 10 },
          { name: 'maple', tier: 'Rare', chance: 0.15, min: 1, max: 5, value: 15 },
          { name: 'mahogany', tier: 'Epic', chance: 0.07, min: 1, max: 5, value: 25 },
          { name: 'ancient oak', tier: 'Legendary', chance: 0.03, min: 1, max: 5, value: 50 },
          { name: 'enchanted tree', tier: 'Mythic', chance: 0.01, min: 1, max: 5, value: 100 },
        ],
      };

      // "mine", "chop", and "fish" commands
      if (Object.keys(actions).includes(name)) {

        // Define allowed channel IDs for each command
        const allowedChannels = {
          mine: '1096060784389398578',
          chop: '1096060820573655070',
          fish: '1096061508015882304',
        };

        // Check if the command is being executed in the allowed channel
        const channelId = req.body.channel_id;
        if (allowedChannels[name] !== channelId) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Sorry, the **${name}** command can only be used in the designated channel.`,
              flags: 64, // Can only be seen by the user who performed the command
            },
          });
        }

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

        // Prepare a response based on the item's rarity
        let response;
        switch (selectedResource.tier) {
          case 'Missed':
            response = `missed!`;
            break;
          case 'Common':
            response = `found :white_large_square: **${amount} ${selectedResource.name}**.`;
            break;
          case 'Uncommon':
            response = `discovered :green_square: **${amount} ${selectedResource.name}**.`;
            break;
          case 'Rare':
            response = `unearthed :blue_square: **${amount} ${selectedResource.name}**.`;
            break;
          case 'Epic':
            response = `stumbled upon :purple_square: **${amount} ${selectedResource.name}**.`;
            break;
          case 'Legendary':
            response = `unveiled :large_orange_diamond: **${amount} ${selectedResource.name}**.`;
            break;
          case 'Mythic':
            response = `unlocked :yellow_circle: **${amount} ${selectedResource.name}**.`;
            break;
        }

        // Send a message with the resource and amount earned
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `**${displayName}** performed a **${name}** action and ${response}`,
          },
        });
      }

      // "status" command
      if (name === 'status') {
        const userId = user.id;

        try {
          const userRecord = await UserModel.findOne({ userId: userId });
          const { health, stamina, level, experience } = userRecord ? userRecord.stats : {};
          console.log(health, stamina, level, experience)

          // Calculate level using getLevel()
          const calculatedLevel = getLevel(experience);

          // Calculate emoji health and stamina bars
          const healthBar = '🟩'.repeat(health) + '🟥'.repeat(MAX_HEALTH - health);
          const staminaBar = '🟦'.repeat(stamina) + '⬜'.repeat(MAX_STAMINA - stamina);

          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content:
                `**Health**: ${health}/${MAX_HEALTH}\n${healthBar}\n` +
                `**Stamina**: ${stamina}/${MAX_STAMINA}\n${staminaBar}\n`,
                // `**Level**: ${calculatedLevel}\n` +
                // `**Experience**: ${experience}`,
              flags: 64, // Make the message ephemeral
            },
          });
        } catch (err) {
          console.error('Error fetching user status:', err);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `An error occurred while fetching your status. Please try again later.`,
              flags: 64, // Make the message ephemeral
            },
          });
        }
      }

      // "hunt" command
      if (name === 'hunt') {

        // Check if the command was executed in the desired channel
        if (req.body.channel_id !== '1096060820573655070') {
          // Send a message informing the user that this command can only be used in the specific channel
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: 'The command can only be used in the designated channel(s).',
              flags: 64, // Make the message ephemeral
            },
          });
        }

        const animals = [
          { name: 'rabbit', tier: 'Common', chance: 0.4, value: 5 },
          { name: 'deer', tier: 'Uncommon', chance: 0.3, value: 15 },
          { name: 'wolf', tier: 'Rare', chance: 0.15, value: 30 },
          { name: 'bear', tier: 'Epic', chance: 0.1, value: 50 },
          { name: 'griffin', tier: 'Legendary', chance: 0.04, value: 100 },
          { name: 'dragon', tier: 'Mythic', chance: 0.01, value: 250 },
        ];
        const monster = { name: 'monster', tier: 'Mythic', chance: 0.1, value: 0 };

        const huntTargets = animals.concat([monster]);

        // Find the hunted animal or monster
        let randomValue = Math.random();
        let selectedTarget;
        for (const target of huntTargets) {
          if (randomValue < target.chance) {
            selectedTarget = target;
            break;
          }
          randomValue -= target.chance;
        }

        if (selectedTarget.name === 'monster') {
          // The user encountered a monster
          const roll = Math.floor(Math.random() * 20) + 1;

          // Check if the user evades or defeats the monster
          if (roll >= 10) {
            // User evades the monster
            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `You encountered a **${selectedTarget.name}** but successfully evaded it with a d20 roll of **${roll}**.`,
              },
            });
          } else {
            // User has to fight the monster
            const fightOutcome = Math.random() >= 0.5;
            if (fightOutcome) {
              // User defeats the monster
              return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: `You encountered a **${selectedTarget.name}** and fought it bravely! With a d20 roll of **${roll}**, you defeated the monster.`,
                },
              });
            } else {
              // User loses to the monster
              return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: `You encountered a **${selectedTarget.name}** and fought bravely, but with a d20 roll of **${roll}**, you were defeated.`,
                },
              });
            }
          }
        } else {
          // The user caught an animal
          try {
            const userId = user.id;
            const userRecord = await UserModel.findOne({ userId: userId });

            if (userRecord) {
              // Add the caught animal to the user's inventory
              userRecord.inventory[selectedTarget.name] =
                (userRecord.inventory[selectedTarget.name] || 0) + 1;

              // Add experience and level up if necessary
              userRecord.stats.experience += selectedTarget.value;
              while (userRecord.stats.experience >= userRecord.stats.level * 100) {
                userRecord.stats.experience -= userRecord.stats.level * 100;
                userRecord.stats.level += 1;
              }

              await userRecord.save();
            } else {
              // Create a new user record with the caught animal
              await UserModel.create({
                userId: userId,
                inventory: { [selectedTarget.name]: 1 },
                stats: {
                  health: MAX_HEALTH,
                  stamina: MAX_STAMINA,
                  level: 1,
                  experience: selectedTarget.value,
                },
              });
            }

            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `You successfully hunted a **${selectedTarget.tier} ${selectedTarget.name}**!`,
              },
            });
          } catch (err) {
            console.error('Error updating user inventory:', err);
            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `An error occurred while updating your inventory. Please try again later.`,
                flags: 64, // Make the message ephemeral
              },
            });
          }
        }
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
          let currencyDisplay = inventory.currency || 0;
          let healthBar = inventory.health;
          let staminaBar = inventory.stamina;

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
              content: `Your inventory:\n**Currency**: ${currencyDisplay}\n**Health**: ${healthBar}\n**Stamina**: ${staminaBar}\n${inventoryDisplay}`,
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

            const resourceInfo = Object.values(actions)
              .flat()
              .find(r => r.name === resource);

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