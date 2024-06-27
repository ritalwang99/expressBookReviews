const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    await new Promise((resolve, reject) => {
        resolve(res.status(200).json(books));
    })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  await new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    let book_details = books[isbn];
    resolve(res.status(200).json(book_details));
  })
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  await new Promise((resolve, reject) => {
    const author = req.params.author;
    let keys = Object.keys(books).filter((key) => books[key].author === author);
    let book_details = Object.entries(books).filter(([key]) => keys.includes(key));
    resolve(res.status(200).json(Object.fromEntries(book_details)));
  })
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    await new Promise((resolve, reject) => {
        const title = req.params.title;
        let keys = Object.keys(books).filter((key) => books[key].title === title);
        let book_details = Object.entries(books).filter(([key]) => keys.includes(key))
        resolve(res.status(200).json(Object.fromEntries(book_details)));
    })
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
