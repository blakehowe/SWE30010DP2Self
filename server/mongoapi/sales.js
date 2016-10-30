var mongo = require('mongodb');

var Server = mongo.Server,
	Db = mongo.Db,
	BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {
	auto_reconnect: true
});
db = new Db('local', server);

db.open(function (err, db) {
	if (!err) {
		console.log("Connected to 'local' database");
		db.collection('sales', {
			strict: true
		}, function (err, collection) {
			if (err) {
				console.log("The 'sales' collection doesn't exist. Creating it with sample data...");
				populateDB();
			}
		});
	}
});

exports.findById = function (req, res) {
	var id = req.params.id;
	console.log('Retrieving wine: ' + id);
	db.collection('sales', function (err, collection) {
		collection.findOne({
			'_id': new BSON.ObjectID(id)
		}, function (err, item) {
			res.send(item);
		});
	});
};

exports.findAll = function (req, res) {
	db.collection('sales', function (err, collection) {
		collection.find().toArray(function (err, items) {
			res.send(items);
		});
	});
};

exports.addSale = function (req, res) {
	console.log(req.body);
	var wine = req.body;
	console.log('Adding sale: ' + JSON.stringify(wine));
	db.collection('sales', function (err, collection) {
		collection.insert(wine, {
			safe: true
		}, function (err, result) {
			if (err) {
				res.send({
					'error': 'An error has occurred'
				});
			} else {
				//console.log('Success: ' + JSON.stringify(result[0]));
				res.send(result[0]);
			}
		});
	});
}

exports.updateSale = function (req, res) {
	var id = req.params.id;
	var wine = req.body;
	console.log('Updating wine: ' + id);
	console.log(JSON.stringify(wine));
	console.log(req.body);
	db.collection('sales', function (err, collection) {
		collection.update({
			'_id': new mongo.ObjectID(id)
		}, wine, {
			safe: true
		}, function (err, result) {
			if (err) {
				console.log('Error updating wine: ' + err);
				res.send({
					'error': 'An error has occurred'
				});
			} else {
				console.log('' + result + ' document(s) updated');
				res.send(wine);
			}
		});
	});
}

exports.deleteSale = function (req, res) {
	var id = req.params.id;
	console.log('Deleting wine: ' + id);
	db.collection('sales', function (err, collection) {
		collection.remove({
			'_id': new BSON.ObjectID(id)
		}, {
			safe: true
		}, function (err, result) {
			if (err) {
				res.send({
					'error': 'An error has occurred - ' + err
				});
			} else {
				console.log('' + result + ' document(s) deleted');
				res.send(req.body);
			}
		});
	});
}

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function () {

	var sales = [
		{
			productid: "581470b80fc1613b3a0c5793",
			quantity: 4
    }];

	db.collection('sales', function (err, collection) {
		collection.insert(sales, {
			safe: true
		}, function (err, result) {});
	});

};