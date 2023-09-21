const express = require('express');
require('dotenv').config();
const app = express();
const port = 3000;

app.use(express.json());

// Import and use the routers
const leaguesRouter = require('./routes/leagues');

app.use('/leagues', leaguesRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
