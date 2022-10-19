

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
    
    try {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt) //hash the password
        
        
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
                        
                        res.send({
                            status: "200",
                        })

                    }) 

            }
            else { 
                res.send({
                    status: "400",
                    message: "found a user with that log in"
                })
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
            //res.status(500).send()
            

        }
        if (result.length > 0) {
            
            try {
                if (await bcrypt.compare(req.body.password, result[0].password)) {
                    res.send({
                        status: "200",
                    })
                   //res.status(200).send()
                }
                else {
                    res.send({
                        status: "400",
                        message: "incorrect password"
                    })
                }
            }
            catch {
                res.status(500).send()
            }
        }
        else {
            res.send({
                status: "400",
                message: "incorrect email"
            })

        }
    })
    
     
 })

 //adding a new nurse
 app.post('/new-nurse', async(req,res) => {
    const nurseid = req.body.nurseid;
    const fname = req.body.fname;
    const lname = req.body.lname;
    const phone = req.body.phone;
    const email = req.body.email;
    const skills = req.body.skill;
    const org = req.body.org;

    db.query('INSERT INTO n_Nurse (nurseid, firstName, lastName, email, phone, skillDescription, org) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ,[nurseid, fname, lname, email, phone, skills, org] 
    ,(err, result) => {
        if (err) {
            console.log(err);
            res.send({
                "status" : 400
            
            })
        }
        
        console.log(result);
        
        res.send({
            "status" : 200
        });
        
    })

 })

 //get all new nurses

 app.post('/get-nurses', async(req, res) => {
    org = req.body.org;
    let qr = `SELECT * from n_Nurse WHERE org = "${org}"`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log(err);
        }

        if (result.length > 0) {
            res.send({
                status:'200',
                data:result
            })
        }
        else {
            res.send({
                status: '400'
            })
        }
    })

 })

 app.post('/new-patient', async(req,res) => {
    const patientid = req.body.patientid;
    const fname = req.body.fname;
    const lname = req.body.lname;
    const dob = req.body.dob;
    const email = req.body.email;
    const phone = req.body.phone;

    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    const street = req.body.street;
    const city = req.body.city;
    const zip = req.body.zip;
    const assignedNurse = req.body.assignedNurse;

    const treatmentDesc = req.body.treatmentDesc;

    const org = req.body.org;
    
    

    db.query('INSERT INTO n_Patient (patientid, firstName, lastName, dateOfBirth, email, phone, startDate, endDate, treatmentDescription, streetAddr, cityAddr, zipAddr, assigned_nurse, org) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ,[patientid, fname, lname, dob, email, phone, startDate, endDate, treatmentDesc, street, city, zip, assignedNurse, org] 
    ,(err, result) => {
        if (err) {
            console.log(err);
            res.send({
                "status" : 400
            
            })
        }
        
        console.log(result);
        
        res.send({
            "status" : 200
        });
        
    })

 })


app.post('/get-patients', async(req,res) => {
    const org = req.body.org;

    let qr = `SELECT * from n_Patient WHERE org = "${org}"`;

    db.query(qr, (err, result) => {
        if (err) {
            console.log(err);
        }

        if (result.length > 0) {
            res.send({
                status:'200',
                data:result
            })
        }
        else {
            res.send({
                status: '400'
            })
        }
    })



})
app.listen(3001, () => {
    console.log("Server Running")
})

