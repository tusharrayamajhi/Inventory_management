document.querySelectorAll(".download_invoice").forEach((form)=>{
    form.addEventListener("click",async(e)=>{
        e.preventDefault()
        let code = form.querySelector('input[class="invoice_sells_code"]').value
        try{

            const response = await fetch(`/invoice/bill?sells_code=${code}`,{
                method:"GET"
            })
            const result = await response.text()
            if(response.status == 200){
                const printframe = document.createElement("iframe")
                printframe.style.position ="absolute";
                printframe.style.top = '-10000px'
                document.body.appendChild(printframe);

                const framedocument = printframe.contentDocument|| printframe.contentWindow.document
                framedocument.open()
                framedocument.write(result)
                framedocument.close()
                printframe.contentWindow.focus()
                printframe.contentWindow.print()
                document.body.removeChild(printframe)
                // const bodydata = document.body.innerHTML
                // document.body.innerHTML = result   
                // window.print();
                // document.body.innerHTML = bodydata
                
                // console.log("print successs fully")
            }else{
               alert("something went wrong cannot print bill")
            }
        }catch(err){
            console.log(err)

        }
    })
})