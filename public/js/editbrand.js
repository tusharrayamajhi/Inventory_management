document
  .getElementById("editbrand")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    let formdata = {};
    new FormData(document.getElementById("editbrand")).forEach(
      (value, key) => (formdata[key] = value)
    );
    console.log(formdata);
    const response = await fetch("/brand/edit", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formdata),
    });
    const result = await response.json();
    if (response.status == 200) {
      console.log(result);
      alert(result.message);
    } else {
      console.log(err);
      alert(err);
    }
  });
