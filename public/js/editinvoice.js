document.querySelector('.update').addEventListener("click",async()=>{
    let formsdata = []
    document.querySelectorAll(".editinvoice").forEach(form=>{
        let temp = {}
        temp.invoices_id = form.querySelector(".invoices_id").value
        temp.status = form.querySelector(".status").value
        temp.remark = form.querySelector(".remark").value
        formsdata.push(temp)
        temp = {}
    })
    console.log(formsdata)
    try{    
        const response = await fetch("/invoice/edit",{
            method:"PATCH",
            headers:{
                "Content-Type": "application/json",
            },
            body:JSON.stringify(formsdata)
        })
        const result = await response.json()
        console.log(result)
        if(response.status == 200){
            alert(result.message)
        }else{
            alert(result.message)
        }
    }catch(err){
        console.log(err)
        alert("something went wrong")
    }
    console.log(formsdata)
})

