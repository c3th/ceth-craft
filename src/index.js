

const Client = require('./structures/Client');

const client = new Client({
    properties: {
        'max-players': '10',
        'server-port': '25565',
        motd: 'welcome back!'
    },

    mx: '3G',
    ms: '3G'
});

const colors = require('colors');

client.on('minecraftDebugLog', (time, info, message) => {
    const coloredTime = colors.bgWhite(colors.black(time));
    const coloredInfo = colors.bgMagenta(colors.white(info));
    console.log(coloredTime, coloredInfo, message);
});

client.on('minecraftError', msg => {
    console.log('Error', msg);
});
