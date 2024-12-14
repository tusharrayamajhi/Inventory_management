document.querySelectorAll(".deleteunit").forEach(form=>{
    form.addEventListener("submit",async (e)=>{
        e.preventDefault()
        const deleteId = form.querySelector('input[name="id"]').value;
        const response = await fetch(`/unit/delete?id=${deleteId}`,{
            method:"DELETE"
        })
        response.json().then(result=>{
            if(response.status == 200){
                alert(result.message);
                window.location = "/unit/view"
            }else {
                alert(result.message)
            }
        }).catch(err=>{
            console.log(err)
        })
    })
})