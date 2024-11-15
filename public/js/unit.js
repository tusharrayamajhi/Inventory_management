document.getElementById("unit_form").addEventListener("submit",async (e)=>{
    e.preventDefault();
    const formdata = {}
    new FormData(document.getElementById("unit_form")).forEach((value,key)=>formdata[key] = value);
    const response = await fetch("/unit/add",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(formdata)
    })
     response.json().then(result=>{
        alert(result.message)
     }).catch(err=>{
        alert(result.message)
     })
   
})