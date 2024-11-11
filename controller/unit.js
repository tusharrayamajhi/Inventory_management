const ejs = require("ejs");
const processPost = require("../util/post")
const connection = require('../util/connect')
const fs = require("fs");
const path = require("path");
let sessions = require("../util/object");
const mimeType = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".ejs": "ejs",
};

const {
  isValidPhoneNo,
  isValidCharacter,
  isValidDigit,
  isValidDate,
  isValidEmail,
  isValidPassword,
} = require("../util/validaton");


module.exports = async function units(req, res) {
  let filepath = "";
  if (req.url == "/unit/add" && req.method == "GET") {
      console.log(req.headers.referer)
    if (!req.headers.cookie) {
      res.writeHead(302, { location: "/" });
      return res.end();
    } else {
      const sessions_id = req.headers.cookie.split("=")[1];
      const user = sessions[sessions_id];
      if (!user) {
        res.writeHead(302, {
          "Set-Cookie": `sessionId=;HttpOnly;Max-Age=0;path=/`,
          location: "/",
        });
        res.end();
        return;
      }
      if(user.roles != 'admin'){
        res.writeHead(302, {
            location: "/",
          });
          res.end();
          return;
      }

    }
    filepath = path.join(__dirname, "../public/html", "unit.ejs");
    fs.readFile(filepath, (err, data) => {
      if (err) {
        fs.readFile("../public/html/error.html", (err, data) => {
          res.writeHead(400, { "Content-Type": "text/html" });
          return res.end(data);
        });
      } else {
        const extname = path.extname(filepath);
        const contentType = mimeType[extname] || "text/plain";
        res.writeHead(200, { "Content-Type": contentType });
        return res.end(data);
      }
    });
    return;
  } else if (req.url == "/unit/add" && req.method == "POST") {
    if (!req.headers.cookie) {
      res.writeHead(302, { location: "/" });
      return res.end();
    }
    const session_id = req.headers.cookie.split("=")[1];
    const user = sessions[session_id];
    if (!user) {
      res.writeHead(302, {
        "Set-Cookie": `sessionId=;HttpOnly;Max-Age=0;path=/`,
        location: "/",
      });
      return res.end();
    }
    if (user.roles != "admin") {
      res.writeHead(302,{location:"/"})
      return res.end();
    }
    const body = await processPost(req)
    console.log(body)
    let err ={
      unit_name:'',
      short_name:''
    }
    let error = false;
    if(!isValidCharacter(body.unit_name)){
      err[unit_name] = 'invalid name';
      error =true;
    }
    if(!isValidCharacter(body.short_name)){
      err[short_name] = 'invalid name';
      error = true
    }
    const {rows} = await connection.promise().query("select * from units where unit_name = ? OR short_name = ?",[body.unit_name,body.short_name]);
    console.log(rows)
    return
  } else {
    const ext = req.url.split(".");
    filepath = path.join(__dirname, `../public/${ext[1]}`, req.url);
  }
  fs.readFile(filepath, (err, data) => {
    if (err) {
      fs.readFile("../public/html/error.html", (err, data) => {
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
