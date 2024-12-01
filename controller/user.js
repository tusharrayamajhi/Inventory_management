const path = require("path");
const crypto = require("crypto");
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
    return renderFileWithData(req, res, filepath, data);
  } else if (req.url == "/user/add" && req.method == "POST") {
    const body = await processPost(req);
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
        res.statusCode = 400;
        return res.end(
          JSON.stringify({
            message:
              "user already exits with given email address user different email address",
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
          res.statusCode = 404;
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
          res.statusCode = 400;
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
      const [results] = await connection
        .promise()
        .query(
          "INSERT INTO users (name, address, phone, email, password, is_active, roles,company_id,created_by) VALUES (?,?,?,?,?,?,?,?,?)",
          [
            body.name,
            body.address,
            body.phone,
            body.email,
            newpassword,
            parseInt(body.is_active),
            body.roles,
            body.company == null?user.company:body.company,
            user.id,
          ]
        );
      if (results.affectedRows == 0) {
        res.statusCode == 400;
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
  } else if (req.url == "/user/view" && req.method == "GET") {
    filepath = path.join(__dirname, "../public/html", "viewuser.ejs");
    let query = '';
    let params = []
    if(user.roles == roles.superadmin){
      query = "select * from users  ";
    }else {
        query = "select * from users where company_id = ?"
        params = [user.company]
    }
    const [result] = await connection
      .promise()
      .query(query,params);
    return renderFileWithData(req, res, filepath, result);
  } else if (req.url.startsWith("/user/delete") && req.method == "DELETE") {
    const parse_query = url.parse(req.url, true);
    try {
      res.setHeader("Content-Type", "application/json");
      const [result] = await connection
        .promise()
        .query("select * from users where user_id = ? AND company_id = ?", [
          parse_query.query.id,
          user.company,
        ]);
      if (result.length == 0) {
        res.statusCode = 404;
        return res.end(
          JSON.stringify({ message: "no user found for given id" })
        );
      }
      const [results] = await connection
        .promise()
        .query("delete from users where user_id = ? AND company_id = ?", [
          parse_query.query.id,
          user.company,
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
    return renderFileWithData(req, res, filepath, data);
  } else if (req.url == "/user/edit" && req.method == "PATCH") {
    const body = await processPost(req);
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
      const [rows] = await connection.promise().query("update users set name = ? , address = ?,phone= ?, email = ?, is_active = ?,roles = ?,company_id = ? where user_id = ?",[body.name,body.address,body.phone,body.email,body.is_active,body.roles,body.company != null ? parseInt(body.company):user.company,parseInt(body.user_id)]);
      
      if(rows.affectedRows > 0){
        res.statusCode = 200;
        return res.end(JSON.stringify({message:"successfully update user"}))
      }
      res.statusCode = 500;
      return res.end(JSON.stringify({message:"cannot update user"}))
    } catch (err) {
      return res.end(JSON.stringify({ message: "database error", err }));
    }
  } else {
    const ext = req.url.split(".");
    filepath = path.join(__dirname, `../public/${ext[1]}`, req.url);
  }
  render(req, res, filepath);
};
