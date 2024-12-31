const path = require("path");
const crypto = require("crypto");
const url = require("url");
const { sessions, mimeType, roles } = require("../util/object");
const { isAdmin } = require("../util/isAdmin");
const { render, renderFileWithData } = require("../util/renderfile");
const processPost = require("../util/post");
const connection = require("../util/connect");
const partMultipartData = require("../util/parseMultipartData")

const {
  isValidPhoneNo,
  isValidCharacter,
  isValidEmail,
  isValidPassword,
  isValidDigit,
} = require("../util/validaton");

module.exports = async function user(req, res) {
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
  if (user.roles != roles.superadmin && user.roles != roles.admin) {
    res.writeHead(302, {
      location: "/",
    });
    return res.end();
  }
  if (req.url == "/user/add" && req.method == "GET") {
    let company = [];
    if (user.roles == roles.superadmin) {
      const [company_ids] = await connection
        .promise()
        .query("select company_id from users where company_id is not null");
        let newcompany_ids = company_ids.map((data) => data.company_id);
        let query = "select * from companies";
        let params = [];
        if (newcompany_ids.length > 0) {
          query = "select * from companies where company_id  not in (?)";
          params = [newcompany_ids];
        }
        const [result] = await connection.promise().query(query, params);
      if (result.length != 0) {
        company = result;
      }else {
        company = []
      }

    }
    filepath = path.join(__dirname, "../public/html", "adduser.ejs");
    let data;
    if(company.length != 0){
      data = { user, company };
    }else {
      data = { user};
    }
    return renderFileWithData(req, res, filepath, data,user);
  } else if (req.url == "/user/add" && req.method == "POST") {
    let body = {}
    try{
      body =  await partMultipartData(req,res)
    }catch(err){
      res.statusCode = 404
      return res.end(JSON.stringify({message:"company logo is not selected"}))
    }
    if (!body.is_active) {
      body.is_active = 0;
    }
    const err = {
      err_name: "",
      err_phone: "",
      err_email: "",
      err_password: "",
      err_roles: "",
    };
    let have_err = false;

    if (!isValidCharacter(body.name)) {
      err.err_name = "name most be string";
      have_err = true;
    }
    if (!isValidPhoneNo(body.phone)) {
      err.err_phone = "invalid phone no";
      have_err = true;
    }
    if (!isValidEmail(body.email)) {
      err.err_email = "invalid email address";
      have_err = true;
    }
    if (!isValidPassword(body.password)) {
      err.err_password = "invalid password";
      have_err = true;
    }
    if (body.roles == "") {
      body.roles = null;
    } else if (body.roles && !isValidCharacter(body.roles)) {
      err.err_roles = "roles must be a valid string";
      have_err = true;
    } else if (
      body.roles &&
      body.roles !== roles.admin &&
      body.roles !== roles.normal &&
      body.roles !== roles.superadmin
    ) {
      err.err_roles = "Invalid role selected";
      have_err = true;
    }
    if (user.roles == roles.superadmin) {
      if (body.company != "") {
        if (!parseInt(body.company)) {
          err.err_company = "company id most be interger";
          have_err = true;
        }
      }else{
        body.company = null
      }
    } else if (body.company) {
      err.err_company = "you cannot assign company";
      have_err = true;
    }
    if (user.roles != roles.superadmin) {
      if (body.roles == "superadmin") {
        err.err_roles = "invalid roles";
        have_err = true;
      }
      body.company = null;
    }

    res.setHeader("Content-Type", "application/json");
    if (have_err) {
      res.statusCode = 400;
      if (user.roles == roles.admin) {
        return res.end(JSON.stringify(err));
      }
      return res.end(JSON.stringify(err));
    }
    try {
      const [result] = await connection
        .promise()
        .query("select * from users where email = ?", [body.email]);
      if (result.length > 0) {
        res.statusCode = 500;
        return res.end(
          JSON.stringify({
            message:
              "user already exits",
          })
        );
      }
      if (user.roles == roles.superadmin && body.company) {
        const [result] = await connection
          .promise()
          .query("select * from companies where company_id = ?", [
            parseInt(body.company),
          ]);
        if (result.length == 0) {
          res.statusCode = 500;
          return res.end(
            JSON.stringify({
              message: "invalid company id",
            })
          );
        }
        const [results] = await connection
          .promise()
          .query("select * from users where company_id = ?", [
            parseInt(body.company),
          ]);
        if (results.length > 0) {
          res.statusCode = 500;
          return res.end(
            JSON.stringify({
              message: `${result[0].company_name} is already assign to other user`,
            })
          );
        }
      }
      const newpassword = crypto.pbkdf2Sync(
        body.password,
        process.env.salt,
        1000,
        64,
        "sha512"
      ).toString('hex');
      let query = ''
      let param =[]
      if(user.roles == roles.superadmin){
        query = "INSERT INTO users (name, address, phone, email, password, is_active, roles,company_id,created_by,user_image) VALUES (?,?,?,?,?,?,?,?,?,?)",
          param = [
            body.name,
            body.address,
            body.phone,
            body.email,
            newpassword,
            parseInt(body.is_active),
            body.roles,
            body.company,
            user.id,
            body.image
          ]
      }else{
        query = "INSERT INTO users (name, address, phone, email, password, is_active, roles,company_id,created_by,user_image) VALUES (?,?,?,?,?,?,?,?,?,?)",
          param = [
            body.name,
            body.address,
            body.phone,
            body.email,
            newpassword,
            parseInt(body.is_active),
            body.roles,
            user.company,
            user.id,
            body.image
          ]
      }
      // const [results] = await connection
      //   .promise()
      //   .query(
      //     "INSERT INTO users (name, address, phone, email, password, is_active, roles,company_id,created_by) VALUES (?,?,?,?,?,?,?,?,?)",
      //     [
      //       body.name,
      //       body.address,
      //       body.phone,
      //       body.email,
      //       newpassword,
      //       parseInt(body.is_active),
      //       body.roles,
      //       body.company,
      //       user.id,
      //     ]
      //   );
      const [results] = await connection.promise().query(query,param)
      if (results.affectedRows == 0) {
        res.statusCode == 500;
        return res.end(
          JSON.stringify({ message: "cannot save data in database" })
        );
      }
      res.statusCode == 200;
      return res.end(JSON.stringify({ message: "user save sccessfully" }));
    } catch (err) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error", err }));
    }
  } else if ((req.url == "/user/view" || req.url.startsWith("/user/view")) && req.method == "GET") {
    const parse_url = url.parse(req.url,true)
    let page = parse_url.query.page
    if(!page || page == 0){
      page = 0
    }else{
      page = page - 1;
    }
    filepath = path.join(__dirname, "../public/html", "viewuser.ejs");
    let query = '';
    let params = []
    let countquery = ""
    let countparams = []
    if(user.roles == roles.superadmin){
      query = "select users.*, companies.company_name as company_name from users left join companies on users.company_id = companies.company_id order by users.created_at asc limit ? offset ?";
      params = [10,page*10]
      countquery = "select count(*) as total from users";
    }else {
        query = "select users.*,companies.company_name as company_name from users left join companies on users.company_id = companies.company_id  where users.company_id = ? order by users.created_at asc limit ? offset ?"
        params = [user.company,10,page*10]
        countquery ="select count(*) as total from users where company_id = ? ";
        countparams = [user.company]

    }
    const [result] = await connection
      .promise()
      .query(query,params);
      const [no_of_users] = await connection.promise().query(countquery,countparams)
      const total_page = Math.ceil(no_of_users[0].total/10)
      const data = {result,total_page}
    return renderFileWithData(req, res, filepath, data,user);
  } else if (req.url.startsWith("/user/delete") && req.method == "DELETE") {
    const parse_query = url.parse(req.url, true);
    try {
      res.setHeader("Content-Type", "application/json");
      const [result] = await connection
        .promise()
        .query("select * from users where user_id = ?", [
          parse_query.query.id
        ]);
      if (result.length == 0) {
        res.statusCode = 404;
        return res.end(
          JSON.stringify({ message: "no user found for given id" })
        );
      }
      const [results] = await connection
        .promise()
        .query("delete from users where user_id = ?", [
          parse_query.query.id
        ]);
      if (results.affectedRows > 0) {
        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            message: "successfully deleted user",
          })
        );
      }
      res.statusCode = 400;
      return res.end(
        JSON.stringify({ message: "cannot delete user" })
      );
    } catch (err) {
      if(err.code == 'ER_ROW_IS_REFERENCED_2'){
        res.statusCode = 409
        return res.end(JSON.stringify({message:"The user cannot be deleted because it is associated with other"}))
      }
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error" }));
    }
  } else if (req.url.startsWith("/user/edit") && req.method == "GET") {
   
    const parseurl = url.parse(req.url, true);
    const [results] = await connection
      .promise()
      .query("select * from users where user_id = ? or user_id = ? AND created_by = ?", [
        parseurl.query.id,
        user.id,
        user.id,
      ]);
      
      let company ={}
      if(user.roles == roles.superadmin){

        const [results] = await connection.promise().query("select * from companies")
        company = results
      }
    filepath = path.join(__dirname, "../public/html", "edituser.ejs");
    let result = results[0]
    let data = {user,result,company}
    return renderFileWithData(req, res, filepath, data,user);
  } else if (req.url == "/user/edit" && req.method == "PATCH") {
    const contentType = req.headers['content-type'];
  let body = {};
  if (contentType && contentType.startsWith("application/json")) {
    // Parse JSON data
    body = await processPost(req); // Assumes this function parses JSON
  } else if (contentType && contentType.startsWith("multipart/form-data")) {
    // Parse multipart form data
    body = await partMultipartData(req, res);
  }
    if (!body.is_active) {
      body.is_active = 0;
    }
    const err = {
      err_name: "",
      err_phone: "",
      err_email: "",
      err_roles: "",
    };
    let have_err = false;

    if (!isValidCharacter(body.name)) {
      err.err_name = "name most be string";
      have_err = true;
    }
    if (!isValidPhoneNo(body.phone)) {
      err.err_phone = "invalid phone no";
      have_err = true;
    }
    if (!isValidEmail(body.email)) {
      err.err_email = "invalid email address";
      have_err = true;
    }
    if (body.roles == 'select roles') {
      body.roles = null;
    } else if (body.roles && !isValidCharacter(body.roles)) {
      err.err_roles = "roles must be a valid string";
      have_err = true;
    } else if (
      body.roles &&
      body.roles !== roles.admin &&
      body.roles !== roles.normal &&
      body.roles !== roles.superadmin
    ) {
      err.err_roles = "Invalid role selected";
      have_err = true;
    }
    if (user.roles == roles.superadmin) {
      if (body.company == 'select company') {
        body.company = null
      }else{
        if (!parseInt(body.company)) {
          err.err_company = "company id most be interger";
          have_err = true;
        }
      }
    } else if (body.company) {
      err.err_company = "you cannot assign company";
      have_err = true;
    }
    if (user.roles != roles.superadmin) {
      if (body.roles == "superadmin") {
        err.err_roles = "invalid roles";
        have_err = true;
      }
      body.company = null;
    }

    res.setHeader("Content-Type", "application/json");
    if (have_err) {
      res.statusCode = 400;
      if (user.roles == roles.admin) {
        return res.end(JSON.stringify(err));
      }
      return res.end(JSON.stringify(err));
    }
    try {
      if (user.roles == roles.superadmin && body.company) {
        const [result] = await connection
        .promise()
        .query("select * from companies where company_id = ?", [
          parseInt(body.company),
        ]);
        if (result.length == 0) {
          res.statusCode = 404;
          return res.end(
            JSON.stringify({
              message: "invalid company id",
            })
          );
        }
        const [results] = await connection
        .promise()
        .query("select * from users where company_id = ?", [parseInt(body.company)]);
        if (results.length > 0 && results[0].company_id == body.company_id) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              message: `${result[0].company_name} is already assign to other user`,
            })
          );
        }
      }
      const [result] = await connection
      .promise()
      .query(
        "select * from users where user_id = ?",
        [parseInt(body.user_id)]
      );
      if (result.length == 0) {
        res.statusCode = 404;
        return res.end(
          JSON.stringify({ message: "no user found for the given id or you dont have authority to edit this user" })
        );
      }
      const [rows] = await connection.promise().query("update users set name = ? , address = ?,phone= ?, email = ?, is_active = ?,roles = ?,company_id = ? , user_image = ? where user_id = ?",[body.name,body.address,body.phone,body.email,body.is_active,body.roles,body.company != null ? parseInt(body.company):user.company,body.image,parseInt(body.user_id)]);
      
      if(rows.affectedRows > 0){
        res.statusCode = 200;
        return res.end(JSON.stringify({message:"successfully update user"}))
      }
      res.statusCode = 500;
      return res.end(JSON.stringify({message:"cannot update user"}))
    } catch (err) {
      return res.end(JSON.stringify({ message: "database error", err }));
    }
  } else if(req.url == "/users/changepassword" && req.method == "POST"){
    const body = await processPost(req)
    if(body.new_password != body.confirm_password){
      res.statusCode = 500
      return res.end(JSON.stringify({message:"new password didn't match with confirm password"}))
    }
    if(!isValidPassword(body.new_password)){
      res.statusCode = 400
      return res.end(JSON.stringify({err_newpassword:"password most be 8 digit long invlude upper and lower case without space and one special character"}))
    }
    const hashpassword = crypto.pbkdf2Sync(body.new_password,process.env.salt,1000,64,"sha512").toString('hex')
    try{
      const [rows] = await connection.promise().query("update users set password = ? where user_id = ? ",[hashpassword,parseInt(body.user_id)]) 
      if(rows.affectedRows > 0){
        res.statusCode = 200
        return res.end(JSON.stringify({message:"successfully update user password"}))
      }
      res.statusCode = 500
      return res.end(JSON.stringify({message:"something went wrong cannot update user password"}));
    }catch(err){  
      res.statusCode = 500
      return res.end(JSON.stringify({message:"internal server error"}))
    }
    
  }
   else {
    const ext = req.url.split(".");
    filepath = path.join(__dirname, `../public/${ext[1]}`, req.url);
  }
  render(req, res, filepath);
};
