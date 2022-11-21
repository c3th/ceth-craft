

const fse = require('fs-extra');
const readline = require('readline');
const zlib = require('zlib');

const path = require('path');

module.exports = class LogFilter {
    constructor(server) {
        this.client = server.client;

        this.logPath = path.join(require.main.path, '..', 'logs');
    }

    searchLog(query) {
        return fse.readdirSync(this.logPath).map(log => {
            if (log.endsWith('.gz')) {
                // TODO: Be able to search log throughout the history of chat logs in the server.
                // let lineReader = readline.createInterface({
                //     input: fs.createReadStream('test.gz').pipe(zlib.createGunzip())
                // });

                // let n = 0;
                // lineReader.on('line', (line) => {
                //     n += 1
                //     console.log("line: " + n);
                //     console.log(line);
                // });
            }
        });
    }

    getLatest(filter = false) {
        const logs = fse.readdirSync(this.logPath).map(file => {
            if (!file.endsWith('.gz')) {
                const text = fse.readFileSync(path.join(this.logPath, file));
                if (text.toString()) return text.toString().trim();
            }
        });
        if (filter) {
            const filtered = logs.filter(x => x).map(log => {
//                const time = log.match(/\[.+?\]/).shift();
//                const info = log.replace(time, '').trim().match(/\[.+?\]/).shift();
//                const filteredLog = log.replace(time, '').replace(info + ':', '').trim();
                return log;
            });
            return filtered.filter(x => x).map(str => str.split('\n')).shift();
        }
        const filtered = logs.filter(x => x).map(str => str.split('\n')).shift();
        return filtered;
    }
}
