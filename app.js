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
let sec = 0, interval;
io.on("connection", socket => {
  console.log("New client connected");
  if (typeof(interval) === 'undefined') {
    interval = setInterval(function() {
      sec++;
      let events = data.filter( i => i.sent_at_second === sec); 
      console.log(events);
      io.sockets.emit('FromAPI', events, sec );
    }, 1000);  
    // clearInterval(interval);
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
    console.log("Client disconnected");
  });
});

// Socket listener
server.listen(port, () => console.log(`Listening on port ${port}`));






// data.forEach( i => {
//   setInterval( () => {
//     console.log(i.sent_at_second);
//     console.log(i);
//     socket.emit('FromAPI', i )
//   } , parseInt(i.sent_at_second) )
// })



// const getApiAndEmit = async socket => {
//   try {
//     const nextEventSecond = pdata[0].sent_at_second;
//     if (nextEvent.sent_at_second === )

    
    
//     // const res = await axios.get(
//     //   "https://api.darksky.net/forecast/PUT_YOUR_API_KEY_HERE/43.7695,11.2558"
//     // ); // Getting the data from DarkSky
//     socket.emit("FromAPI", res.data.currently.temperature); // Emitting a new message. It will be consumed by the client
//   } catch (error) {
//     console.error(`Error: ${error.code}`);
//   }
// };