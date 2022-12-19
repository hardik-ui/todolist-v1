const express = require("express");
const bodyParser = require("body-parser");
var lodash = require('lodash');

const mongoose = require('mongoose');
// Connection URL
mongoose.connect("mongodb+srv://admin-hardik:test123@cluster0.e5ehkmp.mongodb.net/todolistDB");

const itemsSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "List item cannot be empty"]
    },
});

const listSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "List name cannot be empty"]
    },
    items: [itemsSchema]
});

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema);

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", function(req, res){
    
    Item.find(function(err, foundItems){
        if(err){
            console.log(err);
        } else{
            if(foundItems.length===0){
                foundItems = [{name: "Welcome to your todolist!"}, 
                {name: "Hit the + button to add a new item."},
                {name: "<-- Hit this to delete an item."}];
                Item.insertMany(foundItems, function(err){
                  if(err){
                    console.log(err);
                  } else{
                    console.log("Insert Successful");
                  }
                });
            }
            res.render("list", {day: "Today", listOptions: foundItems});
        }
      });
});

app.get("/about", function(req, res){
    res.render("about");
});

app.post("/", function(req, res){

    if(req.body.list==="Today"){
        Item.insertMany([{ name: req.body.newItem}], function(err){
            if(err){
              console.log(err);
            } else{
              console.log("Insert Successful");
            }
          });
          res.redirect("/");
    } else{
        List.findOne({name: req.body.list}, function(err, foundList) {
            const newItem = new Item({
                name: req.body.newItem
            });
            foundList.items.push(newItem);
            foundList.save();
        });

        const url = "/" + req.body.list;
        res.redirect(url);
    }

});

app.post("/delete", function(req, res){
    if(req.body.list==="Today"){
        Item.deleteOne({_id: req.body.checkbox}, function(err){
            if(err){
              console.log(err);
            } else{
              console.log("Delete successful");
              res.redirect("/");
            }
          });
    } else{
        List.findOneAndUpdate({name: req.body.list}, {$pull: {items: {_id: req.body.checkbox}}}, function(err, result) {
            if(!err){
                console.log(result);
                console.log("Remove from custom list successful");
                res.redirect("/"+req.body.list);
            }
        });
    }
});

app.get("/:listName", function(req, res){
    const listName = lodash.capitalize(req.params.listName);
    List.findOne({name: listName}, function(err, foundList){
        if(err){
            console.log(err);
        } else{
            if(!foundList){
                const listItem1 = new List({name: "Welcome to your todolist!"});
                const listItem2 = new List({name: "Hit the + button to add a new item."});
                const listItem3 = new List({name: "<-- Hit this to delete an item."});
                List.create({name: listName, items: [listItem1, listItem2, listItem3]}, function(err){
                        if(err){
                        console.log(err);
                        } else{
                        console.log("Insert Successful");
                        }
                  });

                const url = "/" + listName;
                res.redirect(url);
            } else {
                res.render("list", {day: listName, listOptions: foundList.items});
            }
        }
      });
});

app.listen(3000, function(){
    console.log("server started at port 3000");
});