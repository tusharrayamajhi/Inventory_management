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


document.getElementById("addproduct").addEventListener("submit",async(e)=>{
    e.preventDefault();

    let formdata ={}
    new FormData(document.getElementById("addproduct")).forEach((value,key)=>formdata[key] = value)
    try{
        const response = await fetch("/product/add",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"

            },
            body:JSON.stringify(formdata)
        })
        const result= await response.json();
        if(response.status == 200){
            localStorage.setItem("success",result.message)
            location.reload()
        }else if(response.status == 400){
            document.getElementById("err_name").innerText = result.err_product_name
            document.getElementById("err_brand").innerText = result.err_brand
            document.getElementById("err_rate").innerText = result.err_selling_rate
            document.getElementById("err_unit").innerText = result.err_unit
            document.getElementById("err_cat").innerText = result.err_category
        }else{
            localStorage.setItem("error",result.message)
            location.reload()
        }
    }catch(err){
        localStorage.setItem("error","something went wrong")
        location.reload()
    }
})