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
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data file');
        }
        res.json(JSON.parse(data));
    });
});

// Save data
app.post('/api/itinerary', (req, res) => {
    const newData = req.body;
    fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), 'utf8', (err) => {
        if (err) {
            return res.status(500).send('Error writing data file');
        }
        res.send('Data saved successfully');
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Data server running at http://0.0.0.0:${PORT}`);
});
