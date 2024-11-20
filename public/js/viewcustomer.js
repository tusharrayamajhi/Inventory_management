document.querySelectorAll(".deletecustomer").forEach(form=>{
    form.addEventListener("submit",async(e)=>{
        e.preventDefault()
        const deleteId = form.querySelector("input[name='id']").value
        console.log(deleteId)
        try{

            const response = await fetch(`/customer/delete?id=${deleteId}`,{
                method:"DELETE"
            })
            const result = await response.json();
            console.log(result)
            if(response.status == 200){
                alert(result.message)
                window.location = "/customer/view"
            }else{
                alert(result.message)
            }
        }catch(err){
            console.log(err)
            alert(err)
        }
    })

})