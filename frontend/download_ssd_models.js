import fs from 'fs';
import https from 'https';

const models = [
    "ssd_mobilenetv1_model-weights_manifest.json",
    "ssd_mobilenetv1_model-shard1",
    "ssd_mobilenetv1_model-shard2"
];
const baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/";

if (!fs.existsSync('public/models')) fs.mkdirSync('public/models', {recursive: true});

models.forEach(model => {
    https.get(baseUrl + model, (res) => {
        const file = fs.createWriteStream(`public/models/${model}`);
        res.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${model}`);
        });
    });
});
