require('./config/config');

const express = require('express');

const moment = require('moment-timezone');
const path = require('path')

var cors = require('cors');

var app = express();

const supplierTypesRouter = require('./routes/supplier-types.route.js');
const supplierLocationsRouter = require('./routes/supplier-locations.route.js');
const signUpRouter = require('./routes/sign-up.route.js');
const signInRouter = require('./routes/sign-in.route.js');
const logoutRouter = require('./routes/logout.route.js');
const userRouter = require('./routes/user.route.js');
const usersRouter = require('./routes/users.route.js');
const favoritesRouter = require('./routes/favorites.route.js');
const hubRouter = require('./routes/hub.route.js');
const chatRouter = require('./routes/chat.route.js');
const privacypolicyRouter = require('./routes/privacy-policy.route.js');
const termsAndConditionsRouter = require('./routes/terms-and-conditions.route.js');
const paymentsRouter = require('./routes/payments.route.js');
const subscriptionsRouter = require('./routes/subscriptions.route.js');

//CMS
const cmsSignInRouter = require('./routes/cms/cms-sign-in.route.js');
const cmsLogoutRouter = require('./routes/cms/cms-logout.route.js');
const cmsUsersRouter = require('./routes/cms/cms-users.route.js');
const cmsSupplierTypesRouter = require('./routes/cms/cms-supplier-types.route.js');
const cmsSupplierLocationsRouter = require('./routes/cms/cms-supplier-locations.route.js');
const cmsAuthenticationRouter = require('./routes/cms/cms-authentication.route.js');
const cmsNotificationsRouter = require('./routes/cms/cms-notifications.route.js');

app.use(express.static(path.join( __dirname + '/../src/' )));
app.use(express.static(path.join( __dirname + '/../src/static' )));


app.use(supplierTypesRouter);
app.use(supplierLocationsRouter);
app.use(signUpRouter);
app.use(signInRouter);
app.use(logoutRouter);
app.use(userRouter);
app.use(usersRouter);
app.use(favoritesRouter);
app.use(hubRouter);
app.use(chatRouter);
app.use(privacypolicyRouter);
app.use(termsAndConditionsRouter);
app.use(paymentsRouter);
app.use(subscriptionsRouter);
app.use(cmsLogoutRouter);

//CMS
app.use(cmsSignInRouter);
app.use(cmsSignInRouter);
app.use(cmsUsersRouter);
app.use(cmsSupplierTypesRouter);
app.use(cmsSupplierLocationsRouter);
app.use(cmsAuthenticationRouter);
app.use(cmsNotificationsRouter);

app.use(cors());


app.get('/',function (req,res) {
    res.sendFile('index.html', { root: path.join(__dirname, '/../src') })
});

const port = process.env.PORT;

app.listen(port, () => {
    console.log('Started on port ', port);
});
