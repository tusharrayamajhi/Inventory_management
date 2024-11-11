document.getElementById("signupDetails").addEventListener("submit",async (e)=>{
    e.preventDefault()
    const finalData ={}

    const formdata = new FormData(document.getElementById("signupDetails")).forEach((value,key)=>finalData[key] = value)

    const response = await fetch("/auth/signup",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(finalData)
    })

    const result = response.json();
result.then(result=>
    console.log(result)
).catch(err=>{
    console.log(err)
})

})