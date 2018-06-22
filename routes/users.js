const express = require('express');
const router = express.Router();
const request = require('request');

/* GET users listing. */
router.get('/accounts', function(req, res, next) {
    res.redirect('http://localhost:3030/accounts');
});

module.exports = router;
