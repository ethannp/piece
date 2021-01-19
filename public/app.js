let socket = io();

socket.on("welcome", (data) => {
    console.log(data);
});