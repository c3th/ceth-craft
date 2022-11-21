

const { Collection } = require('discord.js');

module.exports = class Cache {
    constructor() {
        this.commands = new Collection();
        this.modifiedCommands = new Collection();
    }
}
