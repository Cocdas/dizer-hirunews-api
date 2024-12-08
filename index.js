const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Route: /news
app.get('/news', async (req, res) => {
  try {
    // Target URL
    const url = 'https://www.hirunews.lk/';

    // Fetch the HTML from the website
    const response = await axios.get(url);

    if (response.status === 200) {
      const $ = cheerio.load(response.data); // Load the HTML into Cheerio
      let newsData = [];

      // Scrape news titles and URLs
      $('.news-title a').each((i, element) => {
        const title = $(element).text().trim();
        const newsUrl = 'https://www.hirunews.lk' + $(element).attr('href');

        newsData.push({ title, newsUrl });
      });

      // Return the scraped news data as JSON
      res.json(newsData);
    } else {
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Default Route
app.get('/', (req, res) => {
  res.send('Welcome to the Hiru News API!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
