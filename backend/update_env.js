const fs = require('fs');
let key = fs.readFileSync('temp_key.pem', 'utf16le');
if(!key.includes('BEGIN')) key = fs.readFileSync('temp_key.pem', 'utf8');
key = key.trim().replace(/\r?\n/g, '\\n');
let env = fs.readFileSync('.env', 'utf8');
env = env.replace(/FIREBASE_PRIVATE_KEY=".*"/, 'FIREBASE_PRIVATE_KEY="' + key + '"');
fs.writeFileSync('.env', env, 'utf8');
