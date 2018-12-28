const path = require('path');



function setRoutes( app ) {

    app.get('/',function (req,res) {
        console.log( '-------------' )
        res.sendFile('index.html', { root: path.join(__dirname, '/../') })
        // res.send( req.body )
    });



}

exports.setRoutes = setRoutes;