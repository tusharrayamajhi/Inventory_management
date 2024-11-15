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

module.exports = async function brand(req, res) {
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
  if (req.url == "/brand/add" && req.method == "GET") {
    if (!isAdmin(user, res)) return;
    filepath = path.join(__dirname, "../public/html", "addbrand.ejs");
    return render(req, res, filepath);
  } else if (req.url == "/brand/add" && req.method == "POST") {
    if (!isAdmin(user, res)) return;
    const body = await processPost(req);
    const err = {
      err_brand_name: "",
      err_brand_desc: "",
    };
    let have_err = false;
    if (!isValidCharacter(body.brand_name)) {
      err.err_brand_name = "name most be string";
      have_err = true;
    }
    if (!isValidCharacter(body.brand_desc)) {
      err.err_brand_desc = "description most be string";
      have_err = true;
    }
    res.setHeader("Content-Type", "application/json");
    if (have_err) {
      res.statusCode = 400;
      return res.end(JSON.stringify(err));
    }
    try {
      console.log(body);
      const [result] = await connection
        .promise()
        .query(
          "select * from brands where (brand_name = ?) AND user = ?",
          [body.category_name, user.id]
        );
      console.log(result);
      if (result.length > 0) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "brand already exits" }));
      }
      const [results] = await connection
        .promise()
        .query(
          "insert into brands (brand_name,brand_desc,user) values (?,?,?)",
          [body.brand_name, body.brand_desc, user.id]
        );
      if (results.affectedRows == 0) {
        res.statusCode == 400;
        return res.end(
          JSON.stringify({ message: "cannot save data in database" })
        );
      }
      res.statusCode == 200;
      return res.end(JSON.stringify({ message: "brand save sccessfully" }));
    } catch (err) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error", err }));
    }
  } else if (req.url == "/brand/view" && req.method == "GET") {
    if (!isAdmin(user, res)) return;
    filepath = path.join(__dirname, "../public/html", "viewbrand.ejs");
    const [result] = await connection
      .promise()
      .query("select * from brands where user = ?", [user.id]);
    return renderFileWithData(req, res, filepath, result);
  } else if (req.url.startsWith("/brand/delete") && req.method == "DELETE") {
    if (!isAdmin(user, res)) return;
    const parse_query = url.parse(req.url, true);
    console.log(parse_query.query.id);

    try {
        res.setHeader("Content-Type", "application/json");
      const [result] = await connection
        .promise()
        .query("select * from brands where brand_id = ? AND user = ?", [
          parse_query.query.id,
          user.id,
        ]);
      if (result.length == 0) {
        res.statusCode = 404;
        return res.end(
          JSON.stringify({ message: "no brands found for given id" })
        );
      }
      const [results] = await connection
        .promise()
        .query("delete from brands where brand_id = ? AND user = ?", [
          parse_query.query.id,
          user.id,
        ]);
      if (results.affectedRows > 0) {
        res.statusCode = 200;
        return res.end(JSON.stringify({
          message: "successfully delete brand",
        }));
      }
      res.statusCode = 400;
      return res.end(
        JSON.stringify({ message: "cannot delete data" })
      );
    } catch (err) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error" }));
    }
  } else if(req.url.startsWith("/brand/edit") && req.method == "GET"){
    if(!isAdmin(user,res)) return;
    const parseurl = url.parse(req.url, true);
    const [result] = await connection
      .promise()
      .query("select * from brands where brand_id = ? AND user = ?", [
        parseurl.query.id,
        user.id,
      ]);
    filepath = path.join(__dirname, "../public/html", "editbrand.ejs");
    return renderFileWithData(req, res, filepath, result[0]);
  }else if(req.url == "/brand/edit" && req.method == "PATCH"){
    if(!isAdmin(user,res))return;
    
    const body = await processPost(req);
    let err = {
      err_brand_name: "",
      err_brand_desc: "",
    };
    let error = false;
    if (!isValidCharacter(body.brand_name)) {
      err.err_brand_name = "name most be string";
      error = true;
    }
    if (!isValidCharacter(body.brand_desc)) {
      err.err_brand_desc = "description most be string";
      error = true;
    }
    res.setHeader("Content-Type", "application/json");
    if (error) {
      res.statusCode = 400;
      return res.end(JSON.stringify(err));
    }
    try {
      console.log(body);
      console.log(user);
      const [result] = await connection
        .promise()
        .query(
          "update brands set brand_name = ?, brand_desc = ? where brand_id = ? and user = ?",
          [body.brand_name, body.brand_desc, body.brand_id, user.id]
        );
      console.log(result);
      if (result.affectedRows > 0) {
        res.statusCode = 200;
        return res.end(
          JSON.stringify({ message: "brand updated successfully" })
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
