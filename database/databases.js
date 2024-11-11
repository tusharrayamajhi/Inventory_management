const connection = require("../util/connect");

async function getUserByEmail(email){
    try{

        const [rows] = await connection.promise().query("select * from users where email=?",[email])
       return rows[0];
    }catch(err){
        return {error:"something went wrong" + err}
    }
}

module.exports = {
    getUserByEmail
}