const socket = io()

let frames;
let username;
let playersOnServerSide = {};
let playerStats = { x: null, y: null, holdingWeapon: false, mouseX: null, mouseY: null, bullets: [] }
var scene = 'startScreen';

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  background(153);
  textSize(40)
  textAlign(CENTER);
  text("Loading...", width / 2, height / 2)
  startScreen();
}

function addPlayer() {
  username = input.value();
  socket.emit("addPlayer", { "user": username })
  removeElements(input, button);
  scene = 'lobby'
  playerStats["x"] = 50;
  playerStats["y"] = 50;
  socket.emit("updatePlayer", { "user": username, "player": playerStats })
}

function startScreen() {
  greeting = createElement('h2', 'Choose a username and spawn in!');
  greeting.position(20, 5);

  input = createInput();
  input.position(20, 65);

  button = createButton('Play!');
  button.position(input.x + input.width, 65);
  button.mousePressed(addPlayer);
}

function calculateDirectionFacing(x, y, mouseCords) {
  // oppposite over adjacent
  let angle = mouseCords[0] - x
  let angle2 = mouseCords[1] - y
  let realangle = Math.atan2(angle2, angle)
  return realangle
}

function drawPlayer(x, y, d, mouseCords) {
  push();
  translate(x, y)
  circle(0, 0, d);
  let facing = calculateDirectionFacing(x, y, mouseCords)
  rotate(facing);
  // 1 radian = 180/pi
  // console.log((realangle/1)*(180/Math.PI))
  // * (Math.PI / 180)
  // translate(playerStats["x"], playerStats['y'])
  rect(0, 0, 20, 10);
  pop();
  // if (holdingGun)
}

function drawBullet(x, y, angle) {
  rect(x, y, 10, 10);
}

function renderPlayers(playerServerSideObj) {
  let users = Object.keys(playerServerSideObj)
  let stats = Object.values(playerServerSideObj)

  for (var i = 0; i < users.length; i++) {
    if (users[i] == 'undefined') {
      continue;
    }
    // render username
    textSize(20)
    text(users[i], stats[i]['x'], stats[i]['y'] - 30)
    // render player
    // console.log(stats[i])
    drawPlayer(stats[i]['x'], stats[i]['y'], 40, [stats[i]['mouseX'], stats[i]['mouseY']])
    // TODO: add rotation for bullet
    for (var z = 0; z < stats[i]["bullets"].length; z++) {
      let bullet = stats[i]["bullets"][z]
      // console.log(bullet);
      drawBullet(bullet["x"], bullet["y"], bullet["angle"])
    }
  }
}

function updateBullets() {
  for (var z = 0; z < playerStats["bullets"].length; z++) {
    let bullet = playerStats["bullets"][z]
    // help using AI
    bullet["x"] += bullet.speed * Math.cos(bullet.angle);
    bullet["y"] += bullet.speed * Math.sin(bullet.angle);
  }
}

function playerMovement(speed) {
  if (keyIsDown(LEFT_ARROW) === true) {
    playerStats["x"] -= speed;
  }
  if (keyIsDown(RIGHT_ARROW) === true) {
    playerStats["x"] += speed;
  }
  if (keyIsDown(UP_ARROW) === true) {
    playerStats["y"] -= speed;
  } 
  if (keyIsDown(DOWN_ARROW) === true) {
    playerStats["y"] += speed;
  }
}

function showLobby() {
  // drawPlayer(playerStats["x"], playerStats["y"], 50)
  playerMovement(3)
  playerStats["mouseX"] = mouseX
  playerStats["mouseY"] = mouseY
}

function draw() {
  background(153);
  textSize(50);
  renderPlayers(playersOnServerSide)
  if (scene === 'lobby') {
    showLobby();
  }
  // socket.emit("updatePlayer", { "user": username, "player": playerStats })
}

var updatePlayer = setInterval(() => {
  updateBullets()
  socket.emit("updatePlayer", {"user": username, "player": playerStats})
}, 1)

function mouseClicked() {
  if (scene == 'lobby') {
    // [x, y, speed, angleInRadians]
    let facing = calculateDirectionFacing(playerStats["x"], playerStats["y"], [mouseX, mouseY])
    console.log(facing)
    let bulletObj = {
      x: playerStats["x"],
      y: playerStats["y"],
      speed: 5,
      angle: facing
    };
    playerStats["bullets"].push(bulletObj)
    // socket.emit("updatePlayer", {"user": username, "player": playerStats})
  }
}

socket.on("update", function(playerServerSideObj) {
  console.log(playerServerSideObj)
  playersOnServerSide = playerServerSideObj
})

window.addEventListener('beforeunload', ((e) => {
  clearInterval(updatePlayer)
  socket.emit('removePlayer', {"user": username})
  return null
}))