const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const PORT = 3000;

const app = express();
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'Pharmacy Management',
    password: '12345678',
    port: 8000, 

});

client.connect().then(() => {
    console.log('Connected to Database.');
}).catch((err) => {
    console.error('Error Connecting Database:', err);
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/stocks', async (req, res) => {
    try {
        const query = 'SELECT * FROM stocks';
        const result = await client.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error retrieving stock data:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/stocks', async (req, res) => {
    const { drug_name, category, description, company, supplier, quantity, cost, status, date_supplied } = req.body;
    console.log(req.body); // Log the request body to verify data received
    try {
        const query = 'INSERT INTO stocks (drug_name, category, description, company, supplier, quantity, cost, status, date_supplied) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
        const result = await client.query(query, [drug_name, category, description, company, supplier, quantity, cost, status, date_supplied]);
        console.log(result.rows[0]); // Log the inserted row to verify data insertion
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error adding new stock item:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.get('/prescriptions', async (req, res) => {
    try {
        const query = 'SELECT * FROM prescription';
        const result = await client.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error retrieving prescriptions data:', error);
        res.status(500).send('Internal Server Error');
    }
});




app.get('/pharmacists', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM pharmacist');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/pharmacists', async (req, res) => {
    const { first_name, last_name, staff_id, postal_address, phone, email, username, password, date } = req.body;

    
    if (!first_name || !last_name || !staff_id || !postal_address || !phone || !email || !username || !password || !date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
       
        const idResult = await client.query('SELECT MAX(pharmacist_id) FROM pharmacist');
        const maxId = idResult.rows[0].max || 0;
        const pharmacist_id = maxId + 1;

        const result = await client.query(
            'INSERT INTO pharmacist (pharmacist_id, first_name, last_name, staff_id, postal_address, phone, email, username, password, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [pharmacist_id, first_name, last_name, staff_id, postal_address, phone, email, username, password, date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.delete('/pharmacists/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await client.query('DELETE FROM pharmacist WHERE pharmacist_id = $1', [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Pharmacist not found' });
        } else {
            res.status(200).json({ message: 'Pharmacist deleted successfully' });
        }
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all managers
app.get('/managers', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM manager');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add a new manager
app.post('/managers', async (req, res) => {
    const { first_name, last_name, staff_id, postal_address, phone, email, username, password, date } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !staff_id || !postal_address || !phone || !email || !username || !password || !date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Generate a valid, unique manager_id
        const idResult = await client.query('SELECT MAX(manager_id) FROM manager');
        const maxId = idResult.rows[0].max || 0;
        const manager_id = maxId + 1;

        const result = await client.query(
            'INSERT INTO manager (manager_id, first_name, last_name, staff_id, postal_address, phone, email, username, password, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [manager_id, first_name, last_name, staff_id, postal_address, phone, email, username, password, date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a manager by ID
app.delete('/managers/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await client.query('DELETE FROM manager WHERE manager_id = $1', [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Manager not found' });
        } else {
            res.status(200).json({ message: 'Manager deleted successfully' });
        }
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/local-data', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM stocks');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password, position } = req.body;

    if (position !== 'Manager') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await client.query(
            'SELECT * FROM admin WHERE username = $1 AND password = $2',
            [username, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Get all prescriptions
app.get('/prescriptions', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM prescription');
        res.json(result.rows);
    } catch (err) {
        console.error('Error retrieving prescriptions:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get a single prescription by id
app.get('/prescriptions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('SELECT * FROM prescription WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Prescription not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error('Error retrieving prescription:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get prescriptions by customer id
app.get('/prescriptions/customer/:customerId', async (req, res) => {
    const { customerId } = req.params;
    try {
        const result = await client.query('SELECT * FROM prescription WHERE customer_id = $1', [customerId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error retrieving prescriptions:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a prescription by id
app.delete('/prescriptions/:prescription_id', async (req, res) => {
    const { prescription_id } = req.params;
    try {
        const result = await client.query('DELETE FROM prescription WHERE prescription_id = $1 RETURNING *', [prescription_id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Prescription not found' });
        } else {
            res.json({ message: 'Prescription deleted successfully', prescription: result.rows[0] });
        }
    } catch (err) {
        console.error('Error deleting prescription:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Create a new prescription
app.post('/prescriptions', async (req, res) => {
    const { customer_name, prescription_id, invoice_id, date } = req.body;
    try {
        const result = await client.query(
            'INSERT INTO prescription (customer_name, prescription_id, invoice_id, date) VALUES ($1, $2, $3, $4) RETURNING *',
            [customer_name, prescription_id, invoice_id, date]
        );
        res.status(201).json({ message: 'Prescription created successfully', prescription: result.rows[0] });
    } catch (err) {
        console.error('Error creating prescription:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
