

const { Client, IntentsBitField } = require('discord.js');

const Properties = require('./modules/Properties');
const ServerInit = require('./modules/ServerInit');
const Dispatcher = require('./Dispatcher');
const Registry = require('./Registry');
const Cache = require('./Cache');

const Config = require('../utilities/Config');

module.exports = class extends Client {
    constructor(config) {
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildVoiceStates,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.MessageContent,
            ]
        });

        Object.keys(config).forEach(key => this[key] = config[key]);

        this.serverOnline = false;
        this.bot = Config.bot;

        this.properties = new Properties(this);
//        this.properties.getConfig();
        this.cache = new Cache();
        this.server = new ServerInit(this);
        this.dispatch = new Dispatcher(this);
        this.registry = new Registry(this);

        this.once('minecraftReady', () => {
            this.login();
        });
    }

    async login() {
        await super.login(this.bot.token);
    }
}
