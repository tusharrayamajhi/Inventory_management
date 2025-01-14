const ejs = require("ejs");
const { render, renderFileWithData } = require("../util/renderfile");
const processPost = require("../util/post");
const connection = require("../util/connect");
const fs = require("fs");
const path = require("path");
let { sessions, mimeType } = require("../util/object");
const ExcelJS = require("exceljs");
const { isAdmin } = require("../util/isAdmin");
const {
  isValidPhoneNo,
  isValidCharacter,
  isValidEmail,
  isValidPassword,
  isValidDigit,
} = require("../util/validaton");
const url = require("url");

module.exports = async function report(req, res) {
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
  if (!isAdmin(user, res)) return;

  if (req.url === "/report/sales" && req.method == "POST") {
    const body = await processPost(req); // Process the POST request body

    const { start, end } = body; // Extract start and end dates from the body
    const companyId = user.company; // Get the company ID from the user session

    try {
      // Validate the provided date range
      if (!start || !end || new Date(start) > new Date(end)) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid date range");
        return;
      }

      const formattedStart = new Date(start)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const formattedEnd = new Date(
        new Date(end).setUTCHours(23, 59, 59, 999)
      ).toISOString();
      console.log(formattedEnd);
      console.log(formattedStart);

      const [rows] = await connection.promise().query(
        `select *
          FROM 
            invoices i
          JOIN 
            users u ON i.user = u.user_id
          WHERE 
            u.company_id = ? AND i.sales_date BETWEEN ? AND ? 
        `,
        [companyId, formattedStart, formattedEnd] // Use placeholders to prevent SQL injection
      );

      let total = parseFloat(0);

      for (let sale of rows) {
        total += parseFloat(sale.total);
      }

      // Send the response back
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data: total }));
    } catch (error) {
      console.error("Error generating sales report:", error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error generating sales report");
    }
  } else if (req.url === "/report/sales-by-user" && req.method == "POST") {
    const body = await processPost(req); // Process the POST request body

    const { userId, start, end } = body; // Extract userId, start, and end dates from the body

    try {
      // Validate the provided date range
      if (!start || !end || new Date(start) > new Date(end)) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid date range");
        return;
      }

      const formattedStart = new Date(start)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const formattedEnd = new Date(
        new Date(end).setUTCHours(23, 59, 59, 999)
      ).toISOString();
      console.log(formattedEnd);
      console.log(formattedStart);

      // Query to fetch sales for a specific user
      const [rows] = await connection.promise().query(
        `SELECT *
        FROM 
          invoices i
        JOIN 
          users u ON i.user = u.user_id
        WHERE 
          i.user = ? AND i.sales_date BETWEEN ? AND ? And u.company_id = ?
      `,
        [userId, formattedStart, formattedEnd, user.company] // Use placeholders to prevent SQL injection
      );

      let total = parseFloat(0);

      for (let sale of rows) {
        total += parseFloat(sale.total);
      }

      // Send the response back
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ data: total }));
    } catch (error) {
      console.error("Error generating sales by user report:", error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error generating sales by user report");
    }
  } else if (req.url === "/report/top-vendor" && req.method == "POST") {
    const body = await processPost(req);

    const { start, end, numVendors } = body;

    const companyId = user.company; // Assuming `user.companyId` is available from the session

    if (!start || !end || new Date(start) > new Date(end)) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Invalid date range");
      return;
    }

    try {
      const formattedStart = new Date(start)
        .toISOString()
        .slice(0, 19)
        .replace("T", " "); // Format to 'YYYY-MM-DD HH:mm:ss'
      const formattedEnd = new Date(
        new Date(end).setUTCHours(23, 59, 59, 999)
      ).toISOString();

      const query = `
      SELECT v.vendor_name, SUM(p.total) AS total_purchase
      FROM vendors v
      INNER JOIN purchases p ON v.vendor_id = p.vendor
      INNER JOIN users u ON u.user_id = v.user
      WHERE u.company_id = ? 
      AND p.pruchase_date BETWEEN ? AND ?
      GROUP BY v.vendor_id
      ORDER BY total_purchase DESC
      LIMIT ?
  `;

      const params = [
        companyId,
        formattedStart,
        formattedEnd,
        parseInt(numVendors),
      ];

      const [rows] = await connection.promise().query(query, params);

      console.log(rows);

      // Send the response back with the top vendors
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ vendors: rows }));
    } catch (error) {
      console.error("Error fetching top vendors:", error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error fetching top vendors");
    }
  } else if (req.url === "/report/top-buyers" && req.method == "POST") {
    const body = await processPost(req); // Process the POST request body

    // Extract start date, end date, and number of customers from the body
    const { start, end, numCustomers } = body;
    const companyId = user.company; // Get the company ID from the user session

    // Validate the provided date range
    if (!start || !end || new Date(start) > new Date(end)) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Invalid date range");
      return;
    }

    // Format start and end dates for SQL query
    const formattedStart = new Date(start)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const formattedEnd = new Date(
      new Date(end).setUTCHours(23, 59, 59, 999)
    ).toISOString();

    try {
        
      // Query to get top buyers by total purchase within the specified date range and company
      const [rows] = await connection.promise().query(
        `
      SELECT c.name AS customer_name, SUM(i.total) AS total_purchase
      FROM invoices i
      INNER JOIN customers c ON c.customer_id = i.customer_id
      INNER JOIN users u ON u.user_id = c.user_id
      WHERE u.company_id = ?
      AND i.sales_date BETWEEN ? AND ?
      GROUP BY c.customer_id
      ORDER BY total_purchase DESC
      LIMIT ?
      `,
        [companyId, formattedStart, formattedEnd, parseInt(numCustomers)] // Use placeholders to prevent SQL injection
      );

      // Send the response back with the fetched data
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ buyers: rows }));
    } catch (error) {
      console.error("Error fetching top buyers:", error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error fetching top buyers data");
    }
  } else if (req.url === "/report/profit_loss" && req.method == "POST") {
    const body = await processPost(req); // Process the POST request body
    const { start, end } = body; // Get start and end date from the request body
    const companyid = user.company; // Assuming the user object contains the company ID

    // Set default dates if not provided
    if (!start || !end || new Date(start) > new Date(end)) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid date range");
        return;
      }

    try {
        const formattedStart = new Date(start)
        .toISOString()
        .slice(0, 19)
        .replace("T", " "); // Format to 'YYYY-MM-DD HH:mm:ss'
      const formattedEnd = new Date(
        new Date(end).setUTCHours(23, 59, 59, 999)
      ).toISOString();
        // SQL query to fetch the profit/loss data for the company
        const query = `
            SELECT
                SUM(i.Quantity * i.rate) AS total_sales_amount,
                SUM(pur.received_qnt * pur.unit_rate) AS total_purchase_amount,
                (SUM(i.Quantity * i.rate) - SUM(pur.received_qnt * pur.unit_rate)) AS profit_or_loss
            FROM invoices i
            JOIN purchases pur ON pur.product = i.product_id
            JOIN users u ON pur.user = u.user_id
            WHERE i.sales_date BETWEEN ? AND ? 
              AND u.company_id = ?;
        `;

        // Execute the query with the appropriate parameters
        const [results] = await connection.promise().query(query, [formattedStart, formattedEnd, companyid]);

        // If no data is found
        if (results.length === 0) {
            return res.end(JSON.stringify({ message: "No data found for the selected period." }));
        }
console.log(results[0])
        // Return the result as JSON
        return res.end(JSON.stringify({result:results[0],start,end}));
    } catch (error) {
        console.error("Error calculating profit and loss:", error);
        return res.end(JSON.stringify({ error: "An error occurred while calculating profit and loss." }));
    }


  } else if (req.url === "/report/top-selling-products" && req.method == "POST") {
    const body = await processPost(req); // Process the POST request body

    // Extract start date, end date from the body
    const { start, end } = body;
    const companyId = user.company; // Get the company ID from the user session

    // Validate the provided date range
    if (!start || !end || new Date(start) > new Date(end)) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Invalid date range");
      return;
    }

    // Format start and end dates for SQL query
    const formattedStart = new Date(start)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const formattedEnd = new Date(
      new Date(end).setUTCHours(23, 59, 59, 999)
    ).toISOString();

    try {
      // Query to get top-selling products by total sales within the specified date range and company
      const [rows] = await connection.promise().query(
        `
      SELECT p.product_name,SUM(i.Quantity) as qnt, SUM(i.Quantity * i.rate) AS total_sales
      FROM invoices i
      INNER JOIN products p ON p.product_id = i.product_id
      INNER JOIN users u ON u.user_id = p.user
      WHERE u.company_id = ?
      AND i.sales_date BETWEEN ? AND ?
      GROUP BY p.product_id
      ORDER BY total_sales DESC
      LIMIT 10
      `,
        [companyId, formattedStart, formattedEnd] // Use placeholders to prevent SQL injection
      );

      console.log(rows);
      // Send the response back with the fetched data
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ products: rows }));
    } catch (error) {
      console.error("Error fetching top-selling products:", error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error fetching top-selling products data");
    }
  } else if (req.url === "/report/user/get" && req.method == "GET") {
    const parse_url = url.parse(req.url, true);
    const companyId = user.company; // Assuming user.company holds the company ID

    // Query to fetch all users for a particular company
    const query = "SELECT * FROM users where company_id = ?";
    const params = [companyId];

    try {
      // Fetch users for the company
      const [result] = await connection.promise().query(query, params);
      // Return the result (users of the company)
      return res.end(JSON.stringify(result)); // Send users as a JSON response
    } catch (err) {
      console.error(err);
      res.end(
        JSON.stringify({
          status: 500,
          message: "An error occurred while fetching the users.",
        })
      );
    }
  } else {
    // Handle unknown routes
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Report not found");
  }
};
