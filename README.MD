# Bertie's Books – Lab 6

This is my Lab 6 solution for Dynamic Web Applications.

Features:
- MySQL database `berties_books`
- `/books/list` page listing books from the database
- `/books/addbook` page to add new books
- `/books/bargainbooks` for books under £20
- Search route `/books/search-result` (basic and/or LIKE search)

See `links.txt` for the deployed URL on doc.gold.ac.uk.

### dotenv

I used the dotenv module to remove hardcoded database credentials from index.js. 
I created a .env file containing DB_HOST, DB_USER, DB_PASS, and DB_NAME.

In index.js I added:

require('dotenv').config();

Then I changed the database connection to use process.env.* variables.

This prevents sensitive credentials from being visible in the code or on GitHub.

### audit

I created an audit table in MySQL storing:
- username
- success (1 for success, 0 for fail)
- timestamp

In /users/loggedin, I added code that inserts an audit row for each login 
attempt (both successful and failed).

I also added a route /users/audit that displays all login attempts using 
audit.ejs. This lets me view login history for security monitoring.
