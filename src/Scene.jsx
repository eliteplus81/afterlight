import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, RotateCw, Focus } from 'lucide-react';
import './scene.css';

const DEFAULT = { venue: 'courtyard', guests: 80, screen: 'standard', projector: 'beam', lighting: 'dusk' };

// Every object is an authored, reusable component. The configuration changes the
// actual seating, venue, equipment and lighting; no external assets are loaded.
export default function CinemaScene({ plan = DEFAULT, exploded = false, cameraMode = 'orbit', empty = false, onReady, showControls = true, shot = null, onCanvas, preserveFrame = false }) {
  const host = useRef(null);
  const activeShot = useRef(shot); activeShot.current = shot;
  const runtime = useRef(null);
  const ready = useRef(onReady);
  const canvasReady = useRef(onCanvas); canvasReady.current = onCanvas;
  ready.current = onReady;
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const element = host.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: preserveFrame });
    } catch {
      setStatus('failed');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label', 'Interactive three-dimensional cinema venue. Drag horizontally or use the camera buttons to explore.');
    renderer.domElement.setAttribute('role', 'img');
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#171b2b', 0.013);
    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 160);
    const geometries = new Set();
    const materials = new Set();
    const textures = new Set();
    let ephemeral = [];
    const geometry = g => { geometries.add(g); return g; };
    const material = (color, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.78, ...extra }); materials.add(m); return m; };
    const boxGeo = geometry(new THREE.BoxGeometry(1, 1, 1));
    const sphereGeo = geometry(new THREE.SphereGeometry(1, 8, 6));
    const cylinderGeo = geometry(new THREE.CylinderGeometry(1, 1, 1, 10));
    const coneGeo = geometry(new THREE.ConeGeometry(1, 1, 10));
    const mat = {
      base: material('#342f40'), mortar: material('#695b62'), metal: material('#2c303b', { metalness: 0.55, roughness: 0.38 }),
      brass: material('#c19763', { metalness: 0.65, roughness: 0.33 }), velvet: material('#7c354d'), fabric: material('#dec399'),
      bark: material('#624c43'), leaf: material('#536a4e'), leafLight: material('#78836a'), planter: material('#b47f63'),
      dark: material('#141b2c'), window: material('#e7ac69', { emissive: '#d5863c', emissiveIntensity: 0.6 }),
      glow: material('#ffdc98', { emissive: '#ffbf63', emissiveIntensity: 2.2 }), white: material('#ece8dd'),
      equipment: material('#434957'), cable: material('#2f292f'),
      timber: material('#b28c68'), stone: material('#b9b2a3'), steel: material('#6e7d85', { metalness: 0.7, roughness: 0.4 }),
    };
    function canvasTexture(width, height, draw) {
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      draw(canvas.getContext('2d'), width, height);
      const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; textures.add(t); return t;
    }
    const brick = canvasTexture(512, 512, (c, w, h) => {
      c.fillStyle = '#574852'; c.fillRect(0, 0, w, h);
      for (let row = 0; row < 16; row++) for (let col = -1; col < 8; col++) {
        const shade = 100 + ((row * 17 + col * 23) % 36);
        c.fillStyle = `rgb(${shade + 27},${shade - 20},${shade - 16})`;
        c.fillRect(col * 72 + (row % 2) * 36 + 2, row * 32 + 2, 68, 28);
      }
    });
    brick.wrapS = brick.wrapT = THREE.RepeatWrapping; brick.repeat.set(3, 1.4);
    mat.brick = material('#c1a4a3', { map: brick });
    const paving = canvasTexture(512, 512, c => {
      c.fillStyle = '#66616c'; c.fillRect(0, 0, 512, 512);
      for (let r = 0; r < 8; r++) for (let col = -1; col < 5; col++) {
        const shade = 104 + (r * 7 + col * 11) % 24;
        c.fillStyle = `rgb(${shade + 9},${shade + 4},${shade + 8})`;
        c.fillRect(col * 128 + (r % 2) * 64 + 2, r * 64 + 2, 124, 60);
      }
    });
    paving.wrapS = paving.wrapT = THREE.RepeatWrapping; paving.repeat.set(3, 3);
    mat.paving = material('#b7a8a8', { map: paving });
    const film = canvasTexture(1024, 576, (c, w, h) => {
      const sky = c.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#252841'); sky.addColorStop(0.6, '#c4797c'); sky.addColorStop(1, '#efbc91');
      c.fillStyle = sky; c.fillRect(0, 0, w, h);
      c.fillStyle = '#f9dca9'; c.beginPath(); c.arc(725, 187, 67, 0, Math.PI * 2); c.fill();
      ['#79728c', '#514d6b', '#30374e'].forEach((color, j) => {
        c.fillStyle = color; c.beginPath(); c.moveTo(0, h);
        for (let x = 0; x <= w; x += 28) c.lineTo(x, 330 + j * 60 + Math.sin(x * 0.007 + j * 2) * 51 + Math.cos(x * 0.016) * 24);
        c.lineTo(w, h); c.fill();
      });
      c.fillStyle = '#fff1d8'; c.font = '22px Georgia'; c.textAlign = 'center'; c.fillText('A F T E R L I G H T   O R I G I N A L S', w / 2, 57);
      c.font = 'italic 50px Georgia'; c.fillText('Somewhere, after sunset.', w / 2, 505);
    });
    mat.film = material('#ffffff', { map: film, emissive: '#ffffff', emissiveMap: film, emissiveIntensity: 0.6, roughness: 0.7 });
    mat.beam = new THREE.MeshBasicMaterial({ color: '#b9c7f9', transparent: true, opacity: 0.028, side: THREE.DoubleSide, depthWrite: false }); materials.add(mat.beam);
    const ambient = new THREE.HemisphereLight('#d1c5ed', '#9f6551', 2.1); scene.add(ambient);
    const sun = new THREE.DirectionalLight('#ffd3ad', 3); sun.position.set(-12, 20, 6); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 1, far: 65 }); sun.shadow.bias = -0.001; scene.add(sun);
    const pools = [-6, 0, 6].map(x => { const light = new THREE.PointLight('#ffbd69', 35, 15, 2); light.position.set(x, 4, 2); scene.add(light); return light; });
    const content = new THREE.Group(); scene.add(content);
    function mesh(parent, geo, m, x, y, z, sx = 1, sy = 1, sz = 1) {
      const obj = new THREE.Mesh(geo, m); obj.position.set(x, y, z); obj.scale.set(sx, sy, sz); obj.castShadow = true; obj.receiveShadow = true; parent.add(obj); return obj;
    }
    const box = (p, m, x, y, z, sx, sy, sz) => mesh(p, boxGeo, m, x, y, z, sx, sy, sz);
    function rod(p, a, b, radius = 0.025, m = mat.metal) {
      const av = new THREE.Vector3(...a), bv = new THREE.Vector3(...b), d = bv.clone().sub(av);
      const obj = mesh(p, cylinderGeo, m, ...av.clone().add(bv).multiplyScalar(0.5).toArray(), radius, d.length(), radius);
      obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return obj;
    }
    function tree(p, x, z, scale = 1) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(scale); p.add(g);
      mesh(g, cylinderGeo, mat.planter, 0, 0.42, 0, 0.68, 0.84, 0.68);
      mesh(g, cylinderGeo, mat.dark, 0, 0.85, 0, 0.58, 0.04, 0.58);
      rod(g, [0, 0.7, 0], [0.12, 3.5, 0], 0.09, mat.bark);
      for (let i = 0; i < 8; i++) {
        const a = i * 2.4, r = 0.5 + (i % 3) * 0.2;
        mesh(g, sphereGeo, i % 2 ? mat.leaf : mat.leafLight, Math.cos(a) * r, 2.7 + (i % 3) * 0.48, Math.sin(a) * r, 0.9, 1.05, 0.8);
      }
    }
    function guest(p, x, z, angle, coat = mat.fabric) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = angle; p.add(g);
      mesh(g, sphereGeo, mat.timber, 0, 1.65, 0, .17, .21, .17);
      mesh(g, cylinderGeo, coat, 0, 1.14, 0, .23, .7, .17);
      for (const side of [-1, 1]) {
        rod(g, [side * .11, .82, 0], [side * .13, .15, .03], .07, mat.metal);
        box(g, mat.dark, side * .13, .08, -.04, .15, .14, .29);
        rod(g, [side * .23, 1.37, 0], [side * .29, .92, -.06], .065, coat);
      }
    }
    function arch(p, x, z) {
      const shape = new THREE.Shape(); shape.moveTo(-1.25, 0); shape.lineTo(1.25, 0); shape.lineTo(1.25, 2.7); shape.absarc(0, 2.7, 1.25, 0, Math.PI, false); shape.lineTo(-1.25, 0);
      const geo = new THREE.ShapeGeometry(shape); ephemeral.push(geo);
      mesh(p, geo, mat.dark, x, 0.1, z, 1, 1, 1);
      const curve = new THREE.EllipseCurve(0, 0, 1.36, 1.36, 0, Math.PI, false, 0);
      const path = new THREE.CatmullRomCurve3(curve.getPoints(24).map(v => new THREE.Vector3(v.x + x, v.y + 2.8, z + 0.02)));
      const trim = new THREE.TubeGeometry(path, 24, 0.12, 5, false); ephemeral.push(trim); mesh(p, trim, mat.mortar, 0, 0, 0);
      box(p, mat.mortar, x - 1.36, 1.43, z, 0.23, 2.8, 0.17); box(p, mat.mortar, x + 1.36, 1.43, z, 0.23, 2.8, 0.17);
      box(p, mat.window, x, 2.2, z + 0.03, 0.08, 3.6, 0.03); box(p, mat.window, x, 2, z + 0.04, 2.35, 0.07, 0.03);
    }
    let groups = [], overheadStructure = [];
    function build(next, isEmpty = false) {
      const p = { ...DEFAULT, ...next };
      content.traverse(obj => { if (obj.isInstancedMesh) obj.dispose(); });
      content.clear(); ephemeral.forEach(g => g.dispose()); ephemeral = []; groups = []; overheadStructure = [];
      const environment = new THREE.Group(); content.add(environment);
      box(environment, mat.base, 0, -0.55, 0, 20.7, 0.9, 19.5);
      box(environment, mat.paving, 0, -0.06, 0, 20, 0.15, 18.8);
      box(environment, mat.brass, 0, -0.41, 9.77, 19.8, 0.025, 0.03);
      const rooftop = p.venue === 'rooftop', warehouse = p.venue === 'warehouse';
      // Distinct architectural language without changing the sample venue dimensions.
      for (const z of [-8.1, 8.1]) box(environment, mat.stone, 0, 0.035, z, 19.8, 0.09, 0.19);
      if (rooftop) {
        for (let x = -9; x <= 9; x += 1.5) rod(environment, [x, 1.2, -9.15], [x, 2.35, -9.15], 0.025, mat.steel);
        rod(environment, [-9.7, 2.35, -9.15], [9.7, 2.35, -9.15], 0.035, mat.steel);
        for (const x of [-7.8, 7.8]) {
          box(environment, mat.stone, x, .4, -6.5, 2.8, .8, 1.1);
          for (let i = 0; i < 6; i++) mesh(environment, sphereGeo, mat.leaf, x - 1.1 + i * .44, .95, -6.5, .4, .42, .4);
        }
      }
      box(environment, rooftop ? mat.mortar : mat.brick, 0, rooftop ? 0.55 : 3, -9.15, 20.3, rooftop ? 1.1 : 6, 0.45);
      for (const side of [-1, 1]) {
        box(environment, rooftop ? mat.mortar : mat.brick, side * 10.1, rooftop ? 0.55 : 2.1, -3.2, 0.45, rooftop ? 1.1 : 4.2, 12.5);
        box(environment, mat.mortar, side * 10.1, rooftop ? 1.15 : 4.25, -3.2, 0.6, 0.16, 12.6);
      }
      if (!rooftop) for (const x of [-7.2, -3.6, 0, 3.6, 7.2]) arch(environment, x, -8.9);
      if (warehouse) {
        const roof = new THREE.Group(); environment.add(roof); overheadStructure.push(roof);
        for (const z of [-7, -1, 5]) {
          rod(environment, [-9.8, 0, z], [-9.8, 8, z], 0.12);
          rod(environment, [9.8, 0, z], [9.8, 8, z], 0.12);
          rod(roof, [-9.8, 8, z], [0, 10, z], 0.11); rod(roof, [0, 10, z], [9.8, 8, z], 0.11);
          rod(roof, [-9.8, 7.7, z], [9.8, 7.7, z], 0.08);
          for (let x = -8; x < 8; x += 4) {
            rod(roof, [x, 7.7, z], [x + 2, 9.5 - Math.abs(x + 2) * .15, z], .045, mat.steel);
          }
        }
        for (const x of [-9.6, 9.6]) for (const z of [-6, 0, 6]) box(environment, mat.window, x, 3.3, z, .05, 1.3, .8);
      } else if (!rooftop) {
        // Stepped stone pilasters and trailing ivy add scale and age to the courtyard.
        for (const x of [-9.6, -5.4, 5.4, 9.6]) {
          box(environment, mat.stone, x, 2.8, -8.86, .22, 5.7, .2);
          box(environment, mat.stone, x, 5.67, -8.86, .38, .15, .3);
          for (let j = 0; j < 10; j++) {
            const a = j * 2.3;
            mesh(environment, sphereGeo, j % 2 ? mat.leaf : mat.leafLight, x + Math.sin(a) * .4, 5.3 - j * .28, -8.63, .22, .2, .08);
          }
        }
      }
      // A quiet, miniature city beyond the venue, with deterministic lit windows.
      for (let i = 0; i < 16; i++) {
        const x = (i - 7.5) * 2.4, height = 3 + ((i * 7) % 9);
        box(environment, mat.dark, x, height / 2 - 0.5, -15 - i % 3, 1.8, height, 2);
        for (let y = 1; y < height - 0.6; y += 1.1) if ((i + Math.round(y)) % 3 !== 0) box(environment, mat.window, x + 0.3, y, -13.96 - i % 3, 0.24, 0.43, 0.02);
      }
      const screen = new THREE.Group(); content.add(screen); screen.visible = !isEmpty; screen.userData.lift = 1.7; groups.push(screen);
      const large = p.screen === 'large', sw = large ? 10 : 7.7, sh = sw * 0.5625;
      box(screen, mat.metal, 0, 0.18, -6.7, sw + 1.2, 0.36, 2.2);
      box(screen, mat.dark, 0, sh / 2 + 1.25, -7.1, sw + 0.35, sh + 0.35, 0.22);
      box(screen, mat.film, 0, sh / 2 + 1.25, -6.96, sw, sh, 0.025);
      for (const side of [-1, 1]) { box(screen, mat.metal, side * (sw / 2 + 0.38), 2.2, -7.15, 0.1, 4.4, 0.12); box(screen, mat.equipment, side * (sw / 2 + 0.8), 0.8, -6.4, 0.6, 1.6, 0.65); }
      for (const side of [-1, 1]) {
        const sx = side * (sw / 2 + .8);
        for (const y of [.45, 1.15]) {
          const speaker = mesh(screen, cylinderGeo, mat.dark, sx, y, -6.06, .21, .02, .21); speaker.rotation.x = Math.PI / 2;
        }
      }
      const seats = new THREE.Group(); content.add(seats); seats.visible = !isEmpty; seats.userData.lift = 0.35; groups.push(seats);
      const count = [40, 80, 120].includes(Number(p.guests)) ? Number(p.guests) : 80;
      const cols = count === 40 ? 8 : count === 80 ? 10 : 12;
      const seatParts = [
        [mat.velvet, [0, 0.63, 0], [0.64, 0.09, 0.58]], [mat.velvet, [0, 0.99, 0.27], [0.64, 0.62, 0.07]],
        [mat.bark, [-0.38, 0.88, 0], [0.065, 0.065, 0.7]], [mat.bark, [0.38, 0.88, 0], [0.065, 0.065, 0.7]],
        [mat.brass, [-0.36, 0.4, -0.17], [0.045, 0.8, 0.045]], [mat.brass, [0.36, 0.4, -0.17], [0.045, 0.8, 0.045]],
        [mat.brass, [-0.36, 0.4, 0.24], [0.045, 0.8, 0.045]], [mat.brass, [0.36, 0.4, 0.24], [0.045, 0.8, 0.045]],
      ];
      const transform = new THREE.Object3D();
      for (const [m, offset, size] of seatParts) {
        const instances = new THREE.InstancedMesh(boxGeo, m, count); instances.castShadow = instances.receiveShadow = true;
        for (let i = 0; i < count; i++) {
          const col = i % cols, row = Math.floor(i / cols), aisle = col < cols / 2 ? -0.32 : 0.32;
          transform.position.set((col - (cols - 1) / 2) * 0.91 + aisle + offset[0], offset[1], -3.6 + row * 0.99 + offset[2]); transform.scale.set(...size); transform.updateMatrix(); instances.setMatrixAt(i, transform.matrix);
        }
        instances.instanceMatrix.needsUpdate = true; seats.add(instances);
      }
      const equipment = new THREE.Group(); content.add(equipment); equipment.visible = !isEmpty; equipment.userData.lift = 2.6; groups.push(equipment);
      const ez = 7.4, wide = p.projector === 'atlas' ? 1.05 : p.projector === 'aurora' ? 0.85 : 0.62;
      box(equipment, mat.bark, 0, 0.85, ez, 1.8, 0.12, 1.25);
      for (const x of [-0.7, 0.7]) for (const z of [-0.4, 0.4]) box(equipment, mat.metal, x, 0.42, ez + z, 0.07, 0.84, 0.07);
      box(equipment, mat.equipment, 0, 1.13, ez, wide, 0.48, 0.85);
      for (let i = 0; i < 5; i++) box(equipment, mat.dark, wide / 2 + .005, 1.12, ez - .25 + i * .12, .015, .16, .045);
      box(equipment, mat.glow, -.2, 1.38, ez + .1, .07, .015, .05);
      const lens = mesh(equipment, cylinderGeo, mat.brass, 0, 1.14, ez - 0.5, 0.16, 0.2, 0.16); lens.rotation.x = Math.PI / 2;
      const glass = mesh(equipment, cylinderGeo, mat.glow, 0, 1.14, ez - 0.61, 0.115, 0.015, 0.115); glass.rotation.x = Math.PI / 2;
      box(equipment, mat.dark, 1.6, 0.39, ez, 0.7, 0.78, 1.05);
      for (const x of [1.29, 1.91]) box(equipment, mat.brass, x, 0.39, ez, 0.035, 0.8, 1.07);
      // A translucent authored beam, oriented between lens and screen.
      const beamGeo = new THREE.ConeGeometry(sw * 0.35, 13.4, 4, 1, true); ephemeral.push(beamGeo);
      mat.beam.opacity = p.lighting === 'night' ? 0.055 : 0.028;
      const beam = mesh(equipment, beamGeo, mat.beam, 0, 2.5, 0.1, 1, 1, 0.6); beam.rotation.x = -Math.PI / 2 - 0.11; beam.rotation.y = Math.PI / 4; beam.castShadow = false;
      for (const x of [-8, 8]) for (const z of [-5, 2, 7.2]) tree(environment, x, z, z === 7.2 ? 0.8 : 1);
      // Three catenary strings: individual bulbs and modest pooled light.
      const festoon = new THREE.Group(); environment.add(festoon); festoon.visible = !isEmpty;
      for (const z of [-4, 1.3, 6.3]) {
        for (const x of [-9.3, 9.3]) rod(festoon, [x, 0, z], [x, 6.5, z], 0.045);
        const points = [];
        for (let i = 0; i <= 28; i++) { const x = -9.3 + i / 28 * 18.6; points.push(new THREE.Vector3(x, 6.5 - Math.sin(i / 28 * Math.PI) * 1.2, z)); }
        const cord = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 40, 0.018, 4, false); ephemeral.push(cord); mesh(festoon, cord, mat.cable, 0, 0, 0);
        for (let i = 1; i < 28; i += 2) { const v = points[i]; rod(festoon, v.toArray(), [v.x, v.y - 0.15, z], 0.018); mesh(festoon, sphereGeo, mat.glow, v.x, v.y - 0.21, z, 0.085, 0.12, 0.085); }
      }
      // Linen concession canopy and a small bar complete the physical scene.
      box(environment, mat.bark, -7.6, 0.75, 5, 2.7, 1.5, 1.15); box(environment, mat.brass, -7.6, 1.55, 5, 2.9, 0.12, 1.3);
      for (const x of [-9, -6.2]) rod(environment, [x, 0, 4.6], [x, 3.65, 4.6], 0.045, mat.brass);
      const awning = box(environment, mat.fabric, -7.6, 3.6, 4.85, 3.1, 0.06, 2); awning.rotation.z = -0.06;
      for (let i = 0; i < 6; i++) mesh(environment, cylinderGeo, mat.white, -8.5 + i * 0.32, 1.73, 5, 0.09, 0.26, 0.09);
      // Timber slats, an entry threshold and cable ramp make the setup legible up close.
      for (let i = 0; i < 11; i++) box(environment, mat.timber, -8.85 + i * .25, .77, 5.59, .14, 1.28, .035);
      box(environment, mat.stone, 0, .05, 9.1, 4.8, .16, .65);
      if (!isEmpty) box(equipment, mat.cable, 0, .08, 8.8, 2.7, .16, .24);
      if (!isEmpty) {
        const arrivals = new THREE.Group(); environment.add(arrivals);
        guest(arrivals, -5.7, 5.25, -.8, mat.fabric);
        guest(arrivals, -5.6, 6.3, .4, mat.leafLight);
        guest(arrivals, 4.8, 8, -1.2, mat.velvet);
      }
      const night = p.lighting === 'night'; ambient.intensity = night ? 1.15 : 2.1; sun.intensity = night ? 0.8 : 3; pools.forEach(l => { l.intensity = night ? 65 : 35; });
      renderer.toneMappingExposure = night ? 1.12 : 1.28;
      content.scale.setScalar(reduced.matches ? 1 : 0.975);
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let mode = 'orbit', separated = false, yaw = 0.66, pitch = 0.69, radius = 32.5, visible = true;
    let drag = null, frame = 0, disposed = false;
    const targetPosition = new THREE.Vector3();
    const orbitAxis = new THREE.Vector3(0,1,0);
    const look = new THREE.Vector3(0, 1.8, -0.5), targetLook = look.clone(), unitScale = new THREE.Vector3(1, 1, 1);
    camera.position.set(22, 22, 27); camera.lookAt(look);
    const onDown = e => { if (mode === 'plan' || e.target !== renderer.domElement || e.button !== 0) return; drag = { x: e.clientX, y: e.clientY }; if (e.pointerType !== 'touch') element.setPointerCapture?.(e.pointerId); element.classList.add('is-orbiting'); };
    const onMove = e => { if (!drag) return; yaw -= (e.clientX - drag.x) * 0.006; if (e.pointerType !== 'touch') pitch = THREE.MathUtils.clamp(pitch + (e.clientY - drag.y) * 0.004, 0.25, 1.22); drag = { x: e.clientX, y: e.clientY }; };
    const onUp = () => { drag = null; element.classList.remove('is-orbiting'); };
    const onLost = e => { e.preventDefault(); setStatus('failed'); };
    element.addEventListener('pointerdown', onDown); element.addEventListener('pointermove', onMove); element.addEventListener('pointerup', onUp); element.addEventListener('pointercancel', onUp);
    renderer.domElement.addEventListener('webglcontextlost', onLost);
    const resize = () => { const rect = element.getBoundingClientRect(); if (!rect.width || !rect.height) return; renderer.setSize(rect.width, rect.height, false); camera.aspect = rect.width / rect.height; camera.updateProjectionMatrix(); };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    const visibilityObserver = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting !== false; }); visibilityObserver.observe(element);
    runtime.current = { update: build, view: (v, ex) => { mode = v; separated = ex; }, rotate: delta => { yaw += delta; }, reset: () => { yaw = .66; pitch = .69; } };
    build(plan, empty);
    let first = true, previous = performance.now();
    function render(now) {
      if (disposed) return;
      if (document.hidden || !visible) { previous = now; frame = requestAnimationFrame(render); return; }
      const dt = Math.min((now - previous) / 1000, 0.05); previous = now;
      const amount = reduced.matches ? 1 : 1 - Math.exp(-dt * 7);
      const distance = camera.aspect < 0.8 ? radius * 1.2 : radius;
      targetLook.set(0, 1.8, -.5);
      if (activeShot.current) {
        const frame = activeShot.current; targetPosition.fromArray(frame.position); targetLook.fromArray(frame.target);
        const fit = Math.max(1, 1.25 / camera.aspect); targetPosition.sub(targetLook).applyAxisAngle(orbitAxis,yaw-.66).multiplyScalar(fit).add(targetLook);
      }
      else if (mode === 'plan') { targetPosition.set(0, distance + 2, .01); targetLook.set(0, 0, -.5); }
      else if (mode === 'audience' || mode === 'guest') { targetPosition.set(Math.sin(yaw - .66) * 6, 4.8, 14.5 + Math.max(0, 1.15 - camera.aspect) * 15); targetLook.set(0, 3.3, -7); }
      else if (mode === 'equipment') { targetPosition.set(Math.sin(yaw) * 22 * (camera.aspect < .9 ? 1.2 : 1), 14, Math.cos(yaw) * 23 * (camera.aspect < .9 ? 1.2 : 1)); targetLook.set(0, 1.8, 3); }
      else targetPosition.set(Math.sin(yaw) * Math.cos(pitch) * distance, Math.sin(pitch) * distance + 2, Math.cos(yaw) * Math.cos(pitch) * distance);
      const targetFov = activeShot.current?.fov || 37;
      if (Math.abs(camera.fov-targetFov)>.01) { camera.fov = THREE.MathUtils.lerp(camera.fov,targetFov,amount); camera.updateProjectionMatrix(); }
      look.lerp(targetLook, amount);
      camera.position.lerp(targetPosition, amount); camera.lookAt(look);
      overheadStructure.forEach(g => { g.visible = mode !== 'plan'; });
      for (const group of groups) group.position.y = THREE.MathUtils.lerp(group.position.y, separated ? group.userData.lift : 0, amount);
      content.scale.lerp(unitScale, amount);
      renderer.render(scene, camera);
      if (first) { first = false; setStatus('ready'); canvasReady.current?.(renderer.domElement); ready.current?.(() => { if (disposed) return null; renderer.render(scene, camera); return renderer.domElement.toDataURL('image/png'); }); }
      frame = requestAnimationFrame(render);
    }
    frame = requestAnimationFrame(render);
    return () => {
      disposed = true; canvasReady.current?.(null); cancelAnimationFrame(frame); observer.disconnect(); visibilityObserver.disconnect(); runtime.current = null;
      element.removeEventListener('pointerdown', onDown); element.removeEventListener('pointermove', onMove); element.removeEventListener('pointerup', onUp); element.removeEventListener('pointercancel', onUp);
      renderer.domElement.removeEventListener('webglcontextlost', onLost);
      content.traverse(obj => { if (obj.isInstancedMesh) obj.dispose(); });
      ephemeral.forEach(g => g.dispose()); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, []);

  useEffect(() => { runtime.current?.update(plan, empty); }, [plan.venue, plan.guests, plan.screen, plan.projector, plan.lighting, empty]);
  useEffect(() => { runtime.current?.view(cameraMode, exploded); }, [cameraMode, exploded]);

  return <div className="cinema-scene" data-scene-status={status}>
    <div className="cinema-scene__canvas" ref={host} />
    {showControls && status === 'ready' && cameraMode !== 'plan' && <div className="cinema-scene__camera" role="group" aria-label="Camera controls">
      <button type="button" title="Rotate view left" aria-label="Rotate view left" onClick={() => runtime.current?.rotate(-.3)}><RotateCcw size={16} /></button>
      <button type="button" title="Reset camera angle" aria-label="Reset camera angle" onClick={() => runtime.current?.reset()}><Focus size={16} /></button>
      <button type="button" title="Rotate view right" aria-label="Rotate view right" onClick={() => runtime.current?.rotate(.3)}><RotateCw size={16} /></button>
    </div>}
    {status === 'loading' && <div className="cinema-scene__loading" role="status"><span />Setting the scene…</div>}
    {status === 'failed' && <div className="cinema-scene__fallback" role="status"><span className="cinema-scene__fallback-line" />
      <strong>Your plan is available in 2D.</strong><p>The interactive 3D view needs WebGL. Use the guest count, equipment, availability and proposal controls to build and review your plan.</p>
      <small>{plan.guests || 80} guests · {plan.venue || 'courtyard'} · {plan.screen || 'standard'} screen</small>
    </div>}
  </div>;
}
