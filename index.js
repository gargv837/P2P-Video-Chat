const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const connections = [];
const clients = [];
const PORT = process.env.PORT || 5501;

app.use(express.static("public"));

app.set('view engine', 'ejs')
app.set('views', './views')

app.get('/', (req, res) => {
  res.render('lobby');
});

app.post('/invite', (req, res) => {
  const invite_link = req.body.invite_join_link;
  console.log('posted:', invite_link);
  res.redirect(`/index?room=${invite_link}`);
});

app.get('/index', (req, res) => {
  try {
      const room = req.query.room;
      res.render('index', { room });
  } catch (error) {
      console.log(error.message);
  }
});

io.on("connection", (socket) => {
        console.log("a user connected", socket.id);
        connections.push(socket);
        clients.push({ socketId: socket.id });
        console.log("Connected: %s sockets connected ", connections.length);

  socket.on("addRoom", async (room) => {
    try {
      const clients = io.sockets.adapter.rooms.get(room);
    const numClients = typeof clients !== "undefined" ? clients.size : 0;
    if (numClients > 1) {
      console.log("already_full");
    } else if (numClients === 1) {
      socket.join(room);
      socket.broadcast.to(room).emit("userJoined");
    } else {
      socket.join(room);
    }
    } catch (error) {
      console.log(error.message)
    }
  });

  socket.on("leaveRoom", async (room) => {
    try {
      socket.leave(room);
      socket.broadcast.to(room).emit("userLeftRoom");
    } catch (error) {
      console.log(error.message)
    }
  });

  socket.on("sendMessage", (info) => {
    try {
      const parsedInfo = JSON.parse(info);
      socket.to(parsedInfo.room).emit("messageFromPeer", info);
    } catch (error) {
      console.log(error.message)
    }
  });

  socket.on("disconnect", () => {
    try {
      connections.splice(connections.indexOf(socket), 1);
    console.log("Disconnected: %s sockets connected, ", connections.length);
    clients.forEach((client, i) => {
      if (client.socketId === socket.id) {
        clients.splice(i, 1);
      }
    });
    } catch (error) {
      console.log(error.message);
    }
  });
});

app.get('/error', (req, res) =>{
    res.render('lobby', {message : 'Room Not Found'});
})

server.listen(PORT, () => {
  console.log(`listening on PORT:${PORT}`);
});
