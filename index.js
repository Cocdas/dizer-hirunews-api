const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

const PORT = 3000; // Local testing port

// Main route
app.get('/news', async (req, res) => {
  try {
    const newsArticles = [];
    const baseUrl = 'https://www.hirunews.lk/';

    // Fetch the HTML from Hiru News
    const { data: html } = await axios.get(baseUrl);

    // Load the HTML into Cheerio
    const $ = cheerio.load(html);

    // Scrape news articles
    $('.latest-news-block').each((i, el) => {
      const title = $(el).find('a').text().trim(); // Title
      const link = $(el).find('a').attr('href'); // Link
      const image = $(el).find('img').attr('src'); // Image

      if (title && link) {
        newsArticles.push({
          title,
          url: link.startsWith('http') ? link : `${baseUrl}${link}`,
          image: image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : null,
        });
      }
    });

    // Check if articles are found
    if (newsArticles.length === 0) {
      return res.status(404).json({ message: 'No news articles found.' });
    }

    // Respond with scraped articles
    res.json(newsArticles);
  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ message: 'Failed to fetch news articles.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
