/* author: Ajar <ajar@artizan.io> (https://artizan.io) */

const Primus  = require('primus');
const Rooms   = require('primus-rooms');
const http    = require('http');
const fs      = require('fs');

const log = require('@ajar/marker');


const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const server = http.createServer((req,res)=> {
        //log the request url
       log.info('recieved request: ',req.url);

       res.setHeader('Content-Type', 'text/html');
       fs.createReadStream(__dirname + '/private-rooms-chat-client.html').pipe(res);
});

primus = new Primus(server, {transformer: 'sockjs'});
// add rooms to Primus
primus.plugin('rooms', Rooms);

primus.on('connection', spark => {

  log.green('Connected !!!');

  spark.on('data', (data = {}) => {
    log.info('received message:', data);

    const { action,room,message,notification } = data;
    
    log.magenta(`action: ${action}`);
    log.yellow(`room: ${room}`)
    log.info(`message: ${message}`)
    log.info(`notification: ${notification}`)

    // join a room
    if (action === 'join') {
      spark.join(room, ()=> {
        // send message to this client
        spark.write('you joined room ' + room);
        // send message to all clients except this one
        spark.room(room).except(spark.id).write(`${spark.id} joined room ${room}`);
      });
    }

    // leave a room
    if (action === 'leave') {
      spark.leave(room, ()=> {
        // send message to this client
        spark.write('you left room ' + room);
        // send message to all clients except this one
        spark.room(room).except(spark.id).write(spark.id + ' left room ' + room);
      });
    }
    // Send a message to a room
    if(message && room) {
      log.magenta(`writing message to room  ${room}`);
      spark.room(room).write(message);
    }
    // Send a message to a room
    //{ room: currentRoom, notification: 'is_typing' }
    if(notification && room) {
      log.magenta(`notification on room  ${room}`);
      spark.room(room).except(spark.id).write({id:spark.id,notification});
    }
  });
});

server.listen(PORT,HOST,()=>{
    log.magenta(`server is listening on`,`${HOST}:${PORT}`);
});
