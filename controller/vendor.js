const path = require("path");
const crypto = require("crypto");
const url = require("url");
const { sessions, mimeType, roles } = require("../util/object");
const { isAdmin } = require("../util/isAdmin");
const { render, renderFileWithData } = require("../util/renderfile");
const processPost = require("../util/post");
const connection = require("../util/connect");
const {
  isValidPhoneNo,
  isValidCharacter,
  isValidEmail,
  isValidPassword,
  isValidDigit,
} = require("../util/validaton");

module.exports = async function vendor(req, res) {
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

  if (req.url == "/vendor/add" && req.method == "GET") {
    filepath = path.join(__dirname, "../public/html", "addvendor.ejs");
    return renderFileWithData(req, res, filepath,user,user);
  } else if (req.url == "/vendor/add" && req.method == "POST") {
    const body = await processPost(req);
    const err = {
      err_vendor_name: "",
      err_email: "",
      err_phone: "",
      err_pan: "",
      err_country: "",
      err_state: "",
    };
    let have_err = false;
    if (!isValidCharacter(body.vendor_name)) {
      err.err_vendor_name = "name most be string";
      have_err = true;
    }
    if (!isValidEmail(body.email)) {
      err.err_email = "invalid email";
      have_err = true;
    }
    if (!isValidPhoneNo(body.phone)) {
      err.err_phone = "invalid phone no";
      have_err = true;
    }
    if (!isValidDigit(body.pan_no)) {
      err.err_pan = "pan most be valid";
      have_err = true;
    }
    if (!isValidCharacter(body.country)) {
      err.err_country = "country most be string";
      have_err = true;
    }
    if (!isValidCharacter(body.state)) {
      err.err_state = "country most be string";
      have_err = true;
    }

    res.setHeader("Content-Type", "application/json");
    if (have_err) {
      res.statusCode = 400;
      return res.end(JSON.stringify(err));
    }
    try {
      const [pan] = await connection
        .promise()
        .query("select pan_no from vendors inner join users on users.user_id = vendors.user where vendors.pan_no = ? AND users.company_id = ?", [
          body.pan_no,
          user.company,
        ]);
      if (pan.length > 0) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "vander already added" }));
      }
      const [results] = await connection
        .promise()
        .query(
          "insert into vendors (vendor_name, email, phone, pan_no, country, state, address, user) values (?,?,?,?,?,?,?,?)",
          [
            body.vendor_name,
            body.email,
            body.phone,
            body.pan_no,
            body.country,
            body.state,
            body.address,
            user.id
          ]
        );
      if (results.affectedRows > 0) {
        res.statusCode = 200;
        return res.end(
          JSON.stringify({ message: "vendor added successfully" })
        );
      }
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "cannot save vendor" }));
    } catch (err) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error", err }));
    }
  } else if(req.url == "/vendor/view" && req.method == "GET"){
    try{
      const [result] = await connection.promise().query("select * from vendors inner join users on users.user_id = vendors.user where users.company_id = ? order by vendors.created_at asc",[user.company]);
      return renderFileWithData(req,res,path.join(__dirname,'../public/html','viewvendor.ejs'),result,user)
    }catch(err){
      return render(req,res,path.join(__dirname,"../public/html","error.html"))
    }
  } else if(req.url.startsWith("/vendor/delete") && req.method == "DELETE"){
    const parse_query = url.parse(req.url, true);
    const id = parse_query.query.id
    try{

        const [result] = await connection.promise().query('delete vendors from vendors inner join users on users.user_id = vendors.user where vendors.vendor_id = ? and users.company_id = ? ',[id,user.company])
        if(result.affectedRows > 0){
            res.statusCode = 200
            return res.end(JSON.stringify({message:"vendor deleted successfully"}))
        }else{
            res.statusCode == 400
            return res.end(JSON.stringify({message:"vendero cannot deleted"}))
        }
    }catch(err){
      
      if(err.code == 'ER_ROW_IS_REFERENCED_2'){
        res.statusCode = 409
        return res.end(JSON.stringify({message:"cannot delete vendor because it is liked with other data"}))
      }
      res.statusCode = 500
      return res.end(JSON.stringify({message:"database err"}))
    }
  }else if(req.url.startsWith("/vendor/edit") && req.method == "GET"){
    const parseurl = url.parse(req.url,true)
    const id = parseurl.query.id
    const [result] =  await connection.promise().query("select * from vendors inner join users on users.user_id = vendors.user where vendors.vendor_id = ? and users.company_id= ?",[id,user.company])
    filepath = path.join(__dirname,'../public/html',"editvendor.ejs")
    return renderFileWithData(req,res,filepath,result[0],user)
  }else if(req.url == "/vendor/edit" && req.method == "PATCH"){
    const body = await processPost(req);
    const err = {
      err_vendor_name: "",
      err_email: "",
      err_phone: "",
      err_pan: "",
      err_country: "",
      err_state: "",
    };
    let have_err = false;
    if (!isValidCharacter(body.vendor_name)) {
      err.err_vendor_name = "name most be string";
      have_err = true;
    }
    if (!isValidEmail(body.email)) {
      err.err_email = "invalid email";
      have_err = true;
    }
    if (!isValidPhoneNo(body.phone)) {
      err.err_phone = "invalid phone no";
      have_err = true;
    }
    if (!isValidDigit(body.pan_no)) {
      err.err_pan = "pan most be valid";
      have_err = true;
    }
    if (!isValidCharacter(body.country)) {
      err.err_country = "country most be string";
      have_err = true;
    }
    if (!isValidCharacter(body.state)) {
      err.err_state = "country most be string";
      have_err = true;
    }

    res.setHeader("Content-Type", "application/json");
    if (have_err) {
      res.statusCode = 400;
      return res.end(JSON.stringify(err));
    }
    try{
      const [vendor] = await connection.promise().query("select * from vendors inner join users on users.user_id = vendors.user where vendors.vendor_id = ? and users.company_id = ?",[body.vendor_id,user.company])
      if(vendor.length == 0){
        res.statusCode = 400;
        return res.end(JSON.stringify({message:"invalid vendor id"}))
      }
      const [result] = await connection.promise().query("update vendors inner join users on users.user_id = vendors.user set vendors.vendor_name = ?, vendors.email = ?, vendors.phone=?, vendors.pan_no=?, vendors.country=?, vendors.state=?, vendors.address=? where vendors.vendor_id = ? and users.company_id = ?",[body.vendor_name,body.email,body.phone,body.pan_no,body.country,body.state,body.address,parseInt(body.vendor_id),user.company])
      if(result.affectedRows > 0){
        res.statusCode = 200
        return res.end(JSON.stringify({message:"vendor update successfully"}))
      }
      res.statusCode = 400
      return res.end(JSON.stringify({message:"cannot update vendor"}))
    }catch(err){
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error", err }));
    }
  }
  else {
    const ext = req.url.split(".");
    filepath = path.join(__dirname, `../public/${ext[1]}`, req.url);
  }
  render(req, res, filepath);
};
