const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET endpoint to retrieve all pillars of service
router.get('/pillars', (req, res) => {
    db.all("SELECT * FROM Pillars", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ pillarsOfService: rows });
    });
});
router.get('/pillars/imgs', (req, res) => {
    db.all("SELECT * FROM Pillars", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ pillarsOfService: rows });
    });
});

module.exports = router;
