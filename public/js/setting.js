document.getElementById("changepassword").addEventListener("submit",async(e)=>{
    e.preventDefault()
    let formdata = {}
    new FormData(document.getElementById("changepassword")).forEach((value,key)=>formdata[key] = value)
    try{
        const response = await fetch("/setting/changepassword",{
            method:"POST",
            headers:{
            "Content-Type":"application/json"
            },
            body:JSON.stringify(formdata)
        })
        const result = await response.json()
        if(response.status == 200){
            alert(result.message)
        }else{
            console.log(result)
        }
    }catch(err){
        alert("something went wrong")
    }
})