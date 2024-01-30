import express from 'express';
import { body, validationResult } from 'express-validator';
import userServices from './user-services.js';

const app = express();
app.use(express.json());
const port = 8000;

// pesky cors. Yes, insecure. TODO: update to be more secure.
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.post('/account/login', async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    const emailQuery = await userServices.findUserByEmail(email);
    console.log('EMAILQEUERYRYRY is: ' + emailQuery)
    if (emailQuery != undefined) {
        console.log("found user with email: " + email);
        // Generate and send token (simple example)
        res.json({ token: "2342f2f1d131rf12" });
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
  app.post('/account/register', formValidationRules, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    userServices.addUser({email: email, password: password});

    console.log('successfully register user: ' + email);
    res.status(200).send('User registered successfully');
  });


  app.get('/users', (req, res) => {
    // filter users by id if given as argument
    if (req.query.username) {
        const filteredUser = userServices.findUserByEmail(req.query.username);
        return res.json(filteredUser);
    }

    res.json(userServices.getUsers(undefined));
});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});      