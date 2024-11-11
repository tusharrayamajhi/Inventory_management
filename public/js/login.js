document.getElementById("loginform1").addEventListener("submit",async (e)=>{
    e.preventDefault();
    const formdata = {}
    const form = document.getElementById("loginform1")
    new FormData(form).forEach((value,key)=>formdata[key] = value);
    const response = await fetch("/auth/login",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify(formdata)
    })
    response.json().then(result=>{
        if(response.status == 200){
            window.location.href = "/dashboard"
        }else{
            alert(result.message)
        }
    }).catch(err=>{
        console.log(err)
    })
})
document.getElementById("loginform2").addEventListener("submit",async (e)=>{
    e.preventDefault();
    const formdata = {}
    const form = document.getElementById("loginform2")
    new FormData(form).forEach((value,key)=>formdata[key] = value);
    const response = await fetch("/auth/login",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify(formdata)
    })
    response.json().then(result=>{
        if(response.status == 200){
            window.location.href = "/dashboard"
        }else{
            alert(result.message)
        }
    }).catch(err=>{
        console.log(err)
    })
})
document.getElementById("loginform3").addEventListener("submit",async (e)=>{
    e.preventDefault();
    const formdata = {}
    const form = document.getElementById("loginform3")
    new FormData(form).forEach((value,key)=>formdata[key] = value);
    const response = await fetch("/auth/login",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
        },
        body:JSON.stringify(formdata)
    })
    response.json().then(result=>{
        if(response.status == 200){
            window.sessionStorage.setItem("login","login successfully");
            setTimeout(()=>{
                console.log("hello world")
                window.localStorage.removeItem("login","login successfully")
            },5000)
            
            window.location.href = "/dashboard"
        }else{
            document.getElementById("error_message").innerText = result.message
        }
    }).catch(err=>{
        document.getElementById("error_message").value = err
        console.log(err)
    })
})