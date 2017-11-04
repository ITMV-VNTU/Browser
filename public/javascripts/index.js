document.querySelector("#search_repo").addEventListener('click',function(){
    var parameters=document.querySelector("#repositori_name").nodeValue;

    var myInit = { method: 'POST',
                    headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        nameOfRepositori: parameters                        
                      })
                };

    fetch('/',myInit).then(function(response) {
        return response.json();
      }).then(function(data) {
        console.log(data)
      });

})