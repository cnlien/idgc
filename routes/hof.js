const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET endpoint to retrieve all HallOfFame members
router.get('/inductees', (req, res) => {
  const sql = `
      SELECT i.*, c.contributions, c.about
      FROM HOF_Inductees i
      LEFT JOIN HOF_Contributions c ON i.inductee_id = c.inductee_id;
  `;

  db.all(sql, [], (err, rows) => {
      if (err) {
          res.status(500).json({ error: err.message });
          return;
      }
      res.json(rows);
  });
});

router.put('/inductees/:id', (req, res) => {
  const data = req.body;
  const sql = `
      UPDATE HOF_Inductees
      SET first_name = ?, last_name = ?, inducted_year = ?, date_of_birth = ?, club_id = ?, hometown = ?, state = ?, nickname = ?
      WHERE inductee_id = ?;
  `;

  db.run(sql, [data.first_name, data.last_name, data.inducted_year, data.date_of_birth, data.club_id, data.hometown, data.state, data.nickname, req.params.id], (err) => {
      if (err) {
          res.status(500).json({ error: err.message });
          return;
      }
      res.json({ message: 'Inductee updated successfully!' });
  });
});

router.put('/contributions/:id', (req, res) => {
  const data = req.body;
  const sql = `
      UPDATE HOF_Contributions
      SET contributions = ?, about = ?
      WHERE contribution_id = ?;
  `;

  db.run(sql, [data.contributions, data.about, req.params.id], (err) => {
      if (err) {
          res.status(500).json({ error: err.message });
          return;
      }
      res.json({ message: 'Contribution updated successfully!' });
  });
});

router.delete('/inductees/:id', (req, res) => {
  const sql = 'DELETE FROM HOF_Inductees WHERE inductee_id = ?';

  db.run(sql, [req.params.id], (err) => {
      if (err) {
          res.status(500).json({ error: err.message });
          return;
      }
      res.json({ message: 'Inductee deleted successfully!' });
  });
});

router.delete('/contributions/:id', (req, res) => {
  const sql = 'DELETE FROM HOF_Contributions WHERE contribution_id = ?';

  db.run(sql, [req.params.id], (err) => {
      if (err) {
          res.status(500).json({ error: err.message });
          return;
      }
      res.json({ message: 'Contribution deleted successfully!' });
  });
});

router.post('/inductees', (req, res) => {
  const inducteeData = req.body;
  const sqlInductee = `
      INSERT INTO HOF_Inductees (first_name, last_name, inducted_year, date_of_birth, club_id, hometown, state, nickname)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;

  db.run(sqlInductee, [inducteeData.first_name, inducteeData.last_name, inducteeData.inducted_year, inducteeData.date_of_birth, inducteeData.club_id, inducteeData.hometown, inducteeData.state, inducteeData.nickname], function(err) {
      if (err) {
          res.status(500).json({ error: err.message });
          return;
      }

      const inducteeId = this.lastID;
      const sqlContribution = `
          INSERT INTO HOF_Contributions (inductee_id, contributions, about)
          VALUES (?, ?, ?);
      `;

      db.run(sqlContribution, [inducteeId, inducteeData.contributions, inducteeData.about], (err) => {
          if (err) {
              res.status(500).json({ error: err.message });
              return;
          }
          res.json({ message: 'Inductee and Contribution added successfully!', inducteeId: inducteeId });
      });
  });
});



module.exports = router;
