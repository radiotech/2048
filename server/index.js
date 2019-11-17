const http = require('http');
const Express = require('express');
const path = require('path');

console.log(path.resolve('..'));
app = Express();
app.use(Express.static('..'));

http.createServer(app).listen(8080);
console.log('Server is running on port 8080');
