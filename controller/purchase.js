const ejs = require("ejs");
const { render, renderFileWithData } = require("../util/renderfile");
const processPost = require("../util/post");
const connection = require("../util/connect");
const fs = require("fs");
const path = require("path");
let { sessions, mimeType } = require("../util/object");
const { isAdmin } = require("../util/isAdmin");
const {
  isValidPhoneNo,
  isValidCharacter,
  isValidEmail,
  isValidPassword,
  isValidDigit,
} = require("../util/validaton");
const url = require("url");

module.exports = async function purchase(req, res) {
  let filepath = "";
  let user = {};
  if (!req.headers.cookie) {
    res.writeHead(302, { location: "/" });
    return res.end();
  }
  const sessions_id = req.headers.cookie.split("=")[1];
  user = sessions[sessions_id];
  if (!user) {
    res.writeHead(302, {
      "Set-Cookie": `sessionId=;HttpOnly;Max-Age=0;path=/`,
      location: "/",
    });
    res.end();
    return;
  }
  if (!isAdmin(user, res)) return;

  if (req.url == "/purchase/add" && req.method == "GET") {
    try {
      const [vendors] = await connection
        .promise()
        .query("select * from vendors where user = ?", [user.id]);
      const [products] = await connection
        .promise()
        .query("select * from products where user = ?", [user.id]);
      const data = { vendors, products };
      filepath = path.join(__dirname, "../public/html", "addpurchase.ejs");
      return renderFileWithData(req, res, filepath, data);
    } catch (err) {
      filepath = path.join(__dirname, "../public/html", "error.html");
      return render(req, res, filepath);
    }
  } else if (
    req.url.startsWith("/purchase/getproduct") &&
    req.method == "GET"
  ) {
    const parseurl = url.parse(req.url, true);
    const id = parseurl.query.id;
    try {
      const [products] = await connection
        .promise()
        .query("select * from products where product_id = ? and user = ?", [
          id,
          user.id,
        ]);
      if (products.length == 0) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "cannot get product" }));
      }
      res.statusCode = 200;
      return res.end(JSON.stringify(products[0]));
    } catch (err) {
      console.log(err);
      return res.end(JSON.stringify({ message: "database err" }));
    }
  } else if (req.url == "/purchase/add" && req.method == "POST") {
    const body = await processPost(req);
    let finalerr = [];
    let haserr = false;
    if (body.vendor.vendorid == "") {
      res.status = 404;
      return res.end(JSON.stringify({ message: "vendor not selected" }));
    }
    for (let purchase of body.formsdata) {
      let err = {
        product_id: "",
        err_ordered: "",
        err_received: "",
        err_rate: "",
        err_status: "",
        err_product_id: "",
      };
      if (
        !isValidDigit(purchase.ordered) &&
        !(parseInt(purchase.ordered) >= 0)
      ) {
        err.err_ordered = "most be interger and non negative";
        haserr = true;
      }
      if (
        !isValidDigit(purchase.received) ||
        parseInt(purchase.received) < 0 ||
        parseInt(purchase.received) > parseInt(purchase.ordered)
      ) {
        err.err_received = "invlaid received quantity";
        haserr = true;
      }
      if (parseFloat(purchase.rate) < 0) {
        err.err_rate = "rate most positive";
        haserr = true;
      }
      if (
        purchase.status != "pending" &&
        purchase.status != "partial received" &&
        purchase.status != "received"
      ) {
        err.err_status = "invalid status";
        haserr = true;
      }
      if (purchase.product_id == "") {
        err.err_product_id = "product should not be empty";
        haserr = true;
      }
      err.product_id = purchase.product_id;
      finalerr.push(err);
      err = {
        product_id: "",
        err_ordered: "",
        err_received: "",
        err_rate: "",
        err_status: "",
        err_product_id: "",
      };
    }
    if (haserr) {
      res.statusCode = 400;
      return res.end(JSON.stringify(finalerr));
    }
    try {
      const [vendor] = await connection
        .promise()
        .query("select * from vendors where vendor_id = ? and user = ?", [
          body.vendor.vendorid,
          user.id,
        ]);
      if (vendor.length == 0) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ message: "invalid vendor id" }));
      }
      const ids = body.formsdata.map((purchase) => purchase.product_id);
      if(ids.length == 0){
        res.statusCode =404
        return res.end(JSON.stringify({message:"no product selected"}))
      }
      const [products] = await connection
        .promise()
        .query("select vat,stock from products where product_id  in (?)", [
          ids,
        ]);
      if (ids.length != products.length) {
        res.statusCode == 404;
        return res.end(JSON.stringify({ message: "invalid product id" }));
      }
      let purchaserecord = [];
      async function getpurchasecode() {
        const [number] = await connection
          .promise()
          .query("select count(DISTINCT purchase_code) as count from purchases where user = ? ", [
            user.id,
          ]);

        const date = new Date();
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear().toString();

        const code = `${day}${month}${year}-${number[0].count + 2}`;
        return code
      }
      const purchasecode = await getpurchasecode();
      for (let purchases of body.formsdata) {
        let purchase = {};
        purchase.product_id = purchases.product_id
        purchase.ordered_qnt = parseInt(purchases.ordered);
        purchase.received_qnt = parseInt(purchases.received);
        purchase.vatrate = purchases.vat;
        purchase.unit_rate = parseFloat(purchases.rate);
        purchase.status = purchases.status;
        purchase.remark = purchases.remark;
        purchase.balance = parseInt(purchase.ordered_qnt) - parseInt(purchase.received_qnt);
        purchase.remaining = parseInt(purchases.received);
        // let total = 0;
        // if (purchases.vat == "13%") {
        //   total =
        //     purchase.received_qnt * purchase.unit_rate +
        //     (purchase.received_qnt * purchase.unit_rate * 13) / 100;
        // } else {
        //   total = purchase.received_qnt * purchase.unit_rate;
        // }
        purchase.total = purchases.total;
        purchaserecord.push(purchase);
        purchase = {};
        total = 0;
      }
      let values = ''
      let count = 0;
      purchaserecord.forEach(record=>{
            let value = `("${purchasecode}",${record.ordered_qnt},${record.received_qnt},${record.unit_rate},${record.vatrate.split('%')[0]},${record.balance},${record.total},"${record.status}","${record.remark}","${record.remaining}",${body.vendor.vendorid},${record.product_id},${user.id})`
        if(count < purchaserecord.length - 1){
          values+=value + ','
          count = count + 1
        }else{
          values+=value
        }
      })
        const [result] = await connection.promise().query(`INSERT INTO purchases (purchase_code,ordered_qnt, received_qnt, unit_rate, vat_rate,balance,total, status, remarks,remaining, vendor, product,user) VALUES ${values}`)
        purchaserecord.forEach(async record=>{
          await connection.promise().query(`update products set stock = stock + ? where product_id = ? and user = ?`,[parseInt(record.received_qnt),record.product_id,user.id])
        })
        await connection.promise().commit()
        res.statusCode = 200
        return res.end(JSON.stringify({message:"purchase save successfully"}))

    } catch (err) {
      await connection.promise().rollback();
      console.log(err);
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error", err }));
    }
  }else if(req.url == "/purchase/view" && req.method == 'GET'){
    try{
      const [result] = await connection.promise().query("select * from purchases inner join products on purchases.product = products.product_id inner join vendors on purchases.vendor = vendors.vendor_id inner join users on purchases.user = users.user_id where purchases.user = ?",[user.id]);
        res.statusCode == 200
        filepath = path.join(__dirname,'../public/html','viewpurchase.ejs');
        return renderFileWithData(req,res,filepath,result)      
    }catch(err){  
      console.log(err)
      render(req,res,path.join(__dirname,"../public/html",'error.html'))
    }
  }else if(req.url.startsWith("/purchase/edit") && req.method == "GET"){
    const parseurl = url.parse(req.url,true)
    const purchase_code = parseurl.query.purchase_code
    try{
      const [result] = await connection.promise().query("select * from purchases inner join vendors on purchases.vendor = vendors.vendor_id inner join products on purchases.product = products.product_id where purchases.purchase_code = ? and purchases.user = ?",[purchase_code,user.id])
      if(result.length == 0){
      return render(req,res,path.join(__dirname,'../public/html','error.html'))
      }
      return renderFileWithData(req,res,path.join(__dirname,'../public/html','editpurchase.ejs'),result);
    }catch(err){
      console.log(err)
      res.statusCode = 500
      return render(req,res,path.join(__dirname,'../public/html','error.html'))
    }
  }else if(req.url == "/purchase/edit" && req.method == "PATCH"){
    const body = await processPost(req);
   

    try{
      for(let data of body){
        if(data.new_received == ""){
          data.new_received = 0
        }
        console.log(data)
        const [purchase] = await connection.promise().query("select * from purchases where purchase_id = ? and user = ? and product = ?",[data.purchase_id,user.id,data.product_id])
        if (purchase.length === 0) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ success: false, message: `invalid purchase id` }));
      }
        if(parseInt(data.new_received) <= (purchase[0].ordered_qnt - purchase[0].received_qnt)  && data.new_received >= 0 ){
          let new_rec_amt = parseFloat(data.new_received) * parseFloat(purchase[0].unit_rate)
          // if(purchase[0].vat_rate == 13){
          //   new_rec_amt = new_rec_amt +( new_rec_amt * 13 / 100)
          // }
          let total = parseFloat(purchase[0].total) + new_rec_amt
          await connection.promise().query("update purchases set received_qnt = received_qnt + ?,balance = ordered_qnt - received_qnt,remaining = remaining + ? ,total= ? where user = ? and purchase_id = ? ",[parseInt(data.new_received),parseInt(data.new_received),total,user.id,data.purchase_id])
          await connection.promise().query("update products set stock = stock + ? where user = ? and product_id = ?",[parseFloat(data.new_received),user.id,data.product_id])
        }
      }
      res.statusCode = 200
      return res.end(JSON.stringify({message:"successfully update purchase"}))
      }catch(err){
        console.log(err)
        res.statusCode = 500
        return res.end(JSON.stringify({message:"internal server error"}))
    }
  }
  else if(req.url.startsWith("/purchase/delete") && req.method == "DELETE"){
    const parseurl = url.parse(req.url,true)
    const id = parseurl.query.id;
    
    try{
      const [purchase] = await connection.promise().query("select * from purchases where purchase_id = ? and user = ?",[id,user.id])
      
    }catch(err){
      res.statusCode = 500
      return res.end(JSON.stringify({message:"internal server error",err}))
    }
  }
   else {
    const ext = req.url.split(".");
    filepath = path.join(__dirname, `../public/${ext[1]}`, req.url);
  }
  render(req, res, filepath);
};
