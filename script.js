import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { GLTFLoader } from 'GLTFLoader';
import { RGBELoader } from 'RGBELoader';

document.addEventListener('DOMContentLoaded', () => {
  initThree();
  initNavigation();
});

function initNavigation() {
  const links = document.querySelectorAll('.mainMenu a');
  const content = document.querySelector('.content');
  const contentButton = document.querySelector('.contentButton');
  const logo = document.querySelector('.header');

  links.forEach((link) => {
    link.addEventListener('click', () => {
      content.classList.add('visible');
      logo.classList.add('none');

      let linkId = link.href.split('#')[1];
      if (/\d/.test(linkId)) {
        // If there are numbers, remove them
        linkId = linkId.replace(/\d/g, '');
      }
      document.querySelectorAll('.theme').forEach((theme, index) => {
        theme.classList.add('none');
      });
      let linkTarget = document.getElementById(linkId);
      linkTarget.classList.remove('none');
      document.querySelectorAll('.listItem').forEach((item) => {
        item.classList.remove('active');
      });
      document.querySelector(`.${linkId}`).classList.add('active');

      contentButton.addEventListener('click', () => {
        content.classList.remove('visible');
        logo.classList.remove('none');
        linkTarget.classList.add('none');
        document.querySelector(`.${linkId}`).classList.remove('active');
      });
    });
  });
}

function initThree() {
  let modelContainer = document.querySelector('.model');

  const scene = new THREE.Scene();
  scene.position.set(0, 20, 0);
  scene.background = new THREE.Color('#e1e1df');

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
  );
  camera.position.set(-130, 80, 50);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(window.devicePixelRatio);
  modelContainer.appendChild(renderer.domElement);

  {
    const light = new THREE.DirectionalLight(0xeeeeee);
    light.position.set(30, 10, 10);
    scene.add(light);
  }
  {
    const light = new THREE.DirectionalLight(0xeeeeee);
    light.position.set(20, 50, 10);
    scene.add(light);
  }
  {
    const light = new THREE.DirectionalLight(0xeeeeee);
    light.position.set(10, 15, 30);
    scene.add(light);
  }

  {
    const loader = new GLTFLoader();
    loader.load(
      './model-narkomfin/scene.gltf',
      (gltf) => {
        const model = gltf.scene;

        model.scale.set(2, 2, 2);
        model.position.y -= 50;
        // Add the scaled model to the scene
        scene.add(model);
      },
      function (error) {
        console.log(error);
      }
    );
  }

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const hdriLoader = new RGBELoader();
  hdriLoader.load('./img/hdr.hdr', function (texture) {
    renderer.toneMappingExposure = 2;
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    texture.dispose();
    scene.environment = envMap;
  });

  scene.rotation.y = Math.PI / 8;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 200;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 5;

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
  }
  animate();
}
