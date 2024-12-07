// document.getElementById("addcompany").addEventListener("submit",async(e)=>{
//     e.preventDefault()
//     let formdata ={}
//      new FormData(document.getElementById("addcompany")).forEach((value, key)=>formdata[key]= value)

//     try{
//         const response = await fetch("/company/add",{
//             method:"POST",
//             headers:{
//                 "Content-Type":"application/json"
//                 // "Content-Type":"multipart/form-data"
//             },
//             body:JSON.stringify(formdata)
//         })
//         const result = await response.json();
//         console.log(result)
//         if(response.status == 200){
//             alert(result.message)
//         } else{
//             alert(result.message)
//         }
//     }catch(err){
//         console.log(err)
//         alert("something went wrong")
//     }


// })


document.getElementById("addcompany").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Create a FormData object to handle multipart/form-data
    const formData = new FormData(document.getElementById("addcompany"));

    try {
        // Send the FormData directly (fetch will automatically set the headers)
        const response = await fetch("/company/add", {
            method: "POST",
            body: formData, // No need for JSON.stringify
        });

        // Parse the response
        const result = await response.json();
        console.log(result);

        // Check the response status
        if (response.ok) {
            alert(result.message || "Company added successfully!");
        } else {
            alert(result.message || "Failed to add company.");
        }
    } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
    }
});
