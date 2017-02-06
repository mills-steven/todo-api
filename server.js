var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos =[];  
var todoNextId = 1;

app.use(bodyParser.json());


app.get('/', function (req, res) {
	res.send('Todo API Root');
});

//GET /todos?completed=false&q=work
app.get('/todos', function (req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;

 if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
 	filteredTodos = _.where(filteredTodos, {completed: true});
 } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
 	filteredTodos = _.where(filteredTodos, {completed: false});
 }

if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function (todo) {
			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1; 
		});
	
 	 }

	res.json(filteredTodos);
});



//GET /todos/:id
app.get('/todos/:id', function (req, res) {
	var todoID = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoID});

	
  		if (matchedTodo) {
  			res.json(matchedTodo);
  		} else {
  			res.status(404).send();
  		}
});


// POST Request 

app.post('/todos', function (req, res) {
	//var body = req.body;
	var accpetedBody = _.pick(req.body, 'description', 'completed');

	if (!_.isBoolean(accpetedBody.completed) || !_.isString(accpetedBody.description) || accpetedBody.description.trim().length === 0) {

		return res.status(400).send();
	}

	accpetedBody.description = accpetedBody.description.trim();
	accpetedBody.id = todoNextId++;
	todos.push(accpetedBody);
	res.json(accpetedBody);
});


//DELETE Request
app.delete('/todos/:id', function (req, res) {
	var todoID = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoID});

	if (! matchedTodo) {
		res.status(404).json({"Error": "No todo found with that id"});
	}else {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}

});

//UPDATE Method PUT
app.put('/todos/:id', function (req, res) {
	var todoID = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoID});
	var accpetedBody = _.pick(req.body, 'description', 'completed');
	var valiedAttriubtes = {};

	if (! matchedTodo) {
		return res.status(404).send();
	}

	if (accpetedBody.hasOwnProperty('completed') && _.isBoolean(accpetedBody.completed) ) {
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

app.listen(PORT, function () {
	console.log('Exoress listing on port: ' + PORT + '!');
});