const fs = require('fs');
const path = require('path');
const express = require('express');
const axios = require('axios');
const jsonServer = require('json-server');

const app = express();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(middlewares);

// Custom endpoint
app.post('/custom-endpoint', async (req, res) => {
  const incomingMessage = req.body;

  // Append the incoming message to db.json
  const dbFilePath = path.join(__dirname, 'db.json');
  const dbData = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
  dbData.messages.push(incomingMessage);
  fs.writeFileSync(dbFilePath, JSON.stringify(dbData, null, 2), 'utf8');

  // Forward the request to another endpoint
  try {
    //const response = await axios.post('https://example.com/another-endpoint', incomingMessage);
   // res.status(response.status).json(response.data);
   res.status(200).json("hi");
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json({ error: error.message });
  }
});

// Use json-server's default router
app.use(router);

app.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
});