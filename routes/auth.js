var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('mongoose').model('User');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/auth/login');
});

router.get("/login", function (req, res) {
	res.render("login", {message: req.flash("loginMessage"), title: "Login", user: req.user});
});

router.post("/login", passport.authenticate('local-login', {
	successRedirect: "/book/mybooks",
	failureRedirect: "login",
	failureFlash: true
}));

router.get("/failure", function (req, res) {
	res.end("failure");
});

router.get('/logout', function (req, res) {
	req.logout();
	res.redirect('login');
})


router.get("/signup", function (req, res) {
	res.render("signup", {message: req.flash("signupMessage"), title: "Register", user: req.user})
});

router.post("/signup", passport.authenticate('local-signup', {
	successRedirect: '/book/mybooks',
	failureRedirect: 'signup',
	failureFlash: true
}));

router.get('/settings', isLoggedIn, function (req, res, next) {
	res.render('settings', {title: 'Settings', user: req.user});
})

router.post('/settings', isLoggedIn, function (req, res, next) {
	User.findById(req.user, function (err, user) {
		if (err || !user){
			console.log(err);
			return res.redirecr('/book/mybooks');
		}
		user.fullname = req.body.fullname;
		user.city = req.body.city;
		user.state = req.body.state;
		user.save(function (err) {
			return res.redirect('/book/mybooks');
		})
	})
})

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect("/users/login");
}

module.exports = router;
