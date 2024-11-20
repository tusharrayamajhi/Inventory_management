const path = require("path");
const url = require("url");
const { sessions, mimeType, roles } = require("../util/object");
const { isAdmin } = require("../util/isAdmin");
const { isNormalUser } = require("../util/isNormalUser");
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

module.exports = async function customer(req, res) {
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
  if (user.roles != roles.admin && user.roles != roles.normal) {
    res.writeHead(302, {
      location: "/",
    });
    return res.end();
  }
  if (req.url == "/customer/add" && req.method == "GET") {
   
    filepath = path.join(__dirname, "../public/html", "addcustomer.ejs");
    return render(req, res, filepath);
  } else if (req.url == "/customer/add" && req.method == "POST") {
   
    const body = await processPost(req);
    const err = {
      err_name: "",
      err_phone: "",
      err_email: "",
      err_pan: "",
    };
    let have_err = false;
    if (!isValidCharacter(body.name)) {
      err.err_name = "name most be string";
      have_err = true;
    }
    if (!isValidEmail(body.email)) {
      err.err_email = " invalid email address";
      have_err = true;
    }
    if (!isValidPhoneNo(body.phone)) {
      err.err_phone = "invalid phone number";
      have_err = true;
    }
    if (!isValidDigit(body.pan)) {
      err.err_pan = "pan no most be number";
      have_err = true;
    }
    res.setHeader("Content-Type", "application/json");
    if (have_err) {
      res.statusCode = 400;
      return res.end(JSON.stringify(err));
    }
    try {
      const [result] = await connection
        .promise()
        .query("select * from customers where (pan = ?) AND user_id = ?", [
          body.pan,
          user.id,
        ]);
      console.log(result);
      if (result.length > 0) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "customer already exits" }));
      }
      const [results] = await connection
        .promise()
        .query(
          "insert into customers (name, phone, email, address, pan , user_id) values (?,?,?,?,?,?)",
          [body.name, body.phone, body.email, body.address, body.pan, user.id]
        );
      if (results.affectedRows == 0) {
        res.statusCode == 400;
        return res.end(
          JSON.stringify({ message: "cannot save data in database" })
        );
      }
      res.statusCode == 200;
      return res.end(JSON.stringify({ message: "customer save sccessfully" }));
    } catch (err) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error", err }));
    }
  } else if (req.url == "/customer/view" && req.method == "GET") {
    
    filepath = path.join(__dirname, "../public/html", "viewcustomer.ejs");
    const [result] = await connection
      .promise()
      .query("select * from customers where user_id = ?", [user.id]);
    return renderFileWithData(req, res, filepath, result);
  } else if (req.url.startsWith("/customer/delete") && req.method == "DELETE") {
    
    const parse_query = url.parse(req.url, true);
    console.log(parse_query.query.id);

    try {
      res.setHeader("Content-Type", "application/json");
      const [result] = await connection
        .promise()
        .query("select * from customers where customer_id = ? AND user_id = ?", [
          parse_query.query.id,
          user.id,
        ]);
      if (result.length == 0) {
        res.statusCode = 404;
        return res.end(
          JSON.stringify({ message: "no customer found for given id" })
        );
      }
      const [results] = await connection
        .promise()
        .query("delete from customers where customer_id = ? AND user_id = ?", [
          parse_query.query.id,
          user.id,
        ]);
      if (results.affectedRows > 0) {
        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            message: "successfully delete customer",
          })
        );
      }
      res.statusCode = 400;
      return res.end(JSON.stringify({ message: "cannot delete data" }));
    } catch (err) {
      if(err.code == 'ER_ROW_IS_REFERENCED_2'){
        res.statusCode = 409
        return res.end(JSON.stringify({message:"The customer cannot be deleted because it is associated with one or more sells."}))
      }
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error" }));
    }
  } else if (req.url.startsWith("/customer/edit") && req.method == "GET") {
    const parseurl = url.parse(req.url, true);
    const [result] = await connection
      .promise()
      .query("select * from customers where customer_id = ? AND user_id = ?", [
        parseurl.query.id,
        user.id,
      ]);
    filepath = path.join(__dirname, "../public/html", "editcustomer.ejs");
    return renderFileWithData(req, res, filepath, result[0]);
  } else if (req.url == "/customer/edit" && req.method == "PATCH") {
   
    const body = await processPost(req);
    const err = {
      err_name: "",
      err_phone: "",
      err_email: "",
      err_pan: "",
    };
    let have_err = false;
    if (!isValidCharacter(body.name)) {
      err.err_name = "name most be string";
      have_err = true;
    }
    if (!isValidEmail(body.email)) {
      err.err_email = " invalid email address";
      have_err = true;
    }
    if (!isValidPhoneNo(body.phone)) {
      err.err_phone = "invalid phone number";
      have_err = true;
    }
    if (!isValidDigit(body.pan)) {
      err.err_pan = "pan no most be number";
      have_err = true;
    }
    res.setHeader("Content-Type", "application/json");
    if (have_err) {
      res.statusCode = 400;
      return res.end(JSON.stringify(err));
    }
    try {
     const [results] = await connection.promise().query("select * from customers where customer_id = ? AND user_id = ?",[body.id,user.id])
     if(results.length == 0){
      res.statusCode = 404;
        return res.end(
          JSON.stringify({ message: "invalid customer" })
        );
     }
      const [result] = await connection
        .promise()
        .query(
          "update customers set name = ?, phone = ?,email = ?,address = ?,pan = ? where customer_id = ? and user_id = ?",
          [body.name, body.phone, body.email, body.address,body.pan,body.id,user.id]
        );
      console.log(result);
      if (result.affectedRows > 0) {
        res.statusCode = 200;
        return res.end(
          JSON.stringify({ message: "customer updated successfully" })
        );
      } else {
        res.statusCode = 500;
        return res.end(JSON.stringify({ message: "something went wrong" }));
      }
    } catch (err) {
      return res.end(JSON.stringify({ message: "database error", err }));
    }
  } else {
    const ext = req.url.split(".");
    filepath = path.join(__dirname, `../public/${ext[1]}`, req.url);
  }
  render(req, res, filepath);
};
