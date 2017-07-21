// ## test with 
// $ curl --unix-socket ./my.sock http://what/lol

// nodejs core cluster module example usage

const cluster = require('cluster');
const http = require('http');
const fs = require('fs');
const numCPUs = require('os').cpus().length;
const sock_path = './my.sock';

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  // clean up leftover unix socket
  try{
    fs.unlinkSync(sock_path);
  // possible error is leftover unix socket missing, that's OK
  } catch(e) {}

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`hello world from ${process.pid} at ${req.url}\n`);
  }).listen(sock_path);
  console.log(`Worker ${process.pid} started, ready on ${sock_path}`);
}
