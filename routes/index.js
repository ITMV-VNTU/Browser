var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/', function(req, res){
  fetch('https://api.github.com/repos/facebook/react/issues',{method:'GET'}).then(function(response) {
  //res.send(response);
  console.log(response)
  })
})
module.exports = router;
