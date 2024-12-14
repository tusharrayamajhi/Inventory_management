document.getElementById("exportToExcel").addEventListener("submit",async (e)=>{
    e.preventDefault()
    let formdata = {}
    new FormData(document.getElementById("exportToExcel")).forEach((value,key)=>formdata[key] = value)
    try{
        const response = await fetch("/purchase/excel",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(formdata)
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
        }else{
            const result = await response.json() 
            alert(result.message)
        }
    }catch(err){
        console.log(err)
        alert("something went wrong")
    }


})

// document.querySelectorAll(".deletepurchase").forEach(form=>{

//     form.addEventListener("submit", async(e)=>{
//         e.preventDefault()
//     const deleteId = form.querySelector('input[name="id"]').value
//     try{
//         const response = await fetch(`/purchase/delete?id=${deleteId}`,{
//             method:"DELETE"
//         })
//         const result = await response.json();
//         if(response.status == 200){
//             alert(result.message);
//         }else{
//             alert(result.message)
//         }
//     }catch(err){
//         console.log(err)
//     }
// })
// })
