document.getElementById("editcompany").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formElement = document.getElementById("editcompany");
  let formdata;
  const fileInput = document.getElementById("company_logo");
  const file = fileInput.files?.[0];
  
  let headers = {};
  if (!file) {
    formdata = {};
    new FormData(formElement).forEach((value, key) => formdata[key] = value);
    const imgElement = document.getElementById("view_company_image");
    formdata.image = imgElement.src;
    headers["Content-Type"] = "application/json";
    formdata = JSON.stringify(formdata);
  } else {
    formdata = new FormData(formElement);
  }
  try {
    const response = await fetch("/company/edit", {
     method: "PATCH",
      headers,
      body: formdata,
    });
    const result = await response.json();
    console.log(result);
    if (response.status == 200) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  } catch (err) {
    alert("something went wrrong");
  }
});
