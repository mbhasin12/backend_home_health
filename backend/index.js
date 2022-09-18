

const express = require('express')
const bodyparser = require("body-parser")
const cors = require("cors")
const app = express()
const bcrypt = require('bcrypt')


app.use(cors());
app.use(bodyparser.json());
const mysql = require('mysql')

const db = mysql.createConnection({
    user: "homehealth2022",
    host: "home-health-1.cq5vn6zebgoo.us-east-2.rds.amazonaws.com",
    password: "", //!!!!!!!!!NEVER PUSH CODE WITH THE PASSWORD!!!!!!!!!!!
    database: "central_db"

});



//call this endpoint when creating a new account
 app.post('/users', async(req, res) => {
     //check if user already exisits
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        
        
        qr = `SELECT * FROM n_Auth WHERE email = "${req.body.email}"`
        //checks if the user exists
        db.query(qr, (err, result) => {
        
            if (err) {
                console.log(err);
    
            }
            if (result.length < 1) {  //user does not exist
                console.log("did not find a user with that log in");

                db.query('INSERT INTO n_Auth (lastName, firstName, email, password, roleLevel) VALUES (?, ?, ?, ?, ?)',
                    [req.body.lname, req.body.fname, req.body.email, hashedPassword, req.body.role]
                    ,(err, result) => {
                        
                        if (err) {
                            console.log(err);
                            res.status(500).send()
                        }
                        
                        res.send(result);

                    }) 

            }
            else { 
                res.status(500).send()
                console.log('found a user with that log in')
            }
        })
        
        
    }
    catch {
        res.status(500).send()
    }

    

 })
//log in endpoint
 app.post('/users/login', async(req, res) => {
     //query the db to find user
    
     qr = `SELECT * FROM n_Auth WHERE email = "${req.body.email}"`
     db.query(qr, async(err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send()
            

        }
        if (result.length > 0) {
            
            try {
                if (await bcrypt.compare(req.body.password, result[0].password)) {
                   res.status(200).send()
                }
            }
            catch {
                res.status(500).send()
            }
        }
    })
    
     
 })

app.listen(3001, () => {
    console.log("Server Running")
})

