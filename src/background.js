import * as THREE from 'three';

/**
 * Animated WebGL background — floating wireframe geometric shapes
 * with psychedelic color cycling, mouse-reactive distortion,
 * and a particle constellation grid.
 */

export function initBackground(container) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x06060f);
  container.appendChild(renderer.domElement);

  // --- Scene & Camera ---
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06060f, 0.025);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 18);

  // --- Mouse tracking ---
  let targetMouse = { x: 0, y: 0 };
  let currentMouse = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      targetMouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  }, { passive: true });

  // --- Nebula color palettes (cycled on click) ---
  const palettes = [
    [ // Orion Nebula — pinks, purples, blues
      new THREE.Color(0xff6b9d), // Rose pink
      new THREE.Color(0xc44dff), // Bright violet
      new THREE.Color(0x7b68ee), // Medium slate blue
      new THREE.Color(0xff85c8), // Soft pink
      new THREE.Color(0x9945ff), // Purple
      new THREE.Color(0x4169e1), // Royal blue
      new THREE.Color(0xe040fb), // Magenta-pink
    ],
    [ // Carina Nebula — teals, golds, reds
      new THREE.Color(0x00bfa5), // Deep teal
      new THREE.Color(0xffab40), // Amber glow
      new THREE.Color(0xff5252), // Cosmic red
      new THREE.Color(0x64ffda), // Aqua mint
      new THREE.Color(0xffd740), // Golden yellow
      new THREE.Color(0xff6e40), // Deep orange
      new THREE.Color(0x26c6da), // Cyan
    ],
    [ // Eagle Nebula — deep blues, oranges, silvers
      new THREE.Color(0x1a237e), // Deep navy
      new THREE.Color(0x5c6bc0), // Indigo
      new THREE.Color(0xff8a65), // Soft orange
      new THREE.Color(0x90caf9), // Light blue
      new THREE.Color(0xffcc80), // Peach
      new THREE.Color(0xce93d8), // Light purple
      new THREE.Color(0x80cbc4), // Teal-grey
    ],
    [ // Helix Nebula — aquas, magentas, electric blues
      new THREE.Color(0x00e5ff), // Electric cyan
      new THREE.Color(0xd500f9), // Vivid magenta
      new THREE.Color(0x651fff), // Deep purple
      new THREE.Color(0x00e676), // Neon green
      new THREE.Color(0x40c4ff), // Sky blue
      new THREE.Color(0xf50057), // Hot pink
      new THREE.Color(0x7c4dff), // Violet
    ],
  ];
  let currentPaletteIndex = 0;
  let palette = palettes[0];

  // --- Geometry types ---
  const geometries = [
    () => new THREE.IcosahedronGeometry(1, 0),
    () => new THREE.OctahedronGeometry(1, 0),
    () => new THREE.TetrahedronGeometry(1, 0),
    () => new THREE.DodecahedronGeometry(1, 0),
    () => new THREE.BoxGeometry(1, 1, 1),
  ];

  // --- Floating wireframe shapes ---
  const shapes = [];
  const shapeCount = 28;

  for (let i = 0; i < shapeCount; i++) {
    const geoFn = geometries[Math.floor(Math.random() * geometries.length)];
    const geo = geoFn();
    const scale = 0.8 + Math.random() * 2.5;
    const color = palette[Math.floor(Math.random() * palette.length)].clone();

    // Wireframe edges
    const edges = new THREE.EdgesGeometry(geo);
    const lineMat = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5 + Math.random() * 0.4,
      linewidth: 1,
    });
    const wireframe = new THREE.LineSegments(edges, lineMat);

    // Orbital parameters — each shape orbits the origin
    const orbitRadius = 5 + Math.random() * 17;
    const orbitSpeed = (0.03 + Math.random() * 0.08) * (Math.random() > 0.5 ? 1 : -1);
    const orbitInclination = (Math.random() - 0.5) * Math.PI * 0.8;
    const orbitOffset = Math.random() * Math.PI * 2;
    const orbitEccentricity = 0.6 + Math.random() * 0.5; // elliptical
    const zOffset = (Math.random() - 0.5) * 10;

    wireframe.scale.setScalar(scale);
    wireframe.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    scene.add(wireframe);

    shapes.push({
      mesh: wireframe,
      material: lineMat,
      baseColor: color.clone(),
      rotSpeed: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.007,
      },
      orbit: {
        radius: orbitRadius,
        speed: orbitSpeed,
        inclination: orbitInclination,
        offset: orbitOffset,
        eccentricity: orbitEccentricity,
        zOffset: zOffset,
      },
      phase: Math.random() * Math.PI * 2,
      colorPhase: Math.random() * Math.PI * 2,
    });
  }

  // --- Inner ring of brighter shapes in tighter orbits ---
  const innerShapeCount = 8;
  for (let i = 0; i < innerShapeCount; i++) {
    const geoFn = geometries[Math.floor(Math.random() * geometries.length)];
    const geo = geoFn();
    const scale = 1.5 + Math.random() * 2.0;
    const color = palette[Math.floor(Math.random() * palette.length)].clone();

    const edges = new THREE.EdgesGeometry(geo);
    const lineMat = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.7 + Math.random() * 0.3,
      linewidth: 1,
    });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    wireframe.scale.setScalar(scale);

    scene.add(wireframe);

    const orbitRadius = 4 + Math.random() * 5;
    const orbitSpeed = (0.06 + Math.random() * 0.1) * (Math.random() > 0.5 ? 1 : -1);

    shapes.push({
      mesh: wireframe,
      material: lineMat,
      baseColor: color.clone(),
      rotSpeed: {
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.01,
      },
      orbit: {
        radius: orbitRadius,
        speed: orbitSpeed,
        inclination: (Math.random() - 0.5) * Math.PI * 0.5,
        offset: (i / innerShapeCount) * Math.PI * 2,
        eccentricity: 0.7 + Math.random() * 0.3,
        zOffset: (Math.random() - 0.5) * 4,
      },
      phase: Math.random() * Math.PI * 2,
      colorPhase: Math.random() * Math.PI * 2,
    });
  }

  // --- Particle constellation ---
  const particleCount = 12000;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);
  const particleSizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 50;
    positions[i3 + 1] = (Math.random() - 0.5) * 50;
    positions[i3 + 2] = (Math.random() - 0.5) * 35 - 5;

    const c = palette[Math.floor(Math.random() * palette.length)];
    particleColors[i3] = c.r;
    particleColors[i3 + 1] = c.g;
    particleColors[i3 + 2] = c.b;

    // Varied sizes — most small, a few brighter/larger
    particleSizes[i] = 0.04 + Math.pow(Math.random(), 3) * 0.21;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

  // Generate circular particle texture
  const circleCanvas = document.createElement('canvas');
  circleCanvas.width = 32;
  circleCanvas.height = 32;
  const ctx = circleCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.6)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const circleTexture = new THREE.CanvasTexture(circleCanvas);

  // Custom shader material for varied particle sizes
  const particleMat = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: circleTexture },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * uPixelRatio * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      uniform sampler2D uTexture;
      void main() {
        vec4 texColor = texture2D(uTexture, gl_PointCoord);
        gl_FragColor = vec4(vColor, texColor.a * 0.85);
      }
    `,
    transparent: true,
    depthWrite: false,
    vertexColors: true,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // --- Faint constellation lines between nearby particles ---
  const linePositions = [];
  const lineColors = [];
  const maxDist = 4.5;

  const lineCheckCount = Math.min(particleCount, 800); // limit O(n²) check

  for (let i = 0; i < lineCheckCount; i++) {
    for (let j = i + 1; j < lineCheckCount; j++) {
      const i3 = i * 3;
      const j3 = j * 3;
      const dx = positions[i3] - positions[j3];
      const dy = positions[i3 + 1] - positions[j3 + 1];
      const dz = positions[i3 + 2] - positions[j3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < maxDist && linePositions.length < 6000) {
        linePositions.push(
          positions[i3], positions[i3 + 1], positions[i3 + 2],
          positions[j3], positions[j3 + 1], positions[j3 + 2]
        );
        const alpha = 1 - dist / maxDist;
        lineColors.push(
          particleColors[i3] * alpha, particleColors[i3 + 1] * alpha, particleColors[i3 + 2] * alpha,
          particleColors[j3] * alpha, particleColors[j3 + 1] * alpha, particleColors[j3 + 2] * alpha
        );
      }
    }
  }

  if (linePositions.length > 0) {
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.25,
    });

    const constellationLines = new THREE.LineSegments(lineGeo, lineMaterial);
    scene.add(constellationLines);
  }

  // --- Subtle ambient light for depth ---
  const ambientLight = new THREE.AmbientLight(0x4f46e5, 0.15);
  scene.add(ambientLight);

  // --- Resize ---
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);

  // --- Click to change color palette ---

  function cyclePalette() {
    currentPaletteIndex = (currentPaletteIndex + 1) % palettes.length;
    palette = palettes[currentPaletteIndex];

    // Instant snap — assign new colors to all shapes immediately
    for (const s of shapes) {
      const newColor = palette[Math.floor(Math.random() * palette.length)].clone();
      s.baseColor.copy(newColor);
      s.material.color.copy(newColor);
    }
  }

  document.addEventListener('click', (e) => {
    // Don't trigger on UI elements
    if (e.target.closest('#site-header, #overlay, .mobile-menu-toggle, button, a')) return;
    // Don't trigger if overlay is open
    const overlay = document.getElementById('overlay');
    if (overlay && !overlay.classList.contains('hidden')) return;
    cyclePalette();
  });

  // --- Animation loop ---
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = reducedMotion ? 0 : clock.getElapsedTime();

    // Smooth mouse
    currentMouse.x += (targetMouse.x - currentMouse.x) * 0.04;
    currentMouse.y += (targetMouse.y - currentMouse.y) * 0.04;

    // Camera subtle sway following mouse
    camera.position.x = currentMouse.x * 4.0;
    camera.position.y = currentMouse.y * 3.0;
    camera.lookAt(0, 0, 0);

    // Animate shapes
    for (let i = 0; i < shapes.length; i++) {
      const s = shapes[i];

      // Rotation
      s.mesh.rotation.x += s.rotSpeed.x;
      s.mesh.rotation.y += s.rotSpeed.y;
      s.mesh.rotation.z += s.rotSpeed.z;

      // Orbital movement
      const o = s.orbit;
      const angle = elapsed * o.speed + o.offset;
      const rx = o.radius * Math.cos(angle);
      const ry = o.radius * o.eccentricity * Math.sin(angle);
      // Apply inclination rotation
      s.mesh.position.x = rx;
      s.mesh.position.y = ry * Math.cos(o.inclination) + o.zOffset * Math.sin(o.inclination);
      s.mesh.position.z = ry * Math.sin(o.inclination) + o.zOffset * Math.cos(o.inclination);

      // Slow natural color cycling
      const hsl = {};
      s.baseColor.getHSL(hsl);
      hsl.h = (hsl.h + Math.sin(elapsed * 0.15 + s.colorPhase) * 0.08) % 1;
      if (hsl.h < 0) hsl.h += 1;
      hsl.l = 0.55 + Math.sin(elapsed * 0.3 + s.colorPhase) * 0.1;
      s.material.color.setHSL(hsl.h, hsl.s, hsl.l);
    }

    // Slow particle rotation
    particles.rotation.y = elapsed * 0.01;
    particles.rotation.x = elapsed * 0.005;

    renderer.render(scene, camera);
  }

  animate();

  return { renderer, scene, camera };
}
