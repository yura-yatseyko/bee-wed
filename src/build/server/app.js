/**
 * Created by admin on 13.08.2018.
 */
global.R = require('ramda');
global.express = require( 'express' );
global.app = express();
const path = require('path')
const server = require('http').createServer(app);


const cors = require( 'cors' );

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');


app.use(cookieParser());
app.use(bodyParser());

//
app.use(express.static(path.join( __dirname + '/../build' )));

app.use(cors());

console.log( path.join(__dirname, '/../build') );
server.listen( 3300 );

require('./Api').setRoutes( app );



