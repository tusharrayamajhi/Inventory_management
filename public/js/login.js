// document.getElementById("loginform1").addEventListener("submit",async (e)=>{
//     e.preventDefault();
//     const formdata = {}
//     const form = document.getElementById("loginform1")
//     new FormData(form).forEach((value,key)=>formdata[key] = value);
//     const response = await fetch("/auth/login",{
//         method:"POST",
//         headers:{
//             "Content-Type":"application/json",
//         },
//         body:JSON.stringify(formdata)
//     })
//     response.json().then(result=>{
//         if(response.status == 200){
//             window.location.href = "/dashboard"
//         }else{
//             alert(result.message)
//         }
//     }).catch(err=>{
//         console.log(err)
//     })
// })
// document.getElementById("loginform2").addEventListener("submit",async (e)=>{
//     e.preventDefault();
//     const formdata = {}
//     const form = document.getElementById("loginform2")
//     new FormData(form).forEach((value,key)=>formdata[key] = value);
//     const response = await fetch("/auth/login",{
//         method:"POST",
//         headers:{
//             "Content-Type":"application/json",
//         },
//         body:JSON.stringify(formdata)
//     })
//     response.json().then(result=>{
//         if(response.status == 200){
//             window.location.href = "/dashboard"
//         }else{
//             alert(result.message)
//         }
//     }).catch(err=>{
//         console.log(err)
//     })
// })
document.getElementById("loginform").addEventListener("submit",async (e)=>{
    e.preventDefault();
    const formdata = {}
    const form = document.getElementById("loginform")
    new FormData(form).forEach((value,key)=>formdata[key] = value);
    try{

        const response = await fetch("/auth/login",{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
            },
            body:JSON.stringify(formdata)
        })
        const result = await response.json()
        if(response.status == 200){
            document.getElementById("error").innerText = result.message
            window.location = "/dashboard"
        }else{
            document.getElementById("error").innerText = result.message
        }
    }catch(err){
        console.log(err)
        document.getElementById("error").innerText = "someting went wrong try next time"

    }
})