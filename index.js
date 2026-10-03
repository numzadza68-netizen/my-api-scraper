const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT ? process.env.PORT : 3000;

app.use(express.json());

app.get('/', function(req, res) {
    res.json({ message: 'Scraper API is running smoothly!' });
});

app.get('/api/v1/scrape', async function(req, res) {
    try {
        const targetUrl = req.query.url;

        if (!targetUrl) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Please provide a URL parameter' 
            });
        }

        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);

        let title = $('meta[property="og:title"]').attr('content');
        if (!title) {
            title = $('title').text().trim();
        }

        let description = $('meta[property="og:description"]').attr('content');
        if (!description) {
            description = '';
        }

        let image = $('meta[property="og:image"]').attr('content');
        if (!image) {
            image = '';
        }

        res.json({
            status: 'success',
            data: {
                title: title,
                description: description,
                image: image,
                sourceUrl: targetUrl,
                scrapedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Unable to scrape target URL: ' + error.message 
        });
    }
});

app.listen(PORT, function() {
    console.log('API Server running on port ' + PORT);
});