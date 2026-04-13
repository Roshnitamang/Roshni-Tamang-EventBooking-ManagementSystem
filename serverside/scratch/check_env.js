const fs = require('fs');
const content = fs.readFileSync('.env', 'utf8');
const lines = content.split('\n');
const keys = {};
lines.forEach((line, index) => {
    const match = line.match(/^\s*([^#=]+)=/);
    if (match) {
        const key = match[1].trim();
        if (keys[key]) {
            console.log(`Duplicate key found: ${key} on line ${index + 1}. Previous on line ${keys[key]}`);
        }
        keys[key] = index + 1;
    }
});
