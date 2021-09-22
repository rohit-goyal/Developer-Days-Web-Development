const express = require("express");
const bodyParser= require("body-parser");
const mongoose = require("mongoose");
var http = require('http');
var formidable = require('formidable');
var fs = require('fs');

const app = express();


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/assignmentdb")

const detailSchema = {name:String,email:String,title:String,link:String};
const Detail = mongoose.model("Detail",detailSchema);

app.get("/",function(req,res){
  res.sendFile(__dirname+"/index.html");
})

app.post("/",function(req,res){
  const name = req.body.name;
  const email = req.body.email;
  const title = req.body.title;
  const link = req.body.link;

  const info = new Detail({name:name,email:email,title:title,link:link});
  Detail.findOne({email: req.body.email}, function (err, result) {
 if(!result) {
   info.save();
   var form = new formidable.IncomingForm();

   form.parse(req);

   form.on('fileBegin', function (name, file){
       file.path = __dirname +'/'+ file.name;
   });

   form.on('file', function (name, file){
       console.log('Uploaded ' + file.name);
   });
   res.sendFile(__dirname+"/file.html");
}
else {
  console.log(result);
  res.send("<h1>email already in use</h1>");
}
  });

});

app.post("/file",function(req,res){
   var form = new formidable.IncomingForm();

   form.parse(req);

   form.on('fileBegin', function (name, file){
       file.path = __dirname +'/'+ file.name;
   });

   form.on('file', function (name, file){
       console.log('Uploaded ' + file.name);
   });
   res.sendFile(__dirname+"/submitted.html");

});

app.listen(3000,function(){
  console.log("server is up and running");
})
