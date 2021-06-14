var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('twitter/about', { title: 'About' });
});

router.get('/about', function(req, res, next) {
  res.render('twitter/about', { title: 'About' });
});

router.get('/recent', function(req, res, next) {
  res.render('twitter/recent', { title: 'About' });
});

router.get('/daily', function(req, res, next) {
  res.render('twitter/daily', { title: 'About' });
});

router.get('/weekly', function(req, res, next) {
  res.render('twitter/weekly', { title: 'About' });
});

module.exports = router;
