const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require('fs');
const contents = fs.readFileSync('./challenge_data.json', 'utf8');

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server, {
  pingInterval: 1000 // interval of 1 second for consistent seconds counting
});

// Get Feed data
const data = JSON.parse(contents);

// Starting Socket server
io.on("connection", socket => {
  console.log("New client connected");
  let sec = 0, interval;
  if (typeof(interval) === 'undefined') {
    interval = setInterval(function() {
      sec++;
      let events = data.filter( i => i.sent_at_second === sec);       
      for ( event of events ) {
        io.sockets.emit('FromAPI', event , sec );
        console.log(event);
      }
    }, 1000);
  }

  socket.on('Status Change', (id, order) => {
    data.push({
      id: id,
      name: order.name,
      event_name: order.event_name,
      sent_at_second: sec,
      destination: order.destination,
      updated_by: 'client'
    });
  });


  socket.on("disconnect", () => {  
    clearInterval(interval);
    console.log("Client disconnected");
  });
});

// Socket listener
server.listen(port, () => console.log(`Listening on port ${port}`));