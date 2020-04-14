var express = require('express');
var router = express.Router();


router.get('/social', function(req, res, next) {
    res.render('social', { title: 'social'});
});

module.exports = router;
