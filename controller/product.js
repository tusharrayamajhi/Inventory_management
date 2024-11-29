const ejs = require("ejs");
const { render, renderFileWithData } = require("../util/renderfile");
const processPost = require("../util/post")
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
const url = require('url');

module.exports = async function product(req, res) {
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
  if (req.url == "/product/add" && req.method == "GET") {
    try {
      filepath = path.join(__dirname, "../public/html", "addproduct.ejs");
      const [brands] = await connection
        .promise()
        .query("select * from brands where user = ?", [user.id]);
      const [units] = await connection
        .promise()
        .query("select * from units where user = ?", [user.id]);
      const [categories] = await connection
        .promise()
        .query("select * from categorys where user = ?", [user.id]);
      const data = { brands, units, categories };
      return renderFileWithData(req, res, filepath, data);
    } catch (err) {
      return render(req,res,path.join(__dirname, "../public/html", "error.html"));
    }
  }else if(req.url == "/product/add" && req.method == "POST"){
    
    const body = await processPost(req);
    const err = {
      err_product_name: "",
      err_brand: "",
      err_selling_rate:"",
      err_unit:"",
      err_category:""
    };
    let have_err = false;
    if (body.product_name == '') {
      err.err_product_name = "name is required";
      have_err = true;
    }
    if (body.brand == '') {
      err.err_brand = "choose a brand";
      have_err = true;
    }
    if (body.unit == '') {
      err.err_unit = "choose a unit";
      have_err = true;
    }
    if (parseInt(body.selling_rate) < 0) {
      err.err_selling_rate = "selling rate cannot be negative";
      have_err = true;
    }
   
    if (body.category == '') {
      err.err_category = "choose a category";
      have_err = true;
    }
    if(body.vat == 'on'){
      body.vat = 1
    }else{
      body.vat = 0
    }
    console.log(body)
    
    res.setHeader("Content-Type", "application/json");
    if (have_err) {
      res.statusCode = 400;
      return res.end(JSON.stringify(err));
    }
    try {
      const [brands] = await connection.promise().query("select * from brands where brand_id = ? AND user = ?", [parseInt(body.brand),user.id]);
     
      if (brands.length == 0) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "no brand found" }));
      }
      const [units] = await connection.promise().query("select * from units where unit_id = ? AND user = ?", [parseInt(body.unit),user.id]);
     
      if (units.length == 0) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "no units found" }));
      }
      const [category] = await connection.promise().query("select * from categorys where category_id = ? AND user = ?", [parseInt(body.category),user.id]);
     
      if (category.length == 0) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "no category found" }));
      }
      const [results] = await connection.promise().query("insert into products (product_name, brand, unit, vat, selling_rate, category,user) values (?,?,?,?,?,?,?)",[body.product_name,parseInt(body.brand),parseInt(body.unit),body.vat,parseFloat(body.selling_rate),parseInt(body.category),user.id])
      if(results.affectedRows > 0){
        res.statusCode = 200;
        return res.end(JSON.stringify({ message: "product added successfully" }));
      }
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "cannot save product" }));
    } catch (err) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error", err }));
    }
  }else if(req.url == "/product/view" && req.method == "GET"){
    try{
      filepath = path.join(__dirname,"../public/html","viewproduct.ejs")
      const [products] = await connection.promise().query("select * from products inner join units on products.unit = units.unit_id inner join brands on products.brand = brands.brand_id inner join categorys on products.category = categorys.category_id where products.user = ?",[user.id])
      return renderFileWithData(req,res,filepath,products)
    }catch(err){
      filepath = path.join(__dirname,"../public/html",'error.html');
      return render(req,res,filepath);
    }
  }else if(req.url.startsWith("/product/delete") && req.method == "DELETE"){
    const parseurl = url.parse(req.url,true)
    const id = parseurl.query.id;
    console.log(id)
    try{
      const [result] = await connection.promise().query("select * from products where product_id = ? AND user = ?",[id,user.id]);
      if(result.length == 0){
        res.statusCode = 400;
        return res.end(JSON.stringify({message:"no product found for given id"}))
      }
      const [results] = await connection.promise().query("delete from products where product_id = ? and user = ?",[id,user.id]);
      if(results.affectedRows > 0){
        res.statusCode = 200
        return res.end(JSON.stringify({message:"product delete successfully"}));
      }
      res.statusCode = 400
      return res.end(JSON.stringify({message:"cannot delete product"}))

    }catch(err){
      console.log(err)
      if(err.code == 'ER_ROW_IS_REFERENCED_2'){
        res.statusCode = 409
        return res.end(JSON.stringify({message:"cannot delete product because it is liked with other data"}))
      }
      res.statusCode = 500
      return res.end(JSON.stringify({message:"database err"}))
    }
  }else if(req.url.startsWith("/product/edit") && req.method == "GET"){
    const editId = url.parse(req.url,true).query.id;
    try{

      const [products] = await connection.promise().query("select * from products where product_id = ? and user = ?",[parseInt(editId),user.id]);
      const [brands] = await connection.promise().query('select * from brands where user = ?',[user.id]);
      const [units] = await connection.promise().query('select * from units where user = ?',[user.id]);
      const [categories] = await connection.promise().query('select * from categorys where user = ?',[user.id])
      if(products.length == 0 || brands.length == 0 || categories.length == 0 || units.length == 0){
        return render(req,res,path.join(__dirname,'../public/html','error.html')); 
      }
      const product = products[0]
      const data = {product,brands,categories,units}
      console.log(data)
      return renderFileWithData(req,res,path.join(__dirname,'../public/html','editproduct.ejs'),data);
    }catch(err){
      console.log(err)
      return render(req,res,path.join(__dirname,'../public/html','error.html'))
    }
  }else if(req.url == "/product/edit" && req.method == "PATCH"){
    
    const body = await processPost(req);
    const err = {
      err_product_name: "",
      err_brand: "",
      err_selling_rate:"",
      err_unit:"",
      err_stock:"",
      err_category:""
    };
    let have_err = false;
    if (body.product_name == '') {
      err.err_product_name = "name is required";
      have_err = true;
    }
    if (body.brand == '') {
      err.err_brand = "choose a brand";
      have_err = true;
    }
    if (body.unit == '') {
      err.err_unit = "choose a unit";
      have_err = true;
    }
    if (parseInt(body.selling_rate) < 0) {
      err.err_selling_rate = "selling rate cannot be negative";
      have_err = true;
    }
    if (parseInt(body.stock) < 0) {
      err.err_selling_rate = "stock cannot be negative";
      have_err = true;
    }
    if (body.category == '') {
      err.err_category = "choose a category";
      have_err = true;
    }
    console.log(body)
    if(body.vat == '1'){
      body.vat = 1
    }else{
      body.vat = 0
    }
    console.log(body)
    
    res.setHeader("Content-Type", "application/json");
    if (have_err) {
      res.statusCode = 400;
      return res.end(JSON.stringify(err));
    }
    try{
      const [products] = await connection.promise().query("select * from products where product_id = ? and user = ?",[body.product_id,user.id])
      const [units] = await connection.promise().query("select * from units where unit_id = ? and user = ?",[body.unit,user.id])
      const [brands] = await connection.promise().query("select * from brands where brand_id = ? and user = ?",[body.brand,user.id])
      const [categories] = await connection.promise().query("select * from categorys where category_id = ? and user = ?",[body.category,user.id])
      if(products.length == 0 || units.length == 0 || brands.length == 0 || categories.length == 0){
        res.statusCode = 400;
        return res.end(JSON.stringify({message:"invalid product id"}))
      }
      const [results] = await connection.promise().query("update products set product_name = ? , brand = ?, unit = ?, vat = ?,category = ?, selling_rate = ? where product_id = ? and user = ?",[body.product_name,body.brand,body.unit,body.vat,body.category,body.selling_rate,body.product_id,user.id])
      if(results.affectedRows > 0){
        res.statusCode = 200
        return res.end(JSON.stringify({message:"product update successfully"}))
      }
      res.statusCode == 400
      return res.end(JSON.stringify({message:"cannot update product"}))
    }catch(err){
      console.log(err)
      return res.end(JSON.stringify({message:"database err"}))
    }
  }
  else {
    const ext = req.url.split(".");
    filepath = path.join(__dirname, `../public/${ext[1]}`, req.url);
  }
  render(req, res, filepath);
};
