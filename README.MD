# Bertie's Books – Dynamic Web Applications (Lab 6, Lab 7 & Lab 8a)

This repository contains my Lab 6, Lab 7, and Lab 8a work for the Dynamic Web Applications module.  
The project is a Node.js and Express web application using a MySQL database.  
It demonstrates dynamic routing, database integration, password hashing, audit logging, dotenv configuration, session management, and deployment on the Goldsmiths VM.

---

## Lab 6 Features

### Books Functionality
- MySQL database: `berties_books`
- `/books/list` — list all books
- `/books/addbook` — add a new book through a form
- `/books/search-result` — search using SQL `LIKE`
- `/books/bargainbooks` — list books priced under £20

All book pages are rendered using EJS templates.

---

## Lab 7 Features

### Password Hashing (bcrypt)
- User registration (`/users/register`)
- Passwords are hashed using bcrypt before being stored in the database
- Login validation uses `bcrypt.compare` to securely check hashed passwords

### Audit Logging
The `audit` table stores:
- `username`
- `success` (1 for success, 0 for failure)
- `timestamp` (defaults to current time)

Every login attempt inserts a new row into this table.  
`/users/audit` displays audit entries using an EJS template.

### dotenv (Security)
To avoid hardcoding database credentials:
- A `.env` file was created containing database connection details
- These variables are loaded using `dotenv` and accessed in `index.js`

---

## Lab 8a Features (Authorisation & Sessions)

### Access Control Summary

In Lab 8a, I added access control using `express-session` so that certain routes are only accessible to logged-in users.

### Protected Routes (require login)

The following pages use the `redirectLogin` middleware and require an active session:

- `/users/list`
- `/books/list`
- `/books/addbook`
- `/books/search`
- `/books/search-result`
- `/books/bargainbooks`
- `/books/bookadded`

These routes interact with the database or show user/book information, so they are restricted for security.

### Public Routes (no login required)
- Home page (`/`)
- Login page (`/users/login`)
- Registration page (`/users/register`)
- About page (`/about`)

These routes are intentionally public so new users can register and existing users can log in.

### Logout
A logout route (`/logout`) was implemented in `main.js`.  
This destroys the user's session and prevents access to protected pages until the user logs in again.

## Lab 8b – Validation and Sanitisation

For this lab I added server-side input validation using `express-validator` to prevent invalid data from being submitted during registration. The checks I implemented are:

- `email` must be a valid email format  
- `username` must be between 5 and 20 characters  
- `password` must be at least 8 characters  
- `first` and `last` name fields cannot be empty  

If validation fails, the registration page is shown again without inserting anything into the database.

I also added basic sanitisation using `express-sanitizer` on the first name field to protect against simple XSS attacks. Before inserting the data, `req.sanitize(req.body.first)` removes any potentially harmful HTML/JavaScript (e.g. `<script>alert("XSS")</script>`). This ensures that even if a user attempts to inject a script into the form, it is cleaned before being processed or displayed.


---

