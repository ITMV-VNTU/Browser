
let buglabels = []
let questionlabels = []
let enchancementlabels = []
let featurelabels = []
let otherlabels = []
/*
 * clear Labels
*/
function clearLabels () {
  buglabels = []
  questionlabels = []
  enchancementlabels = []
  featurelabels = []
  otherlabels = []
}

/*
 * request to GitHub API
*/
function reqRepository () {
  clearLabels()
  var urlrepository = document.getElementById('repositori_name').value
  var url = 'http://localhost:3000/getissues'
  console.log(url)
  var data = new FormData()
  data.append('json', JSON.stringify({url: urlrepository}))
  fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: new Headers({
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({url: urlrepository})
  })
    .then(function (res) {
      res.json().then(function (data) {
        console.log(data)
        parseLabels(data)
        changeView()
      })
    })
}

/* This shit must be better (kostil) */
function changeView () {
  var labellist = document.getElementById('label_list')
  console.log(labellist)
  otherlabels.map(function (el) {
    var sublist = ''
    el.subtype.map(function (ell) {
      sublist += '<li>' + ell.name + '</li>'
    })
    labellist.innerHTML += '<li><div><h4>Label type:' + el.type + ' Number:' + el.subtype.length + '</h4></div><div><ul>' + sublist + '</ul></div></li>'
  })
}
/* create new Type of Label */
function creatNewtype (type, el) {
  let othertype = {
    type: '',
    subtype: []
  }
  var newtype = othertype
  newtype.type = type
  newtype.subtype.push(el)
  otherlabels.push(newtype)
}
/* Search what type have label */
function searchType (type, el) {
  let flag = false
  otherlabels.map(function (ell) {
    if (ell.type === type) {
      ell.subtype.push(el)
      flag = true
    }
  })
  if (!flag) {
    creatNewtype(type, el)
  }
}
/* Parse all labels (default & users) */
function parseLabels (labelsarray) {
  labelsarray.map(function (el) {
    if (!el.default) {
      var index = el.name.indexOf(':')
      var type = null
      if (index !== -1) {
        type = el.name.substring(0, index)
      } else {
        type = el.name
      }
      searchType(type, el)
      console.log(otherlabels)
    } else {
      if (el.type === 'bug') {
        buglabels.push(el)
      } else if (el.type === 'question') {
        questionlabels.push(el)
      } else if (el.type === 'enchancement') {
        enchancementlabels.push(el)
      } else {
        featurelabels.push(el)
      }
    }
  })
}
