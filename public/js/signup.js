document
  .getElementById("signupDetails")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const formdata = {};

    new FormData(document.getElementById("signupDetails")).forEach(
      (value, key) => (formdata[key] = value)
    );
    try {
      const response = await fetch("/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formdata),
      });

      const result = await response.json();
      if ((response.status == 400)) {
        document.getElementById("error_name").innerText = result.error_name;
        document.getElementById("error_phone").innerText = result.error_phone;
        document.getElementById("error_email").innerText = result.error_email;
        document.getElementById("error_password").innerText =result.error_password;
      } else {
        alert(result.message);
        window.location = "/"
      }
    } catch (err) {
      console.log(err);
      alert("something went wrong");
    }
  });
