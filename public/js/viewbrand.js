
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

document.querySelectorAll(".deletebrand").forEach(form=>{
    form.addEventListener("submit",async(e)=>{
        e.preventDefault()
        const deleteId = form.querySelector("input[name='id']").value
        try{

            const response = await fetch(`/brand/delete?id=${deleteId}`,{
                method:"DELETE"
            })
            const result = await response.json();
            if(response.status == 200){
               localStorage.setItem('success',result.message)
                location.reload()
            }else{
                localStorage.setItem("error",result.message)
                location.reload()
            }
        }catch(err){
            localStorage.setItem("error","something went wrong")
            location.reload()
        }
    })

})