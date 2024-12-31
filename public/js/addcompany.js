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

document.getElementById("addcompany").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Create a FormData object to handle multipart/form-data
    const formData = new FormData(document.getElementById("addcompany"));

    try {
        // Send the FormData directly (fetch will automatically set the headers)
        const response = await fetch("/company/add", {
            method: "POST",
            body: formData, // No need for JSON.stringify
        });

        // Parse the response
        const result = await response.json();

        // Check the response status
        if (response.ok) {
            alert(result.message || "Company added successfully!");
        } else {
            alert(result.message || "Failed to add company.");
        }
    } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
    }
});
