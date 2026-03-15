const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username, password) => {
	if (!username || !password) {
		return false;
	}
	return true;
};

const authenticatedUser = (username, password) => {
	const selectedUser = users.find(
		(user) => user.username === username && user.password === password,
	);
	return !!selectedUser;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	if (!isValid(username, password)) {
		return res
			.status(400)
			.json({ message: "Username and password are not provided" });
	}

	if (authenticatedUser(username, password)) {
		let accessToken = jwt.sign({ data: password }, "access", {
			expiresIn: 60 * 60,
		});
		req.session.authorization = {
			accessToken,
			username,
		};
		return res.status(200).json({ message: "User successfully logged in" });
	}

	return res.status(400).json({ message: "Invalid login" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
	const isbn = req.params.isbn;
	const review = req.body.review;
	const username = req.session.authorization.username;

	if (!books[isbn]) {
		return res.status(404).json({ message: "Book not found" });
	}

	books[isbn].reviews[username] = review;

	return res.status(201).json({ message: "Review added/updated successfully" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
	const isbn = req.params.isbn;
	const username = req.session.authorization.username;

	if (!books[isbn]) {
		return res.status(404).json({ message: "Book not found" });
	}

	if (!books[isbn].reviews[username]) {
		return res.status(404).json({ message: "Review not found" });
	}

	delete books[isbn].reviews[username];
	return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
