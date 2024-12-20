document.getElementById("editunit").addEventListener('submit',async(e)=>{
    e.preventDefault();
    let formdata = {}
    new FormData(document.getElementById('editunit')).forEach((value,key)=>formdata[key] = value)
    const response = await fetch("/unit/edit",{
        method:"PATCH",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(formdata)
    })
    response.json().then(result =>{
        alert(result.message)
    }).catch(err=>{
        console.log(err)
        alert(err)
    })
})