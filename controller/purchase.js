const ejs = require("ejs");
const { render, renderFileWithData } = require("../util/renderfile");
const processPost = require("../util/post");
const connection = require("../util/connect");
const fs = require("fs");
const path = require("path");
let { sessions, mimeType } = require("../util/object");
const ExcelJS = require('exceljs')
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
        .query("select * from vendors inner join users on users.user_id = vendors.user where users.company_id = ?", [user.company]);
      const [products] = await connection
        .promise()
        .query("select * from products inner join users on users.user_id = products.user where users.company_id = ?", [user.company]);
      const data = { vendors, products };
      filepath = path.join(__dirname, "../public/html", "addpurchase.ejs");
      return renderFileWithData(req, res, filepath, data,user);
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
        .query("select * from products inner join users on users.user_id = products.user where products.product_id = ? and users.company_id = ?", [
          id,
          user.company,
        ]);
      if (products.length == 0) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "cannot get product" }));
      }
      res.statusCode = 200;
      return res.end(JSON.stringify(products[0]));
    } catch (err) {
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
        .query("select * from vendors inner join users on users.user_id = vendors.user where vendors.vendor_id = ? and users.company_id = ?", [
          body.vendor.vendorid,
          user.company,
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
          .query("select count(DISTINCT purchase_code) as count from purchases inner join users on users.user_id = purchases.user where users.company_id = ? ", [
            user.company,
          ]);

        const date = new Date();
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear().toString();

        const code = `${user.company_code}-${day}${month}${year}-${number[0].count + 2}`;
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
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error", err }));
    }
  }else if((req.url == "/purchase/view" || req.url.startsWith("/purchase/view")) && req.method == 'GET'){
    const parse_url = url.parse(req.url,true);
    let page = parse_url.query.page;
    if (!page || page == 0) {
      page = 0;
    } else {
      page = page - 1;
    }
    try{
      const [result] = await connection.promise().query("select * from purchases inner join products on purchases.product = products.product_id inner join vendors on purchases.vendor = vendors.vendor_id inner join users on purchases.user = users.user_id where users.company_id = ? order by purchases.pruchase_date desc limit 10 offset ?",[user.company,page*10]);
      const [no_of_purchases] = await connection
        .promise()
        .query("select count(*) as total from purchases left join users on users.user_id = purchases.user where users.company_id = ?",[user.company]);
      const total_page = Math.ceil(no_of_purchases[0].total / 10);
      const data = { result, total_page };
        res.statusCode == 200
        filepath = path.join(__dirname,'../public/html','viewpurchase.ejs');
        return renderFileWithData(req,res,filepath,data,user)      
    }catch(err){  
      return render(req,res,path.join(__dirname,"../public/html",'error.html'))
    }
  }else if(req.url.startsWith("/purchase/edit") && req.method == "GET"){
    const parseurl = url.parse(req.url,true)
    const purchase_code = parseurl.query.purchase_code
    try{
      const [result] = await connection.promise().query("select * from purchases inner join vendors on purchases.vendor = vendors.vendor_id inner join products on purchases.product = products.product_id inner join users on users.user_id = purchases.user where purchases.purchase_code = ? and users.company_id = ?",[purchase_code,user.company])
      if(result.length == 0){
      return render(req,res,path.join(__dirname,'../public/html','error.html'))
      }
      return renderFileWithData(req,res,path.join(__dirname,'../public/html','editpurchase.ejs'),result,user);
    }catch(err){
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
        const [purchase] = await connection.promise().query("select * from purchases inner join users on users.user_id = purchases.user where purchases.purchase_id = ? and users.company_id = ? and purchases.product = ?",[data.purchase_id,user.company,data.product_id])
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
          await connection.promise().query("update purchases set received_qnt = received_qnt + ?,balance = ordered_qnt - received_qnt,remaining = remaining + ? ,total= ?,status = ?,remarks = ? where purchase_id = ? ",[parseInt(data.new_received),parseInt(data.new_received),total,data.status,data.remark,data.purchase_id])
          await connection.promise().query("update products set stock = stock + ? where  product_id = ?",[parseFloat(data.new_received),data.product_id])
        }
      }
      res.statusCode = 200
      return res.end(JSON.stringify({message:"successfully update purchase"}))
      }catch(err){
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
  } else if (req.url == "/purchase/excel" && req.method == "POST"){
    const body = await processPost(req);
    const err = {
      err_vendor_id:"",
      err_from_date:"",
      err_to_date:""
    }
    let haserr = false;
    if(body.customer_id == ''){
      err.err_customer_id = "no vendor selected"
      haserr = true
    }
    
    if(body.from == ""){
      err.err_from_date = "date not selected"
    }

    if(haserr){
      res.statusCode = 400
      return res.end(JSON.stringify({message:"vendor not selected"}))
    }
    let adjustto = body.from === body.to ? `${body.to} 23:59:59` : body.to
    try{
          
      const [data] = await connection.promise().query(`
        SELECT
            purchases.*,
            products.*,
            users.name as buyer_name,
            vendors.*,
            units.*,
            brands.*
        FROM vendors
        INNER JOIN purchases ON vendors.vendor_id = purchases.vendor
        INNER JOIN products ON purchases.product = products.product_id
        INNER JOIN users ON users.user_id = vendors.user
        INNER JOIN units ON products.unit = units.unit_id
        inner join brands on products.brand = brands.brand_id
        WHERE vendors.vendor_id = ? 
        AND vendors.created_at BETWEEN ? AND ?`, 
        [body.vendor_id,`${body.from} 00:00:00`, adjustto]
    );
    if (data.length === 0) {
      res.statusCode = 404
      res.end(JSON.stringify({ message: 'No data found for the given criteria.' }));
      return;
  }
  
      const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Invoices');

        worksheet.columns = [
          { header: 'Purchase ID', key: 'purchase_id', width: 15 },
          { header: 'Purchase Code', key: 'purchase_code', width: 20 },
          { header: 'Ordered Quantity', key: 'ordered_qnt', width: 20 },
          { header: 'Received Quantity', key: 'received_qnt', width: 20 },
          { header: 'Unit Rate', key: 'unit_rate', width: 15 },
          { header: 'VAT Rate (%)', key: 'vat_rate', width: 15 },
          { header: 'Total', key: 'total', width: 15 },
          { header: 'Purchase Date', key: 'pruchase_date', width: 20 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Remarks', key: 'remarks', width: 20 },
          { header: 'Product Name', key: 'product_name', width: 20 },
          { header: 'Brand Name', key: 'brand_name', width: 15 },
          { header: 'Unit Name', key: 'unit_name', width: 15 },
          { header: 'Buyer Name', key: 'buyer_name', width: 20 },
          { header: 'Vendor Name', key: 'vendor_name', width: 20 },
          { header: 'Vendor Email', key: 'email', width: 25 },
          { header: 'Vendor Phone', key: 'phone', width: 20 },
          { header: 'Vendor PAN', key: 'pan_no', width: 25 },
          { header: 'Vendor Address', key: 'address', width: 30 },
        ];

      data.forEach(row => {
        worksheet.addRow(row);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=invoices_${Date.now()}.xlsx`);

    // Write workbook to response
    await workbook.xlsx.write(res);

    res.statusCode = 200
    // End response
    return res.end();

    }catch(err){
      res.statusCode = 500
      return res.end(JSON.stringify({message:"internal server error"}))
    }

  } else if(req.url.startsWith("/purchase/priceHistory") && req.method == "GET"){
    const parse_url = url.parse(req.url,true)
    const product_id = parse_url.query.product_id;
    const [result] = await connection.promise().query("select vendors.vendor_name as vendor_name,products.product_name as product_name,purchases.pruchase_date as pruchase_date,purchases.unit_rate as buying_rate from purchases inner join vendors on vendors.vendor_id = purchases.vendor inner join products ON products.product_id = purchases.product where purchases.product = ? order by purchases.unit_rate asc limit 10",[product_id])
    if(!result || result.length == 0){
      res.statusCode = 404
      return res.end(JSON.stringify({message:"no data found"}))
    }
    res.statusCode = 200
    return res.end(JSON.stringify(result))
  }
   else {
    const ext = req.url.split(".");
    filepath = path.join(__dirname, `../public/${ext[1]}`, req.url);
  }
  render(req, res, filepath);
};
