const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const users = require('./routes/user');
const config = require('./config/database');

const app=express();

mongoose.connect(config.database);

mongoose.connection.on('connected', () => {
    console.log('Connected to Database '+config.database);
  });

  mongoose.connection.on('error', (err) => {
    console.log('Database error '+err);
  });


const port=3000;

app.get("/" , (req,res) =>
{
    res.send("Anything");
});



app.use(cors());
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);



app.use('/user', users);

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/index.html'));
// });


app.listen(port, () => {
    console.log('Server started on port '+port);
  });
  

