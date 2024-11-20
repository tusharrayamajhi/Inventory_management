const http = require("http");
const path = require("path")
require("dotenv").config();
let {render} = require("./util/renderfile")
const auth = require("./controller/auth")
const dashboard = require('./controller/dashboard')
const units = require('./controller/unit')
const category = require("./controller/category")
const brand = require("./controller/brand")
const customer = require('./controller/customer')
const user = require("./controller/user")
const product = require("./controller/product")
const vendor = require("./controller/vendor")
const purchase = require("./controller/purchase")
const company = require("./controller/company")
const server = http.createServer(async (req, res) => {
  let filepath = "";
  if( req.url == "/" || req.url.startsWith("/auth")){
    return auth(req,res)
  }else if(req.url.startsWith("/dashboard")){
    return dashboard(req,res)
  }else if(req.url.startsWith("/unit")){
    return units(req,res)
  }else if(req.url.startsWith("/brand")){
    return brand(req,res)
  }else if(req.url.startsWith("/category")){
    return category(req,res)
  }else if(req.url.startsWith("/customer")){
    return customer(req,res)
  }else if(req.url.startsWith("/user")){
    return user(req,res)
  }else if(req.url.startsWith("/product")){
    return product(req,res)
  }else if(req.url.startsWith("/vendor")){
    return vendor(req,res)
  }else if(req.url.startsWith("/purchase")){
    return purchase(req,res)
  }else if(req.url.startsWith("/company")){
    return company(req,res)
  }
   else {
    const ext = req.url.split(".");
    filepath = path.join(__dirname, `public/${ext[1]}`, req.url);
  }
render(req,res,filepath)
  
});

server.listen(3000, () => {
  console.log("app is running in port no 3000");
});
