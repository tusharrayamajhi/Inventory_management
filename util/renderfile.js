const fs = require("fs");
const path = require('path');
const ejs = require('ejs')
const {mimeType} = require('../util/object')
function render(req,res,filepath){
    ejs.renderFile(filepath, (err, data) => {
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
}
function renderFileWithData(req,res,filepath,data){
    ejs.renderFile(filepath,{data:data}, (err, data) => {
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
}
module.exports ={
    render,renderFileWithData
}