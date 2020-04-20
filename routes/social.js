var express = require('express');
var router = express.Router();
let coronaApi = require('../helpers/corona-api');

coronaApi('summary')
    .then(res => console.log(res))

router.get('/social', function(req, res, next) {
    res.render('social', { title: 'social'});
});

module.exports = router;
