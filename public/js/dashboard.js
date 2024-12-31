if (localStorage.getItem("success") != null) {
  document.getElementById("message").innerText = localStorage.getItem("success");
  document.getElementById("messagebox").style.display = "block";
  setTimeout(() => {
    document.getElementById("messagebox").style.display = "none";
    localStorage.removeItem("success");
  }, 1000);
}
