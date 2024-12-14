document.getElementById('adduser').addEventListener("submit",async(e)=>{
    e.preventDefault()
    let formdata = new FormData(document.getElementById("adduser"))
    try{
        const response = await fetch("/user/add",{
            method:"POST",
            body:formdata
        })
        const result = await response.json()
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