import fs from 'fs';
import https from 'https';

const models = [
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2"
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
