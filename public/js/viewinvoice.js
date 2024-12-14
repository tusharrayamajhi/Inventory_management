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

document.getElementById("exportToExcel").addEventListener("submit",async (e)=>{
    e.preventDefault()
    let formdata = {}
    new FormData(document.getElementById("exportToExcel")).forEach((value,key)=>formdata[key] = value)
    try{
        const response = await fetch("/invoice/excel",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(formdata)
        })
        if(response.status == 200){
            const blob = await response.blob();

                // Create a temporary URL for the blob
                const url = window.URL.createObjectURL(blob);

                // Create a link element to trigger download
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoices_${Date.now()}.xlsx`; // Filename for the downloaded file
                document.body.appendChild(a); // Append the link to the document
                a.click(); // Programmatically click the link to trigger download
                a.remove(); // Remove the link element

                // Revoke the temporary URL
                window.URL.revokeObjectURL(url);
        }else{
            const result = await response.json() 
            alert(result.message)
        }
    }catch(err){
        console.log(err)
        alert("something went wrong")
    }


})


document.getElementById("export_all_to_excel").addEventListener("click",async()=>{
    try{
        const response = await fetch("/invoice/export_all_to_excel",{
            method:"GET"
        })
        if(response.status == 200){
            const blob = await response.blob();

                const url = window.URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `invoices_${Date.now()}.xlsx`;
                document.body.appendChild(a); 
                a.click(); 
                a.remove(); 

                window.URL.revokeObjectURL(url);
        }else if(response.status = 404){
            const result = await response.json() 
            alert(result.message)
        }
    }catch(err){
        console.log(err)
        alert("something went wrong")
    }
})


document.getElementById("seller_excel").addEventListener("submit",async(e)=>{
    e.preventDefault()
    const formdata = {}
    new FormData(document.getElementById("seller_excel")).forEach((value,key)=>formdata[key] = value)
    try{
        const response = await fetch("/invoice/excel/seller",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(formdata)
        })
        if(response.status == 200){
            const blob = await response.blob();

                // Create a temporary URL for the blob
                const url = window.URL.createObjectURL(blob);

                // Create a link element to trigger download
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoices_${Date.now()}.xlsx`; // Filename for the downloaded file
                document.body.appendChild(a); // Append the link to the document
                a.click(); // Programmatically click the link to trigger download
                a.remove(); // Remove the link element

                // Revoke the temporary URL
                window.URL.revokeObjectURL(url);
        }else{
            const result = await response.json() 
            alert(result.message)
        }

    }catch(err){
        alert("something went wrong")
    }
})