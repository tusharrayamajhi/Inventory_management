const ejs = require("ejs");
const processPost = require("../util/post");
const connection = require("../util/connect");
const fs = require("fs");
const path = require("path");
const url = require("url");
let { sessions, mimeType, roles } = require("../util/object");
let { render, renderFileWithData } = require("../util/renderfile");
const {isAdmin} = require("../util/isAdmin")
const {
  isValidPhoneNo,
  isValidCharacter,
  isValidDigit,
  isValidDate,
  isValidEmail,
  isValidPassword,
} = require("../util/validaton");

module.exports = async function units(req, res) {
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
  if (!isAdmin(user,res)) return;

  if (req.url == "/unit/add" && req.method == "GET") {
    filepath = path.join(__dirname, "../public/html", "unit.ejs");
    render(req, res, filepath);

    return;
  } else if (req.url == "/unit/add" && req.method == "POST") {
    if (!isAdmin(user,res)) return;

    const body = await processPost(req);
    let err = {
      unit_name: "",
      short_name: "",
    };
    let error = false;
    if (!isValidCharacter(body.unit_name)) {
      err.unit_name = "invalid name";
      error = true;
    }
    if (!isValidCharacter(body.short_name)) {
      err.short_name = "invalid short name";
      error = true;
    }
    if (error) {
      res.statusCode = 404;
      return res.end(JSON.stringify(err));
    }
    try {
      const [results] = await connection
        .promise()
        .query(
          "select * from units where (unit_name = ? OR short_name = ?) and user = ?",
          [body.unit_name, body.short_name, user.id]
        );
      if (results.affectedRows > 0) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "unit already exits" }));
      }
      const [result] = await connection
        .promise()
        .query("insert into units (unit_name,short_name,user) values (?,?,?)", [
          body.unit_name,
          body.short_name,
          user.id,
        ]);
      if (result.affectedRows > 0) {
        res.statusCode = 200;
        return res.end(JSON.stringify({ message: "unit create successfully" }));
      }
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "something went wrong" }));
    } catch (err) {
      return res.end(JSON.stringify({ message: "database error", err }));
    }
  } else if (req.url == "/unit/view" && req.method == "GET") {
    filepath = path.join(__dirname, "../public/html", "unitview.ejs");
    const [units] = await connection
      .promise()
      .query("select * from units where user = ?", [user.id]);
    return renderFileWithData(req, res, filepath, units);
  } else if (req.url.startsWith("/unit/edit") && req.method == "GET") {
    const parseurl = url.parse(req.url, true);
    const [result] = await connection
      .promise()
      .query("select * from units where unit_id = ? AND user = ?", [
        parseurl.query.id,
        user.id,
      ]);
    filepath = path.join(__dirname, "../public/html", "editunit.ejs");
    return renderFileWithData(req, res, filepath, result[0]);
  } else if (req.url == "/unit/edit" && req.method == "PATCH") {

    const body = await processPost(req);
    let err = {
      unit_name: "",
      short_name: "",
    };
    let error = false;
    if (!isValidCharacter(body.unit_name)) {
      err.unit_name = "invalid name";
      error = true;
    }
    if (!isValidCharacter(body.short_name)) {
      err.short_name = "invalid short name";
      error = true;
    }
    if (error) {
      res.statusCode = 400;
      return res.end(JSON.stringify(err));
    }
    try {
      console.log(body);
      console.log(user);
      const [results] = await connection.promise().query("select * from units where unit_id = ? AND user = ?",[body.unit_id,user.id]);
      if(results.length == 0 ){
        res.statusCode = 404;
        return res.end(JSON.stringify({message:"no units found"}))
      }
      const [result] = await connection
        .promise()
        .query(
          "update units set unit_name = ?, short_name = ? where unit_id = ? and user = ?",
          [body.unit_name, body.short_name, body.unit_id, user.id]
        );
      console.log(result);
      if (result.affectedRows > 0) {
        res.statusCode = 200;
        return res.end(
          JSON.stringify({ message: "unit updated successfully" })
        );
      } else {
        res.statusCode = 500;
        return res.end(JSON.stringify({ message: "something went wrong" }));
      }
    } catch (err) {
      return res.end(JSON.stringify({ message: "database error", err }));
    }
  } else if (req.url.startsWith("/unit/delete") && req.method == "DELETE") {

    const parse_query = url.parse(req.url, true);
    const unit_id = parse_query.query.id;
    try {
      const [result] = await connection
        .promise()
        .query("select * from units where unit_id = ? ", [unit_id]);
      if (result.length == 0) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ message: "no unit found" }));
      }
      const [results] = await connection
        .promise()
        .query("DELETE FROM units WHERE unit_id = ? AND user = ?", [
          unit_id,
          user.id,
        ]);
      if (results.affectedRows > 0) {
        res.statusCode = 200;
        return res.end(
          JSON.stringify({ message: "unit deleted successfully" })
        );
      }
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "something went wrong" }));
    } catch (err) {
      if(err.code == 'ER_ROW_IS_REFERENCED_2'){
        res.statusCode = 409
        return res.end(JSON.stringify({message:"The unit cannot be deleted because it is associated with one or more products."}))
      }
      console.log(err)
      return res.end(JSON.stringify({ message: "database error", err }));
    }
  } else {
    const ext = req.url.split(".");
    filepath = path.join(__dirname, `../public/${ext[1]}`, req.url);
  }
return render(req, res, filepath);
};
