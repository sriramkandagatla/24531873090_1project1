const express=require('express');
const app=express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

let server=require('./server');
let config=require('./config');
let middleware=require('./middleware');

const MongoClient = require('mongodb').MongoClient;

const response=require('express');

const url='mongodb://127.0.0.1:27017';
const dbname="micro1";
let db

MongoClient.connect(url, (err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbname);
    console.log(`connected database: ${url}`);
    console.log(`Database:${dbname}`);
});

app.get('/hospitals', middleware.checkToken, (req,res) => {
    console.log("getting things ready");
    const data=db.collection("hospital").find().toArray()
    .then(result => res.json(result));
});

app.get('/ventilator', middleware.checkToken , (req,res)=>{
    console.log("getting things ready");
    const data=db.collection("ventilator").find().toArray()
    .then(result=>(res.json(result)));
});

//SEARCH VENTILATOR BY STATUS
app.post('/searchventbystatus', middleware.checkToken , (req,res) => {
    const status = req.query.status;
    console.log(status);
    const ventillatordetails=db.collection('ventilator')
    .find({"status":status}).toArray().then(result=>res.json(result));
});

//SEARCH VENTILATOR BY NAME

app.post('/searchventbyname',  middleware.checkToken , (req,res) => {
    const name=req.query.name;
    console.log(name);
    const ventilatordeatils=db.collection('ventilator')
    .find({'name':new RegExp(name, 'i')}).toArray().then(result=>res.json(result));
});

//SEARCH HOSPITAL
app.post('/searchhospital', middleware.checkToken , (req,res) => {
    const name=req.query.name;
    console.log(name);
    const hospitaldetails=db.collection('hospital')
    .find({'name':new RegExp(name, 'i')}).toArray().then(result=>res.json(result));
});

//ADD VENTILATOR
app.post('/addvent', middleware.checkToken ,(req,res)=>{
    const hid=req.query.hid;
    const ventid=req.query.ventid;
    const status=req.query.status;
    const name=req.query.name;
    console.log("adding ventilator, please wait a moment");
    const item={"hid":hid, "ventid":ventid, "status":status, "name":name};
    db.collection("ventilator").insertOne(item, function(err, result){
        res.json("inserted successfully");
    });
});

//UPDATE VENTILATOR BY VENTILATOR ID
app.put('/updateventilator',  middleware.checkToken ,(req,res) => {
    const ventid= {ventid: req.query.ventid};
    console.log(ventid);
    const newvalues={$set: {status:req.query.status}};
    console.log("updating ventilator details, please wait a moment");
    db.collection("ventilator").updateOne(ventid, newvalues, function(err, result){
        res.json('updated one document');
        if(err) throw err;
    });
});

//DELETE VENTILATOR BY VENTILATOR ID
app.delete('/deletevent', middleware.checkToken , (req,res) => {
    const ventid=req.query.ventid;
    console.log(ventid);
    const temp={"ventid":ventid};
    db.collection("ventilator").deleteOne(temp, function(err,obj){
        if(err) throw err;
        res.json("deleted one element");
    });
});

app.get('/searchventilators', middleware.checkToken ,(req,res)=>{
    const status=req.query.status;
    const name=req.query.name;
    console.log("searching ventilators, please wait a moment");
    const data=db.collection("ventilator").find({"name":name},{"status":status}).toArray().then(result=>res.send(result));
    res.send("no hospital found :(");
});

app.listen(3333,(req,res)=>{
    console.log("working well");
});