document.getElementById("edituser").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const formElement = document.getElementById("edituser");
  let formdata;
  const fileInput = document.getElementById("user_image");
  const file = fileInput.files?.[0];
  
  let headers = {};
  
  if (!file) {
    formdata = {};
    new FormData(formElement).forEach((value, key) => formdata[key] = value);
    const imgElement = document.getElementById("view_user_image");
    formdata.image = imgElement.src;
    headers["Content-Type"] = "application/json";
    formdata = JSON.stringify(formdata);
  } else {
    formdata = new FormData(formElement);
  }

  try {
    const response = await fetch("/user/edit", {
      method: "PATCH",
      headers,
      body: formdata,
    });
    
    // Parse the JSON response safely
    const result = await response.json();
    
    if (response.ok) {
      alert(result.message); // Success
    } else {
      console.error("Server Error:", result);
      alert(result.message); // Failure from server
    }
  } catch (err) {
    console.error("Network Error:", err);
    alert("Something went wrong. Please try again later.");
  }
});
