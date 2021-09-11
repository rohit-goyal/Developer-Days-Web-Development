const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname+ "/date.js");

const app = express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/todolistdb");
const itemsSchema = {name:String};
const Item = mongoose.model("Item",itemsSchema);

const milk = new Item({name:"add your task here"});
const food = new Item({name:"mark check to delete this"});
const dish = new Item({name:"add new to do using the button below"});

const defaultArray = [milk,food,dish];

const listSchema = {name: String, items:[itemsSchema]};
const List = mongoose.model("List",listSchema);

    let day= date();

app.get("/", function(req, res){



    Item.find({}, function(err, items){
      if(items.length=== 0){
        Item.insertMany(defaultArray, function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("success");
          }
        });
        res.redirect("/");
      } else {

        res.render("list", { listTitle: day, newListItems: items});
      }
    });
  });

  app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name:itemName});
  if (listName === day){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
  });

app.post("/delete",function(req,res){
  const checkedItem= req.body.checkbox;
  const listName = req.body.listName;  // stores checkbox name

  if(listName === day){
  Item.findByIdAndRemove(checkedItem, function(err){
    if(err){
      console.log(err);
    } else {
      console.log("done");
      res.redirect("/")
    }
  });
} else{
  List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: checkedItem}}}, function(err, foundList){
    if(!err){
      res.redirect("/"+ listName)
    }
  })
}
});


app.get("/:customListName",function(req,res){
  const customListName = req.params.customListName;

  List.findOne({name:customListName},function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({name:customListName,items:defaultArray});
        list.save();
        res.redirect("/"+customListName);
      }
      else{
          res.render("list",{ listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
});




app.listen(3000, function(){
  console.log("server is up and running.");
});
