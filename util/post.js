

module.exports = (req) => {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const parseBody = JSON.parse(body);
      resolve(parseBody)
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
};
