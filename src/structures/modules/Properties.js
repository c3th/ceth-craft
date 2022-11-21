

const fse = require('fs-extra');

const path = require('path');

module.exports = class Properties {
    constructor(client) {
        this.client = client;

        this.propertiesPath = path.join(require.main.path, '..', 'server.properties');

        this.updateConfig(client.properties);
    }

    updateConfig(properties) {
        const config = this.getConfig();

        Array.from(Object.keys(properties)).map(prop => {
            const property = config.find(p => p[prop]);
            if (!property) {
                return this.client.emit('propertyError', properties);
            }
        });

        const raw = this.getRaw().split('\n');
        const newProperties = raw.map(line => {
            Object.keys(properties).map(prop => {
                if (line.includes(prop)) {
                    const newProp = properties[prop];
                    const findOldProp = config.find(p => p[prop]);
                    line = line.replace(findOldProp[prop], newProp);
                }
            });
            return line;
        });
        fse.writeFileSync(this.propertiesPath, newProperties.join('\n'));
    }

    getRaw() {
        const file = fse.readFileSync(this.propertiesPath);
        const prop = file.toString().trim();
        return prop;
    }

    getConfig() {
        const prop = this.getRaw();
        const properties = prop.split('\n').filter(x => !x.includes('#')).map(x => x.trim().split('='));
        const filtered = properties.map((a, b) => {
            const [key, val] = a;
            return { [key]: val }
        });
        return filtered;
    }
}
