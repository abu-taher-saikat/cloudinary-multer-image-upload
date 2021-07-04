const express = require('express');
const app = express();
const upload = require('./multer');
const uploads = require('./cloudinary');
const fs = require('fs');

app.use(express.json());


app.get('/',(req,res)=>{
    res.send('hello world');
})

// make a port request
app.use('/upload-images', upload.array('image'), async(req,res)=>{

    const uploader = async(path)=> await uploads(path, 'Images')
    try{
        if(req.method === 'POST'){
            const urls = [];
            const files = req.files
    
            for(const file of files){
                const {path} = file
                const newPath = await uploader(path);
                urls.push(newPath);
    
                fs.unlink(path);
            }
    
            res.status(200).json({
                message : 'Images Uploaded Successfully',
                data : urls
            })
        }else{
            res.status(405).json({
                err : "Images not uploaded successfully"
            })
        }
    }catch(err){
        res.json({
            err
        })
    }
})

app.listen(5000,()=>{
    console.log("server is listening or port 5000");
})

