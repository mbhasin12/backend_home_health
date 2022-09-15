

const express = require('express')
const bodyparser = require("body-parser")
const cors = require("cors")
const app = express()


app.use(cors());
app.use(bodyparser.json());
const mysql = require('mysql')

const db = mysql.createConnection({
    user: "homehealth2022",
    host: "home-health-1.cq5vn6zebgoo.us-east-2.rds.amazonaws.com",
    password: "", //!!!!!!!!!NEVER PUSH CODE WITH THE PASSWORD!!!!!!!!!!!
    database: "central_db"

});

app.listen(3001, () => {
    console.log("Server Running")
})

//some example api end points and sql queries for your learning convenience
/*
app.post('/insert', (req, res) => {

    const countryName = req.body.countryName;
    const pop = req.body.population;
    db.query('INSERT INTO node_testing (countryName, population) VALUES (?, ?)',[countryName, pop] ,(err, result) => {
        if (err) {
            console.log(err);
        }
        
        //console.log(result);
        
        res.send(result);
        
    })
    console.log('This is the req');
    console.log(req);
})

//get all countries
app.get('/countries', (req, res) => {
    let qr = 'SELECT * from node_testing';

    db.query(qr, (err, result) => {
        if (err) {
            console.log(err);

        }

        if (result.length > 0) {
            res.send({
                message:'all countries',
                data:result
            })
        }
    })
});

app.get('/country/:id', (req, res) => {
    const id = req.params.id;
    let qr = `SELECT * from node_testing WHERE id = ${id};`

    db.query(qr, (err, result) => {
        if (err) {
            console.log(err);
        }

        if (result.length > 0) {
            res.send({
                message:'Selected Country',
                data:result
            })
        }
        else {
            res.send({
                message: 'data not found'
            })
        }
    })
});

*/
