
const fs = require('fs')
const path = require('path')
module.exports =  parseMultipartData = (body, boundary) => {
    const parts = body.split(`--${boundary}`);
    const result = {};
    parts.forEach((part) => {
      if (part.includes('Content-Disposition')) {
        const [headers, content] = part.split('\r\n\r\n');
        const nameMatch = headers.match(/name="([^"]+)"/);
        const filenameMatch = headers.match(/filename="([^"]+)"/);
        const name = nameMatch && nameMatch[1];
        const filename = filenameMatch && filenameMatch[1];
        if (filename) {
          const filePath = path.join(__dirname, '../uploads', filename.trim());
          fs.writeFileSync(filePath, content.trim(), { encoding: 'binary' });
          result[name] = filename;
        } else if (name) {
          result[name] = content.trim();
        }
      }
    });
    return result;
  };
  

 