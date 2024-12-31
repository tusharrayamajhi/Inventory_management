document.getElementById("loginform").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formdata = {};
  const form = document.getElementById("loginform");
  new FormData(form).forEach((value, key) => (formdata[key] = value));
  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formdata),
    });
    const result = await response.json();
    if (response.status == 200) {
      localStorage.setItem("success", "successfully login");
      window.location = "/dashboard";
    } else if (response.status == 404) {
      document.getElementById("error_email").innerText = result.err_email;
      document.getElementById("error_pass").innerText = result.err_password;
    } else {
      document.getElementById("error_message_box").style.display = "block";
      document.getElementById("err_message").innerText = result.message;
    }
  } catch (err) {
    document.getElementById("errormessage").style.display = "block";
    document.getElementById("message").innerText =
      "someting went wrong try next time";
  }
});
