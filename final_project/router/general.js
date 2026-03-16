const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require("axios");
const public_users = express.Router();
const BASE_URL = "http://localhost:5001";

public_users.post("/register", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	if (!isValid(username, password)) {
		return res
			.status(400)
			.json({ message: "Username and password are not provided" });
	}
	const userExists = users.find((user) => user.username === username);
	if (userExists) {
		return res.status(400).json({ message: "Username already exists" });
	}
	users.push({ username, password });
	return res
		.status(201)
		.json({ message: `User ${username} registered successfully.` });
});

// Get the book list available in the shop
public_users.get("/books", function (req, res) {
	return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get("/books/isbn/:isbn", function (req, res) {
	const bookSelected = books[req.params.isbn] || {};
	return res.status(200).json(bookSelected);
});

// Get book details based on author
public_users.get("/books/author/:author", function (req, res) {
	const author = req.params.author;
	let bookSelected = Object.values(books).filter(
		(book) => book.author === author,
	);
	bookSelected = bookSelected.length > 0 ? bookSelected[0] : {};
	return res.status(200).json(bookSelected);
});

// Get all books based on title
public_users.get("/books/title/:title", function (req, res) {
	const title = req.params.title;
	let bookSelected = Object.values(books).filter(
		(book) => book.title === title,
	);
	bookSelected = bookSelected.length > 0 ? bookSelected[0] : {};
	return res.status(200).json(bookSelected);
});

// Get the book list using async + await
public_users.get("/", async function (req, res) {
	try {
		const results = await axios.get(BASE_URL + "/books");
		return res.status(200).json(results.data);
	} catch (err) {
		return res.status(500).json({ message: "Error retrieving books" });
	}
});

// Get book details based on ISBN using async + await
public_users.get("/isbn/:isbn", async function (req, res) {
	try {
		const results = await axios.get(
			BASE_URL + "/books/isbn/" + req.params.isbn,
		);
		return res.status(200).json(results.data);
	} catch (err) {
		return res.status(500).json({ message: "Error retrieving a book detail" });
	}
});

// Get book details based on author using async + await
public_users.get("/author/:author", async function (req, res) {
	try {
		const results = await axios.get(
			BASE_URL + "/books/author/" + req.params.author,
		);
		return res.status(200).json(results.data);
	} catch (err) {
		return res.status(500).json({ message: "Error retrieving a book detail" });
	}
});

// Get all books based on title using async + await
public_users.get("/title/:title", async function (req, res) {
	try {
		const results = await axios.get(
			BASE_URL + "/books/title/" + req.params.title,
		);
		return res.status(200).json(results.data);
	} catch (err) {
		return res.status(500).json({ message: "Error retrieving a book detail" });
	}
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
	const isbn = req.params.isbn;
	if (!books[isbn]) {
		return res.status(400).json({ message: "Book not found" });
	}
	if (!books[isbn]?.reviews || Object.keys(books[isbn].reviews).length === 0) {
		return res.status(404).json({ message: "No reviews found for this book" });
	}

	let reviews = books[isbn].reviews;
	return res.status(200).json(reviews);
});

module.exports.general = public_users;
