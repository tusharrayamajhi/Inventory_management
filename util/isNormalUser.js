
let {roles} = require("./object")

function isNormalUser(user,res){
if(user.roles !== roles.normal){
    res.writeHead(302, {
        location: "/",
      });
      res.end();
      return false;
}
return true
}
module.exports = {
    isNormalUser
}