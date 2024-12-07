const path = require("path");
const fs = require("fs");
const processPost = require("../util/post");
require("dotenv").config();
const connection = require("../util/connect");
const { getUserByEmail } = require("../database/databases");
const crypto = require("crypto");
let { sessions, mimeType, roles } = require("../util/object");
let { render } = require("../util/renderfile");
const {
  isValidPhoneNo,
  isValidCharacter,
  isValidEmail,
  isValidPassword,
} = require("../util/validaton");

module.exports = async function auth(req, res) {
  let filepath = "";
  if ((req.url == "/" || req.url == "/auth/login") && req.method == "GET") {
    if (req.headers.cookie) {
      const session_id = req.headers.cookie.split("=")[1];
      if (session_id) {
        res.writeHead(302, { location: "/dashboard" });
        return res.end();
      }
    }
    filepath = path.join(__dirname, "../public/html", "login.ejs");
  } else if (req.url == "/auth/login" && req.method == "POST") {
    try {
      const body = await processPost(req);
      const result = await getUserByEmail(body.email);
      if (!result) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ message: "give email id not found" }));
      }
      const hashpassword = crypto
        .pbkdf2Sync(body.password, process.env.salt, 1000, 64, "sha512")
        .toString("hex");
      res.setHeader("Content-Type", "application/json");
      if (result.password != hashpassword) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ message: " invalid password" }));
      }
      if (!result.roles) {
        res.statusCode = 403;
        return res.end(
          JSON.stringify({ message: "your have not assign any roles" })
        );
      }
      if (result.is_active == 0) {
        res.statusCode = 403;
        return res.end(
          JSON.stringify({ message: "your account is not active" })
        );
      }
      if (!result.company_id ) {
        res.statusCode = 403;
        return res.end(
          JSON.stringify({ message: "your account have not assign any company" })
        );
      }
      const session_id = crypto.randomBytes(16).toString("hex");
      sessions[session_id] = {
        email: body.email,
        id: result.user_id,
        roles: result.roles,
        company:result.company_id,
        company_logo:result.company_logo,
        company_name:result.company_name,
        username:result.name,
        user_image:result.user_image,
        exipre:'1h',
        createdBy:result.created_by
        
      };
      res.writeHead(200, {
        "Set-Cookie": `sessionId=${session_id};HttpOnly;Max-Age=3600;path=/`,
      });
      return res.end(JSON.stringify({ message: "login Successfully" }));
    } catch (err) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "Internal server error", err }));
    }
  } else if (req.url == "/auth/signup" && req.method == "GET") {
    if (req.headers.cookie) {
      res.writeHead(302, { location: "/dashboard" });
      return res.end();
    } else {
      filepath = path.join(__dirname, "../public/html", "signup.ejs");
    }
  } else if (req.url == "/auth/signup" && req.method == "POST") {
    try {
      const body = await processPost(req);
      let err = {
        error_name: "",
        error_email: "",
        error_phone: "",
        error_password: "",
      };
      let error = false;
      if (!isValidEmail(body.email)) {
        err.error_email = "Invalid email address";
        error = true;
      }
      if (!isValidPhoneNo(body.phone)) {
        err.error_phone = "invalid phone no";
        error = true;
      }
      if (!isValidPassword(body.password)) {
        err.error_password = "invalid password";
        error = true;
      }
      if (!isValidCharacter(body.name)) {
        err.error_name = "use only character";
        error = true;
      }
      res.setHeader("Content-Type", "application/json");
      if (error) {
        res.statusCode = 400;
        return res.end(JSON.stringify(err));
      }
      const [results] = await connection
        .promise()
        .query(
          "select * from users where (email = ?)",
          [body.email]
        );
      if (results.length > 0) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ message: "user already exits with given email address use different email address" }));
      }
      const hashpassword = crypto
        .pbkdf2Sync(body.password, process.env.salt, 1000, 64, "sha512")
        .toString("hex");
        
      const [result] = await connection
        .promise()
        .query(
          "insert into users (name,address,phone,email,password) values (?,?,?,?,?)",
          [body.name, body.address, body.phone, body.email, hashpassword]
        );
      if (result.affectedRows > 0) {
        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            message:
              "register successfully contact to Admin for further process ",
            
          })
        );
      }
      res.statusCode = 401;
      return res.end(
        JSON.stringify({
          message: "cannot save data in database",
          err: err.message,
        })
      );
    } catch (err) {
      console.log(err)
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "Internal server error", err }));
    }
  } else if (req.url == "/auth/logout" && req.method == "GET") {
    if (req.headers.cookie) {
      const session_id = req.headers.cookie.split("=")[1];
      delete sessions[session_id];
      res.writeHead(302, { location: "/" });
      return res.end();
    }
  } else {
    const ext = req.url.split(".");
    filepath = path.join(__dirname, `../public/${ext[1]}`, req.url);
  }
  return render(req, res, filepath);
};
