//http://coenraets.org/blog/2012/10/creating-a-rest-api-using-node-js-express-and-mongodb/

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
	extended: true
}));


var productsDB = require('./mongoapi/products');
var salesDB = require('./mongoapi/sales');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: true
}));
// parse application/json
app.use(bodyParser.json());

app.get('/products', productsDB.findAll);
app.get('/products/:id', productsDB.findById);


app.get('/sales', salesDB.findAll);
app.post('/sales', salesDB.addSale);
app.put('/sales/:id', salesDB.updateSale);

app.listen(3000);
console.log('Listening on port 3000...');