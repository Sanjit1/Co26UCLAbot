// why not: https://discord.js.org/#/docs/discord.js/
require("dotenv/config");

// constants
const test = process.env.ARETEST == 1;
const constants = test
    ? require("./../testConstants.json")
    : require("./../constants.json");

const fs = require("fs");
var storage = fs.readFileSync("./storage.json");
var parsedStorage = JSON.parse(storage);

const handle = (reaction, MessageEmbed) => {
    //handle functions
    (async () => {
        if (reaction.partial) {
            // if its a partial we fetch the full reaction and message objects
            try {
                await reaction.fetch();
                await reaction.message.fetch();
            } catch (error) {
                console.log("f ", error);
            }
        }
        // cache all the emojis reacted to the message
        reaction.message.reactions.cache.get(reaction.emoji.name);
        var parsedStorage = JSON.parse(storage);

        if (
            // if there are more than three reactions and it has not been placed in historical before, we go ahead and place it
            reaction.count > 3 &&
            !parsedStorage.modules.historicalMessages.messages.includes(
                reaction.message.id
            )
        ) {
            parsedStorage.modules.historicalMessages.messages.push(
                reaction.message.id
            ); // add this to the historical history
            fs.writeFileSync("./storage.json", JSON.stringify(parsedStorage)); // rewrite storage to include history

            var historicalEmbed = new MessageEmbed()
                .setColor(
                    "#" + Math.floor(Math.random() * 16777215).toString(16)
                ) // set a random color cuz why not
                .setAuthor({
                    name: reaction.message.author.username,
                    iconURL: reaction.message.author.displayAvatarURL(),
                }) // show the author of the original message on the embed
                .addFields({
                    name:
                        reaction.message.content == ""
                            ? "Look!"
                            : reaction.message.content,
                    value:
                        "[Click here to be teleported](" +
                        reaction.message.url +
                        ")",
                }); // add the message content to the historical message embed
            if (reaction.message.attachments.size > 0) {
                if (
                    Array.from(
                        reaction.message.attachments.filter((file) => {
                            return (
                                file.url.endsWith(".png") ||
                                file.url.endsWith(".jpg") ||
                                file.url.endsWith(".jpeg") ||
                                file.url.endsWith(".mp4") ||
                                file.url.endsWith(".gif")
                            );
                        })
                    ).length > 0
                ) {
                    historicalEmbed.setImage(
                        Array.from(
                            reaction.message.attachments.filter((file) => {
                                return (
                                    file.url.endsWith(".png") ||
                                    file.url.endsWith(".jpg") ||
                                    file.url.endsWith(".jpeg") ||
                                    file.url.endsWith(".mp4") ||
                                    file.url.endsWith(".gif")
                                );
                            })
                        )[0][1].url
                    );
                }
            } // adds the first attachment(if any) to the embed: this could be done cleaner
            reaction.message.guild.channels.cache
                .get(constants.channels.historical)
                .send({ embeds: [historicalEmbed] });
            // Get the Historical Channel and send the embed there.
        }
    })();
};

module.exports = { handle };
