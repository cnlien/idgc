const express = require('express');
const router = express.Router();
const db = require('../config/database');

const leagueDetailsQuery = `
  SELECT 
      Leagues.ID,
      Leagues.Name,
      Days.Day AS Day,
      Courses.Name AS Course,
      Format.Name AS Format,
      Leagues.LeagueURL,
      Leagues.StartDate,
      Leagues.StartTime,
      Leagues.Cost,
      Leagues.About,
      GROUP_CONCAT(DISTINCT Divisions.Name) AS Divisions,
      GROUP_CONCAT(DISTINCT Users.DisplayName) AS Coordinators
  FROM 
      Leagues
  JOIN 
      Days ON Leagues.DayID = Days.ID
  JOIN 
      Courses ON Leagues.CourseID = Courses.ID
  JOIN 
      Format ON Leagues.FormatID = Format.ID
  LEFT JOIN 
      LeagueDivisions ON Leagues.ID = LeagueDivisions.LeagueID
  LEFT JOIN 
      Divisions ON LeagueDivisions.DivisionID = Divisions.ID
  LEFT JOIN 
      LeagueAdmins ON Leagues.ID = LeagueAdmins.LeagueID
  LEFT JOIN 
      Users ON LeagueAdmins.UserID = Users.ID
`;

  router.get('/', (req, res) => {
    let query = leagueDetailsQuery;

    let params = [];
    let filters = [];

    if (req.query.day) {
        filters.push('Days.Day = ?');
        params.push(req.query.day);
    }

    if (req.query.location) {
        filters.push('Courses.Name = ?');
        params.push(req.query.location);
    }

    if (filters.length) {
        query += ' WHERE ' + filters.join(' AND ');
    }

    query += ' GROUP BY Leagues.ID';

    db.all(query, params, (err, rows) => {
        if(err) {
            return res.status(500).json({ error: err.message });
        }

        const data = rows.map(row => {
            if (row.Divisions) {
                row.Divisions = row.Divisions.split(',');
            } else {
                row.Divisions = [];
            }

            if (row.Coordinators) {
                row.Coordinators = row.Coordinators.split(',').map(name => name.trim());
            } else {
                row.Coordinators = [];
            }

            return row;
        });

        res.json({ 
            data,
            timestamp: new Date().toISOString()
        });
    });
});



router.get('/:id', (req, res) => {
  const leagueId = req.params.id;

  if (!Number(leagueId)) {
    return res.status(400).json({ error: 'Invalid league ID' });
  }

  let query = `${leagueDetailsQuery} WHERE Leagues.ID = ?`;

  db.get(query, [leagueId], (err, row) => {
    if(err) {
        return res.status(500).json({ error: err.message });
    }

    if (!row) {
        return res.status(404).json({ error: 'League not found' });
    }

    if (row.Divisions) {
      row.Divisions = row.Divisions.split(',');
    } else {
        row.Divisions = [];
    }

    if (row.Coordinators) {
        row.Coordinators = row.Coordinators.split(',').map(name => name.trim());
    } else {
        row.Coordinators = [];
    }

    res.json({ data: row });
  });
});


router.post('/', (req, res) => {
  const { Name, DayID, CourseID, FormatID, LeagueURL, StartDate, StartTime, Cost, About } = req.body;

  if (!Name || !DayID || !CourseID || !FormatID || !LeagueURL) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
      INSERT INTO Leagues (Name, DayID, CourseID, FormatID, LeagueURL, StartDate, StartTime, Cost, About)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [Name, DayID, CourseID, FormatID, LeagueURL, StartDate, StartTime, Cost, About], function(err) {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'League successfully added', leagueID: this.lastID });
  });
});

router.put('/:id', (req, res) => {
  const { DayID, LocationID, FormatID, CoordinatorID, SportID, LeagueURL, StartDate, StartTime, Cost, About } = req.body;
  const leagueID = req.params.id;

  if (!DayID || !LocationID || !FormatID || !CoordinatorID || !SportID || !LeagueURL) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
      UPDATE Leagues
      SET DayID = ?, LocationID = ?, FormatID = ?, CoordinatorID = ?, SportID = ?, LeagueURL = ?, StartDate = ?, StartTime = ?, Cost = ?, About = ?
      WHERE ID = ?
  `;

  db.run(query, [DayID, LocationID, FormatID, CoordinatorID, SportID, LeagueURL, StartDate, StartTime, Cost, About, leagueID], function(err) {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'League successfully updated', rowsAffected: this.changes });
  });
});

router.delete('/:id', (req, res) => {
  const leagueID = req.params.id;

  const query = `
      DELETE FROM Leagues
      WHERE ID = ?
  `;

  db.run(query, leagueID, function(err) {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'League successfully deleted', rowsAffected: this.changes });
  });
});

module.exports = router;