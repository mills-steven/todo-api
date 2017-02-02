var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos =[{
	id: 1,
	description: 'Meet wife for lunch.',
	completed: false

}, {
	id: 2,
	description: 'Complete this course.',
	completed: false
}, {
	id: 3,
	description: 'Get the car washed today.',
	completed: true
}, {
	id: 69,
	description: 'Jeremy gets fucked in the ass by Tom Brady',
	completed: false

}]  



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
	var matchedTodo;

	todos.forEach(function (todo) {
		if (todoID === todo.id) {
			matchedTodo = todo;
		}
	
	});
  		if (matchedTodo) {
  			res.json(matchedTodo);
  		} else {
  			res.status(404).send();
  		}
});


app.listen(PORT, function () {
	console.log('Exoress listing on port: ' + PORT + '!');
});