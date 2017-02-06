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

//GET /todos
app.get('/todos', function (req, res) {
	res.json(todos);

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

app.listen(PORT, function () {
	console.log('Exoress listing on port: ' + PORT + '!');
});