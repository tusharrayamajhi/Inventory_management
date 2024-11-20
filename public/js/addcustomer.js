document.getElementById("addcustomerform").addEventListener("submit",async(e)=>{
    e.preventDefault();

    let formdata ={}
    new FormData(document.getElementById("addcustomerform")).forEach((value,key)=>formdata[key] = value)
    console.log(formdata)
    try{
        const response = await fetch("/customer/add",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"

            },
            body:JSON.stringify(formdata)
        })
        const result= await response.json();
        console.log(result)
    }catch(err){
        console.log(err)
        alert("something went wrong")
    }
})