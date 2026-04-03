const express = require('express');
const router = express.Router();

// Mock Trending Data Aggregator
router.get('/all', (req, res) => {
  const trends = [
    { 
      id: 1,
      category: 'TRENDING', 
      headline: 'Iran-Israel Conflict Escalates', 
      source: 'Twitter', 
      metrics: '45k tweets',
      url: 'https://twitter.com/search?q=Iran-Israel'
    },
    { 
      id: 2,
      category: 'TECH', 
      headline: 'Apple Vision Pro 2 Announced', 
      source: 'Tech Forums', 
      metrics: '5k discussions',
      url: 'https://techcrunch.com'
    },
    { 
      id: 3,
      category: 'MEMES', 
      headline: 'KitKat Truck Robbery Goes Viral', 
      source: 'Reddit', 
      metrics: '12k upvotes',
      url: 'https://reddit.com/r/memes'
    },
    { 
      id: 4,
      category: 'PARTIES', 
      headline: 'Coachella 2026 Lineup Leaked', 
      source: 'Instagram', 
      metrics: '230k posts',
      url: 'https://instagram.com'
    },
    { 
      id: 5,
      category: 'GOSSIP', 
      headline: 'New Void Star Discovered', 
      source: 'OYEEE', 
      metrics: '2k aura',
      url: '#'
    },
    {
      id: 6,
      category: 'POLITICS',
      headline: 'Global Election Updates',
      source: 'BBC News',
      metrics: 'Over 1M reached',
      url: 'https://bbc.com/news'
    }
  ];

  res.json({
    success: true,
    timestamp: new Date(),
    trends
  });
});

module.exports = router;
