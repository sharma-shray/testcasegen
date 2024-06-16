// server.mjs
import express from 'express';
import fs from 'fs';
import path from 'path';
import { groqCallCreateTestcase,groqCallCreateTestcaseSteps } from './groqCall.js'; 
import {createTestCase} from './zephyr_integration.js'
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(express.json());
app.use(express.static('public'));

// generate test case title
app.post('/generate-testcase-title', async (req, res) => {
    try {
        const incomingMessage = req.body;
        //console.log(incomingMessage)
        const encodedMessage = req.body.message;
        const decodedMessage = decodeURIComponent(encodedMessage);
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
        //groq call
        console.log(decodedMessage)
        let groqResponse = await groqCallCreateTestcase(decodedMessage, dbData.messages);

        // Append the incoming message to dbData.messages
        dbData.messages.push({ message: decodedMessage });

        // Write updated data back to db.json
        fs.writeFileSync(dbFilePath, JSON.stringify(dbData, null, 2), 'utf8');
        
        
        
        // Respond with success message
        res.status(200).json({ message: groqResponse });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// generate test case steps
app.post('/generate-testcase-steps', async (req, res) => {
    try {
        const incomingMessage = req.body;
        console.log(" here is the message from  test case steps",incomingMessage)
        const encodedMessage = req.body.message;
        const encodedSummary = req.body.summary;
        const decodedSummary = decodeURIComponent(encodedSummary);
        const decodedMessage = decodeURIComponent(encodedMessage);

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
        
        // Extract the list of test cases from the decoded message
        const testCases = decodedMessage.split('\n').filter(tc => tc.trim() !== '');

        // Generate detailed steps for each test case
        const detailedTestCaseSteps = [];
        for (const testCase of testCases) {
            const steps = await groqCallCreateTestcaseSteps(decodedSummary,testCase, dbData.messages);
            await createTestCase(testCase,steps);
            detailedTestCaseSteps.push({ testCase, steps });
        }
        
        // Respond with detailed test case steps
        res.status(200).json({ detailedTestCaseSteps });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Endpoint to reset db.json manually
app.post('/reset-db', (req, res) => {
    try {
      const dbFilePath = path.join(__dirname, 'db.json');
      const initialData = { messages: [] };
  
      fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), 'utf8');
      console.log('db.json has been reset');
  
      res.status(200).json({ message: 'db.json has been reset' });
    } catch (error) {
      console.error('Error resetting db.json:', error);
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
