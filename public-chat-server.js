/* author: Ajar <ajar@artizan.io> (https://artizan.io) */

const Primus  = require('primus');
const http    = require('http');
const fs      = require('fs');

const log = require('@ajar/marker');


const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const server = http.createServer((req,res)=> {
        //log the request url
       log.info('recieved request: ',req.url);

       res.setHeader('Content-Type', 'text/html');
       fs.createReadStream(__dirname + '/public-chat-client.html').pipe(res);
});

primus = new Primus(server, {transformer: 'sockjs'});

primus.on('connection', spark => {

  log.green('Connected !!!');
  spark.on('data', data => {
    log.info('received message:', data);
    primus.write(data);
  });
});

server.listen(PORT,HOST,()=>{
    log.magenta(`server is listening on`,`${HOST}:${PORT}`);
});
