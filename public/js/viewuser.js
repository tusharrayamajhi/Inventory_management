document.querySelectorAll(".deleteuser").forEach(form=>{
    form.addEventListener("submit",async(e)=>{
        e.preventDefault()
        const deleteId = form.querySelector("input[name='id']").value
        try{

            const response = await fetch(`/user/delete?id=${deleteId}`,{
                method:"DELETE"
            })
            const result = await response.json();
            if(response.status == 200){
                alert(result.message)
                // window.location = "/user/view"
                window.location.reload()
            }else{
                alert(result.message)
            }
        }catch(err){
            console.log(err)
            alert(err)
        }
    })

})


document.getElementById("changepassword").addEventListener("submit",async(e)=>{
    e.preventDefault()
    let formdata = {}
    new FormData(document.getElementById("changepassword")).forEach((value,key)=>formdata[key]= value);
    try{
        const response = await fetch("/users/changepassword",{
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
        console.log(err)
        alert("something went wrong")
    }
})