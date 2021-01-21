const express = require("express");
const path = require("path");
var admin = require("firebase-admin");
var serviceAccount = require("square-piece-firebase-adminsdk-3ok7a-7a389b0d87.json");

const app = express();

app.use("/static", express.static(path.resolve(__dirname, "public", "static")));

app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

app.listen(process.env.PORT || 3000, () => console.log("Server up"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});