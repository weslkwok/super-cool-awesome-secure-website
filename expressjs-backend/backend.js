import express from 'express';
import { body, validationResult } from 'express-validator';
import userServices from './user-services.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const options = {
  key:fs.readFileSync('key.pem'),
  cert:fs.readFileSync('cert.pem')
}


// get config vars
dotenv.config();

const app = express();
app.use(express.json());
const port = 8000;
const sslServer=https.createServer(options, app);

// pesky cors. Yes, insecure. Oops.
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization, refreshToken");
  next();
});


const authenticate = (req, res, next) => {
  const accessToken = req.headers['authorization'];
  const refreshToken = req.headers['refreshtoken'];

  if (!accessToken && !refreshToken) {
    return res.status(401).send('Access Denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
    req.user = decoded.user;
    next();
  } catch (error) {
    if (!refreshToken) {
      return res.status(401).send('Access Denied. No refresh token provided.');
    }
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
      res.send(decoded.user);
    } catch (error) {
      return res.status(400).send('Invalid Token.');
    }
  }
};

// endpoint for frontend to trade expired access token for a new one, using the refresh token
// didn't have time to integrate it into the code though :(
app.post('/refresh', (req, res) => {
  const refreshToken = req.cookies['refreshToken'];
  if (!refreshToken) {
    return res.status(401).send('Access Denied. No refresh token provided.');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
    const accessToken = jwt.sign({ user: decoded.user }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    res
      .json({authorization: accessToken})
  } catch (error) {
    return res.status(400).send('Invalid refresh token.');
  }
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.post('/account/login', async (req, res) => {
    console.log('PAINA')
    console.log(req.body);
    const submittedPassword = req.body['password'];
    const email = req.body['email'];
    const emailQuery = await userServices.findUserByEmail(email);
    console.log('emailQUERY HIT')
    console.log(emailQuery)
    console.log('password found in DB: ' + emailQuery[0].password);
    console.log('password received: ' + submittedPassword);
    console.log(bcrypt.compareSync('Pass123!', '$2a$08$.D876zWOR/Fp01b7f9b9Fugc0RRudB773o.x6UVd8wG7/i8yGhq3S'))
    if ((emailQuery.length) && (bcrypt.compareSync(submittedPassword, emailQuery[0].password))) {
        // Generate and send token (simple example)
        const accessToken = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
        res
          .status(200)
          .json({refresh: refreshToken, authorization: accessToken});
    } else {
        res.status(401).json({ error: "Invalid username or password" });
    }
});

const formValidationRules = [
    // check the email
    body('email').isEmail().withMessage('Email is not valid'),
    // Check the password
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/\d/)
      .withMessage('Password must contain a number')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter')
      .matches(/[@$!%*#?&]/)
      .withMessage('Password must contain a special character'),
  ];
  
  /* TODO:
    - disallow duplicate usernames
  */
  app.post('/account/register', formValidationRules, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const password = req.body['password'];
    const email = req.body['email'];

    if ((await userServices.findUserByEmail(email)).length) {
      res
      .status(400)
      .send('Username already exists in server. Please use different email to register.');
    }

    const accessToken = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
    
    userServices.addUser({email: email, password: bcrypt.hashSync(password, 8), token: accessToken});

    res
    .status(200)
    .json({refresh: refreshToken, authorization: accessToken});
  });


  app.get('/users', authenticate, async (req, res) => {
    // filter users by id if given as argument
    if (req.query.username) {
        const filteredUser = userServices.findUserByEmail(req.query.username);
        res.json(filteredUser.email);
    }
    const users = await userServices.getUsers();
    res.json({userList: users});
});


sslServer.listen(8000,()=>{
console.log('Secure server is listening on port 8000')
})