var express = require('express');
var router = express.Router();

router.all('/', (req,res) => {
    res.render('index.ejs');
});


module.exports = router;