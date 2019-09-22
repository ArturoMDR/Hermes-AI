const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();

//MongoURI
const mongoURI = 'mongodb+srv://dbHermes:cornell@hermesdb-f36ji.gcp.mongodb.net/imageUp?retryWrites=true&w=majority';

//Mongo Connection
const conn = mongoose.createConnection(mongoURI);


//Middleware//


//Initialize gfs
let gfs; 

conn.once('open', () => {
    //Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads')
})

//Create Storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });

// @route GET /
// @desc Loads from
app.get('/', (req, res) => {
    res.render('index');
});

// @route POST /upload
// @desc Uploads file to DB
app.post('/upload', upload.single('file'), (req, res) => {
    //res.json({ file: req.file});
    res.send("Your file was uploaded");
    console.log(req.file);
});

app.use(bodyParser.json());
app.use(methodOverride('_method'))
app.set('view engine', 'ejs');

const port = 3000
app.listen(port, () => console.log(`Server started on port ${port}`));
