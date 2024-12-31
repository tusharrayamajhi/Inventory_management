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

document
  .getElementById("editcustomer")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    let formdata = {};
    try{

      new FormData(document.getElementById("editcustomer")).forEach(
        (value, key) => (formdata[key] = value)
      );
      
      const response = await fetch("/customer/edit", {
        method: "PATCH",
        headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formdata),
    });
    const result = await response.json();
    if (response.status == 200) {
      localStorage.setItem('success',result.message)
      location.reload()
    }else if(response.status == 400){
      document.getElementById("err_name").innerText = result.err_name
      document.getElementById("err_phone").innerText = result.err_phone
      document.getElementById("err_email").innerText = result.err_email
      document.getElementById("err_pan").innerText = result.err_pan
    } else {
      localStorage.setItem('error',result.message)
      location.reload()
    }
  }catch(err){
    localStorage.setItem('error',"something went wrong")
    location.reload()
  }
  });
