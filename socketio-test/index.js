var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.get('/', function(req, res) {
	res.send(`
		<script src="/socket.io/socket.io.js"></script>
		<script>
		  var socket = io();
		</script>
	`);
})

server.listen(3000);

// Set socket.io listeners.
io.on('connection', function(client) {  
  console.log('a user connected');

  client.on('join', function(data) {
      console.log(data);
  });
});


