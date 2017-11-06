var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
    acc[i].onclick = function(){
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
    }
}

document.querySelectorAll('.get_issue').forEach(function(elem){
    elem.addEventListener('click',function(){
        elem.parentNode.submit()
    })
})

/*document.querySelectorAll('.get_issue').forEach(function(element){
    element.addEventListener('click',function(){
        
        var body_data={
            issue_url:this.attributes['dataurl'].value
        }
        console.log(body_data)
        var fechData={
            method:'POST',
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(body_data)
        }
        fetch('/getIssue',fechData)
        .then(function(response){
            return response.text();
        })
    })
})
*/
