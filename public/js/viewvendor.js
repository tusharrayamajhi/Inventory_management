
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


document.querySelectorAll(".deletevendor").forEach(form=>{

    form.addEventListener('submit',async(e)=>{
        e.preventDefault()
        const deleteId = form.querySelector("input[name='id']").value
        try{

            const response = await fetch(`/vendor/delete?id=${deleteId}`,{
                method:"DELETE"
            })
            const result = await response.json();
            if(response.status == 200){
                alert(result.message)
                window.location = "/vendor/view"
            }else{
                alert(result.message)
            }
        }catch(err){
            console.log(err)
            alert(err)
        }
    })
})