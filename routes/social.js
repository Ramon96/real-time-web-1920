var express = require('express');
var router = express.Router();
let coronaApi = require('../helpers/corona-api');

// dit kan weg als server sided lukt
coronaApi('live/country/netherlands/status/confirmed')
    .then(res => {
        // console.log(res)
        // const netherlands = res.find(entry => {
        //     console.log(entry)
        //     // if(entry == "NL"){
        //     //     return entry;
        //     // }
        // })
        // console.log(netherlands)

    })

router.get('/social', function(req, res, next) {
    res.render('social', { title: 'social'});
});

module.exports = router;
