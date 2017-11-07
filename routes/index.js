var express = require('express')
var fetch = require('node-fetch')
var urlapi = require('url')
var urlencode = require('urlencode');
var ghm = require("github-flavored-markdown");
var router = express.Router()

router.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

var otherlabels = [];
var comments = [];
var urlrepository = "";

var check = {
	notnull:true,
	gh_found:true,
	gh_limit:false
}

var feature_integration = {
		min:null,
		max:null,
		mid:null,
	    value:null,
	    color:null,
	    enable: false
	};

function clear(){
	otherlabels = [];
    comments = [];
    feature_integration = {
		min:null,
		max:null,
		mid:null,
	    value:null,
	    color:null,
	    enable:false
	};
}

function clearCheck(){
	check = {
	    notnull:true,
	    gh_found:true,
	    gh_limit:false
	};
}

/*Check Url*/
function checkUrl(url, res){
	if(url===null){
		check.notnull = false;
		res.render('index', { title: 'GIB', data:{check}});
	}
	else{
		var urlres = 'https://api.github.com/repos' + url.pathname + '/issues';
      fetch(urlres+'?page=1&per_page=1000&state=all')
        .then(function (response) {
          return response.json()
          .then(function (arr) {
          	if(arr.message=="Not Found"){
          		check.gh_found=false;
          		res.render('index', { title: 'GIB', data:{check}});
          	}
          	else if(!arr.message===undefined&&arr.message.indexOf("API rate limit exceeded")!=-1){
          		check.gh_limit=true;
          		res.render('index', { title: 'GIB', data:{check}});
          	}
          	else{
          		parseIssues(arr);
                res.render('getLabels',{data:{otherlabels,feature_integration,check}, title:'GIB:issues'});
          	}
          });
        });
	}
}

/* GET home page. */
router.get('/', function (req, res, next) {
  clear();
  clearCheck();
  res.render('index', { title: 'GIB', data:{check}});
})
/* Request GitHub API */
router.post('/getissues', function (req, res) {
  clear();
  clearCheck();
  var url = urlapi.parse(req.body.repositori_name);
  urlrepository = req.body.repositori_name;
  checkUrl(url, res);
})

/*Comments request*/
router.post('/getcomments', function (req, res) {
  clearCheck();
  var url = urlapi.parse(urlrepository);
  var urlres = 'https://api.github.com/repos' + url.pathname + '/pulls/comments';
  console.log("comments");
  fetch(urlres)
    .then(function (response) {
      return response.json()
      .then(function (arr) {
        for(var i=0;i<arr.length;i++){
          arr[i].body = ghm.parse(arr[i].body);
        }
        res.render('getComments',{data:{arr, check}, title:'GIB:comments'});
      })
    })
})
/* Get one issue */
router.post('/getIssue', function(req, res) {
  clearCheck();
  var url = urlapi.parse(req.body.issueUrl)
  var urlres = 'https://api.github.com' + url.pathname;
  urlIssue = req.body.issueUrl;
   //console.log(urlres)
  fetch(urlres)
    .then(function (response) {
      return response.json()
      .then(function (dat) {
      	fetch(dat.comments_url)
      	.then(function (ress){
      		return ress.json()
      		.then(function(comments){
            dat.body = ghm.parse(dat.body);
            comments.map(function(el){
              el.body = ghm.parse(el.body)
            })
      			res.render('get_issue',{data:{dat, check, comments}, title:'GIB:issue'});
      		})
      	})
      })
    })
});

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
  
    if(labelsarray.length === 0){
    	var type = "No labels";
    	var el = {
    		name: "No labels",
    		color: "0055ff"    	
    	}
    	searchType(type, el, issue);
    }
    else{
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
    if(el.closed_at===null);
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
	console.log(count);
	if(count==0){
		feature_integration.enable = false;
		feature_integration.color = "#909090";
	}
	else {
		feature_integration.enable = true;
		feature_integration.color = chooseColorForFI(value);
	}
}

/* Color FI functions*/ 
function chooseColorForFI(value){
	var g = Math.ceil((255*value)/100);
	var r = 255 - g;
	return rgbToHex(r,g,0);
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

module.exports = router
