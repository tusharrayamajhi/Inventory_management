const path = require("path");
const fs = require("fs")
const processPost = require("../util/post")
require("dotenv").config();
const connection = require("../util/connect");
const { getUserByEmail } = require("../database/databases");
const crypto = require("crypto");
let sessions = require('../util/object')
const {
  isValidPhoneNo,
  isValidCharacter,
  isValidEmail,
  isValidPassword,
} = require("../util/validaton");
const mimeType = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".ejs": "ejs",
};


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
    const body = await processPost(req);
    const result = await getUserByEmail(body.email);
    if (!result) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ message: "give email id not found" }));
    }
    const hashpassword = crypto
      .pbkdf2Sync(body.password, process.env.salt, 1000, 64, "sha512")
      .toString("hex");
    res.setHeader("Content-Type", "application/json");
    if (result.password != hashpassword) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ message: " invalid password" }));
    }
    if (result.is_active == 0) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ message: "your account is not active" }));
    }
    const session_id = crypto.randomBytes(16).toString("hex");
    sessions[session_id] = {
      email: body.email,
      id: result.user_id,
      roles: result.roles,
    };
    res.writeHead(200, {
      "Set-Cookie": `sessionId=${session_id};HttpOnly;Max-Age=3600;path=/`,
    });
    return res.end(JSON.stringify({ message: "login Successfully" }));
  } else if (req.url == "/auth/signup" && req.method == "GET") {
    if (req.headers.cookie) {
      res.writeHead(302, { location: "/dashboard" });
      return res.end();
    } else {
      filepath = path.join(__dirname, "../public/html", "signup.ejs");
    }
  } else if (req.url == "/auth/signup" && req.method == "POST") {
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
      res.statusCode = 404;
      return res.end(JSON.stringify(err));
    } else {
      const hashpassword = crypto
        .pbkdf2Sync(body.password, process.env.salt, 1000, 64, "sha512")
        .toString("hex");
      const { err, result } = await connection
        .promise()
        .query(
          "insert into users (name,address,phone,email,password) values (?,?,?,?,?)",
          [body.name, body.address, body.phone, body.email, hashpassword]
        );
      if (err) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({
            message: "cannot save data in database",
            err: err.message,
          })
        );
      } else {
        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            message:
              "register successfully contact to Admin for further process ",
            result: result,
          })
        );
      }
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
  fs.readFile(filepath, (err, data) => {
    if (err) {
      fs.readFile("public/html/error.html", (err, data) => {
        res.writeHead(404, { "Content-Type": "text/html" });
        return res.end(data);
      });
    } else {
      const extname = path.extname(filepath);
      const contentType = mimeType[extname] || "text/plain";
      res.writeHead(200, { "Content-Type": contentType });
      return res.end(data);
    }
  });
};
