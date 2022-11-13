

const express = require('express')
const bodyparser = require("body-parser")
const cors = require("cors")
const app = express()
const bcrypt = require('bcryptjs')
const nodemailer = require("nodemailer");
//require('dotenv').config();
const { Auth, LoginCredentials } = require("two-step-auth");

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
 //reset password
 app.post("/users/resetPassword", async(req, res)=>{

    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt)

    console.log("resetting")
    qr = `SELECT * FROM n_Auth WHERE email = "${req.body.email}"`
    db.query(qr, (err, result)=>{
        if(err){
            console.log(err);
        }
        if (result.length > 0){
            console.log("reset in action")
            qr2 = `UPDATE n_Auth SET password = "${hashedPassword}" WHERE email = "${req.body.email}"`
            db.query(qr2, (err, result)=>{
                console.log(result)
                if(err){
                    console.log(err);
                }
                res.send({
                    status: "200"
                })

            })
        } else{
            res.send({
                status: "400",
                message: "can't find email"
            });
        }
    })

 })
 
 app.post("/users/sendEmail", async(req, res) => {
    qr = `SELECT * FROM n_Auth WHERE email = "${req.body.email}"`
    //checks if the user exists
    db.query(qr, (err, result) => {
        if (err) {
            console.log(err);
            //res.status(500).send()
        }
        console.log(result)
        if (result.length > 0) {
            
            const transport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                  user: 'xinyizhang0215@gmail.com',
                  pass: 'rvsouukhgqknbcnk'
                }
             });

            async function sendSth(emailId) {
                try {
                    const res = await Auth(emailId, "Home Health Dashboard");
                    return res.OTP;
                } catch (error) {
                  console.log(error);
                }
            }
            

            async function printPikachuMessage() {
                const pikachuMessage = await sendSth(req.body.email)
                console.log("Pin " + pikachuMessage);
                res.send({
                    status: "200",
                    message: pikachuMessage
                })
            }
            
            printPikachuMessage();
            
            

        }
        else {
            res.send({
                status: "400",
                message: "can't find email"
            })
        }
    })
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
                        firstname: result[0].firstName,
                        lastname: result[0].lastName,
                        role: result[0].roleLevel,
                        orgId: result[0].orgId
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
    const orgId = req.body.org;

    db.query('INSERT INTO n_Nurse (nurseid, firstName, lastName, email, phone, skillDescription, orgId) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ,[nurseid, fname, lname, email, phone, skills, orgId] 
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
    orgId = req.body.org;
    let qr = `SELECT * from n_Nurse WHERE orgId = "${orgId}"`;

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

    const orgId = req.body.org;
    
    

    db.query('INSERT INTO n_Patient (patientid, firstName, lastName, dateOfBirth, email, phone, startDate, endDate, treatmentDescription, streetAddr, cityAddr, zipAddr, assigned_nurse, orgId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ,[patientid, fname, lname, dob, email, phone, startDate, endDate, treatmentDesc, street, city, zip, assignedNurse, orgId] 
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
    const orgId = req.body.org;

    let qr = `SELECT * from n_Patient WHERE orgId = "${orgId}"`;

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

app.post('/new-calendar-event', async(req,res) => {
    const title = req.body.title;
    const date_time_start = req.body.date_time_start;
    const date_time_end = req.body.date_time_end;
    const reccuring = req.body.reccuring;
    const nurse_name = req.body.nurse_name;
    const patient_name = req.body.patient_name;
    const org = req.body.org;

    db.query('INSERT INTO calendar_events (title, time_start, time_end, recurring, nurse_name, patient_name, orgId) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ,[title, date_time_start, date_time_end, reccuring, nurse_name, patient_name, org] 
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


 
app.post('/get-calendar-event', async(req,res) => {
    const org = req.body.org;

    let qr = `SELECT * from calendar_events WHERE orgId = "${org}"`;

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

app.post('/delete-calendar-event', async(req,res) => {
    const title = req.body.title;

    let qr = `DELETE from calendar_events WHERE title = "${title}"`;

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

app.post('/get-orgname', async(req, res) => {
    const orgId = req.body.orgId;

    let qr = `SELECT orgName FROM orgs WHERE orgId = ${orgId}`;

    db.query(qr, (err, result) => {
        if(err) {
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

