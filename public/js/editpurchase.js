
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
    document.querySelectorAll(".editpurchase").forEach(form=>{
        let temp = {}
        temp.product_id = form.querySelector(".product_id").value
        temp.new_received = form.querySelector(".new_received").value
        temp.purchase_id = form.querySelector('.purchase_id').value
        temp.status = form.querySelector('.status').value
        temp.remark = form.querySelector('.remark').value
        formsdata.push(temp)
        temp = {}
    })
    try{    
        const response = await fetch("/purchase/edit",{
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

document.querySelectorAll(".editpurchase").forEach(form=>{
    let total_amt = document.getElementById("total_amt").value
    total_amt = parseFloat(form.querySelector("input[class='total']").value) +parseFloat(total_amt);
    document.getElementById("total_amt").value = total_amt
  
    
    if(form.querySelector('input[class="vat"]').value == "13%"){
        document.getElementById("total_vatable_amt").value = form.querySelector('input[class="total"]').value + parseFloat(document.getElementById("total_vatable_amt").value)

        let vatamt =  form.querySelector("input[class='total']").value * 13 / 100
        document.getElementById("vatamt").value = parseFloat(vatamt) +parseFloat(document.getElementById("vatamt").value)

    } 
    document.getElementById("total_amt_after_vat").value = total_amt + parseFloat(document.getElementById("vatamt").value)
})