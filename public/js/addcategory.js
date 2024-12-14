document.getElementById("addcategoryForm").addEventListener("submit",async(e)=>{
    e.preventDefault()
    let formdata = {}
    new FormData(document.getElementById("addcategoryForm")).forEach((value,key)=>formdata[key] = value)
    try{
        const response = await fetch("/category/add",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(formdata)
        })
        const result = await response.json();
        if(response.status == 200){
            alert(result.message)
        }else{
            alert(result.message)
        }
    }catch(err){
        alert(err)
    }
})