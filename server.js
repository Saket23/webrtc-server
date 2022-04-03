const express = require('express');
const app = express();
const cors = require("cors");

const socket = require("socket.io")

app.use(cors())


let connectedUsers = [];

const PORT = 3030

const server = app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
})

const io = socket(server, {
    cors: {
      origin: "http://localhost:8080",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
});

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "https://localhost:8000");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });

//routes
app.get('/', (req, res) => {
    res.status(200).send('Its working');
})

io.on('connection', socket => {
    connectedUsers.push(socket.id);
  
    socket.on('disconnect', () => {
      connectedUsers = connectedUsers.filter(user => user !== socket.id)
      socket.broadcast.emit('update-user-list', { userIds: connectedUsers })
    })
  
    socket.on('mediaOffer', data => {
      socket.to(data.to).emit('mediaOffer', {
        from: data.from,
        offer: data.offer
      });
    });
    
    socket.on('mediaAnswer', data => {
      socket.to(data.to).emit('mediaAnswer', {
        from: data.from,
        answer: data.answer
      });
    });
  
    socket.on('iceCandidate', data => {
      socket.to(data.to).emit('remotePeerIceCandidate', {
        candidate: data.candidate
      })
    })
  
    socket.on('requestUserList', () => {
      socket.emit('update-user-list', { userIds: connectedUsers });
      socket.broadcast.emit('update-user-list', { userIds: connectedUsers });
    });
  });