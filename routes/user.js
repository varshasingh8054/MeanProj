const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt= require('jsonwebtoken');
const User= require('../models/users1');
const config= require('../config/database');
const nodemailer=require('nodemailer');
const crypto=require('crypto');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./mylocalStor');
}

router.post('/register', (req,res,next) => {
  const token = crypto.randomBytes(20).toString('hex');
  const today=new Date();
    let newUser = new User ({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        token:token,
        active: false,
        resetPasswordToken: '',
        resetPasswordExpires: '',
        created: today
    });

  
    const msg = `
    <p>You have a SignUp Request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Email: ${req.body.email} </li>
    </ul>
    <h3>Message</h3>
    <p>Click <a href="http://localhost:3000/user/verifyuser/${token}/${req.body.email}">here</a> to activate.</p>
  `;

  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
    tls:{
      rejectUnauthorized:false
  }
  });

 
let mailOptions = {
  from: '"MEAN PROJECT" <varshasingh8054@gmail.com>',
  to: req.body.email,
  subject: 'Confirmation Email!',
  text: 'This is confirmation Email.',
  html: msg
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
      return console.log(error);
  }
  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  
});
console.log("mail sent");

    User.addUser(newUser,(err,user)=>
    {
        if(err)
        {
            res.json({success: false, msg: ' Failed to register user'});
        }
        else{
            res.json({success: true, msg: '  user registered'});
        }

    });
  });

  router.get('/verifyuser/:token/:email', (req, res, next) => {

    User.findOne({
        email: req.params.email,
    }).then(user => {
        if(user.token === req.params.token)
        {

                console.log(user.active);
                user.active = true;
                console.log(user.active);
                user.save().then(emp => {
                  res.sendFile(path.join(__dirname, '../emailVerify', 'verify.html'));
                })

        }
        else{
            res.send("error");
        }
    })
    
 
  });

   

router.post('/authenticate', (req,res,next) => {

  const username = req.body.username;
  const password = req.body.password;

  User.getUserByUsername(username, (err, user) => {
    if(err) throw err;
    if(!user) {
      return res.json({success: false, msg: 'User not found'});
    }
    if(!user.active)
    {
      return res.json({success: false, msg: 'User not active'});
    }
    User.comparePassword(password, user.password,(err, isMatch) => {
      if(err) throw err;
      if(isMatch) {
        const token = jwt.sign({data : user}, config.secret, {
          expiresIn: 604800 // 1 week
        });
        res.json({
          success: true,
          token: 'JWT '+token,
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        })

      } else {
        return res.json({success: false, msg: 'Wrong password'});
      }
    });
  });
});


// =============================================================================
router.post('/forgotpassword', (req, res) => {
  if (req.body.email === '') {
    res.json('email required');
  }
  console.log(req.body.email);
  User.findOne({
      email: req.body.email
  })
  .then(user => {
    if (user === null) {
      console.log('email not in database');
      res.json('email not in db');
    } 
    else {
      const token = crypto.randomBytes(20).toString('hex');


          user.resetPasswordToken = token,
          user.resetPasswordExpires=Date.now() + 360000;
          user.save();

              const output = `
              <p>Click <a href="http://localhost:3000/user/reset/${token}/${req.body.email}">here</a> to reset password.</p>
          `;

          let transporter = nodemailer.createTransport({
              service: 'Gmail',
              auth: {
                  user: process.env.GMAIL_USER,
                  pass: process.env.GMAIL_PASS
              },
              tls:{
                  rejectUnauthorized:false
          }
          });

          let mailOptions = {
              from: '"MEAN Demo" <varshasingh8054@gmail.com>',
              to: req.body.email,
              subject: 'Reset Email!',
              text: 'This is Reset Email.',
              html: output
          };

          transporter.sendMail(mailOptions, function(err, response) {
              if (err) {
                console.error('there was an error: ', err);
              } else {
                console.log('here is the res: ', response);
                res.status(200).json('recovery email sent');
              }
            });
    }
  })
  .catch(err => {
      res.send('error: ' + err)
  })
});



router.get('/reset/:token/:email', (req, res, next) => {

  User.findOne({
      email: req.params.email,
  }).then(user => {
      if(Date.now() > user.resetPasswordExpires)
      {
          res.send("Reset Link Expired");
      }
      else{
          if(user.resetPasswordToken === req.params.token)
          {
        
            localStorage.setItem('email1',req.params.email);
            res.sendFile(path.join(__dirname, '../reset', 'reset.html'));
                   
          }
          else{
              res.send("error");
          }
      }
  })
});

//reset confirmation ends

//confirmation email






//reset password ends

//update password


router.put('/updatepassword', (req, res, next) => {
  var email1 =  localStorage.getItem('email1');; 
  User.findOne({
      email: email1
  }).then(user => {
    if (user != null) {
      console.log('user exists in db');
      bcrypt.genSalt(10, (err, salt)  =>  {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
            if(err) throw err;
            console.log(hash)
            user.password = hash;
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            res.json({success: true, msg: 'password updated'});
            user.save();
        });
    });
  }
     else {
      console.log('no user exists in db to update');
      res.status(404).json('no user exists in db to update');
    }
  });
});


//update password ends






//=================================================================================

router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
 // res.json({user: req.user});
 res.json({user: req.user});
});


module.exports= router;