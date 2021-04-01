const express = require('express');
const app = express();
const keys = require('./keys');
const morgan = require('morgan');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // store image in uploads folder in file system
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage});
const mysql = require('mysql');
const bodyParser = require('body-parser');

// middleware that allows us to get fields in POST requests
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static('./public'));

app.use(morgan('short'));

const connection = mysql.createConnection({
    host: keys.host,
    port: keys.port,
    user: keys.user,
    password: keys.password,
    database: keys.database
});

app.get("/", (req, res) => {
    res.redirect('/spa.html');
});

// get all patients data in json format
app.get('/patients', (req, res) => {
    connection.query("SELECT * FROM patient", (err, rows, fields) => {
        if (err) {
            console.log("Failed to query for users: " + err);
            res.sendStatus(500);
            return
        } 
    
        res.json(rows);
    });
});

app.post('/patient_create', upload.single('photo'), (req, res) => {
    var name = req.body.first_name + ' ' + req.body.last_name;
    var photoPath = './uploads/' + req.file.originalname; // save path of image in db
    const patient = {
        name: name,
        age: req.body.age,
        gender: req.body.gender,
        photo: photoPath,
        medications: req.body.medications,
        notes: req.body.other_details
    }

    connection.query('INSERT INTO `patients` SET ?', patient, function(error, results, fields) {
        if (error) {
            console.log(error);
        } else {
            console.log("Successfully inserted patient data!");
        }
    });

    res.redirect('/');
});

app.listen(3003, () => {
    console.log("Server is up and listening on 3003...")
});

