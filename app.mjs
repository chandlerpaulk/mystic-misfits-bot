import 'dotenv/config';
import './commands.mjs';
import { actions, creatures, shopItems } from './loot.mjs'
import UserModel from './database.mjs';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
} from 'discord-interactions';
import { VerifyDiscordRequest, DiscordRequest } from './utils.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

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

      // Define allowed channel IDs for each command
      const allowedChannels = {
        mine: '1096060784389398578', // This is the id of #mithril-mines
        chop: '1096060820573655070', // This is the id of #enchanted-forest
        fish: '1096061508015882304', // This is the id of #celestial-river
        hunt: '1097517896621637712', // This is the id of #creature-hunt
      };

      // Loot modifer for when user is battling
      async function updateLootModifier(userId) {
        // Adjust the modifier value to increase or decrease the improvement in loot chances
        const modifierValue = 0.1;
        await UserModel.findOneAndUpdate(
          { userId },
          { $inc: { 'stats.lootModifier': modifierValue } },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
      }

      // "mine", "chop", and "fish" commands
      if (Object.keys(actions).includes(name)) {

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

      if (name === 'hunt') {
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

        // Select a random creature to encounter
        let randomValue = Math.random();
        let selectedMonster;
        for (const creature of creatures) {
          if (randomValue < creature.chance) {
            selectedMonster = creature;
            break;
          }
          randomValue -= creature.chance;
        }

        // Calculate health loss
        const healthLoss = Math.floor(Math.random() * (selectedMonster.health / 2)) + 1;

        // Select a random loot item
        let lootRandomValue = Math.random();
        let selectedLoot;
        for (const lootItem of selectedMonster.loot) {
          if (lootRandomValue < lootItem.chance) {
            selectedLoot = lootItem;
            break;
          }
          lootRandomValue -= lootItem.chance;
        }

        // Update user's health and inventory in the database
        const userId = user.id;
        const amount = Math.floor(Math.random() * (selectedLoot.max - selectedLoot.min + 1)) + selectedLoot.min;
        const userDoc = await UserModel.findOneAndUpdate(
          { userId },
          {
            $inc: {
              'inventory.health': -healthLoss,
              [`inventory.items.${selectedLoot.name}`]: amount,
            },
          },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Check if the user has any health left
        const remainingHealth = userDoc.inventory.health;

        // Prepare embed for the creature image
        const embed = {
          title: `Encounter: ${selectedMonster.name}`,
          image: {
            url: selectedMonster.imageUrl, // You should add an imageUrl property to your creature objects
          },
        };

        console.log('Embed object:', embed);

        if (remainingHealth <= 0) {
          // Notify the user that they have been defeated
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `**${displayName}** encountered a **${selectedMonster.name}** and lost **${healthLoss}** health points. Unfortunately, you have been defeated.`,
              embeds: [embed],
            },
          });
        } else {
          // Notify the user of their health loss, remaining health, and obtained loot
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `**${displayName}** encountered a **${selectedMonster.name}** and lost **${healthLoss}** health points. You have **${remainingHealth}** health points left. You also received **${amount} ${selectedLoot.name}**!`,
              embeds: [embed],
            },
          });
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

      // // "inventory" command
      // if (name === 'inventory') {
      //   const userId = user.id;

      //   try {
      //     const userRecord = await UserModel.findOne({ userId: userId });
      //     const inventory = userRecord ? userRecord.inventory : {};

      //     // Create an inventory display string
      //     let inventoryDisplay = '';
      //     let currencyDisplay = inventory.currency || 0;
      //     let healthBar = inventory.health || 100;
      //     let staminaBar = inventory.stamina || 100;

      //     // Convert the Map to a plain JavaScript object
      //     const itemsObject = Object.fromEntries(inventory.items || {});

      //     for (const [item, amount] of Object.entries(itemsObject)) {
      //       inventoryDisplay += `**${item}**: ${amount}\n`;
      //     }

      //     // If inventory is empty, display a message
      //     if (!inventoryDisplay) {
      //       inventoryDisplay = 'Your inventory is empty.';
      //     }

      //     return res.send({
      //       type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      //       data: {
      //         content: `Your inventory:\n**Currency**: ${currencyDisplay}\n**Health**: ${healthBar}\n**Stamina**: ${staminaBar}\n${inventoryDisplay}`,
      //         flags: 64, // Make the message ephemeral (Private only to the user themselves)
      //       },
      //     });
      //   } catch (err) {
      //     console.error('Error fetching user inventory:', err);
      //     return res.send({
      //       type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      //       data: {
      //         content: `An error occurred while fetching your inventory. Please try again later.`,
      //         flags: 64, // Make the message ephemeral
      //       },
      //     });
      //   }
      // }
      // "inventory" command
      if (name === 'inventory') {
        const userId = user.id;

        try {
          const userRecord = await UserModel.findOne({ userId: userId });
          const inventory = userRecord ? userRecord.inventory : {};

          // Create an inventory display string
          let inventoryDisplay = '';
          let currencyDisplay = inventory.currency || 0;
          let healthBar = inventory.health || 100;
          let staminaBar = inventory.stamina || 100;

          // Convert the Map to a plain JavaScript object
          const itemsObject = Object.fromEntries(inventory.items || {});

          const categories = {
            weapons: [],
            armor: [],
            consumables: [],
            materials: [],
            misc: [],
          };

          for (const [item, amount] of Object.entries(itemsObject)) {
            // Assign the items to the corresponding categories
            // This is an example; you can add more categories and items as needed
            if (['Rusty Sword', 'Dragon Tooth'].includes(item)) {
              categories.weapons.push(`**${item}**: ${amount}`);
            } else if (['Goblin Armour', 'Wolf Pelt'].includes(item)) {
              categories.armor.push(`**${item}**: ${amount}`);
            } else if (['Mushroom', 'Berry', 'Herb'].includes(item)) {
              categories.consumables.push(`**${item}**: ${amount}`);
            } else if (['Stick', 'Stone', 'Spider Silk'].includes(item)) {
              categories.materials.push(`**${item}**: ${amount}`);
            } else {
              categories.misc.push(`**${item}**: ${amount}`);
            }
          }

          // Format the inventory display
          for (const [category, items] of Object.entries(categories)) {
            if (items.length > 0) {
              inventoryDisplay += `\n**${category.charAt(0).toUpperCase() + category.slice(1)}**\n`;
              inventoryDisplay += items.join('\n');
            }
          }

          // If inventory is empty, display a message
          if (!inventoryDisplay) {
            inventoryDisplay = 'Your inventory is empty.';
          }

          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Your inventory:\n**Currency**: ${currencyDisplay}\n**Health**: ${healthBar}\n**Stamina**: ${staminaBar}${inventoryDisplay}`,
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

          // Convert the Map to a plain JavaScript object
          const itemsObject = Object.fromEntries(inventory.items || {});

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

            if (!itemsObject[resource] || itemsObject[resource] < amount) {
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