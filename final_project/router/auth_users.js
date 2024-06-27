const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    if (username) {
        let user = users.find((user) => user.username === username);
        if (user) {
            return true;
        }
    }
    return false;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let user = users.find((user) => user.username === username);
    if (user) {
        if (user.password !== password) {
            return false;
        } else {
            return true;
        }
    }
    return false;
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let filtered_book = books[isbn]
    if (filtered_book) {
        let review = req.query.review;
        let reviewer = req.session.authorization['username'];
        if (review) {
            filtered_book['reviews'][reviewer] = review;
            books[isbn] = filtered_book;
        }
        res.status(200).send(`Book with ISBN ${isbn}: Book Review Updated/Added`);
    } else {
        res.status(404).json({message: "Unable to find book with this ISBN"});
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let filtered_book = books[isbn]
    if (filtered_book) {
        let reviewer = req.session.authorization['username'];
        if (filtered_book['reviews'][reviewer]) {
            delete filtered_book['reviews'][reviewer];
            books[isbn] = filtered_book;
            res.status(200).json({message: "Successfully deleted your review"});

        } else {
            res.status(200).json({message: "There are no review which you have the permission to delete"});
        }
    } else {
        res.status(404).json({message: "Unable to find book with this ISBN"});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
