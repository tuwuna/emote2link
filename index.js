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
      command: 'e',
      description: 'Send emote as link',
      usage: '{c} [emote name]',
      executor: (args) => {
        let argument = args[0];
        let size = 32;
        console.log(args);
        if (args[0] == "-s") {
          size = args[1];
          argument = args[2];
        }
        if (argument.length === 0) {
          return {
            send: false,
            result: 'Could not find any emotes containing **' + argument + '**'
          }
        }

        const emojis = Object.values(this.emojiStore.getGuilds()).flatMap(g => g.emojis);
        const foundEmojis = emojis.filter(emoji => emoji.name.toLowerCase().includes(argument));
        
        if (foundEmojis.length > 0) {
          const emojisAsString = foundEmojis[0].url + '&size=' + size;
          return {
            send: true,
            result: emojisAsString
          };
        }
        return {
          send: false,
          result: 'Could not find any emotes containing **' + argument + '**'
        }
      }
    });

  }

  pluginWillUnload () {
    powercord.api.commands.unregisterCommand('e');
  }

};
