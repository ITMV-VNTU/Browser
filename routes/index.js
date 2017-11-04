var express = require('express')
var fetch = require('node-fetch')
var urlapi = require('url')

var router = express.Router()

router.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

/* GET home page. */

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})
/* Request GitHub API */
router.post('/getissues', function (req, res) {
  var url = urlapi.parse(req.body.repositori_name)
  var urlres = 'https://api.github.com/repos' + url.pathname + '/labels'

  // console.log(urlres)
  fetch(urlres)
    .then(function (response) {
      return response.json()
      .then(function (arr) {
        console.log(arr[0].color);
        res.render('getLabels',{data:arr})
      })
    })
})

module.exports = router

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

