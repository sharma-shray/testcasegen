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
  try {
    const incomingMessage = req.body;
console.log(incomingMessage)
    // Validate incoming message structure
    if (!incomingMessage || typeof incomingMessage !== 'object' || !incomingMessage.hasOwnProperty('message')) {
      return res.status(400).json({ error: 'Invalid message format' });
    }

    // Read db.json file
    const dbFilePath = path.join(__dirname, 'db.json');
    let dbData = { messages: [] };

    // Check if db.json exists and has data
    if (fs.existsSync(dbFilePath)) {
      const dbContent = fs.readFileSync(dbFilePath, 'utf8');
      dbData = JSON.parse(dbContent);
    }

    // Append the incoming message to dbData.messages
    dbData.messages.push({ message: incomingMessage.message });

    // Write updated data back to db.json
    fs.writeFileSync(dbFilePath, JSON.stringify(dbData, null, 2), 'utf8');

    // Respond with success message
    res.status(200).json({ message: 'Message received and saved successfully' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// New endpoint
app.get('/hello', (req, res) => {
  res.status(200).send('Hello, world!');
});

// Serve index.html on root request
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
