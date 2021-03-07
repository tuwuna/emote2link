const { Plugin } = require('powercord/entities');

const {
  getModule,
} = require('powercord/webpack');

module.exports = class EmojiUtility extends Plugin {
  async import (filter, functionName = filter) {
    if (typeof filter === 'string') {
      filter = [ filter ];
    }

    this[functionName] = (await getModule(filter))[functionName];
  }

  async doImport () {
    this.emojiStore = await getModule([ 'getGuildEmoji' ]);
    await this.import('getGuilds');
  }

  async startPlugin () {
    await this.doImport();

    powercord.api.commands.registerCommand({
      command: '',
      description: 'Send emote as link',
      usage: '{c} [emote name]',
      executor: (args) => {
        const argument = args.join(' ').toLowerCase();
        if (argument.length === 0) {
          return this.replyError('Please provide an emote name');
        }

        const emojis = Object.values(this.emojiStore.getGuilds()).flatMap(g => g.emojis);
        const foundEmojis = emojis.filter(emoji => emoji.name.toLowerCase().includes(argument));
        
        if (foundEmojis.length > 0) {
          const emojisAsString = foundEmojis[0].url + '&size=32';
          return {
            send: true,
            result: emojisAsString
          };
        }

        return this.replyError(`Could not find any emotes containing **${argument}**`);
      }
    });

  }

  pluginWillUnload () {
    powercord.api.commands.unregisterCommand('');
  }

};
