
const ejs = require('ejs')
const {render,renderFileWithData} = require("../util/renderfile")
const fs = require('fs')
const path = require('path')
let{sessions,mimeType} = require('../util/object');
  
module.exports = async function dashboard(req, res) {
    let filepath = "";
  if (req.url == "/dashboard" && req.method == "GET") {
    if (!req.headers.cookie) {
      res.writeHead(302, {
        "Set-Cookie": `sessionId=;HttpOnly;Max-Age=0;path=/`,
        location: "/",
      });
      return res.end();
    } else {
      const session_id = req.headers.cookie.split("=")[1];
      const user = sessions[session_id];
      if (!user) {
        res.writeHead(302, {
          "Set-Cookie": `sessionId=;HttpOnly;Max-Age=0;path=/`,
          location: "/",
        });
        res.end();
        return;
      }
      filepath = path.join(__dirname, "../public/html", "dashboard.ejs");
      return renderFileWithData(req,res,filepath,user,user)
      // const fdata= {user}
      // ejs.renderFile(filepath,fdata, (err, data) => {
      //   if (err) {
      //     ejs.renderFile("../public/html/error.html", (err, data) => {
      //       res.writeHead(404, { "Content-Type": "text/html" });
      //       return res.end(data);
      //     });
      //   } else {
      //     const extname = path.extname(filepath);
      //     const contentType = mimeType[extname] || "text/plain";
      //     res.writeHead(200, { "Content-Type": contentType });
      //     return res.end(data);
      //   }
    
      // });
      return
    }
  }else{
    const ext = req.url.split(".");
    filepath = path.join(__dirname, `../public/${ext[1]}`, req.url);
  }
  render(req,res,filepath)
  
};
