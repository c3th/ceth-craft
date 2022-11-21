

module.exports = class FilterMessage {
    constructor(server) {
        this.client = server.client;
        this.process = server.minecraftProcess;
        this.logs = server.logs;

        this.process.stderr.on('data', this.err.bind(this));
        this.process.stdout.on('data', this.log.bind(this));
    }

    err(data) {
        const message = data.toString().trim();
        this.client.emit('minecraftError', message);
    }

    log(data) {
        try {
            const message = data.toString().trim();
            this.client.emit('minecraftRawLog', message);

            if (message.match(/\[.+?\]/)) {
                const time = message.match(/\[.+?\]/).shift();
                const info = message.replace(time, '').trim().match(/\[.+?\]/).shift();
                const filteredMessage = message.replace(time, '').replace(info + ':', '').trim();

                if (filteredMessage.includes('Done')) {
                    this.client.emit('minecraftLoaded');
                }

                if (filteredMessage.includes('joined')) {
                    const latestLogs = this.logs.getLatest();
                    const [playerInfo, joinMessage] = latestLogs.slice(latestLogs.length - 2, latestLogs.length);
                    const playerIp = playerInfo.match(/\:+ [a-zA-Z0-9]{6,}\[.+?\]/).shift().replace(': ', '');
                    const playerCoords = playerInfo.match(/\(.+?\)/).shift();
                    this.client.emit('minecraftCreatePlayer', joinMessage, playerCoords, playerIp);
                }

                if (filteredMessage.includes('left')) {
                    const latestLogs = this.logs.getLatest();
                    const [playerInfo, leaveMessage] = latestLogs.slice(latestLogs.length - 2, latestLogs.length);
                    this.client.emit('minecraftCreatePlayer', leaveMessage, playerInfo);
                }

                

                this.client.emit('minecraftDebugLog', time, info, filteredMessage);
            }
        } catch (err) {
            this.client.emit('ChatFilterError', err);
        }
    }
}
