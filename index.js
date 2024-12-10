const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow Cross-Origin Requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// Root Route
app.get('/', (req, res) => {
    res.send('Welcome to the Hiru News API! Use /news to fetch local news.');
});

// Function to scrape Hiru News
async function scrapeHiruNews() {
    const url = 'https://www.hirunews.lk/local-news.php?pageID=1';
    const results = [];

    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            const $ = cheerio.load(response.data);
            
            // Scrape News Articles
            $('.lts-item').each((i, el) => {
                const title = $(el).find('.lts-title a').text().trim();
                const newsUrl = 'https://www.hirunews.lk' + $(el).find('.lts-title a').attr('href');
                const description = $(el).find('.lts-content').text().trim();
                const image = $(el).find('img').attr('src');

                results.push({
                    title,
                    description,
                    image,
                    url: newsUrl,
                    powered_by: 'DIZER',
                });
            });

            return results;
        }
    } catch (error) {
        console.error('Error scraping Hiru News:', error);
        return [];
    }
}

// API Route for News
app.get('/news', async (req, res) => {
    try {
        const news = await scrapeHiruNews();
        if (news.length > 0) {
            res.json({ status: 'success', data: news });
        } else {
            res.status(404).json({ status: 'error', message: 'No news articles found.' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
