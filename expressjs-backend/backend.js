const express = require('express');
const { body, validationResult } = require('express-validator');

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

const hardcodedUser = {
    userid: "bj@test.com",
    password: "pass424"
};

// User list. will be turned into a database eventually, I suppose.
const userList = [hardcodedUser];

app.post('/account/login', (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    if (email === hardcodedUser.userid && password === hardcodedUser.password) {
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

    userList.push(
        {
            userid: email,
            password: password,
        }
    )
    console.log('successfully register user: ' + email);
    res.status(200).send('User registered successfully');
  });


  app.get('/users', (req, res) => {
    // filter users by id if given as argument
    if (req.query.username) {
        const filteredUser = userList.find(user => user.userid === username);
        return res.json(filteredUser);
    }

    res.json(userList);
});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});      