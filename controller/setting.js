const path = require("path");
const url = require("url");
const crypto = require('crypto')
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
} = require("../util/validaton");
const { hasOwnOnlyObject } = require("ejs/lib/utils");

module.exports = async function setting(req, res) {
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
  if (user.roles != roles.superadmin && user.roles != roles.admin && user.roles != roles.normal) {
    res.writeHead(302, {
      location: "/",
    });
    return res.end();
  }
if(req.url == "/setting/view" && req.method == "GET"){
    try{
        const [users] = await connection.promise().query("select * from users where user_id = ?",[user.id])
        const [company] = await connection.promise().query("select * from companies where company_id = ?" ,[user.company]);
        let data = {users:users[0],company:company[0]}
        filepath = path.join(__dirname,"../public/html","setting.ejs")
        return renderFileWithData(req,res,filepath,data,user)
    }catch(err){
        filepath = path.join(__dirname,"../public/html","error.html")
        return render(req,res,filepath)
    }
}else if(req.url == "/setting/changepassword" && req.method == "POST"){
    const body = await processPost(req)
    if(body.new_password != body.confirm_password){
        res.statusCode = 400
        return res.end(JSON.stringify({message:"new password did not match with confirm password"}))
    }
    if(!isValidPassword(body.new_password)){
        res.statusCode = 400
        return res.end(JSON.stringify({err_newpassword:"password most be 8 digit long invlude upper and lower case without space and one special character"}))
    }
    try{
        const hashpassword = crypto
        .pbkdf2Sync(body.old_password, process.env.salt, 1000, 64, "sha512")
        .toString("hex");
        const [users] = await connection.promise().query("SELECT * FROM users WHERE user_id = ? and password = ?",[parseInt(body.user_id),hashpassword])
        if(!users || users.length == 0){
            res.statusCode = 401
            return res.end(JSON.stringify({message:"invalid password"}))
        }
        const newhashpassword = crypto
        .pbkdf2Sync(body.new_password, process.env.salt, 1000, 64, "sha512")
        .toString("hex");
        const [rows] = await connection.promise().query("update users set password = ? where user_id = ? and password = ?",[newhashpassword,parseInt(body.user_id),hashpassword])
        if(rows.affectedRows > 0){
          res.statusCode = 200;
          return res.end(JSON.stringify({message:"password change successfully"}));
        }
        res.statusCode = 500
        return res.end(JSON.stringify({message:"internal server error"}));


    }catch(err){
        res.statusCode = 500
        return res.end(JSON.stringify({message:"internal server error"}))
    }
} else {
    const ext = req.url.split(".");
    filepath = path.join(__dirname, `../public/${ext[1]}`, req.url);
  }
  render(req, res, filepath);
}