const express = require('express');
const router = express.Router();
const db = require('../config/database');

const leagueDetailsQuery = `
    SELECT 
        Leagues.ID,
        Days.Day AS Day,
        Locations.Name AS Location,
        Format.Name AS Format,
        Sports.Name AS Sport,
        Leagues.LeagueURL,
        Leagues.StartDate,
        Leagues.StartTime,
        Leagues.Cost,
        Leagues.About,
        Leagues.Name,
        (
            SELECT GROUP_CONCAT(Divisions.Name)
            FROM LeagueDivisions
            JOIN Divisions ON LeagueDivisions.DivisionID = Divisions.ID
            WHERE LeagueDivisions.LeagueID = Leagues.ID
        ) AS Divisions,
        (
            SELECT GROUP_CONCAT(Coordinator.FirstName || ' ' || Coordinator.LastName)
            FROM LeagueCoordinators
            JOIN Coordinator ON LeagueCoordinators.CoordinatorID = Coordinator.ID
            WHERE LeagueCoordinators.LeagueID = Leagues.ID
        ) AS Coordinators
    FROM 
        Leagues
    JOIN 
        Days ON Leagues.DayID = Days.ID
    JOIN 
        Locations ON Leagues.LocationID = Locations.ID
    JOIN 
        Format ON Leagues.FormatID = Format.ID
    JOIN 
        Sports ON Leagues.SportID = Sports.ID
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
      filters.push('Locations.Name = ?');
      params.push(req.query.location);
  }

  if (filters.length) {
      query += ' WHERE ' + filters.join(' AND ');
  }

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

    res.json({ data: row });
  });
});


router.post('/', (req, res) => {
    const { DayID, LocationID, FormatID, CoordinatorID, SportID, LeagueURL, StartDate, StartTime, Cost, About } = req.body;

    if (!DayID || !LocationID || !FormatID || !CoordinatorID || !SportID || !LeagueURL) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
        INSERT INTO Leagues (DayID, LocationID, FormatID, CoordinatorID, SportID, LeagueURL, StartDate, StartTime, Cost, About)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [DayID, LocationID, FormatID, CoordinatorID, SportID, LeagueURL, StartDate, StartTime, Cost, About], function(err) {
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