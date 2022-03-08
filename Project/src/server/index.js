require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');
const { rmSync } = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../public')));

const api_key = `api_key=${process.env.API_KEY}`;
const baseUrl = 'https://api.nasa.gov/mars-photos/api/v1';

// rover names
const names = ['curiosity', 'opportunity', 'spirit'];

// API call to get rover latest photos
app.get('/photos', async (req, res) => {

    // each call to get latest photos of rover depends on rover name in the url
    const allUrls = names.map(name => `/rovers/${name}/latest_photos?`);

    try {
        //four request for each of the four rovers to get their pictures
        let results = await Promise.all(allUrls.map(async partUrl => {
            return (await fetch(baseUrl + partUrl + api_key)
            .then(res => res.json()));
        }));
        
        // shape the response before sending to frontend
        const photos = results.map(obj => obj.latest_photos);
        res.send({ photos });

    } catch(err) {

        console.log('Error fetching photos:', err);
    }
})

// API call to get APOD image
app.get('/apod', async (req, res) => {
    try {
        // request APOD image
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())

        // and send to frontend
        res.send({ image })
    } catch (err) {
    
        console.log('error:', err);
    }
})

// console feedback that server is listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
