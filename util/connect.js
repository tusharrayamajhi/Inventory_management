const sql = require('mysql2');
const fs = require("fs");
const { log } = require('console');

    const connection = sql.createConnection({
        host:"localhost",
        port:3307,
        user:"root",
        password:"tushar",
        multipleStatements:true,
        database:"inventory"
    })
    module.exports = connection;


// const sqlfile = './database.sql'

// fs.readFile(sqlfile,"utf-8",(err,data)=>{
//     if(err){
//         console.log(err.message)
//         return;
//     }
//     connection.query(data,(err,result)=>{
//         if(err){
//             console.log(err)
//             return;
//         }
//         console.log(result);
//     })
//     connection.end();

// })