document.querySelectorAll(".download_invoice").forEach((form)=>{
    form.addEventListener("click",async(e)=>{
        e.preventDefault()
        let code = form.querySelector('input[class="invoice_sells_code"]').value
        try{

            const response = await fetch(`/invoice/bill?sells_code=${code}`,{
                method:"GET"
            })
            const result = await response.text()
            console.log(result)
            if(response.status == 200){
                const bodydata = document.body.innerHTML
                document.body.innerHTML = result   
                window.print();
                document.body.innerHTML = bodydata
                
            }else{
               alert("something went wrong cannot print bill")
            }
        }catch(err){
            console.log(err)

        }
    })
})