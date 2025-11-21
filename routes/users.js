// Create a new router
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Get the database connection from global (set in index.js)
const db = global.db;

// ------------------------
// Registration routes
// ------------------------

router.get('/register', function (req, res, next) {
    res.render('register.ejs');
});

router.post('/registered', function (req, res, next) {

    const plainPassword = req.body.password;

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
            req.body.first,
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
            output += `Hello ${req.body.first} ${req.body.last}, you are now registered!<br>`;
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

router.get('/list', function (req, res, next) {
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
// Export the router
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

module.exports = router;
