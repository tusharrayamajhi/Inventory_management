let sessions ={}
const mimeType = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".ejs": "ejs",
  };
  const roles = {
    admin:"admin",
    superadmin :"superadmin",
    normal:"normal"
  }
module.exports = {
    sessions,
    mimeType,
    roles
}