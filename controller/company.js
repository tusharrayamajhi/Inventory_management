const path = require("path");
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
  isvalidurl
} = require("../util/validaton");



module.exports = async function company(req,res) {
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
  if (user.roles != roles.superadmin){
    res.writeHead(302,{
        location:"/"
    })
    return res.end()
  } 
  if(req.url == "/company/add" && req.method == "GET"){
    filepath = path.join(__dirname,"../public/html","addcompany.ejs")
  }else if(req.url == "/company/add" && req.method == "POST"){
    const body = await processPost(req)
    let err = {
        err_cmp_name:'',
        err_reg_no:'',
        err_phone:'',
        err_email:'',
        err_pan_vat:'',
        err_address:"",
        err_country:'',
        err_state:'',
        err_city:'',
        err_state:'',
        err_bank:'',
        err_ac_no:'',
        err_link:''
    }
    let haserr = false
    if(body.vat == 'on'){
      body.vat = 1;
    }else{
      body.vat = 0;
    }
    console.log(body)

    if(!isValidCharacter(body.company_name)){
        err.err_cmp_name = "company name most be string"
        haserr = true
    }
    if(!isValidDigit(body.registration_no)){
        err.err_reg_no = "register no most be number"
        haserr = true
    }
    if(!isValidPhoneNo(body.phone)){
        err.err_phone = "invalid phone no"
        haserr = true
    }
    if(!isValidDigit(body.pan_no)){
        err.err_pan_vat = "error pan or vat no"
        haserr = true
    }
    if(body.address == ""){
        err.err_address = "address is required"
        haserr = true
    }
    if(!isValidCharacter(body.country)){
        err.err_country = "country name is required and most be type string"
        haserr = true
    }
    if(!isValidCharacter(body.state)){
        err.err_state = "state should be string "
        haserr = true
    }
    if(!isValidCharacter(body.city)){
      err.err_city = "city most and string"
      haserr = true
    }
    if(!isValidCharacter(body.bank_name)){
      err.bank_name = "bank most be string"
      haserr = true
    }
    if(!isValidDigit(body.account_no)){
      err.account_no = "account no most be interger"
      haserr = true
    }
    if(!isvalidurl(body.website)){
      err.err_link = "invalid url";
      haserr = true
    }
    if(haserr){
      res.statusCode = 400
      return res.end(JSON.stringify(err))
    }
    try{

      const [result] = await connection.promise().query("INSERT INTO companies (company_name,registration_no,phone,email, pan_vat_no,isvat,address,country,state,city,zip,  bank_name,  account_no,website) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[body.company_name,body.registration_no,body.phone,body.email,body.pan_no,body.vat,body.address,body.country,body.state,body.city,body.zip,body.bank_name,body.account_no,body.website]);
      console.log(result)
      if(result.affectedRows > 0){
        res.statusCode = 200
        return res.end(JSON.stringify({message:"successfully created company"}))
      }
      res.statusCode = 404
      return res.end(JSON.stringify({message:"unable to create a company"}))
    }catch(err){
     if(err.code == 'ER_DUP_ENTRY'){
      res.statusCode = 400
      return res.end(JSON.stringify({message:"given pan number is already used"}))
     }
      res.statusCode = 500
      return res.end(JSON.stringify({message:"something went wrong",err}))
    }

  }else if(req.url == "/company/view" && req.method == "GET"){
    try{
      const [result] = await connection.promise().query('select * from companies')
      return renderFileWithData(req,res,path.join(__dirname,'../public/html','viewcompanies.ejs',result))
    }catch(err){
      return render(req,res,path.join(__dirname,'../public/html','error.html'))
    }
  }
  else {
        const ext = req.url.split(".");
        filepath = path.join(__dirname, `../public/${ext[1]}`, req.url);
      }
      render(req, res, filepath);
}