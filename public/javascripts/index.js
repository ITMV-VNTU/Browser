/*
 * request to GitHub API
*/

function reqRepository () {
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
      })
    })
}
