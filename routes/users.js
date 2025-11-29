// Create a new router
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Get the database connection from global (set in index.js)
const db = global.db;

const { check, validationResult } = require('express-validator');


// Access control middleware
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('./login'); // Not logged in → redirect to login
    } else {
        next(); // Logged in → continue
    }
};

// ------------------------
// Registration routes
// ------------------------

router.get('/register', function (req, res, next) {
    res.render('register.ejs');
});

router.post(
    '/registered',
    [
        check('email').isEmail(),
        check('username').isLength({ min: 5, max: 20 }),
        check('password').isLength({ min: 8 }),
        check('first').notEmpty(),
        check('last').notEmpty()
    ],
    function (req, res, next) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('register.ejs');
        }

        const plainPassword = req.body.password;

        // ⭐ SANITISE FIRST NAME (Task 6)
        const first = req.sanitize(req.body.first);

        bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
            if (err) {
                console.log(err);
                return res.send("Error hashing password");
            }

            // Insert into database
            let sql = `
            INSERT INTO users (username, first, last, email, hashedPassword)
            VALUES (?, ?, ?, ?, ?)
        `;

            db.query(sql, [
                req.body.username,
                first,               // ⭐ use sanitised first name
                req.body.last,
                req.body.email,
                hashedPassword
            ], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.send("Database error");
                }

                // DEBUG MESSAGE (for Lab 7)
                let output = "";
                output += `Hello ${first} ${req.body.last}, you are now registered!<br>`;  // ⭐ use sanitised first
                output += `We will send an email to you at ${req.body.email}.<br><br>`;
                output += `Your password is: ${plainPassword}<br>`;
                output += `Your hashed password is: ${hashedPassword}`;

                res.send(output);
            });
        });

    });


// ------------------------
// List users route
// ------------------------

router.get('/list', redirectLogin, function (req, res, next) {
    const sql = "SELECT username, first, last, email FROM users";

    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.send("Database error");
        }

        res.render('userlist.ejs', { users: results });
    });
});

// ------------------------
// Login routes
// ------------------------

router.get('/login', function (req, res, next) {
    res.render('login.ejs');
});

router.post('/loggedin', function (req, res, next) {

    const username = req.body.username;
    const plainPassword = req.body.password;
    const auditSQL = "INSERT INTO audit (username, success) VALUES (?, ?)";
    const sql = "SELECT hashedPassword FROM users WHERE username = ?";

    db.query(sql, [username], (err, results) => {
        if (err) {
            console.log(err);
            return res.send("Database error.");
        }

        if (results.length === 0) {
            // No such username → log failed attempt
            db.query(auditSQL, [username, 0], (err2) => {
                if (err2) console.log(err2);
                return res.send("Login failed: invalid username or password.");
            });
            return;
        }

        const hashedPassword = results[0].hashedPassword;

        bcrypt.compare(plainPassword, hashedPassword, function (err, match) {
            if (err) {
                console.log(err);
                return res.send("Error comparing passwords.");
            }

            if (match) {
                // ⭐ Save user in session on successful login
                req.session.userId = username;

                // Successful login → log success
                db.query(auditSQL, [username, 1], (err2) => {
                    if (err2) console.log(err2);
                    return res.send("Login successful! Welcome, " + username + ".");
                });
            } else {
                // Wrong password → log failed attempt
                db.query(auditSQL, [username, 0], (err2) => {
                    if (err2) console.log(err2);
                    return res.send("Login failed: invalid username or password.");
                });
            }
        });
    });
});

// ------------------------
// Audit route
// ------------------------

router.get('/audit', function (req, res, next) {
    const sql = "SELECT username, success, timestamp FROM audit ORDER BY timestamp DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.send("Database error");
        }

        res.render('audit.ejs', { logs: results });
    });
});

// ------------------------
// Export the router
// ------------------------

module.exports = router;
