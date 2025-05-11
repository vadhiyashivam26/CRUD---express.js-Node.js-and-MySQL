const express = require("express");
const app = express();

const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const path = require('path');
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

let port = 8080;

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended : true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    database : 'delta_app',
    password : '2636',
});

let getRandomUser = () => {
    return [
      faker.string.uuid(),
      faker.internet.username(), 
      faker.internet.email(),
      faker.internet.password(),
    ];
}

// let q = "INSERT INTO user (id, username, email, password) VALUES ?";

// let data = [];

// for (let i = 1; i <= 100; i++) {
//     data.push(getRandomUser()); // 100 fake data
// }

// Home route
app.get("/h", (req, res)=>{
    let q = `SELECT count(*) FROM user;`;
    try{
        connection.query(q, (err, result) =>{
            if(err) throw err;
            let count = result[0]["count(*)"];
            res.render("home.ejs", { count });
        });
    } catch (er){
     console.log(er);
     res.send("some error in database.");
    }
});

//Show route
app.get("/user", (req, res) =>{
    let q = `SELECT * FROM user`;
    try{
        connection.query(q, (err, users) =>{
            if(err) throw err;
            res.render("showusers.ejs", { users });
        });
    } catch (e){
        console.log(e);
        res.send("some error in DB");
    }
});

// edit route
app.get("/user/:id/edit", (req, res) =>{
    let { id } = req.params;
    let q = `SELECT * FROM user where id='${id}'`;
    try{
        connection.query(q, (err, result)=>{
            if (err) {
                throw err;
            }
            let user = result[0];
            res.render("edit.ejs", { user });
        });
    } catch (e){
        res.send("some error in DB");
    }
});

//update route
app.patch("/user/:id", (req, res)=>{
    let { id } = req.params;
    let { password: formPass, username: newUsername } = req.body;
    let q = `SELECT * FROM user WHERE id = '${id}' `;

    try {
        connection.query(q, (err, result) =>{
            if(err) throw err;
            let user = result[0];
            if(formPass != user.password){
                res.send("Wrong Password");
            } else {
                let q2 = `UPDATE user SET username = '${newUsername}' WHERE id = '${id}'`;
                connection.query(q2, (err, result) =>{
                    if(err) throw err;
                    res.redirect("/user");
                });             
            }
        });
    } catch (e) {
        console.log(e);
        res.send("some error in DB");
    }
});

app.get("/user/new", (req, res) =>{
    res.render("new.ejs");
});

app.post("/user/new", (req, res)=> {
    let { email, username, password } = req.body;
    let id = uuidv4();

    let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}', '${email}', '${password}')`;

    try {
     connection.query(q, (err, result) =>{
        if(err) throw err;
        console.log("add new user");
        res.redirect("/user");
     });
    } catch (e) {
        res.send("some error in DB");
    }
});

app.get("/user/:id/delete", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
        res.render("delete.ejs", { user });
      });
    } catch (err) {
      res.send("some error with DB");
    }
})

app.delete("/user/:id/", (req, res) =>{
    let { id } = req.params;
    let { password } = req.body;

    let q = `SELECT * FROM user WHERE id = '${id}' `;
    
    connection.query(q, (err, result) =>{
        if(err) throw err;
        let user = result[0];

        if (user.password != password) {
            res.send("Wrong Password...");
        } else {
            let q2 = `DELETE FROM user WHERE id ='${id}'`;
            
            try {
                connection.query(q2, (err, result)=>{
                    if(err) {
                        throw err;
                    } else {
                        console.log(result);
                        console.log("deleted!");
                        res.redirect("/user");
                    }
                    
                });
            } catch (e) {
                res.send("Some error in DB.");                
            }
        }
    });
});

app.listen(port, () =>{
    console.log("app is listening...!");
});

