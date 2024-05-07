const form = document.getElementById("form");
const game = document.getElementById("game");
const inputUsername = document.getElementById("username");
// const inputCell = document.getElementById("cell");
const formCells = document.getElementById("form__cells");
const formColors = document.getElementById("form__colors");
const messageP = document.getElementById("message");
const buttonJump = document.getElementById("btnjump");

const socket = io();

let cellSelected = undefined;
let colorSelected = undefined;
let ocupedCells = [1, 2, 3, 4, 5, 6, 7, 8, 9];
let chickens = [];
let userInfo = {
  username: "",
  cell: 0,
};

function cargarVista() {}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let username = inputUsername.value.trim();
  let cell;
  let color;

  if (username == "") {
    messageP.textContent = "Ingrese un usuario";
    return;
  }
  if (cellSelected == undefined) {
    messageP.textContent = "Seleccione una celda";
    return;
  }
  cell = cellSelected.textContent;

  if (colorSelected == undefined) {
    messageP.textContent = "Seleccione un color";
    return;
  }
  messageP.textContent = "";
  color = colorSelected.dataset.color;

  userInfo.username = username;
  userInfo.cell = cell;

  socket.emit("login", { username, cell, color });
});

formCells.addEventListener("click", (e) => {
  let element = e.target;
  if (element.nodeName == "LI") {
    if (!element.classList.contains("selected")) {
      if (cellSelected != undefined) {
        cellSelected.classList.remove("user_select");
      }
      cellSelected = element;
      cellSelected.classList.add("user_select");
    }
  }
});
formColors.addEventListener("click", (e) => {
  let element = e.target;
  if (element.nodeName == "LI") {
    if (colorSelected != undefined) {
      colorSelected.classList.remove("selected");
    }
    colorSelected = element;
    colorSelected.classList.add("selected");
  }
});

function createChicken(cell, color) {
  const chicken = new THREE.Group();
  chicken.name = cell;

  const materialBody = new THREE.MeshStandardMaterial({ color: color });
  const materialBeak = new THREE.MeshStandardMaterial({ color: 0xff7127 });
  const materialFoot = new THREE.MeshStandardMaterial({ color: 0xff7127 });
  const materialEye = new THREE.MeshStandardMaterial({ color: 0x000000 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 1), materialBody);
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.5, 0.5),
    materialBody
  );
  const eyeL = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.1, 0.2),
    materialEye
  );
  const eyeR = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.1, 0.2),
    materialEye
  );
  const beak = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.15, 0.4),
    materialBeak
  );
  const footL = new THREE.Mesh(
    new THREE.BoxGeometry(0.115, 0.7, 0.115),
    materialFoot
  );
  const footR = new THREE.Mesh(
    new THREE.BoxGeometry(0.115, 0.7, 0.115),
    materialFoot
  );

  body.position.set(0, 0, 0);
  head.position.set(0, 0.5, 0.5);
  eyeL.position.set(0.15, 0.6, 0.7);
  eyeR.position.set(-0.15, 0.6, 0.7);
  beak.position.set(0, 0.4, 0.75);
  footL.position.set(0.2, -0.6, 0);
  footR.position.set(-0.2, -0.6, 0);

  chicken.add(body);
  chicken.add(head);
  chicken.add(eyeL);
  chicken.add(eyeR);
  chicken.add(beak);
  chicken.add(footL);
  chicken.add(footR);

  return chicken;
}

function jump(cell) {
  let chicken = chickens.find((chicken) => {
    return chicken.name == cell;
  });
  const initialY = chicken.position.y;
  const jumpHeight = 1;
  const jumpDuration = 500;
  const startTime = Date.now();

  function update() {
    const elapsedTime = Date.now() - startTime;
    const progress = Math.min(elapsedTime / jumpDuration, 1);
    chicken.position.y = initialY + Math.sin(progress * Math.PI) * jumpHeight;
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  update();
}
let inAir = false;
buttonJump.addEventListener("click", function () {
  if (game.classList.contains("visible")) {
    if (!inAir) {
      inAir = true;
      socket.emit("jump", userInfo.cell);
      setTimeout(() => {
        inAir = false;
      }, 600);
    }
  }
});
function init() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdddedf);
  const camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  scene.add(camera);

  camera.position.set(0, 5, 15);
  camera.lookAt(0, 10, 0);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.display = "block";
  renderer.shadowMap.enabled = true;
  game.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(
    camera,
    document.querySelector("canvas")
  );
  controls.enableRotate = false;
  controls.update();

  function renderChickens() {
    ocupedCells.forEach((item) => {
      let chicken = createChicken(item, "#FFFFFF");
      chicken.receiveShadow = true;
      scene.add(chicken);

      chickens.push(chicken);

      let x = item % 3;
      let y = parseInt((item - 1) / 3);
      let largo = 2;
      let alto = 2.5;
      let xPos = 0;
      let yPos = 0;

      if (x === 1) {
        xPos = 0 - largo;
      } else if (x === 0) {
        xPos = 0 + largo;
      }

      if (y === 0) {
        yPos = 0 + alto;
      } else if (y === 2) {
        yPos = 0 - alto;
      }
      chicken.position.set(xPos, yPos, 0);
    });
  }
  function addLighting() {
    let ambientColor = "#dcdde1";
    let ambiantIntensity = 0.5;
    let lightAmbient = new THREE.AmbientLight(ambientColor, ambiantIntensity);
    scene.add(lightAmbient);

    let directionalColor = "#ffffff";
    let directionalBrightness = 1;
    let lightDirectional = new THREE.DirectionalLight(
      directionalColor,
      directionalBrightness
    );
    lightDirectional.position.set(5, 10, 7);
    lightDirectional.castShadow = true;
    lightDirectional.shadow.mapSize.width = 1024;
    lightDirectional.shadow.mapSize.height = 1024;
    scene.add(lightDirectional);
  }
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  addLighting();
  renderChickens();

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
  window.addEventListener("resize", onWindowResize, false);
}

init();

socket.on("selected", (cell) => {
  let li = form.querySelector(".cell_" + cell);
  li.classList.add("selected");
});
socket.on("deselected", (cell) => {
  let li = form.querySelector(".cell_" + cell);
  li.classList.remove("selected");
});

socket.on("cells", (cells) => {
  ocupedCells = cells;
  cells.forEach((i) => {
    let li = form.querySelector(".cell_" + i);
    li.classList.add("selected");
  });
});

// recibir mensajes desde el servidor
socket.on("message", (message) => {
  console.log(message);
  // messageP.textContent = message;
});
socket.on("auth", (status) => {
  if (status == 0) {
    // Cambiar a juego y ocultar el formulario
    game.classList.add("visible");
    form.classList.remove("visible");
  }
});

socket.on("jump", (cell) => {
  if (game.classList.contains("visible")) {
    jump(cell);
  }
});
