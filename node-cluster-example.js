// ## test with 
// $ curl --unix-socket ./my.sock http://what/lol

// nodejs core cluster module example usage
const cluster = require('cluster');
const sock_path = './my.sock';

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  // clean up leftover unix socket
  try{
    const fs = require('fs');
    fs.unlinkSync(sock_path);
  // possible error is leftover unix socket missing, that's OK
  } catch(e) {}

  // Fork workers.
  const numCPUs = require('os').cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const http = require('http');
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`hello world from ${process.pid} at ${req.url}\n`);
  }).listen(sock_path);
  console.log(`Worker ${process.pid} started, ready on ${sock_path}`);
}
