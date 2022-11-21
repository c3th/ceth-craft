

module.exports = class Dispatcher {
    constructor(client) {
        this.client = client;
        this.commands = client.cache.commands;
        this.minecraft = null;

        this.client.once('ready', this.ready.bind(this));
        this.client.on('messageCreate', this.dispatchMessage.bind(this));
    }

    async ready() {
        this.client.user.setActivity({
            name: 'myself',
            type: 'LISTENING'
        });
        console.log(`Logged in as ${this.client.user.tag} (${this.client.user.id})`);
    }

    async dispatchMessage(msg) {
        const prefix = this.client.bot.prefix;
        if (!msg.content.startsWith(prefix)) return;
        if (msg.author.bot || msg.channel.type == 'DM') return;

        const args = msg.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();
        console.log('Searching for:', commandName);

        const command = this.commands.get(commandName);
        console.log(this.commands.get(commandName));

        if (command.length) this.client.emit('minecraftCommand', msg, args, commandName);

    }
}
