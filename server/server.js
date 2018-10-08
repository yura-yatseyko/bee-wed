const express = require('express');

var app = express();

const supplierTypesRouter = require('./routes/supplier-types.route.js');
const signUpRouter = require('./routes/sign-up.route.js');
const signInRouter = require('./routes/sign-in.route.js');
const logoutRouter = require('./routes/logout.route.js');

app.use(supplierTypesRouter);
app.use(signUpRouter);
app.use(signInRouter);
app.use(logoutRouter);

app.get('/', (req, res) => {
    res.send('Server works.');
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Started on port ', port);
});
