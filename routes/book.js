var express = require('express');
var router = express.Router();
var User = require('mongoose').model('User');
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/book/mybooks');
});

router.get('/mybooks', isLoggedIn, function (req, res, next) {
	User.findById(req.user.id, function (err, user) {
		if (err || !user){
			return res.render('mybooks', { title: 'My Books' , user: req.user, books: []});
		}
		return res.render('mybooks', { title: 'My Books' , user: req.user, books: req.user.books});
	})
});

router.get('/requests', isLoggedIn, function (req, res, next) {
	res.render('requests', { title: 'My Requests' , user: req.user})
})

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect("/users/login");
}

module.exports = router;
