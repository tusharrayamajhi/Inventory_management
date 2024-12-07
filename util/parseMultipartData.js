
const fs = require("fs");
const formidable = require("formidable");
const path = require("path");

const cloudinary  = require("./cloudinaryConfig")


module.exports = (req,res)=>{
return new Promise((resolve,reject)=>{

    const form = new formidable.IncomingForm({
        allowEmptyFiles: true, 
        keepExtensions:true,

    });
    form.parse(req, (err, fields, files) => {
        let data = Object.fromEntries(Object.entries(fields).map(([key,value]) => [key,value[0]]));
        if (err) {
            if(err.code == 1008){
                resolve(data)
                return
            }
           reject(err)
            return;
        }
        const file = files.image?.[0];
        if (!file || file.length === 0) {
            resolve(data)
            return
        }
        cloudinary.uploader.upload(file.filepath).then(result=>{
            let url = result.secure_url
            data.image = url
            resolve(data)
        }).catch(err=>{
            reject(err)
        })
    });
})
}



// module.exports = (req,res)=>{
//     return new Promise((resolve,reject)=>{
    
//         const form = new formidable.IncomingForm();
//         form.uploadDir = path.join(__dirname,"../uploads"); // Temporary folder for uploads
//         form.keepExtensions = true;
        
//         form.parse(req, (err, fields, files) => {
//             if (err) {
//                reject(err)
//                 return;
//             }
//             let data = Object.fromEntries(Object.entries(fields).map(([key,value]) => [key,value[0]]));
//             const file = files.company_logo;
//             if (file) {
//                 const newPath = `./uploads/${Date.now()}_${file[0].originalFilename}`;
//                 fs.rename(file[0].filepath, newPath, (err) => {
//                     if (err) throw err;
//                     const imagePath = newPath.replace("./", "");
//                     data.company_logo = imagePath
//                     resolve(data)
//                 });
//             }
           
//         });
//     })
//     }