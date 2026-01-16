const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'src', 'itinerary.json');

app.use(cors());
app.use(bodyParser.json());

// Load data
app.get('/api/itinerary', (req, res) => {
    console.log(`[${new Date().toISOString()}] GET /api/itinerary`);
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Read Error:', err);
            return res.status(500).send('Error reading data file');
        }
        try {
            if (!data || data.trim() === '') {
                return res.json({});
            }
            res.json(JSON.parse(data));
        } catch (parseErr) {
            console.error('Parse Error:', parseErr);
            res.status(500).send('Invalid data format');
        }
    });
});

// Save data
app.post('/api/itinerary', (req, res) => {
    console.log(`[${new Date().toISOString()}] POST /api/itinerary`);
    const newData = req.body;
    fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Write Error:', err);
            return res.status(500).send('Error writing data file');
        }
        console.log('Data saved successfully');
        res.send('Data saved successfully');
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Data server running at http://0.0.0.0:${PORT}`);
    console.log(`Persistence file: ${DATA_FILE}`);
});
