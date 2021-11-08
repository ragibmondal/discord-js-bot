const { Command } = require("@src/structures");
const { getEffectiveInvites } = require("@src/handlers/invite-handler");
const { EMBED_COLORS } = require("@root/config.js");
const { MessageEmbed, Message, CommandInteraction } = require("discord.js");
const { resolveMember } = require("@utils/guildUtils");
const { getMember } = require("@schemas/Member");

module.exports = class InvitesCommand extends Command {
  constructor(client) {
    super(client, {
      name: "invites",
      description: "shows number of invites in this server",
      category: "INVITE",
      botPermissions: ["EMBED_LINKS"],
      command: {
        enabled: true,
        usage: "[@member|id]",
      },
      slashCommand: {
        enabled: true,
        options: [
          {
            name: "user",
            description: "the user to get the invites for",
            type: "USER",
            required: false,
          },
        ],
      },
    });
  }

  /**
   * @param {Message} message
   * @param {string[]} args
   */
  async messageRun(message, args) {
    const target = (await resolveMember(message, args[0])) || message.member;
    const response = await getInvites(message, target);
    await message.channel.send(response);
  }

  /**
   * @param {CommandInteraction} interaction
   */
  async interactionRun(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const response = await getInvites(interaction, user);
    await interaction.followUp(response);
  }
};

async function getInvites({ guild }, user) {
  const inviteData = (await getMember(guild.id, user.id)).invite_data;

  const embed = new MessageEmbed()
    .setAuthor(`Invites for ${user.username}`)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(user.displayAvatarURL())
    .setDescription(`${user.toString()} has ${getEffectiveInvites(inviteData)} invites`)
    .addField("Total Invites", `**${inviteData?.tracked + inviteData?.added || 0}**`, true)
    .addField("Fake Invites", `**${inviteData?.fake || 0}**`, true)
    .addField("Left Invites", `**${inviteData?.left || 0}**`, true);

  return { embeds: [embed] };
}
