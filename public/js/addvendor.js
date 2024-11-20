document.getElementById('addvendor').addEventListener("submit",async(e)=>{
    e.preventDefault()
    let formdata = {}
    new FormData(document.getElementById("addvendor")).forEach((value,key)=>formdata[key] = value)

    try{
        const response = await fetch("/vendor/add",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(formdata)
        })
        const result = await response.json()
        console.log(result)
        if(response.status == 200){
            alert(result.message)
        }else{
            alert(result.message)
        }
    }catch(err){
        alert("something went wrong")
    }
})