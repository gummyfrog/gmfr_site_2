var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('hub', { title: 'LINK HUB' });
});

router.get('/screenshots', function(req, res, next) {
  res.render('screenshots', { title: 'SCREENS' });
});

router.get('/cw_faq_br', function(req, res, next) {
  res.render('cw_faq_br', { title: 'cwfaq' });
});

module.exports = router;
