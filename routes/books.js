// Create a new router
const express = require('express');
const router = express.Router();

// Show the search form
router.get('/search', function (req, res, next) {
    res.render('search.ejs');
});

// Handle search result (just echoing the keyword for now)
router.get('/search-result', function (req, res, next) {
    res.send('You searched for: ' + req.query.keyword);
});

// List all books from the database
router.get('/list', function (req, res, next) {
    const sqlquery = 'SELECT * FROM books'; // query database to get all the books

    db.query(sqlquery, (err, result) => {
        if (err) {
            return next(err); // pass error to Express error handler
        }
        res.send(result); // send back data as JSON
    });
});

// Export the router object so index.js can access it
module.exports = router;
