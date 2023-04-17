export async function handleAction(name, req, res) {
    // Define allowed channel IDs for each command
    const allowedChannels = {
        mine: '1096060784389398578', // This is the id of #mithril-mines
        chop: '1096060820573655070', // This is the id of #enchanted-forest
        fish: '1096061508015882304', // This is the id of #celestial-river
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