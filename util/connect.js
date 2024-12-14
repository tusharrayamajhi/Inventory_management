const sql = require('mysql2');
const fs = require("fs");
const { log } = require('console');

    // const connection = sql.createConnection({
    //     host:"localhost",
    //     port:3307,
    //     user:"root",
    //     password:"rasonar0002",
    //     multipleStatements:true,
    //     database:"inventory"
    // })
    const connection = sql.createConnection({
        host:process.env.host,
        port:process.env.port,
        user:process.env.user,
        password:process.env.password,
        multipleStatements:true,
        database:process.env.database
    })
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err.message);
        } else {
            console.log('Connected to the database successfully!');
        }
    });
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
