

const fse = require('fs-extra');

const path = require('path');

module.exports = class Registry {
    constructor(client) {
        this.client = client;
        this.modifiedCommands = this.client.cache.modifiedCommands;

        this.commandPath = path.join(require.main.path, 'commands');

        this.registerModifiedCommands();
    }

    registerModifiedCommands() {
        return fse.readdirSync(this.commandPath).forEach(file => {
            const command = require(path.join(this.commandPath, file));
            this.modifiedCommands.set(command.name, command);
        });
    }
}
