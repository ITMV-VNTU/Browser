var express = require('express')
var fetch = require('node-fetch')
var urlapi = require('url')
var urlencode = require('urlencode');

var router = express.Router()

router.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

var otherlabels = [];
var comments = [];
var urlrepository = "";

var feature_integration = {
		min:null,
		max:null,
		mid:null,
	    value:null
	};

function clear(){
	var otherlabels = [];
    var comments = [];
    feature_integration = {
		min:null,
		max:null,
		mid:null,
	    value:null
	};
}


/* GET home page. */
router.get('/', function (req, res, next) {
  clear();
  res.render('index', { title: 'Express' })
})
/* Request GitHub API */
router.post('/getissues', function (req, res) {
  clear();
  var url = urlapi.parse(req.body.repositori_name)
  var urlres = 'https://api.github.com/repos' + url.pathname + '/issues'
  urlrepository = req.body.repositori_name;
  console.log(urlrepository);
  // console.log(urlres)
  fetch(urlres+'?page=1&per_page=100&state=all')
    .then(function (response) {
      return response.json()
      .then(function (arr) {
      	parseIssues(arr);
      	console.log(feature_integration);
        res.render('getLabels',{data:otherlabels})
      })
    })
})

/*Comments request*/
router.post('/getcomments', function (req, res) {
  var url = urlapi.parse(urlrepository)
  var urlres = 'https://api.github.com/repos' + url.pathname + '/pulls/comments'
  console.log("comments");
  fetch(urlres)
    .then(function (response) {
      return response.json()
      .then(function (arr) {
      	//console.log(arr);
        res.render('getComments',{data:arr})
      })
    })
})



/* create new Type of Label */
function creatNewtype (type, el, issue) {
  var othertype = {
    type: '',
    subtype: [],
    count_issues: 1
  }
  var newtype = othertype
  newtype.type = type
  var subt = {
        obj:el,
        url_st:'#',
        count:1,
        issues:[]
      }
  subt.url_st = urlrepository+'/labels/'+urlencode(el.name);
  subt.issues.push(issue);
  newtype.subtype.push(subt)
  otherlabels.push(newtype)
}
/*Create new SubType for label*/
function createNewSubType(ell, el, issue){
  var subt = {
        obj:el,
        url_st:'#',
        count:1,
        issues:[]
      }
      subt.url_st = urlrepository+'/labels/'+urlencode(el.name);
      subt.issues.push(issue);
      ell.subtype.push(subt);
      ell.count_issues++;
}

/* Search what type have label */
function searchType (type, el, issue) {
  var flag = false
  otherlabels.map(function (ell) {
    if (ell.type === type) {
      var fl = false;
      ell.subtype.map(function(elll){
        if(elll.obj.name === el.name){
          fl = true;
          elll.count++;
          ell.count_issues++;
          elll.issues.push(issue);
          //console.log(el.name);
        }
      });
      if(!fl){
        createNewSubType(ell,el,issue);
      }
      flag = true;
    }
  })
  if (!flag) {
    creatNewtype(type, el, issue);
  }
}

/* Parse all labels (default & users) */
function parseLabels (labelsarray, issue) {
  labelsarray.map(function (el) {
      var index = el.name.indexOf(':')
      var type = null
      if (index !== -1) {
        type = el.name.substring(0, index)
      } else {
        type = el.name
      }
      searchType(type, el, issue);
      //console.log(otherlabels)
  });
}

function parseIssues(issuearray){
    /* FI variables */ 
  var min = 0;
  var max = 0;
  var summ = 0;
  var count = 0;
  var mid = 0;
  var value = 0;
  var f = false;
  issuearray.map(function(el){
    parseLabels(el.labels, el);

    /* Found Feature integration*/
    if(el.closed_at===null) console.log('null');
    else{
			var r = (Date.parse(el.closed_at)-Date.parse(el.created_at))/ (1000*60*60*24);
			if(!f){
				min = r;
				f=true;
			}
			else{
				if(min>r) min = r;
			} 
			if(max<r) max = r;
			summ+=r;
			count++;
		}
  });
    mid = (summ/count);
	value = 100 - (mid*100)/max;
	feature_integration.min = Math.ceil(min);
	feature_integration.max = Math.ceil(max);
	feature_integration.mid = Math.ceil(mid);
	feature_integration.value = Math.ceil(value);
}

module.exports = router
