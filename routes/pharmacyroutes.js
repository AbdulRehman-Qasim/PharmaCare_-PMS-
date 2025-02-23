const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Get the list of pharmacists
router.get('/pharmacists', async (req, res) => {
    try {
        const pool = await sql.connect();
        const result = await pool.request().query('SELECT * FROM pharmacist');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send({ message: `${err}` });
    }
});

module.exports = router;
