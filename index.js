// some imports
const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const port = 3000;

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server);

// uses static site from /public
app.use(express.static("public"));

let serverPlayerStats = {
  
};

// client-side
function updatePlayerPositions(){
  io.sockets.emit("update", serverPlayerStats);
  // console.log(serverPlayerStats)
}

function updateAllBullets() {
  // let users = Object.keys(serverPlayerStats)
  let stats = Object.values(serverPlayerStats)
  
  for (var i = 0; i < stats.length; i++) {
    // console.log(stats[i]["bullets"])
    for (var z = 0; z < stats[i]["bullets"].length; z++) {
      let bullet = stats[i]["bullets"][z]
      // console.log(bullet);
      if (bullet["x"] > 200 || bullet["x"] < 0) {
        stats[i]["bullets"][z] = []
      } else if (bullet["y"] > 400 || bullet["y"] < 0) {
        stats[i]["bullets"][z] = []
      }
      // help using AI
      // bullet["x"] += bullet.speed * Math.cos(bullet.angle);
      // bullet["y"] += bullet.speed * Math.sin(bullet.angle);
    }
  }
}

setInterval(function (){
  // console.log(serverPlayerStats)
  updatePlayerPositions()
  updateAllBullets()
}, 10)

io.on('connection', (socket) => {
  socket.on('addPlayer', (obj) => {
    let userList = Object.keys(serverPlayerStats)
    let user = obj["user"]
    if (userList.includes('user')) {
      return false
    }
    serverPlayerStats[user] = {x: null, y: null, holdingWeapon: false, mouseX: null, mouseY: null, bullets: []}
  });

  socket.on('updatePlayer', (obj) => {
    serverPlayerStats[obj["user"]] = obj["player"]
  })

  socket.on('removePlayer', (obj) => {
    console.log(obj["user"])
    delete serverPlayerStats[obj["user"]]
    console.log(serverPlayerStats)
  })
});

// io.on("connect", function(socket) {
//   updateAllBullets()
//   updatePlayerPositions()
// })

server.listen(port, function() {
  console.clear()
  console.log("🟢 localhost:" + port);
});