document.getElementById('edituser').addEventListener("submit",async(e)=>{
    e.preventDefault()
    let formdata = {}
    new FormData(document.getElementById("edituser")).forEach((value,key)=>formdata[key] = value)
    console.log(formdata)
    try{
        const response = await fetch("/user/edit",{
            method:"PATCH",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(formdata)
        })
        const result = await response.json()
        console.log(result)
        if(response.status == 200){
            alert(result.message);
        }else{
            alert(result.message);
        }
    }catch(err){
        console.log(err)
        alert("something went wrong")
    }
})