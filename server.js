var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());


app.get('/', function(req, res) {
	res.send('Todo API Root');
});

//GET /todos?completed=false&q=work
app.get('/todos', function(req, res) {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true'){
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false'){
		where.completed = false;
	}
	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q+ '%'
		};
	}

	db.todo.findAll({where: where}).then(function (todos) {
		res.json(todos);
	}, function (e) {
		res.status(500).send
	});

});



//GET /todos/:id
app.get('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	
	db.todo.findById(todoID).then(function (todo){
		if (!! todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	
	}, function (e) {
		res.status(500).send();
	});
});


// POST Request 

app.post('/todos', function(req, res) {
	var accpetedBody = _.pick(req.body, 'description', 'completed');

	db.todo.create(accpetedBody).then(function (todo) {
		res.json(todo.toJSON());

	}, function(e) {
		res.status(400).json(e);
	});

});


//DELETE Request
app.delete('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoID
	});

	if (!matchedTodo) {
		res.status(404).json({
			"Error": "No todo found with that id"
		});
	} else {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}

});

//UPDATE Method PUT
app.put('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoID
	});
	var accpetedBody = _.pick(req.body, 'description', 'completed');
	var valiedAttriubtes = {};

	if (!matchedTodo) {
		return res.status(404).send();
	}

	if (accpetedBody.hasOwnProperty('completed') && _.isBoolean(accpetedBody.completed)) {
		valiedAttriubtes.completed = accpetedBody.completed;
	} else if (accpetedBody.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (accpetedBody.hasOwnProperty('description') && _.isString(accpetedBody.description) && accpetedBody.description.trim().length > 0) {
		valiedAttriubtes.description = accpetedBody.description;
	} else if (accpetedBody.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(matchedTodo, valiedAttriubtes);
	res.json(matchedTodo);


});

db.sequelize.sync().then(function () {
	app.listen(PORT, function() {
	console.log('Exoress listing on port: ' + PORT + '!');

	});
});