const {render,renderFileWithData} = require('../util/renderfile')
const {roles,sessions} = require('../util/object')
const path = require("path")
const connection = require('../util/connect')
const url = require('url')
const processpost = require("../util/post")
module.exports = async function invoice(req,res) {
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
    if(user.roles == roles.superadmin  ){
        res.writeHead(302,{
            location:"/"
        })
        return res.end();
    }

    if(req.url == "/invoice/add" && req.method == "GET"){
        let cus_query = ''
        let cus_params = []
        let pro_query = ''
        let pro_params = []
        if(user.roles == roles.admin){
            cus_query = "select * from customers where user_id = ?"
            cus_params = [user.id]
            pro_query = "select * from products where user = ?"
            pro_params = [user.id]
        }else{
            cus_query = "select * from customers where user_id = ?"
            cus_params = [user.createdBy]
            pro_query = "select * from products where user = ?"
            pro_params = [user.createdBy]
        }
        try{
            
            const [customers] = await connection.promise().query(cus_query,cus_params)
            const [product] = await connection.promise().query(pro_query,pro_params);
            const data = {customers,product}
            return renderFileWithData(req,res,path.join(__dirname,"../public/html",'addinvoice.ejs'),data)
        }catch(err){
            console.log(err)
            render(req,res,path.join(__dirname,'../public/html','error.html'))
        }
    }else if(req.url == "/invoice/add" && req.method == "POST"){
      const body = await processpost(req);
      if(body.customer_id == ''){
        res.statusCode = 400
        return res.end(JSON.stringify({message:"select customer"}))
      }
      if(body.formsdata.length == 0){
        res.statusCode = 400
        return res.end(JSON.stringify({message:"select product"}))
      }
      let err = {
        product_id:'',
        invalid_qnt:''
      }
      let errors = []
      let haserr = false
      body.formsdata.forEach(product => {
        console.log(product)
        if(parseInt(product.qnt) <= 0 || parseInt(product.qnt) > parseInt(product.stock)){
          err.product_id = product.product_id
          err.invalid_qnt = `qnt most be between 0 and ${product.stock}` 
          haserr = true
          errors.push(err)
          err = {
            product_id:'',
            invalid_qnt:''
          }
        }
        
      });
      if(haserr){
        res.statusCode = 400
        return res.end(JSON.stringify(errors));
      }
      let cases = 'case'
      let ids = []
      body.formsdata.forEach(product=>{
        ids.push(product.product_id)
        cases = cases + ` when product_id = ${product.product_id} then stock - ${product.qnt} `
        
      })  
      console.log(body)
      async function getsellscode() {
        const [number] = await connection
          .promise()
          .query("select count(DISTINCT sells_code) as count from invoices where user = ? ", [
            user.id,
          ]);

        const date = new Date();
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear().toString();

        const code = `${day}${month}${year}-${number[0].count + 2}`;
        return code
      }
      const sellscode = await getsellscode();

      try{
        await connection.promise().beginTransaction()
          connection.execute(`update products set stock =  ${cases} end where product_id in (${ids.join(',')})`);

          for (const sells of body.formsdata) {
            let qnt = parseInt(sells.qnt)
            let isdec = 0
            let [result] = await connection.promise().query("select * from purchases  where user = ? and product = ? and remaining != 0  order by pruchase_date asc",[user.id,sells.product_id])
            
            while(qnt != 0){
              if(result[isdec].remaining >= qnt){
                connection.execute(`update purchases set remaining = remaining - ?  where purchase_id = ?`,[qnt,result[isdec].purchase_id])
                qnt = 0
                isdec ++
              }else{
                connection.execute("update purchases set remaining = 0 where purchase_id = ?",[result[isdec].purchase_id])
                qnt = qnt - result[isdec].remaining
                isdec++
              }

            }
            await connection.promise().query("insert into invoices (sells_code, customer_id,product_id,Quantity,rate,total,payment,remark,user) values (?,? , ? ,  ? ,  ? ,  ? , ? ,  ? , ?)",[sellscode,body.customer_id,sells.product_id,sells.qnt,sells.rate,sells.total,sells.status,sells.remark,user.id]);
          }
        await connection.promise().commit()
        res.statusCode = 200
        return res.end(JSON.stringify({message:"invoice add successfully"}))
        
      }catch(err){
        await connection.promise().rollback()
        console.log(err)
        res.statusCode = 500
        return res.end(JSON.stringify({message:"internal server error"}))
      }
    }else if(req.url == "/invoice/view" && req.method == "GET"){
      try{
        let [result] = await connection.promise().query("select * from invoices inner join customers on invoices.customer_id = customers.customer_id inner join products on invoices.product_id = products.product_id  where invoices.user = ?",[user.id]);
        console.log(result)
        return renderFileWithData(req,res,path.join(__dirname,"../public/html",'viewinvoice.ejs'),result);
      }catch(err){
        console.log(err);
        return render(req,res,path.join(__dirname,'../public/html','error.html'))
      }
    }
    else if (
        req.url.startsWith("/invoice/getproduct") &&
        req.method == "GET"
      ) {
        const parseurl = url.parse(req.url, true);
        const id = parseurl.query.id;
        try {
            
        let pro_query = ''
        let pro_params = []
        if(user.roles == roles.admin){
           
            pro_query = "select * from products where product_id = ? and user = ?"
            pro_params = [id,user.id]
        }else{
            
            pro_query = "select * from products where product_id = ? and user = ?"
            pro_params = [id,user.createdBy]
        }
          const [products] = await connection
            .promise()
            .query(pro_query,pro_params)
          if (products.length == 0) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ message: "cannot get product" }));
          }
          res.statusCode = 200;
          return res.end(JSON.stringify(products[0]));
        } catch (err) {
          console.log(err);
          return res.end(JSON.stringify({ message: "database err" }));
        }
    }else if(req.url.startsWith("/invoice/edit") && req.method == "GET"){
      const parseurl = url.parse(req.url,true);
      const sells_code = parseurl.query.sells_code;
      console.log(sells_code)
      try{
        const [result] = await connection.promise().query("select * from invoices inner join products on invoices.product_id = products.product_id inner join customers on invoices.customer_id = customers.customer_id where invoices.sells_code = ? and invoices.user = ?",[sells_code,user.id]);
        console.log(result)
        return renderFileWithData(req,res,path.join(__dirname,"../public/html","editinvoice.ejs"),result);
      }catch(err){
        console.log(err)
        return render(req,res,path.join(__dirname,"../public/html","error.html"))
      }
    } else if(req.url == "/invoice/edit" && req.method == "PATCH"){
      const body = await processpost(req);
      console.log(body)
      try{
        await connection.promise().beginTransaction()
        for(let invoice of body){
          await connection.promise().query("update invoices set payment = ?, remark = ? where user = ? and invoices_id = ?",[invoice.status,invoice.remark,user.id,invoice.invoices_id]);
        } 
        await connection.promise().commit()
        res.statusCode = 200
        return res.end(JSON.stringify({message:"update successfully"}))
      }catch(err){
        console.log(err)
        await connection.promise().rollback()
        res.statusCode = 500
        return res.end(JSON.stringify({message:"internal server error"}))
      }
    }
    else {
        const ext = req.url.split(".");
        filepath = path.join(__dirname, `../public/${ext[1]}`, req.url);
      }
      render(req, res, filepath);

    
}