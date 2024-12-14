const { render, renderFileWithData } = require("../util/renderfile");
const { roles, sessions } = require("../util/object");
const path = require("path");
const connection = require("../util/connect");
const url = require("url");
const processpost = require("../util/post");
const ExcelJS = require("exceljs");

module.exports = async function invoice(req, res) {
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
  if (user.roles == roles.superadmin) {
    res.writeHead(302, {
      location: "/",
    });
    return res.end();
  }

  if (req.url == "/invoice/add" && req.method == "GET") {
    let cus_query = "";
    let cus_params = [];
    let pro_query = "";
    let pro_params = [];
    cus_query =
      "SELECT customers.name AS customer_name,customers.customer_id as customer_id from customers inner join users on users.user_id = customers.user_id where users.company_id = ?";
    cus_params = [user.company];
    pro_query =
      "select * from products inner join users on users.user_id = products.user where users.company_id = ?";
    pro_params = [user.company];

    try {
      const [customers] = await connection
        .promise()
        .query(cus_query, cus_params);
      const [product] = await connection.promise().query(pro_query, pro_params);
      const data = { customers, product };
      return renderFileWithData(
        req,
        res,
        path.join(__dirname, "../public/html", "addinvoice.ejs"),
        data,
        user
      );
    } catch (err) {
      return render(
        req,
        res,
        path.join(__dirname, "../public/html", "error.html")
      );
    }
  } else if (req.url == "/invoice/add" && req.method == "POST") {
    const body = await processpost(req);
    if (body.customer_id == "") {
      res.statusCode = 400;
      return res.end(JSON.stringify({ message: "select customer" }));
    }
    if (body.formsdata.length == 0) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ message: "select product" }));
    }
    let err = {
      product_id: "",
      invalid_qnt: "",
    };
    let errors = [];
    let haserr = false;
    body.formsdata.forEach((product) => {
      if (
        parseInt(product.qnt) <= 0 ||
        parseInt(product.qnt) > parseInt(product.stock)
      ) {
        err.product_id = product.product_id;
        err.invalid_qnt = `qnt most be between 0 and ${product.stock}`;
        haserr = true;
        errors.push(err);
        err = {
          product_id: "",
          invalid_qnt: "",
        };
      }
    });
    if (haserr) {
      res.statusCode = 400;
      return res.end(JSON.stringify(errors));
    }
    let cases = "case";
    let ids = [];
    body.formsdata.forEach((product) => {
      ids.push(product.product_id);
      cases =
        cases +
        ` when product_id = ${product.product_id} then stock - ${product.qnt} `;
    });

    let today = "";
    async function getsellscode() {
      const date = new Date();

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      today = `${year}-${month}-${day}`;
      // const [userids] = await connection
      //   .promise()
      //   .query("SELECT user_id FROM users WHERE company_id = ?", [user.company]);

      // let userIds = userids.map((row) => row.user_id).join(",");

      const [number] = await connection
        .promise()
        .query(
          `SELECT COUNT(DISTINCT sells_code) AS count from invoices inner join users on users.user_id = invoices.user where users.company_id = ?  and invoices.created_at = ?`,
          [user.company, today]
        );

      const code = `${user.company_code}-${year}${month}${day}-${
        number[0].count + 1
      }`;
      return code;
    }
    const sellscode = await getsellscode();

    try {
      await connection.promise().beginTransaction();
      await connection
        .promise()
        .execute(
          `update products set stock = ${cases} end where product_id in (${ids.join(
            ","
          )})`
        );

      for (const sells of body.formsdata) {
        let qnt = parseInt(sells.qnt);
        let isdec = 0;
        let [result] = await connection
          .promise()
          .query(
            "select * from purchases inner join users on users.user_id = purchases.user  where users.company_id = ? and purchases.product = ? and purchases.remaining != 0  order by purchases.pruchase_date asc",
            [user.company, sells.product_id]
          );
        while (qnt != 0) {
          if (result[isdec].remaining >= qnt) {
            await connection
              .promise()
              .execute(
                `update purchases set remaining = remaining - ?  where purchase_id = ?`,
                [qnt, result[isdec].purchase_id]
              );
            qnt = 0;
            isdec++;
          } else {
            await connection
              .promise()
              .execute(
                "update purchases set remaining = 0 where purchase_id = ?",
                [result[isdec].purchase_id]
              );
            qnt = qnt - result[isdec].remaining;
            isdec++;
          }
        }
        // const date = new Date();

        // const year = date.getFullYear();
        // const month = String(date.getMonth() + 1).padStart(2, "0");
        // const day = String(date.getDate()).padStart(2, "0");

        // const today = `${year}-${month}-${day}`;
        await connection
          .promise()
          .query(
            "insert into invoices (sells_code, customer_id,product_id,Quantity,rate,total,payment,remark,user,created_at) values (? ,? , ? , ? ,  ? ,  ? ,  ? , ? ,  ? , ?)",
            [
              sellscode,
              body.customer_id,
              sells.product_id,
              sells.qnt,
              sells.rate,
              sells.total,
              sells.status,
              sells.remark,
              user.id,
              today,
            ]
          );
      }
      await connection.promise().commit();
      res.statusCode = 200;
      return res.end(JSON.stringify({ message: "invoice add successfully" }));
    } catch (err) {
      await connection.promise().rollback();
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error" }));
    }
  } else if (
    (req.url == "/invoice/view" || req.url.startsWith("/invoice/view")) &&
    req.method == "GET"
  ) {
    const parse_url = url.parse(req.url, true);
    let page = parse_url.query.page;
    if (!page || page == 0) {
      page = 0;
    } else {
      page = page - 1;
    }
    try {
      if (user.roles == roles.admin) {
        const [result] = await connection
          .promise()
          .query(
            "select products.*,invoices.*, users.*,units.* ,customers.name as customer_name, customers.customer_id as customer_id from invoices inner join users on users.user_id = invoices.user inner join customers on invoices.customer_id = customers.customer_id inner join products on invoices.product_id = products.product_id inner join units on products.unit = units.unit_id where users.company_id = ?  order by invoices.created_at desc limit 10 offset ?",
            [user.company, page * 10]
          );
        const [no_of_invoices] = await connection
          .promise()
          .query(
            "select count(*) as total from invoices left join users on users.user_id = invoices.user where users.company_id = ?",
            [user.company]
          );
        const total_page = Math.ceil(no_of_invoices[0].total / 10);
        const data = { result, total_page };
        return renderFileWithData(
          req,
          res,
          path.join(__dirname, "../public/html", "viewinvoice.ejs"),
          data,
          user
        );
      } else {
      
        const [result] = await connection
          .promise()
          .query(
            "select products.*, users.*, invoices.*,units.*,customers.name as customer_name from invoices inner join customers on invoices.customer_id = customers.customer_id inner join products on invoices.product_id = products.product_id inner join users on users.user_id = invoices.user inner join units on products.unit = units.unit_id where invoices.user = ? order by invoices.created_at desc limit 10 offset ?",
            [user.id, page * 10]
          );
        const [no_of_invoices] = await connection
          .promise()
          .query(
            "select count(*) as total from invoices left join users on users.user_id = invoices.user where users.company_id = ? and invoices.user = ?",
            [user.company, user.id]
          );
        const total_page = Math.ceil(no_of_invoices[0].total / 10);
        const data = { result, total_page };
        return renderFileWithData(
          req,
          res,
          path.join(__dirname, "../public/html", "viewinvoice.ejs"),
          data,
          user
        );
      }
    } catch (err) {
      return render(
        req,
        res,
        path.join(__dirname, "../public/html", "error.html")
      );
    }
  } else if (req.url.startsWith("/invoice/getproduct") && req.method == "GET") {
    const parseurl = url.parse(req.url, true);
    const id = parseurl.query.id;
    try {
      let pro_query = "";
      let pro_params = [];
      // if (user.roles == roles.admin) {
      pro_query =
        "select * from products inner join users on users.user_id = products.user where products.product_id = ? and users.company_id = ?";
      pro_params = [id, user.company];
      // } else {
      // pro_query = "select * from products where product_id = ? and user = ?";
      // pro_params = [id, user.createdBy];
      // }
      const [products] = await connection
        .promise()
        .query(pro_query, pro_params);
      if (products.length == 0) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ message: "cannot get product" }));
      }
      res.statusCode = 200;
      return res.end(JSON.stringify(products[0]));
    } catch (err) {
      return res.end(JSON.stringify({ message: "database err" }));
    }
  } else if (req.url.startsWith("/invoice/edit") && req.method == "GET") {
    const parseurl = url.parse(req.url, true);
    const sells_code = parseurl.query.sells_code;
    try {
      if (user.roles == roles.admin) {
        const [result] = await connection
          .promise()
          .query(
            "select * from invoices inner join products on invoices.product_id = products.product_id inner join users on users.user_id = invoices.user where invoices.sells_code = ? and users.company_id = ?",
            [sells_code, user.company]
          );
        return renderFileWithData(
          req,
          res,
          path.join(__dirname, "../public/html", "editinvoice.ejs"),
          result,
          user
        );
      } else {
        const [result] = await connection
          .promise()
          .query(
            "select * from invoices inner join products on invoices.product_id = products.product_id inner join users on users.user_id = invoices.user where invoices.sells_code = ? and users.user_id= ?",
            [sells_code, user.id]
          );
        return renderFileWithData(
          req,
          res,
          path.join(__dirname, "../public/html", "editinvoice.ejs"),
          result,
          user
        );
      }
    } catch (err) {
      return render(
        req,
        res,
        path.join(__dirname, "../public/html", "error.html")
      );
    }
  } else if (req.url == "/invoice/edit" && req.method == "PATCH") {
    const body = await processpost(req);
    try {
      await connection.promise().beginTransaction();
      for (let invoice of body) {
        await connection
          .promise()
          .query(
            "update invoices inner join users on users.user_id = invoices.user set invoices.payment = ?, invoices.remark = ? where users.company_id = ? and invoices.invoices_id = ?",
            [invoice.status, invoice.remark, user.company, invoice.invoices_id]
          );
      }
      await connection.promise().commit();
      res.statusCode = 200;
      return res.end(JSON.stringify({ message: "update successfully" }));
    } catch (err) {
      await connection.promise().rollback();
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error" }));
    }
  } else if (req.url.startsWith("/invoice/bill") && req.method == "GET") {
    let parseurl = url.parse(req.url, true);
    let sells_code = parseurl.query.sells_code;
    try {
      const [customers] = await connection.promise().query(
        `
        select customers.* from invoices
        inner join customers on customers.customer_id = invoices.customer_id
        where invoices.sells_code = ?   
        `,
        [sells_code]
      );
      const [invoices] = await connection.promise().query(
        `
        select products.*,units.*,invoices.* from invoices
        inner join products on products.product_id = invoices.product_id
        inner join units on products.unit = units.unit_id
        inner join users on users.user_id = invoices.user
        where invoices.sells_code = ? and users.company_id = ?
        `,
        [sells_code, user.company]
      );
      const [company] = await connection.promise().query(
        `
        select * from companies where companies.company_id = ?
        `,
        [user.company]
      );
      let totals_detals = {
        total_amt: 0,
        vatable_amt: 0,
        vat_amt: 0,
        total_include_vat: 0,
      };
      for (let invoice of invoices) {
        totals_detals.total_amt =
          totals_detals.total_amt + parseFloat(invoice.total);
        if (invoice.vat == 1) {
          totals_detals.vatable_amt =
            parseFloat(totals_detals.vatable_amt) + parseFloat(invoice.total);
        }
        totals_detals.vat_amt = (totals_detals.vatable_amt * 13) / 100;
        totals_detals.total_include_vat =
          totals_detals.vat_amt + totals_detals.total_amt;
      }
      let data = {
        customers: customers[0],
        invoice: invoices,
        totals_detals: totals_detals,
        company: company[0],
      };
      res.statusCode = 200;
      return renderFileWithData(
        req,
        res,
        path.join(__dirname, "../public/html", "vatbill.ejs"),
        data,
        user
      );
    } catch (err) {
      res.startsWith = 500;
      return res.end(JSON.stringify({ message: "internal server error" }));
    }
  } else if (req.url == "/invoice/excel" && req.method == "POST") {
    const body = await processpost(req);
    const err = {
      err_customer_id: "",
      err_from_date: "",
      err_to_date: "",
    };
    let haserr = false;
    if (body.customer_id == "") {
      err.err_customer_id = "no customer id selected";
      haserr = true;
    }

    if (body.from == "") {
      err.err_from_date = "date not selected";
      haserr = true;
    }
    if (body.to == "") {
      err.err_to_date = "date not selected";
      haserr = true;
    }

    if (haserr) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ message: "customer not selected" }));
    }
    let adjustto = body.from === body.to ? `${body.to} 23:59:59` : body.to;
    try {
      const [data] = await connection.promise().query(
        `
        SELECT
            products.*,
            users.name as seller_name,
            invoices.*,
            units.*,
            brands.*,
            customers.* 
        FROM invoices
        INNER JOIN customers ON invoices.customer_id = customers.customer_id
        INNER JOIN products ON invoices.product_id = products.product_id 
        INNER JOIN users ON users.user_id = invoices.user
        INNER JOIN units ON products.unit = units.unit_id
        inner join brands on products.brand = brands.brand_id
        WHERE invoices.customer_id = ? 
        AND invoices.sales_date BETWEEN ? AND ?`,
        [body.customer_id, `${body.from} 00:00:00`, adjustto]
      );
      if (data.length === 0) {
        res.statusCode = 404;
        res.end(
          JSON.stringify({ message: "No data found for the given criteria." })
        );
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Invoices");

      worksheet.columns = [
        { header: "Invoice ID", key: "invoices_id", width: 15 },
        { header: "Sales Code", key: "sells_code", width: 20 },
        { header: "Customer Name", key: "name", width: 20 },
        { header: "Customer Phone", key: "phone", width: 20 },
        { header: "Customer email", key: "email", width: 20 },
        { header: "Customer pan", key: "pan", width: 20 },
        { header: "Product Name", key: "product_name", width: 20 },
        { header: "Brand name", key: "brand_name", width: 15 },
        { header: "Unit", key: "unit_name", width: 15 },
        { header: "Quantity", key: "Quantity", width: 10 },
        { header: "Rate", key: "rate", width: 10 },
        { header: "Total", key: "total", width: 15 },
        { header: "VAT", key: "vat", width: 10 },
        { header: "Remark", key: "remark", width: 20 },
        { header: "Sales Date", key: "sales_date", width: 20 },
        { header: "seller name", key: "seller_name", width: 20 },
      ];

      data.forEach((row) => {
        worksheet.addRow(row);
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoices_${Date.now()}.xlsx`
      );

      // Write workbook to response
      await workbook.xlsx.write(res);

      res.statusCode = 200;
      // End response
      return res.end();
    } catch (err) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error" }));
    }
  } else if (req.url == "/invoice/excel/seller" && req.method == "POST") {
    const body = await processpost(req);
    const err = {
      err_customer_id: "",
      err_from_date: "",
      err_to_date: "",
    };
    let haserr = false;
    if (body.customer_id == "") {
      err.err_customer_id = "no customer id selected";
      haserr = true;
    }

    if (body.from == "") {
      err.err_from_date = "date not selected";
      haserr = true;
    }
    if (body.to == "") {
      err.err_to_date = "date not selected";
      haserr = true;
    }

    if (haserr) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ message: "customer not selected" }));
    }
    let adjustto = body.from === body.to ? `${body.to} 23:59:59` : body.to;
try{
    const [data] = await connection.promise().query(
      `
        SELECT
            products.*,
            users.name as seller_name,
            invoices.*,
            units.*,
            brands.*,
            customers.* 
        FROM invoices
        INNER JOIN customers ON invoices.customer_id = customers.customer_id
        INNER JOIN products ON invoices.product_id = products.product_id 
        INNER JOIN users ON users.user_id = invoices.user
        INNER JOIN units ON products.unit = units.unit_id
        inner join brands on products.brand = brands.brand_id
        WHERE invoices.user = ? 
        AND invoices.sales_date BETWEEN ? AND ?`,
      [body.seller_id, `${body.from} 00:00:00`, adjustto]
    );
    if (data.length === 0) {
      res.statusCode = 404;
      res.end(
        JSON.stringify({ message: "No data found for the given criteria." })
      );
      return;
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Invoices");

    worksheet.columns = [
      { header: "Invoice ID", key: "invoices_id", width: 15 },
      { header: "Sales Code", key: "sells_code", width: 20 },
      { header: "Customer Name", key: "name", width: 20 },
      { header: "Customer Phone", key: "phone", width: 20 },
      { header: "Customer email", key: "email", width: 20 },
      { header: "Customer pan", key: "pan", width: 20 },
      { header: "Product Name", key: "product_name", width: 20 },
      { header: "Brand name", key: "brand_name", width: 15 },
      { header: "Unit", key: "unit_name", width: 15 },
      { header: "Quantity", key: "Quantity", width: 10 },
      { header: "Rate", key: "rate", width: 10 },
      { header: "Total", key: "total", width: 15 },
      { header: "VAT", key: "vat", width: 10 },
      { header: "Remark", key: "remark", width: 20 },
      { header: "Sales Date", key: "sales_date", width: 20 },
      { header: "seller name", key: "seller_name", width: 20 },
    ];

    data.forEach((row) => {
      worksheet.addRow(row);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoices_${Date.now()}.xlsx`
    );

    // Write workbook to response
    await workbook.xlsx.write(res);

    res.statusCode = 200;
    // End response
    return res.end();
  } catch (err) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ message: "internal server error" }));
  }
  } else if(req.url == "/invoice/export_all_to_excel" && req.method == "GET"){
    try{ 
      let data = []
      if(user.roles == roles.normal){
        [data] = await connection.promise().query(
          `
          SELECT
          products.*,
          users.name as seller_name,
          invoices.*,
          units.*,
              brands.*,
              customers.* 
              FROM invoices
              INNER JOIN customers ON invoices.customer_id = customers.customer_id
              INNER JOIN products ON invoices.product_id = products.product_id 
              INNER JOIN users ON users.user_id = invoices.user
              INNER JOIN units ON products.unit = units.unit_id
              inner join brands on products.brand = brands.brand_id
              WHERE invoices.user = ?`,           
        [user.id]
      );
    }else if(user.roles == roles.admin){
      [data] = await connection.promise().query(
        `
        SELECT
        products.*,
        users.name as seller_name,
        invoices.*,
        units.*,
            brands.*,
            customers.* 
            FROM invoices
            INNER JOIN customers ON invoices.customer_id = customers.customer_id
            INNER JOIN products ON invoices.product_id = products.product_id 
            INNER JOIN users ON users.user_id = invoices.user
            INNER JOIN units ON products.unit = units.unit_id
            inner join brands on products.brand = brands.brand_id
            WHERE users.company_id = ?`,           
      [user.company]
      );
    }
      if (data.length === 0) {
        res.statusCode = 404;
        res.end(
          JSON.stringify({ message: "No data found for the given criteria." })
        );
        return;
      }
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Invoices");
  
      worksheet.columns = [
        { header: "Invoice ID", key: "invoices_id", width: 15 },
        { header: "Sales Code", key: "sells_code", width: 20 },
        { header: "Customer Name", key: "name", width: 20 },
        { header: "Customer Phone", key: "phone", width: 20 },
        { header: "Customer email", key: "email", width: 20 },
        { header: "Customer pan", key: "pan", width: 20 },
        { header: "Product Name", key: "product_name", width: 20 },
        { header: "Brand name", key: "brand_name", width: 15 },
        { header: "Unit", key: "unit_name", width: 15 },
        { header: "Quantity", key: "Quantity", width: 10 },
        { header: "Rate", key: "rate", width: 10 },
        { header: "Total", key: "total", width: 15 },
        { header: "VAT", key: "vat", width: 10 },
        { header: "Remark", key: "remark", width: 20 },
        { header: "Sales Date", key: "sales_date", width: 20 },
        { header: "seller name", key: "seller_name", width: 20 },
      ];
  
      data.forEach((row) => {
        worksheet.addRow(row);
      });
  
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoices_${Date.now()}.xlsx`
      );
  
      // Write workbook to response
      await workbook.xlsx.write(res);
  
      res.statusCode = 200;
      // End response
      return res.end();
    }catch(err){
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: "internal server error" }));
    }
  } else {
    const ext = req.url.split(".");
    filepath = path.join(__dirname, `../public/${ext[1]}`, req.url);
  }
  render(req, res, filepath);
};
