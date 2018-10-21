const express = require('express');

var app = express();

const supplierTypesRouter = require('./routes/supplier-types.route.js');
const supplierLocationsRouter = require('./routes/supplier-locations.route.js');
const signUpRouter = require('./routes/sign-up.route.js');
const signInRouter = require('./routes/sign-in.route.js');
const logoutRouter = require('./routes/logout.route.js');
const userRouter = require('./routes/user.route.js');
const usersRouter = require('./routes/users.route.js');

app.use(supplierTypesRouter);
app.use(supplierLocationsRouter);
app.use(signUpRouter);
app.use(signInRouter);
app.use(logoutRouter);
app.use(userRouter);
app.use(usersRouter);

app.get('/', (req, res) => {
    res.send('Server works.');
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Started on port ', port);
});
