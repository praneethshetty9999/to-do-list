//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash")
const date = require(__dirname + "/date.js");
require('dotenv').config()
const app = express();

const mongoose = require("mongoose");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));//to configure body-parser
app.use(express.static("public"));//to set public folder as static folder

mongoose.connect(process.env.MONGO_STRING, {
  useNewUrlParser: true,
});

const itemSchema = mongoose.Schema({
  name: String,
});

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

const Item = mongoose.model("Item", itemSchema);

const i1 = new Item({
  name: "Welcome to TO-DO list!",
});

const i2 = new Item({
  name: "<-- Hit this to delete the item",
});

const i3 = new Item({
  name: "Click + to add new item!",
});

const defaultItems = [i1, i2, i3];

app.get("/", function (req, res) {
  const day = "Today";
  Item.find({}, function (err, result) {
    if (err) {
      console.log("Error Occured!");
    } else {
      if (result.length == 0) {
        res.render("list", { listTitle: day, newListItems: defaultItems });
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log("Error occured!");
          } else {
            console.log("No Error!");
          }
        });
      } else {
        res.render("list", { listTitle: day, newListItems: result });
      }
    }
  });
});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const lName = req.body.list;
  const newItem = new Item({
    name: item,
  });  

  if(lName==="Today"){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name : lName}, function(err,result){
      if(!err){
        result.items.push(newItem);
        result.save();
        res.redirect("/"+lName);
      }
    })
  }
});

app.post("/delete", function (req, res) {
  const checkedID = req.body.checkbox;
  const listName = (req.body.listName);
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedID, function (err) {
      if (err) {
        console.log("Error Occured!");
      }
      res.redirect("/");
    });
  }
  else{
    List.findOneAndUpdate({name : listName},{$pull : {items : {_id : checkedID}}} ,function (err,results){
      if(!err){
        res.redirect("/"+listName)
      }
    })
  }
});

app.get("/:customList", function (req, res) {
  const listName = _.capitalize(req.params.customList);
  List.findOne({name : listName}, function (err, result) {
    if(!err){
      if(!result){
        const list = new List({
          name: listName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/"+listName);
      }
      else{
        res.render("list",{listTitle: result.name,newListItems : result.items})
      }
    }

  })
});

app.get("/about", function (req, res) {
  res.render("about");
});
let port = process.env.PORT;
if(port=="" || port == null){
  port = 3000;
}
app.listen(port,function(){
  console.log("running!");
});
