const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

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
    res.status(200).json("hi");
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
