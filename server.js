const path = require('path');
const express = require("express");
const app = express();
const port = 3000;
const http = require("http").createServer(app);

const io = require("socket.io")(http);

app.use(express.static(path.join(__dirname, 'public')));

io.on("connection", (socket) => {
    //to client
    socket.emit("welcome", "hello from server");
    console.log("client connected")

    //to all client except one connecting
    socket.broadcast.emit("message", "a user joined");
    
    //to all clients
    //io.emit();

    //disconnect
    socket.on('disconnect', () => {
        io.emit("message", "a user left");
    });
});

http.listen(port, () =>{
    console.log("Server listening");
});