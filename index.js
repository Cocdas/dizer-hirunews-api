const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

// Define the URL to scrape
const url = "https://www.hirunews.lk/";

app.use((req, res, next) => {
  // Enable CORS
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/news", async (req, res) => {
  try {
    // Fetch the website's HTML
    const response = await axios.get(url);

    if (response.status === 200) {
      const $ = cheerio.load(response.data); // Load HTML into Cheerio
      const newsArticles = [];

      // Extract news details
      $('div.news-block').each((i, el) => {
        const title = $(el).find('h2').text().trim(); // Title
        const link = $(el).find('a').attr('href'); // Link
        const image = $(el).find('img').attr('src'); // Image URL

        if (title && link) {
          newsArticles.push({
            title,
            url: link.startsWith("http") ? link : `https://www.hirunews.lk${link}`,
            image: image ? (image.startsWith("http") ? image : `https://www.hirunews.lk${image}`) : null,
          });
        }
      });

      // Respond with the extracted news data
      if (newsArticles.length > 0) {
        res.json(newsArticles);
      } else {
        res.json({ message: "No news articles found." });
      }
    } else {
      res.status(500).json({ error: "Failed to fetch the website." });
    }
  } catch (error) {
    console.error("Error during scraping:", error.message);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
