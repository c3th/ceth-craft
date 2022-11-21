

const { PermissionsBitField } = require('discord.js');

const spawn = require('child_process').spawn;
const path = require('path');

const ChatFilter = require('./filters/ChatFilter');
const LogFilter = require('./filters/LogFilter');

module.exports = class Server {
    constructor(client) {
        this.client = client;
        this.mx = client.mx;
        this.ms = client.ms;

        this.minecraftProcess = spawn('java', [
            `-Xmx${this.mx}`,
            `-Xms${this.ms}`,
            '-jar',
            path.join(require.main.path, '..', 'server.jar'),
            'nogui'
        ]);

        this.commands = this.client.cache.commands;
        this.modifiedCommands = this.client.cache.modifiedCommands;

        this.logs = new LogFilter(this);
        this.filter = new ChatFilter(this);

        process.stdin.on('data', data => {
            this.minecraftProcess.stdin.write(data.toString());
        });

        this.client.once('minecraftLoaded', async () => {
            await this.minecraftProcess.stdin.write('help\n');
            setTimeout(() => {
                this.registerHelp();
            }, 300);
        });

        this.client.on('minecraftCommand', async (msg, args, commandName) => {
            const commandDesc = this.commands.get(commandName);
            const command = this.modifiedCommands.get(commandName);

            if (command && command.admin && !msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return msg.channel.send('Insufficient permissions for user. \n> Requires: *Administrator*');
            }

            await this.sendCommand(command?.name || commandName, args, msg);
            console.log('Sent!');
        });

    }

    sendCommand(commandName, args, msg) {
        this.minecraftProcess.stdin.write(`${commandName} ${args.join(' ')}\n`);
        setTimeout(() => {
            const logs = this.logs.getLatest(true);
            const responseLog = logs.splice(logs.length - 2, logs.length);

            const filteredResponse = responseLog.map(r => {
                const time = r.match(/\[.+?\]/).shift();
                const info = r.replace(time, '').trim().match(/\[.+?\]/).shift();
                const filtered = r.replace(time, '').replace(info + ':', '').trim();
                return filtered;
            });

            let response = filteredResponse[0];
            console.log('Command array response:', filteredResponse);
            console.log('Command response:', response);

            if (response.includes('Incorrect')) {
                const commandDesc = this.commands.get(commandName);
                return msg.channel.send(`${response} \n> Requires: *${commandDesc[0]}*`);
            } else {
                return msg.channel.send(filteredResponse[1]);
            }
        }, 300);
    }

    registerHelp() {
        const logs = this.logs.getLatest();
        const advancementInd = logs.findIndex(x => x.includes('/advancement'));

        const help = logs.slice(advancementInd, logs.length).map(log => {
            const time = log.match(/\[.+?\]/).shift();
            const info = log.replace(time, '').trim().match(/\[.+?\]/).shift();
            const filteredLog = log.replace(time, '').replace(info + ':', '').trim();
            return filteredLog;
        });

        const commands = help.map(str => {
            const command = str.split(' ');
            const commandName = command.shift().replace('/', '');
            this.client.cache.commands.set(commandName, command);
        });
        this.client.emit('minecraftReady');
    }
}
