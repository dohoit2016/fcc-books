var express = require('express');
var router = express.Router();
var User = require('mongoose').model('User');
var Trade = require('mongoose').model('TradeRequest');
var request = require('request');

/* GET home page. */

// add a book with googleBookId passed in request.body to current user.
router.post('/add', isLoggedIn, function (req, res, next) {
	User.findById(req.user.id, function (err, user) {
		if (err || !user){
			return res.redirect('/book/mybooks');
		}
		var googleBookId = req.body.googleBookId;
		var books = user.books;
		for (var i = 0; i < books.length; i++) {
			if (books.indexOf(googleBookId) >= 0){
				return res.json({status: "err", errorMessage: "This book has already been added."});
			}
		}
		request.get("https://www.googleapis.com/books/v1/volumes/" + googleBookId, function (err, response, body) {
			if (err){
				console.log(err);
				return res.json({status: 'err', errorMessage: 'Error while getting book information.'});
			}
			body = JSON.parse(body);
			if (body){
				var book = {
					title: body.volumeInfo.title,
					googleBookId: googleBookId,
					thumbnail: body.volumeInfo.imageLinks.extraLarge
				};
				user.books.push(book);
				user.save(function (err) {
					if (err){
						console.log(err);
						return res.json({status: "err", errorMessage: "Error while updating user."});
					}
					res.json({
						status: "OK",
					})
				})
			}
			else {
				return res.json({
					status: 'err',
					errorMessage: "Book not found."
				})
			}
		})
	})
})

router.post('/search', function (req, res, next) {
	var title = req.body.title;
	request.get('https://www.googleapis.com/books/v1/volumes?q=' + title, function (err, response, body) {
		if (err){
			console.log(err);
			return res.json({status: 'err', errorMessage: 'Error while search book information.'});
		}

		body = JSON.parse(body);
		if (body){
			var count = parseInt(body.totalItems);
			// console.log(count);
			if (count == 0){
				return res.json({
					status: "err",
					errorMessage: "No book found."
				});
			}
			var items = body.items;
			var result = {status: "OK", count: count, data: []};
			for (var i = 0; i < items.length; i++) {
				var item = {};
				item.title = items[i].volumeInfo.title;
				item.googleBookId = items[i].id;
				console.log(i);
				if (typeof(items[i].volumeInfo.imageLinks) !== 'undefined')
					item.thumbnail = items[i].volumeInfo.imageLinks.thumbnail;
				result.data.push(item);
			};
			return res.json(result);
		}
		return res.json({
			status: 'err',
			errorMessage: "Book not found."
		})
	})
})

router.get('/delete/:bookId', isLoggedIn, function (req, res, next) {
	var bookId = req.params.bookId;
	User.findById(req.user.id, function (err, user) {
		if (err || !user){
			console.log('err');
			res.redirect('/book/mybooks');
			return;
		}
		if (user){
			var books = user.books;
			for (var i = 0; i < books.length; i++) {
				var book = books[i];
				if (bookId == book._id){
					user.books.splice(i, 1);
					user.save(function (err) {
						if (err){
							console.log(err);
						}
						res.redirect('/book/mybooks');
					})
					return;
				}
			}
		}
	})
})

router.get('/getall', function (req, res, next) {
	var books = [];
	User.find({}, function (err, users) {
		if (err || !users){
			return res.json({status: 'err', errorMessage: "Error while reading db."});
		}
		// for (var i = 0; i < users.length; i++) {
		// 	books.push({user: users[i]});
		// }
		var result = [];
		for (var i = 0; i < users.length; i++) {
			var u = {}
			u.books = users[i].books;
			u._id = users[i]._id;
			result.push(u);
		}
		return res.json({
			status: "OK",
			data: result
		})
	})
})

router.post('/trade/add', isLoggedIn, function (req, res, next) {
	var fromId = req.user.id;
	var toId = req.body.toId;
	var bookId = req.body.bookId;
	var bookTitle = req.body.bookTitle;
	if (toId == fromId){
		return res.json({
			status: 'err',
			errorMessage: 'You cannot trade with yourself.'
		})
	}
	Trade.find({
		fromId: fromId,
		bookId: bookId
	}, function (err, trades) {
		if (err){
			console.log(err);
			return res.json({
				status: "err",
				errorMessage: "An Error"
			})
		}
		if (trades.length > 0){
			return res.json({
				status: "err",
				errorMessage: "Already sent request."
			})
		}
		var newTrade = new Trade();
		newTrade.fromId = fromId;
		newTrade.bookId = bookId;
		newTrade.toId = toId;
		newTrade.bookTitle = bookTitle;
		newTrade.processed = 0;
		newTrade.save(function (err) {
			if (err){
				console.log(err);
				return res.json({
					status: "err",
					errorMessage: "Error while saving."
				})
			}
			res.json("OK");
		})
	})
});

router.post('/trade/cancel', isLoggedIn, function (req, res, next) {
	var tradeId = req.body.tradeId;
	Trade.findById(tradeId, function (err, trade) {
		if (err || !trade || (trade.fromId != req.user.id)){
			return res.json({
				status: "OK"
			})
		}
		trade.remove(function (err) {
			if (err){
				console.log(err);
			}
			return res.json({
				status: "OK"
			})
		})
	})
})

router.post('/trade/accept', isLoggedIn, function (req, res, next) {
	var tradeId = req.body.tradeId;
	Trade.findById(tradeId, function (err, trade) {
		if (err || !trade || (trade.toId != req.user.id)){
			return res.json({
				status: "OK"
			})
		}
		trade.processed = 1;
		trade.save(function (err) {
			if (err){
				console.log(err);
			}
			return res.json({
				status: "OK"
			})
		})
	})
})

router.post('/trade/deny', isLoggedIn, function (req, res, next) {
	var tradeId = req.body.tradeId;
	Trade.findById(tradeId, function (err, trade) {
		if (err || !trade || (trade.toId != req.user.id)){
			return res.json({
				status: "OK"
			})
		}
		trade.remove(function (err) {
			if (err){
				console.log(err);
			}
			return res.json({
				status: "OK"
			})
		})
	})
})

router.post('/trade/get/incoming', isLoggedIn, function (req, res, next) {
	Trade.find({
		toId: req.user.id
	}, function (err, trades) {
		if (err){
			console.log(err);
			return res.json({
				status: 'OK',
				data: []
			})
		}
		return res.json({
			status: 'OK',
			data: trades
		})
	})
});

router.post('/trade/get/outgoing', isLoggedIn, function (req, res, next) {
	Trade.find({
		fromId: req.user.id
	}, function (err, trades) {
		if (err){
			console.log(err);
			return res.json({
				status: 'OK',
				data: []
			})
		}
		return res.json({
			status: 'OK',
			data: trades
		})
	})
});

router.post('/delete', isLoggedIn, function (req, res, next) {
	// Delete book. Do later.
})
function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect("/users/login");
}

module.exports = router;
