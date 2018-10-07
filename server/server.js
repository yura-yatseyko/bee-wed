const express = require('express');

var app = express();

const supplierTypesRouter = require('./routes/supplier-types.js');
app.use(supplierTypesRouter);

app.get('/', (req, res) => {
    res.send('Server works.');
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Started on port ', port);
});
