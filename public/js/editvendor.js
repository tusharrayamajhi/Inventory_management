document.getElementById('editvendor').addEventListener("submit",async(e)=>{
    e.preventDefault()
    let formdata = {}
    new FormData(document.getElementById("editvendor")).forEach((value,key)=>formdata[key] = value)
console.log(formdata)
    try{
        const response = await fetch("/vendor/edit",{
            method:"PATCH",
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