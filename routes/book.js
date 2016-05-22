var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/book/mybooks');
});
router.get('/mybooks', function(req, res, next) {
	res.json(req.user);
	return;
	//res.render('mybooks', { title: 'Express' , user: req.user});
});

module.exports = router;
