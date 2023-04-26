const { createUser, findByEmail } = require('../models/User');
const bcrypt = require('bcrypt');
const multer = require('multer');

const db = require('../config/db');
const jwt = require('jsonwebtoken');



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/userimages');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const fileExt = file.originalname.split('.').pop();
    cb(null, uniqueSuffix + '.' + fileExt);
  }
});

const upload = multer({ storage: storage });

exports.register = function(req, res, next) {

  upload.single('profile_image')(req, res, function(err) {
    if (err) {
      console.log(err);
      return res.render('auth/register', { title: 'Register', errors: ['Error uploading profile image'], user: null ,user2: null});
    }
    const { name, email, password, confirm_password } = req.body;


    if (!name || !email || !password || !confirm_password) {
      return res.render('auth/register', { title: 'Register', errors: ['All fields are required'], user: null,user2: null  });
    }
  
    if (password !== confirm_password) {
      return res.render('auth/register', { title: 'Register', errors: ['Passwords do not match'], user: null ,user2: null});
    }

    

    const profile_image = req.file.filename;

    createUser(name, email, profile_image, password, function(err, user) {
      if (err) {
        return next(err);
      }

      const token = jwt.sign({ user }, "JWT_SECRETs123", { expiresIn: '1h' });

      res.cookie('jwt', token, { httpOnly: true });

      return res.redirect('/home');
    });
  });
};



exports.logout = function(req, res) {
  res.clearCookie('jwt');

  res.redirect('/');
};

exports.login = function(req, res) {
  
  const { email, password } = req.body;
  findByEmail(email, function(err, user) {
    if (err) {
      res.render('auth/login', { title: 'Login', message: 'Error finding user' });
    } else if (!user) {
      res.render('auth/login', { title: 'Login', message: 'The email is incorrect or this email is not registered with us' , user:null ,user2: null});
    } else {
      bcrypt.compare(password, user.password, function(err, result) {
        if (err) {
          res.render('auth/login', { title: 'Login', message: 'Error comparing passwords', user:null ,user2: null});
        } else if (result) {
          const token = jwt.sign({ user: user }, "JWT_SECRETs123");
          res.cookie('jwt', token, { path: '/' });
          res.redirect('/',);
        } else {
          res.render('auth/login', { title: 'Login', message: 'Incorrect password', user:null, user2:null });
        }
      });
    }
  });
};


