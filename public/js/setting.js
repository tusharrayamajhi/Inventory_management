

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

document.getElementById("changepassword").addEventListener("submit",async(e)=>{
    e.preventDefault()
    let formdata = {}
    new FormData(document.getElementById("changepassword")).forEach((value,key)=>formdata[key] = value)
    try{
        const response = await fetch("/setting/changepassword",{
            method:"POST",
            headers:{
            "Content-Type":"application/json"
            },
            body:JSON.stringify(formdata)
        })
        const result = await response.json()
        if(response.status == 200){
            alert(result.message)
        }else{
            console.log(result)
        }
    }catch(err){
        alert("something went wrong")
    }
})