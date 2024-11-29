document
  .getElementById("select_product")
  .addEventListener("change", async () => {
    const option = document.getElementById("select_product");
    console.log("selected id " + option.value);
    const form = document.getElementById(option.value);
    if (form) {
      alert("already select this product");
      option.value = "";
      return;
    }
    try {
      const response = await fetch(`/purchase/getproduct?id=${option.value}`, {
        method: "GET",
      });
      await response
        .json()
        .then(async (result) => {
          const formresponse = await fetch("/form.html", {
            method: "GET",
          });
          await formresponse
            .text()
            .then((formresult) => {
              let form = document.createElement("form");
              form.id = `${result.product_id}`;
              form.classList.add(`forms`);
              form.classList.add(`form-container`);
              form.innerHTML = formresult;
              document.getElementById("formsection").appendChild(form);
              let newform = document.getElementById(`${result.product_id}`);
              newform.querySelector("input[class='productName']").value =
                result.product_name;
              newform.querySelector("input[class='product_id']").value =
                result.product_id;
              newform.querySelector('button[class="delete-btn"]').value =
                result.product_id;

              newform.querySelector("input[class='stock']").value =
                result.stock;
              newform.querySelector("input[class='rate']").value =
                result.selling_rate;
              if (result.vat == 1) {
                newform.querySelector("input[class='vat']").value = "13%";
              } else {
                newform.querySelector("input[class='vat']").value = "0%";
              }
              newform
                .querySelector("input[class='received']")
                .addEventListener("keyup", () => {
                 
                  const ordered = newform.querySelector(
                    "input[class='ordered']"
                  ).value;
                  const unit_rate = newform.querySelector(
                    'input[class="rate"]'
                  ).value;
                  const received = newform.querySelector(
                    "input[class='received']"
                  ).value;
                  const vat = newform.querySelector("input[name='vat']").value;
                  if (parseInt(ordered) < parseInt(received)) {
                    alert("received is more then order qnt");
                  }
                  newform.querySelector("input[class='balance']").value =
                    ordered - received;
                  newform.querySelector("input[class='total']").value =
                    received * unit_rate;
                  let totalFormAmt = 0;
                  let vatableAmt = 0;
                  document.querySelectorAll(".forms").forEach((form) => {
                    vatableAmt = form.querySelector("input[class='vat']").value == "13%" ?parseFloat(form.querySelector("input[class='total']").value) + parseFloat(vatableAmt):vatableAmt
                    
                    totalFormAmt =
                      parseFloat(totalFormAmt) +
                      parseFloat(
                        form.querySelector('input[name="total"]').value
                      );
                  });
                  document.getElementById("total_amt").value = totalFormAmt;
                  document.getElementById("total_vatable_amt").value = vatableAmt;
                  let vatamt =  (vatableAmt * 13/100);
                  document.getElementById("vatamt").value = vatamt
                  document.getElementById("total_amt_after_vat").value = (totalFormAmt + vatamt)
                });
              newform
                .querySelector("input[class='rate']")
                .addEventListener("keyup", () => {
                  
                  const ordered = newform.querySelector(
                    "input[class='ordered']"
                  ).value;
                  const unit_rate = newform.querySelector(
                    'input[class="rate"]'
                  ).value;
                  const received = newform.querySelector(
                    "input[class='received']"
                  ).value;
                  const vat = newform.querySelector("input[name='vat']").value;
                  if (parseInt(ordered) < parseInt(received)) {
                    alert("received is more then order qnt");
                  }
                  newform.querySelector("input[class='balance']").value =
                    ordered - received;
                  newform.querySelector("input[class='total']").value =
                    received * unit_rate;
                  let totalFormAmt = 0;
                  let vatableAmt = 0;
                  document.querySelectorAll(".forms").forEach((form) => {
                    vatableAmt = form.querySelector("input[class='vat']").value == "13%" ?parseFloat(form.querySelector("input[class='total']").value) + parseFloat(vatableAmt):vatableAmt
                    
                    totalFormAmt =
                      parseFloat(totalFormAmt) +
                      parseFloat(
                        form.querySelector('input[name="total"]').value
                      );
                  });
                  document.getElementById("total_amt").value = totalFormAmt;
                  document.getElementById("total_vatable_amt").value = vatableAmt;
                  let vatamt =  (vatableAmt * 13/100);
                  document.getElementById("vatamt").value = vatamt
                  document.getElementById("total_amt_after_vat").value = (totalFormAmt + vatamt)
                });
              newform.querySelector('button[class="delete-btn"]').addEventListener("click", () => {
                newform.remove()
              });

              
            })
            .catch((err) => {
              throw err;
            });
        })
        .catch((err) => {
          throw err;
        });
    } catch (err) {
      console.log(err);
      alert("someting went wrong");
    }
    option.value = "";
  });

document.getElementById("savepurchase").addEventListener("click", async () => {
  let formids = [];
  document.querySelectorAll(".forms").forEach((form) => {
    const id = form.querySelector('input[name="product_id"]').value;
    
    formids.push(id);
  });
  console.log(formids);
  let formsdata = [];
  const vendorid = document.getElementById("vendorlist").value;
  const vendor = {
    vendorid: vendorid,
  };
  formids.forEach((id) => {
    let formdata = {};
    new FormData(document.getElementById(id)).forEach(
      (value, key) => (formdata[key] = value)
    );
    console.log(formdata);
    formsdata.push(formdata);
    formdata = {};
  });
  console.log(formsdata);
  try {
    const response = await fetch("/purchase/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ formsdata, vendor }),
    });
    const result = await response.json();
    console.log(response.status)
    if(response.status == 200){
      alert(result.message)
      window.location = "/purchase/add"
    }else{
      alert(result.message)
    }
    console.log(result);
  } catch (err) {
    console.log(err);
    alert("something went wrong");
  }
});
