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

// your API calls
app.get('/photos', async (req, res) => {

    const names = ['curiosity', 'opportunity', 'spirit'];
    const allUrls = names.map(name => `/manifests/${name}/?`);
    try {
        let manifests = await Promise.all(allUrls.map(async partUrl => {
            return (await fetch(baseUrl + partUrl + api_key)
            .then(res => res.json()));
        }));

        const shapeManifests = 
            manifests.map(obj => obj.photo_manifest.photos)
            //.map(a => a.filter(o => o.cameras.includes('PANCAM') || o.cameras.includes('NAVCAM')))
            .map(a => a.reduce((p, c) => {
                return parseInt(p.total_photos) > parseInt(c.total_photos) ? p : c;
            }))
            .map(a => a.sol);

            const allUrls2 = 
                names.map((name, i) => `/rovers/${name}/photos?sol=${shapeManifests[i]}&`);
            try {
                let results = await Promise.all(allUrls2.map(async partUrl => {
                    return (await fetch(baseUrl + partUrl + api_key)
                    .then(res => res.json()));
                }));

                const photos = results.map(o => o.photos);
                res.send({ photos });
            } catch(err) {
                console.log('Error fetching photos:', err);
            }

    } catch(err) {
        console.log('Error fetching manifests:', err);
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`))