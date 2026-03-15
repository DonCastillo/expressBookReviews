const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

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
public_users.get("/", function (req, res) {
	const getBooks = new Promise((resolve, reject) => {
		resolve(books);
	});
	getBooks
		.then((books) => {
			return res.status(200).json(books);
		})
		.catch((er) => {
			return res.status(500).json({ message: "Error retrieving books" });
		});
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
	const getBookDetails = new Promise((resolve, reject) => {
		if (!books[req.params.isbn]) {
			reject("Book not found");
		} else {
			resolve(books[req.params.isbn]);
		}
	});
	getBookDetails
		.then((bookDetails) => {
			return res.status(200).json(bookDetails);
		})
		.catch((err) => {
			return res.status(400).json({ message: err });
		});
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
	const getBookDetails = new Promise((resolve, reject) => {
		const author = req.params.author;
		let bookSelected = Object.values(books).filter(
			(book) => book.author === author,
		);
		if (!bookSelected[0] || bookSelected.length === 0) {
			reject("Book not found");
		} else {
			resolve(bookSelected[0]);
		}
	});

	getBookDetails
		.then((bookDetails) => {
			return res.status(200).json(bookDetails);
		})
		.catch((err) => {
			return res.status(400).json({ message: err });
		});
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
	const title = req.params.title;
	let bookSelected = Object.values(books).filter(
		(book) => book.title === title,
	);
	bookSelected = bookSelected.length > 0 ? bookSelected[0] : {};
	return res.status(200).json(bookSelected);
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
	const isbn = req.params.isbn;
	let reviews = books[isbn] ? books[isbn]?.reviews : {};
	return res.status(200).json(reviews);
});

module.exports.general = public_users;
