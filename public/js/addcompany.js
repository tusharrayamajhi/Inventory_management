document.getElementById("addcompany").addEventListener("submit",async(e)=>{
    e.preventDefault()
    let formdata = {}
    new FormData(document.getElementById("addcompany")).forEach((value,key)=>formdata[key]=value)

    try{
        const response = await fetch("/company/add",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(formdata)
        })
        const result = await response.json();
        console.log(result)
        if(response.status == 200){
            alert(result.message)
        } else{
            alert(result.message)
        }
    }catch(err){
        console.log(err)
        alert("something went wrong")
    }


})