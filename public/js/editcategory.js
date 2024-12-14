document
  .getElementById("editcategory")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    let formdata = {};
    new FormData(document.getElementById("editcategory")).forEach(
      (value, key) => (formdata[key] = value)
    );
    const response = await fetch("/category/edit", {
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
