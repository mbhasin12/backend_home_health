

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
    password: "DVNFrYyJO2ONYzGwyIZS", //!!!!!!!!!NEVER PUSH CODE WITH THE PASSWORD!!!!!!!!!!!
    database: "central_db"

});

function checkifUserExists(email) {
    qr = `SELECT * FROM n_Auth WHERE email = "${email}"`

    db.query(qr, (err, result) => {
        
        if (err) {
            console.log(err);

        }
        if (result.length > 0) { 
            console.log(result.email)
        }
        
    })


}

//call this endpoint when creating a new account
 app.post('/users', async(req, res) => {
     //check if user already exisits
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        
        
        //if (checkifUserExists(req.body.email) === false) {
            console.log('hi')
            db.query('INSERT INTO n_Auth (lastName, firstName, email, password, roleLevel) VALUES (?, ?, ?, ?, ?)',
            [req.body.lname, req.body.fname, req.body.email, hashedPassword, req.body.role]
            ,(err, result) => {
                console.log('2')
                if (err) {
                    console.log(err);
                }
                
                //console.log(result);
                
                res.send(result);

            }) 
            
        //}
        //res.status(200).send()
        
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

