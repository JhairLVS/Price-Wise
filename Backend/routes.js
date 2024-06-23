const express = require('express');
const db = require('../db/database');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/usuarios', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); 

        db.query(
            'INSERT INTO usuario (email, password) VALUES (?, ?)',
            [email, hashedPassword],
            (err, results) => {
                if (err) {
                    console.error('Error creating user:', err);
                    res.status(500).send('An error occurred while creating the user.');
                } else {
                    res.status(201).send('User created successfully.');
                }
            }
        );
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).send('An error occurred while hashing the password.');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      
        db.query(
            'SELECT * FROM usuario WHERE email = ?',
            [email],
            async (err, results) => {
                if (err) {
                    console.error('Error fetching user:', err);
                    res.status(500).send('An error occurred while fetching the user.');
                } else {
                    if (results.length > 0) {
                        
                        const match = await bcrypt.compare(password, results[0].password);
                        if (match) {
                            res.status(200).send('Login successful.');
                        } else {
                            res.status(401).send('Invalid email or password.');
                        }
                    } else {
                        res.status(401).send('Invalid email or password.');
                    }
                }
            }
        );
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('An error occurred while logging in.');
    }
});

module.exports = router;
