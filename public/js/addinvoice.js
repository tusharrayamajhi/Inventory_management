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



document.getElementById("select_product").addEventListener("change",async()=>{
    let option = document.getElementById('select_product')
    if(document.getElementById(option.value)){
        alert("already selected this product")
        option.value = ''
        return;
    }
    try{
        const response = await fetch(`/invoice/getproduct?id=${option.value}`,{
            method:"GET"
        })
        await response.json().then(async result=>{
            const formresponse = await fetch('/invoiceform.html',{
                method:"GET"
            })
            await formresponse.text().then(async formresult=>{
                    console.log(formresult)
                    let form = document.createElement("form")
                    form.id = result.product_id
                    form.classList.add(`forms`)
                    form.classList.add(`form-container`)
                    form.innerHTML = formresult
                    document.getElementById("formsection").appendChild(form)
                    let newform = document.getElementById(`${result.product_id}`);
                    newform.querySelector("input[name='product_id']").value = result.product_id
                    newform.querySelector("input[name='productName']").value = result.product_name
                    newform.querySelector("input[name='stock']").value = result.stock
                    newform.querySelector('button[class="delete-btn"]').value = result.product_id;
                    newform.querySelector("input[class='stock']").value = result.stock;
                    newform.querySelector("input[class='rate']").value = result.selling_rate;
                    if (result.vat == 1) {
                        newform.querySelector("input[class='vat']").checked = true
                        newform.querySelector("input[class='vat']").value = 1
                      }else{
                        newform.querySelector("input[class='vat']").checked = false
                        newform.querySelector("input[class='vat']").value = 0

                      }
                      newform.querySelector('input[class="vat"]').addEventListener("click",(e)=>e.preventDefault());
                 option.value = ''

                 newform.querySelector('button[class="delete-btn"]').addEventListener("click",()=>{
                    newform.remove();
                 })
                 newform.querySelector('input[class="qnt"]').addEventListener("keyup",()=>{
                    if(parseInt(newform.querySelector('input[class="qnt"]').value) > parseInt(newform.querySelector("input[class='stock']").value)){
                        
                        alert("quantity most no be greater then stock " + newform.querySelector("input[class='stock']").value);
                    }
                     newform.querySelector("input[class='total']").value = newform.querySelector("input[class='qnt']").value * newform.querySelector("input[class='rate']").value
                     let total_amt = 0;
                     let total_vatable_amt = 0;
                     document.querySelectorAll('.forms').forEach(form=>{
                        
                        total_amt = parseFloat(total_amt) + parseFloat(form.querySelector("input[class='total']").value)
                        if(form.querySelector('input[class="vat"]').value == 1){
                           total_vatable_amt = total_vatable_amt + parseFloat(form.querySelector("input[class='total']").value)
                        }
                     })
                     document.getElementById("total_amt").value = total_amt;
                     document.getElementById("total_vatable_amt").value = total_vatable_amt;
                     let vatamt = total_vatable_amt * 13 / 100
                     document.getElementById("vatamt").value = vatamt
                     document.getElementById("total_amt_after_vat").value = total_amt + vatamt 
                  })








                  newform.querySelector('input[class="rate"]').addEventListener("keyup",()=>{
                    if(parseInt(newform.querySelector('input[class="qnt"]').value) > parseInt(newform.querySelector("input[class='stock']").value)){
                        
                        alert("quantity most no be greater then stock " + newform.querySelector("input[class='stock']").value);
                    }
                     newform.querySelector("input[class='total']").value = newform.querySelector("input[class='qnt']").value * newform.querySelector("input[class='rate']").value
                     let total_amt = 0;
                     let total_vatable_amt = 0;
                     document.querySelectorAll('.forms').forEach(form=>{
                        
                        total_amt = parseFloat(total_amt) + parseFloat(form.querySelector("input[class='total']").value)
                        if(form.querySelector('input[class="vat"]').value == 1){
                           total_vatable_amt = total_vatable_amt + parseFloat(form.querySelector("input[class='total']").value)
                        }
                     })
                     document.getElementById("total_amt").value = total_amt;
                     document.getElementById("total_vatable_amt").value = total_vatable_amt;
                     let vatamt = total_vatable_amt * 13 / 100
                     document.getElementById("vatamt").value = vatamt
                     document.getElementById("total_amt_after_vat").value = total_amt + vatamt 
                })
        }).catch(err=>{
            console.log(err)
            throw(err)
        })
        }).catch(err=>{
            throw(err)
        })
       
    }catch(err){
        console.log(err)
        alert("something went wrong")
    }
})

document.getElementById("save").addEventListener("click",async ()=>{
    let ids = []
    document.querySelectorAll(".forms").forEach(form=>{
        let id = form.querySelector('input[name="product_id"]')
        ids.push(id.value);
    })
    let formsdata = []
    ids.forEach(id=>{
        let formdata = {}
        new FormData(document.getElementById(id)).forEach((value,key)=>formdata[key] = value)
        formsdata.push(formdata)
        formdata={}
    })
    const customer = document.getElementById("select_customer").value;
    
    try{
        const response = await fetch("/invoice/add",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({formsdata,customer_id:customer})
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