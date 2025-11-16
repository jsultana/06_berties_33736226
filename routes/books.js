// Create a new router
const express = require('express');
const router = express.Router();
const db = global.db;

// Show the search form
router.get('/search', function (req, res, next) {
    res.render('search.ejs');
});

// Show the form to add a new book
router.get('/addbook', function (req, res, next) {
    res.render('addbook.ejs');
});

// Handle the form submission and insert a new book
router.post('/bookadded', function (req, res, next) {
    let sqlquery = "INSERT INTO books (name, price) VALUES (?, ?)";
    let newrecord = [req.body.name, req.body.price];

    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err);
        } else {
            res.send(
                'This book was added to the database: name = ' +
                req.body.name +
                ', price = ' +
                req.body.price
            );
        }
    });
});

// Handle search result - search for books by name (LIKE search)
router.get('/search-result', function (req, res, next) {
    let keyword = req.query.keyword;
    let sqlquery = "SELECT * FROM books WHERE name LIKE ?";
    let term = "%" + keyword + "%";

    db.query(sqlquery, [term], (err, result) => {
        if (err) {
            return next(err);
        }
        res.render("list.ejs", { availableBooks: result });
    });
});

// List all books from the database
router.get('/list', function (req, res, next) {
    const sqlquery = 'SELECT * FROM books'; // query database to get all the books

    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err); // pass error to Express error handler
        }
        res.render("list.ejs", { availableBooks: result });
    });
});

// List all books cheaper than £20 (bargain books)
router.get('/bargainbooks', function (req, res, next) {
    const sqlquery = 'SELECT * FROM books WHERE price < 20';

    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err);
        }
        res.render("list.ejs", { availableBooks: result });
    });
});

// Export the router object so index.js can access it
module.exports = router;
