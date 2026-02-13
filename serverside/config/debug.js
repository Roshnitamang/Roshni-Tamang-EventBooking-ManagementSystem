import fs from 'fs';
import path from 'path';

const logPath = path.join(process.cwd(), 'debug.log');

export const debugLog = (msg, obj = null) => {
    const timestamp = new Date().toISOString();
    let logMsg = `${timestamp} - ${msg}`;
    if (obj) {
        logMsg += ` - ${JSON.stringify(obj, (key, value) =>
            key === 'password' ? '***' : value, 2)}`;
    }
    fs.appendFileSync(logPath, logMsg + '\n');
    console.log(logMsg);
};

export const errorLog = (msg, err) => {
    const timestamp = new Date().toISOString();
    const logMsg = `${timestamp} - ERROR - ${msg}: ${err.message}\nStack: ${err.stack}`;
    fs.appendFileSync(logPath, logMsg + '\n');
    console.error(logMsg);
};
