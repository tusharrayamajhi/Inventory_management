if (localStorage.getItem("success") != null) {
    document.getElementById("message").innerText =localStorage.getItem("success")
    document.getElementById("messagebox").style.display = "block";
    setTimeout(() => {
      document.getElementById("messagebox").style.display = "none";
      localStorage.removeItem("success");
    }, 1000);
  }
  if (localStorage.getItem("error") != null) {
    document.getElementById("err_message").innerText =localStorage.getItem("error")
    document.getElementById("error_message_box").style.display = "block";
    setTimeout(() => {
      document.getElementById("error_message_box").style.display = "none";
      localStorage.removeItem("error");
    }, 1000);
  }

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
    try{    
        const response = await fetch("/invoice/edit",{
            method:"PATCH",
            headers:{
                "Content-Type": "application/json",
            },
            body:JSON.stringify(formsdata)
        })
        const result = await response.json()
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

