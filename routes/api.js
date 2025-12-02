var express = require('express');
var router = express.Router();

// use the global db connection you set in index.js (global.db = db)
const db = global.db;

// GET /api/books
router.get('/books', function (req, res, next) {

    let sqlquery = 'SELECT * FROM books';
    let params = [];
    let conditions = [];

    // Optional search parameter: /api/books?search=word
    if (req.query.search) {
        conditions.push('name LIKE ?');
        params.push('%' + req.query.search + '%');
    }

    // Optional minprice: /api/books?minprice=10
    if (req.query.minprice) {
        conditions.push('price >= ?');
        params.push(req.query.minprice);
    }

    // Optional maxprice: /api/books?maxprice=20
    if (req.query.maxprice) {
        conditions.push('price <= ?');
        params.push(req.query.maxprice);
    }

    if (conditions.length > 0) {
        sqlquery += ' WHERE ' + conditions.join(' AND ');
    }

    // Optional sort: /api/books?sort=name or /api/books?sort=price
    if (req.query.sort) {
        if (req.query.sort === 'name') {
            sqlquery += ' ORDER BY name';
        } else if (req.query.sort === 'price') {
            sqlquery += ' ORDER BY price';
        }
    }

    db.query(sqlquery, params, (err, result) => {
        if (err) {
            res.json(err);   // return the error as JSON
            return next(err);
        } else {
            res.json(result); // return the rows as JSON
        }
    });
});




module.exports = router;
