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
  .getElementById("addcategoryForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    let formdata = {};
    new FormData(document.getElementById("addcategoryForm")).forEach(
      (value, key) => (formdata[key] = value)
    );
    try {
      const response = await fetch("/category/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formdata),
      });
      const result = await response.json();
      if (response.status == 200) {
        localStorage.setItem("success","category save successfully");
        location.reload()
      } else if (response.status == 400) {
        document.getElementById("err_name").innerText =
          result.err_category_name;
        document.getElementById("err_desc").innerText =
          result.err_category_desc;
      } else {
        localStorage.setItem("error",result.message)
        location.reload()
      }
    } catch (err) {
      localStorage.setItem("error","something went wrong")
      location.reload()
    }
  });
