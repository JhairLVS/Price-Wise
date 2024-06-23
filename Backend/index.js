const express = require('express');
const scraper = require('./scraper');
const userRoutes = require('./routes');
const db = require('./db/db');
const app = express();
const port = 8080;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', userRoutes);

app.get('/scrape', async (req, res) => {
    const query = req.query.q || 'default';
    try {
        const data = await scraper.scrapeAll(query);
        res.json(data);
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).send('Error during scraping.');
    }
});

app.get('/compare', async (req, res) => {
    const query = req.query.q || 'default';
    try {
        const data = await scraper.comparePrices(query);
        res.json(data);
    } catch (error) {
        console.error('Error during price comparison:', error);
        res.status(500).send('Error during price comparison.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
