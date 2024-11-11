const http = require("http");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
require("dotenv").config();
const processPost = require("./util/post");
const connection = require("./util/connect");
const { getUserByEmail } = require("./database/databases");
const crypto = require("crypto");
const {
  isValidPhoneNo,
  isValidCharacter,
  isValidDigit,
  isValidDate,
  isValidEmail,
  isValidPassword,
} = require("./util/validaton");
const auth = require("./controller/auth")
const dashboard = require('./controller/dashboard')
const units = require('./controller/unit')
let sessions = require('./util/object')
const mimeType = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".ejs": "ejs",
};



const server = http.createServer(async (req, res) => {
  let filepath = "";
  if( req.url == "/" || req.url.startsWith("/auth")){
    return auth(req,res)
  }else if(req.url.startsWith("/dashboard")){
    return dashboard(req,res)
  }else if(req.url.startsWith("/unit")){
    return units(req,res)
  }
   else {
    const ext = req.url.split(".");
    filepath = path.join(__dirname, `public/${ext[1]}`, req.url);
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
});

server.listen(3000, () => {
  console.log("app is running in port no 3000");
});
