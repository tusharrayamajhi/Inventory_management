
let {roles} = require("./object")

function isAdmin(user,res){
if(user.roles !== roles.admin){
    res.writeHead(302, {
        location: "/",
      });
      res.end();
      return false;
}
return true
}
module.exports = {
    isAdmin
}