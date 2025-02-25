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
} = require("../util/validaton");

module.exports = async function category(req, res) {
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
  if (req.url == "/category/add" && req.method == "GET") {
    if (!isAdmin(user, res)) return;
    filepath = path.join(__dirname, "../public/html", "addcategory.ejs");
    return renderFileWithData(req, res, filepath,user,user);
  } else if (req.url == "/category/add" && req.method == "POST") {
    if (!isAdmin(user, res)) return;
    const body = await processPost(req);
    const err = {
      err_category_name: "",
      err_category_desc: "",
    };
    let have_err = false;
    if (!isValidCharacter(body.category_name)) {
      err.err_category_name = "name most be string";
      have_err = true;
    }
    if (!isValidCharacter(body.category_des)) {
      err.err_category_desc = "description most be string";
      have_err = true;
    }
    res.setHeader("Content-Type", "application/json");
    if (have_err) {
      res.statusCode = 400;
      return res.end(JSON.stringify(err));
    }
    try {
      const [result] = await connection
        .promise()
        .query(
          "select * from categorys inner join users on users.user_id = categorys.user where categorys.category_name = ? AND users.company_id = ?",
          [body.category_name, user.company]
        );
      if (result.length > 0) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ message: "category already exits" }));
      }
      const [results] = await connection
        .promise()
        .query(
          "insert into categorys (category_name,category_des,user) values (?,?,?)",
          [body.category_name, body.category_des, user.id]
        );
      if (results.affectedRows == 0) {
        res.statusCode == 500;
        return res.end(
          JSON.stringify({ message: "cannot save data in database" })
        );
      }
      res.statusCode == 200;
      return res.end(JSON.stringify({ message: "category save sccessfully" }));
    } catch (err) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error", err }));
    }
  } else if (req.url == "/category/view" && req.method == "GET") {
    if (!isAdmin(user, res)) return;
    filepath = path.join(__dirname, "../public/html", "viewcategory.ejs");
    const [result] = await connection
      .promise()
      .query("select * from categorys inner join users on users.user_id = categorys.user where users.company_id = ? order by categorys.created_at asc", [user.company]);
    return renderFileWithData(req, res, filepath, result,user);
  } else if (req.url.startsWith("/category/delete") && req.method == "DELETE") {
    if (!isAdmin(user, res)) return;
    const parse_query = url.parse(req.url, true);

    try {
        res.setHeader("Content-Type", "application/json");
      const [result] = await connection
        .promise()
        .query("select * from categorys inner join users on users.user_id = categorys.user where categorys.category_id = ? AND users.company_id = ?", [
          parse_query.query.id,
          user.company,
        ]);
      if (result.length == 0) {
        res.statusCode = 404;
        return res.end(
          JSON.stringify({ message: "no category found for given id" })
        );
      }
      const [results] = await connection
        .promise()
        .query("delete categorys FROM categorys inner join users on users.user_id = categorys.user where categorys.category_id = ? AND users.company_id = ? and users.roles = ?", [
          parse_query.query.id,
          user.company,
          roles.admin
        ]);
      if (results.affectedRows > 0) {
        res.statusCode = 200;
        return res.end(JSON.stringify({
          message: "successfully deleted category",
        }));
      }
      res.statusCode = 400;
      return res.end(
        JSON.stringify({ message: "cannot delete data form category" })
      );
    } catch (err) {
      if(err.code == 'ER_ROW_IS_REFERENCED_2'){
        res.statusCode = 409
        return res.end(JSON.stringify({message:"The category cannot be deleted because it is associated with one or more products."}))
      }
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error" }));
    }
  } else if(req.url.startsWith("/category/edit") && req.method == "GET"){
    if(!isAdmin(user,res)) return;
    const parseurl = url.parse(req.url, true);
    const [result] = await connection
      .promise()
      .query("SELECT * FROM categorys INNER JOIN users ON users.user_id = categorys.user WHERE categorys.category_id = ? AND users.company_id = ?", [
        parseurl.query.id,
        user.company,
      ]);
    filepath = path.join(__dirname, "../public/html", "editcategory.ejs");
    return renderFileWithData(req, res, filepath, result[0],user);
  }else if(req.url == "/category/edit" && req.method == "PATCH"){
    if(!isAdmin(user,res))return;
    
    const body = await processPost(req);
    let err = {
      category_name: "",
      category_des: "",
    };
    let error = false;
    if (!isValidCharacter(body.category_name)) {
      err.category_name = "name most be string";
      error = true;
    }
    if (!isValidCharacter(body.short_name)) {
      err.category_des = "description most be string";
      error = true;
    }
    res.setHeader("Content-Type", "application/json");
    if (error) {
      res.statusCode = 400;
      return res.end(JSON.stringify(err));
    }
    try {
      const [result] = await connection
        .promise()
        .query(
          "update categorys INNER JOIN users ON users.user_id = categorys.user  SET categorys.category_name = ?, categorys.category_des = ? WHERE categorys.category_id = ?  AND users.company_id = ? and users.roles = ?",
          [body.category_name, body.category_des, body.category_id, user.company,roles.admin]
        );
      if (result.affectedRows > 0) {
        res.statusCode = 200;
        return res.end(
          JSON.stringify({ message: "category updated successfully" })
        );
      } else {
        res.statusCode = 500;
        return res.end(JSON.stringify({ message: "something went wrong" }));
      }
    } catch (err) {
      return res.end(JSON.stringify({ message: "database error", err }));
    }
  }
   else {
    const ext = req.url.split(".");
    filepath = path.join(__dirname, `../public/${ext[1]}`, req.url);
  }
  render(req, res, filepath);
};
