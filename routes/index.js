const express = require('express');
const router = express.Router();


/* GET home page. */
router.get('/createColony', function(req, res, next) {
    res.json({status: 'OK', message: 'Welcome'});
});



module.exports = router;
