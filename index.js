// Add required packages
const express = require("express");
const path = require('path');
const mysql = require('mysql');
const ejs = require('ejs');

const app = express();


const bodyParser = require('body-parser');
const methodOverride = require('method-override')
require('dotenv').config()

const multer = require("multer");
const upload = multer();

// Set up EJS
app.set("view engine", "ejs");


// Start listener
app.listen(process.env.PORT || 8080, () => {
    console.log("App started (http://localhost:8080/) !");
});

app.use(methodOverride('_method'));
// Setup routes
app.get('/', (req,res)=>{
    res.render('index')
});


// Add database package and connection string (can remove ssl)

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});


///view customer list

app.get('/customers', (req,res)=>{
    let sql = "SELECT * FROM customer";
    let query = pool.query(sql,(err, rows)=>{
        if (err) throw err;
        res.render ('customers',{customer:rows});
    });
   });

/***************delete data********************/
app.get('/del/:cusId',(req,res) =>{
    const cusId= req.params.cusId;
    let sql= `DELETE  FROM customer WHERE cusId= ${cusId}`;
    let query= pool.query(sql, (err,result)=>{
        if (err) throw err;
        res.redirect('/customers');
    });
  });

app.get("/import", (req, res) => {
    res.render("import");
 });
 
 app.post("/import",  upload.single('filename'), (req, res) => {
     if(!req.file || Object.keys(req.file).length === 0) {
         message = "Error: Import file not uploaded";
         return res.send(message);
     };
     //Read file line by line, inserting records
     const buffer = req.file.buffer; 
     const lines = buffer.toString().split(/\r?\n/);
 
     lines.forEach(line => {
          //console.log(line);
          customer = line.split(",");
          //console.log(customer);
          const sql = "INSERT INTO customer(cusId, cusFname, cusLname, cusState, cusSalesYTD}, cusSalesPrev) VALUES ($1, $2, $3, $4, $5, $6)";
          pool.query(sql, customer, (err, result) => {
              if (err) {
                  console.log(`Insert Error.  Error message: ${err.message}`);
              } else {
                  console.log(`Inserted successfully`);
              }
         });
     });
     message = `Processing Complete - Processed ${lines.length} records`;
     res.send(message);
 });

 app.get("/output", (req, res) => {
    var message = "";
    res.render("output",{ message: message });
   });
   
   
   app.post("/output", (req, res) => {
       const sql = "SELECT * FROM customer";
       pool.query(sql, [], (err, result) => {
           var message = "";
           if(err) {
               message = `Error - ${err.message}`;
               res.render("output", { message: message })
           } else {
               var output  = "";
               result.rows.forEach(customer => {
                   output += `${customer.cusId},${customer.cusFname},${customer.cusLname},${customer.cusState},${customer.cusSalesYTD},${customer.cusSalesPrev}\r\n`;
               });
               res.header("Content-Type", "text/csv");
               res.attachment("output.csv");
               return res.send(output);
           };
       });
   });

   /***************delete data********************/
   app.get('/del/:cusId',(req,res) =>{
    const cusId= req.params.cusId;
    let sql= `DELETE  FROM customer WHERE cusId= ${cusId}`;
    let query= pool.query(sql, (err,result)=>{
        if (err) throw err;
        res.redirect('/customers');
    });
  });
  /********** insert data to the database thru form*/
app.get('/create', (req, res) =>{
    res.render('create.ejs');
  });
  app.post('/create',(req, res)=>{
    var cusId = req.body.cusId;
    var cusFname = req.body.cusFname;
    var cusLname = req.body.cusLname;
    var cusState = req.body.cusState;
    var cusSalesYTD = req.body.cusSalesYTD;
    var cusSalesPrev = req.body.cusSalesPrev;
   
    var data = `INSERT INTO customer (cusId, cusFname, cusLname, cusState,cusSalesYTD,cusSalesPrev) VALUES ("${cusId}", "${cusFname}", "${cusLname}", "${cusState}","${cusSalesYTD}", "${cusSalesPrev}")`;
    pool.query(data, function(err, result) {

        if (err) throw err;
        console.log("New Customer Created");
        res.redirect('/create');
    });
  });
  /***************edit data********************/
  app.get('/edit/:cusId',(req,res)=>{
    const cusId= req.params.cusId;
    let sql= `SELECT * FROM customer WHERE cusId= ${cusId}`;
    let query= pool.query(sql, (err,result)=>{
        if (err) throw err;
        res.render ('edit',{customer: result[0]
        });
    });
  });

//update data
   app.post('/update',(req, res) => {
      const cusId = req.body.cusId;
      let sql = "UPDATE customer SET cusFname='"+req.body.cusFname+"',cusLname='"+req.body.cusLname+"',cusState='"+req.body.cusState+"', cusSalesYTD='"+req.body.cusSalesYTD+"',  cusSalesPrev='"+req.body.cusSalesPrev+"' where cusId ="+cusId;
      let query = pool.query(sql,(err, results) => {
        if(err) throw err;
        console.log("Customer update successfuly");
        res.redirect('/edit/ ');
      });
  });
