require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const { rmSync } = require('fs')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

const api_key = `api_key=${process.env.API_KEY}`;
const baseUrl = 'https://api.nasa.gov/mars-photos/api/v1';
const names = ['perseverance', 'curiosity', 'opportunity', 'spirit'];

// your API calls
app.get('/photos', async (req, res) => {

    const allUrls = names.map(name => `/rovers/${name}/latest_photos?`);

    try {
        let results = await Promise.all(allUrls.map(async partUrl => {
            return (await fetch(baseUrl + partUrl + api_key)
            .then(res => res.json()));
        }));
        
        const photos = results.map(obj => obj.latest_photos);
        res.send({ photos });

    } catch(err) {
        console.log('Error fetching photos:', err);
    }
})

// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
