const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

app.get('/', (req, res) => {
    res.send('Hello Job Box');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
