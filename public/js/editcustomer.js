document
  .getElementById("editcustomer")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    let formdata = {};
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
      alert(result.message);
    } else {
      console.log(err);
      alert(err);
    }
  });
