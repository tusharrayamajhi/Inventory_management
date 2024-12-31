
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

  
function tougleViewDetails(id){
    const view = document.getElementById("dropdown-"+id);
    view.style.display == "grid" ? view.style.display = "none": view.style.display = "grid"
}
