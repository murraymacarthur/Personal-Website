import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import initOpenCascade from 'occt-import-js';

/**
 * Initialize a 3D viewer in the given container for the provided model URL.
 */
export async function initViewer(container, modelUrl, isModal = false) {
    console.log(`[3D Viewer] Initializing for: ${modelUrl} (Modal: ${isModal})`);

    // Scene setup
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 2);
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !isModal; // Only auto-rotate if not in modal
    controls.autoRotateSpeed = 1.0;

    // Click to change color (Modal only)
    if (isModal) {
        renderer.domElement.addEventListener('click', () => {
            scene.traverse((child) => {
                if (child.isMesh) {
                    child.material.color.setHex(Math.random() * 0xffffff);
                }
            });
        });
    }

    // Loader
    const ext = modelUrl.split('.').pop().toLowerCase();

    try {
        if (ext === 'stl') {
            const loader = new STLLoader();
            loader.load(modelUrl, (geometry) => {
                const material = new THREE.MeshPhongMaterial({ color: 0xa78bfa, specular: 0x111111, shininess: 200 });
                const mesh = new THREE.Mesh(geometry, material);
                centerAndFit(scene, camera, mesh, controls);
            });
        } else if (ext === 'glb' || ext === 'gltf') {
            const loader = new GLTFLoader();
            loader.load(modelUrl, (gltf) => {
                scene.add(gltf.scene);
                centerAndFit(scene, camera, gltf.scene, controls);
            });
        } else if (ext === 'step' || ext === 'stp') {
            console.log('[3D Viewer] Loading STEP file via occt-import-js...');
            const occt = await initOpenCascade();
            const response = await fetch(modelUrl);
            const buffer = await response.arrayBuffer();
            const fileBuffer = new Uint8Array(buffer);

            const result = occt.ReadStepFile(fileBuffer, null);
            if (result.success) {
                const group = new THREE.Group();
                for (const mesh of result.meshes) {
                    const geometry = new THREE.BufferGeometry();
                    geometry.setAttribute('position', new THREE.Float32BufferAttribute(mesh.attributes.position.array, 3));
                    if (mesh.attributes.normal) {
                        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(mesh.attributes.normal.array, 3));
                    }
                    geometry.setIndex(new THREE.Uint32BufferAttribute(mesh.index.array, 1));

                    const material = new THREE.MeshPhongMaterial({ color: 0xa78bfa, specular: 0x111111, shininess: 100 });
                    group.add(new THREE.Mesh(geometry, material));
                }
                scene.add(group);
                centerAndFit(scene, camera, group, controls);
            }
        }
    } catch (err) {
        console.error('[3D Viewer] Error loading model:', err);
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    const resizeObserver = new ResizeObserver(() => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    resizeObserver.observe(container);
}

function centerAndFit(scene, camera, object, controls) {
    const box = new THREE.Box3().setFromObject(object);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Move object to origin
    object.position.sub(center);
    scene.add(object);

    // Fit camera
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.z = maxDim * 2;
    camera.updateProjectionMatrix();

    if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
    }
}
