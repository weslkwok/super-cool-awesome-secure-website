import express from 'express';
import { body, validationResult } from 'express-validator';
import userServices from './user-services.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import bcrypt from 'bcryptjs';

import { OAuth2Client } from 'google-auth-library';

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

app.post("/", async function (req, res, next) {

  res.header("Access-Control-Allow-Origin", "https://localhost:3000");

  res.header("Referrer-Policy", "no-referrer-when-downgrade"); // needed for http

  const redirectUrl = "https://localhost:8000/oath";

  const oAuth2Client = new OAuth2Client(

    process.env.CLIENT_ID,

    process.env.CLIENT_SECRET,

    redirectUrl

  );

  const authorizeUrl = oAuth2Client.generateAuthUrl({

    access_type: "offline",

    scope: "https://www.googleapis.com/auth/userinfo.profile openid",

    prompt: "consent",

  });

  console.log(authorizeUrl);

  res.json({ url: authorizeUrl });

});

async function getUserData(access_token) {

  const response = await fetch(

    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`

  );

  const data = await response.json();

  return data.sub;

  // console.log("data", data);

}

// Function to generate JWT
function generateJWT(user) {
    const SECRET_KEY = process.env.JWT_SECRET_KEY;
    const payload = {
      userId: user,
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' });
    return token;
  }

app.get("/oath", async function (req, res, next) {
  const code = req.query.code;

  try {

    const redirectUrl = "https://localhost:8000/oath";
    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
     redirectUrl
    );

    const result = await oAuth2Client.getToken(code);
    await oAuth2Client.setCredentials(result.tokens);
    const user = oAuth2Client.credentials;
    // show data that is returned from the Google call
    const userId = await getUserData(user.access_token);

        
   // call your code to generate a new JWT from your backend, don't reuse Googles

    const token = generateJWT(userId);
    res.redirect(303, `https://localhost:3000/home?token=${token}`);

    } catch (err) {
           console.log("Error with signin with Google", err);
           res.redirect(303, "http://localhost:3000/");
  }

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
    const submittedPassword = req.body['password'];
    const email = req.body['email'];
    const emailQuery = await userServices.findUserByEmail(email);
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