const controls = new OrbitControls(camera, document.querySelector("canvas"));
controls.enableRotate = false;
controls.target.set(0, -1, 0);
controls.update();

const chicken1 = createChicken("1", "#FFFFFF");
const chicken2 = createChicken("2", "#FFFFFF");
const chicken3 = createChicken("3", "#FFFFFF");

chicken1.receiveShadow = true;
chicken2.receiveShadow = true;
chicken3.receiveShadow = true;

scene.add(chicken1);
scene.add(chicken2);
scene.add(chicken3);

let axisX = new THREE.Vector3(1, 0, 0).normalize();
let axisY = new THREE.Vector3(0, 1, 0).normalize();
let large = 1;

chicken1.translateOnAxis(axisX, large);
chicken2.translateOnAxis(axisX, 0);
chicken3.translateOnAxis(axisX, -large);

chicken1.translateOnAxis(axisY, large);
chicken2.translateOnAxis(axisY, 0);
chicken3.translateOnAxis(axisY, -large);
