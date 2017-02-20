var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');

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

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }
    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        };
    }

    db.todo.findAll({
        where: where
    }).then(function(todos) {
        res.json(todos);
    }, function(e) {
        res.status(500).send
    });

});



//GET /todos/:id
app.get('/todos/:id', function(req, res) {
    var todoID = parseInt(req.params.id, 10);

    db.todo.findById(todoID).then(function(todo) {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }

    }, function(e) {
        res.status(500).send();
    });
});


// POST Request /todos

app.post('/todos', function(req, res) {
    var accpetedBody = _.pick(req.body, 'description', 'completed');

    db.todo.create(accpetedBody).then(function(todo) {
        res.json(todo.toJSON());

    }, function(e) {
        res.status(400).json(e);
    });

});

//DELETE Request
app.delete('/todos/:id', function(req, res) {
    var todoID = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoID
        }
    }).then(function(rowDeleted) {
        if (rowDeleted === 0) {
            res.status(404).json({
                error: 'No todo with ID'
            });
        } else {
            res.status(204).send();
        }
    }, function(e) {
        res.status(500).send();

    })
});

//UPDATE Method PUT
app.put('/todos/:id', function(req, res) {
    var todoID = parseInt(req.params.id, 10);
    var accpetedBody = _.pick(req.body, 'description', 'completed');
    var attriubtes = {};


    if (accpetedBody.hasOwnProperty('completed')) {
        attriubtes.completed = accpetedBody.completed;
    }

    if (accpetedBody.hasOwnProperty('description')) {
        attriubtes.description = accpetedBody.description;
    }

    db.todo.findById(todoID).then(function(todo) {
        if (todo) {
            todo.update(attriubtes).then(function(todo) {
                res.json(todo.toJSON());
            }, function(e) {
                res.status(400).json(e);
            });
        } else {
            res.status(404).send();
        }
    }, function() {
        res.status(500).send();
    })

});


//POST Request /account

app.post('/account', function(req, res) {
    var account = _.pick(req.body, 'email', 'password');

    db.user.create(account).then(function(accounts) {
        res.json(accounts.toPublicJSON());
    }, function(e) {
        res.status(400).json(e);
    });

});

//POST /account/login

app.post('/account/login', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.authenticate(body).then(function(user) {
    	var token = user.generateToken('authentication')

		    if (token) {
		        res.header('Auth', token).json(user.toPublicJSON());
		    } else {
		    	res.status(401).send();
		    }
		    }, function () {
		        res.status(401).send();
    });
});



db.sequelize.sync({force: true}).then(function() {
    app.listen(PORT, function() {
        console.log('Exoress listing on port: ' + PORT + '!');

    });
});