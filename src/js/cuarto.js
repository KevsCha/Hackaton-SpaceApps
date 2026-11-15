import * as THREE from "three";

/* =====================================================
   CREW · Astronaut interface (prototype)
   All data is SIMULATED. To connect real data, replace the
   simulate() function with your source (API, WebSocket, model).
   ===================================================== */

const CONFIG = {
  firstName: 'Ericka',
  fullName: 'Ericka Alexis Venegas Gonzalez',
  subjectId: 'ASTRO-772',
  missionStart: { d: 42, h: 18, m: 55, s: 9 },
  tickMs: 1000,
  // Indicative ranges; the mission medical team should set these
  ranges: {
    hr:   { warnLo: 55, warnHi: 100 },
    spo2: { warnLo: 95 },
    temp: { warnLo: 36.0, warnHi: 37.5 },
    sys:  { warnHi: 130 },
    glu:  { warnLo: 70, warnHi: 125 }
  }
};

/* ---------- Utilities ---------- */
const $ = (id) => document.getElementById(id);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rnd = (lo, hi) => lo + Math.random() * (hi - lo);
const fmt = (n, d = 1) => n.toFixed(d);
const pad = (n, w = 2) => String(n).padStart(w, '0');

/* ---------- State ---------- */
const S = {
  hr: 72, hrBuf: Array.from({ length: 40 }, (_, i) => 72 + Math.sin(i / 3) * 3 + (Math.random() - 0.5) * 2),
  spo2: 99, temp: 36.8,
  sys: 118, dia: 76,
  glu: 94, gluBuf: [92, 97, 90, 99, 95, 91, 94],
  bone: 2.9, boneBase: 3.0,
  moodScore: 3,
  sleepMin: 6 * 60 + 24,
  radToday: 1.8, radCum: 198, radLimit: 600,
  battery: 82,
  lag: 42,
  elapsed: CONFIG.missionStart.d * 86400 + CONFIG.missionStart.h * 3600 + CONFIG.missionStart.m * 60 + CONFIG.missionStart.s,
  log: []
};

/* ---------- Header and photo ---------- */
$('subjectId').textContent = CONFIG.subjectId + ' / ' + CONFIG.fullName;
$('bubbleHi').textContent = 'Hi, ' + CONFIG.firstName;
// $('photo').alt = 'Portrait of ' + CONFIG.fullName;

/* ---------- Build dynamic elements ---------- */
const gluBars = $('gluBars');
for (let i = 0; i < 7; i++) gluBars.appendChild(document.createElement('i'));

const tempSegs = $('tempSegs');
for (let i = 0; i < 12; i++) tempSegs.appendChild(document.createElement('i'));

const moodDots = $('moodDots');
for (let i = 0; i < 5; i++) moodDots.appendChild(document.createElement('i'));

/* ---------- Status (text + colour, never colour alone) ---------- */
function setStatus(el, level, text) {
  el.textContent = text;
  el.classList.toggle('warn', level === 'warn');
  el.classList.toggle('alert', level === 'alert');
}

/* ---------- Render ---------- */
function render() {
  // Heart rate
  $('hr').textContent = Math.round(S.hr);
  const pts = S.hrBuf.map((v, i) => {
    const x = (i / (S.hrBuf.length - 1)) * 200;
    const y = 60 - ((clamp(v, 55, 95) - 55) / 40) * 50 - 5;
    return x.toFixed(1) + ',' + y.toFixed(1);
  });
  $('hrLine').setAttribute('points', pts.join(' '));
  $('hrArea').setAttribute('points', '0,60 ' + pts.join(' ') + ' 200,60');

  // Blood pressure
  $('bp').textContent = Math.round(S.sys) + '/' + Math.round(S.dia);
  $('bpBar').style.width = clamp((S.sys / 180) * 100, 0, 100) + '%';
  const bpOk = S.sys < CONFIG.ranges.sys.warnHi;
  setStatus($('bpStatus'), bpOk ? 'ok' : 'warn', bpOk ? 'STATUS: NOMINAL' : 'STATUS: ELEVATED · WATCH');

  // Glucose
  $('glu').textContent = Math.round(S.glu);
  [...gluBars.children].forEach((b, i) => {
    const v = S.gluBuf[i];
    b.style.height = clamp(((v - 70) / 60) * 100, 12, 100) + '%';
  });

  // Bone mass (estimated)
  $('bone').textContent = fmt(S.bone, 2);
  const pct = (S.bone / S.boneBase) * 100;
  $('boneBar').style.width = clamp(pct, 0, 100) + '%';
  const drop = 100 - pct;
  const boneLevel = drop > 5 ? 'alert' : drop > 2 ? 'warn' : 'ok';
  setStatus($('boneStatus'), boneLevel,
    boneLevel === 'ok' ? 'STATUS: NOMINAL' : 'STATUS: ' + (boneLevel === 'warn' ? 'WATCH' : 'ATTENTION') + ' · −' + Math.round(drop) + '% VS. BASELINE');
  $('boneBar').style.background = boneLevel === 'ok' ? '' : (boneLevel === 'warn' ? 'var(--amber)' : 'var(--red)');

  // SpO2
  $('spo2').textContent = Math.round(S.spo2);
  $('spo2Bar').style.width = clamp(S.spo2, 0, 100) + '%';

  // Temperature
  $('temp').textContent = fmt(S.temp, 1);
  const idx = clamp(Math.round(((S.temp - 36.0) / 1.6) * 11), 0, 11);
  [...tempSegs.children].forEach((s, i) => s.classList.toggle('on', i === idx || i === idx + 1));

  // Mood
  [...moodDots.children].forEach((d, i) => d.classList.toggle('on', i < S.moodScore));
  moodDots.setAttribute('aria-label', 'Mood ' + S.moodScore + ' of 5');

  // Sleep
  const h = Math.floor(S.sleepMin / 60), m = S.sleepMin % 60;
  $('sleep').textContent = pad(h) + ':' + pad(m);
  const sleepOk = S.sleepMin >= 420;
  setStatus($('sleepStatus'), sleepOk ? 'ok' : 'warn', sleepOk ? 'WITHIN RECOMMENDED RANGE (7 TO 9 H)' : 'BELOW RECOMMENDED RANGE (7 TO 9 H)');

  // Radiation
  $('rad').textContent = fmt(S.radToday, 1);
  $('radBar').style.width = clamp((S.radCum / S.radLimit) * 100, 0, 100) + '%';
  $('radCum').textContent = 'CUMULATIVE: ' + Math.round(S.radCum) + ' mSv';

  // Header
  const d = Math.floor(S.elapsed / 86400);
  const r = S.elapsed % 86400;
  $('met').textContent = pad(d, 3) + ':' + pad(Math.floor(r / 3600)) + ':' + pad(Math.floor((r % 3600) / 60)) + ':' + pad(r % 60);
  $('battery').setAttribute('aria-label', 'Battery ' + Math.round(S.battery) + '%');
  $('batFill').setAttribute('width', String(Math.max(1, Math.round(11 * S.battery / 100))));
  $('uplink').textContent = 'SATELLITE UPLINK (LAG ' + Math.round(S.lag) + ' MS)';
}

/* ---------- Simulation (replace with real data) ---------- */
let tickCount = 0;
function simulate() {
  tickCount++;
  S.elapsed += 1;

  S.hr = clamp(S.hr + rnd(-2, 2), 64, 82);
  S.hrBuf.push(S.hr); S.hrBuf.shift();

  S.spo2 = clamp(S.spo2 + rnd(-0.4, 0.4), 97, 99.4);
  S.temp = clamp(S.temp + rnd(-0.03, 0.03), 36.5, 37.1);
  S.sys = clamp(S.sys + rnd(-1, 1), 112, 124);
  S.dia = clamp(S.dia + rnd(-1, 1), 72, 82);

  if (tickCount % 5 === 0) {
    S.glu = clamp(S.glu + rnd(-3, 3), 86, 104);
    S.gluBuf.push(S.glu); S.gluBuf.shift();
    S.lag = clamp(S.lag + rnd(-3, 3), 36, 52);
  }
  if (tickCount % 20 === 0) S.battery = clamp(S.battery - 0.05, 5, 100);
  S.radCum += 1.8 / 86400;

  // Log row for export
  S.log.push({
    t: new Date().toISOString(),
    met: $('met').textContent,
    hr: Math.round(S.hr), spo2: +S.spo2.toFixed(1), temp: +S.temp.toFixed(2),
    sys: Math.round(S.sys), dia: Math.round(S.dia), glu: Math.round(S.glu),
    bone_kg: +S.bone.toFixed(2), mood: S.moodScore, sleep_min: S.sleepMin
  });
  if (S.log.length > 900) S.log.shift();

  render();
}

/* ---------- Assistant (sample replies, no real AI) ---------- */
const bubbleMsg = $('bubbleMsg');
const quick = $('quick');

function say(text) { bubbleMsg.textContent = text; }

const REPLIES = [
  { re: /(sleep|slept|rest|insomnia|tired|nap)/i,
    text: 'You slept 6 h 24 min, below your baseline. Try: screens off 45 min before bed, warm light in the cabin, and resistance exercise earlier in the day. Shall I schedule it?' },
  { re: /(bone|hip|femur|density|calcium|exercise|resistance|workout)/i,
    text: 'Your estimated hip bone density is down 3% from baseline. There is no DXA on board, so this is a model estimate. The best response is completing all 3 weekly resistance sessions; you have done 2 this week.' },
  { re: /(mood|sad|stress|anxi|lonely|alone|miss my|homesick)/i,
    text: 'Your mood has been trending down for 3 days. That is common on long transits. I can guide you through a 5-minute breathing break, or alert a crewmate or Ground if you would rather talk to a person.' },
  { re: /(radiation|dose|sievert|msv)/i,
    text: 'Today you are at 1.8 mSv with about 198 mSv cumulative, roughly a third of the 600 mSv career limit. The module shielding is operating at 98%.' },
  { re: /(report|ground|doctor|flight|medical|surgeon)/i,
    text: 'I have prepared a report for the flight surgeon with your trends from the last 2 weeks. It will be sent as soon as a stable link is available.' }
];
const CRISIS = /(can'?t go on|hurt myself|want to die|end it all|kill myself|suicid)/i;

function reply(text) {
  if (CRISIS.test(text)) {
    say('I am sorry you are going through this, and I am glad you told me. I do not want you to face it alone: alert a crewmate now or contact the medical team on Ground. I am here with you in the meantime.');
    return;
  }
  const hit = REPLIES.find((r) => r.re.test(text));
  say(hit ? hit.text : 'I can help with your sleep, bones, mood, radiation, or prepare a report for Ground. Where shall we start?');
}

const QUICK = ['Review my sleep', 'Check my bones', 'Breathing break', 'Talk to a person'];
QUICK.forEach((label) => {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = label;
  b.addEventListener('click', () => {
    if (label === 'Breathing break') {
      say('Here we go: inhale for 4 seconds, hold for 4, exhale for 6. Repeat 5 times. When you finish, tell me how you feel.');
    } else if (label === 'Talk to a person') {
      say('Understood. I am alerting the crewmate on duty and leaving a message for the medical team on Ground for when the link is up.');
    } else {
      reply(label);
    }
  });
  quick.appendChild(b);
});

$('askForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('askInput');
  const text = input.value.trim();
  if (!text) return;
  reply(text);
  input.value = '';
});

say('I noticed your mood has dropped 3 days in a row and you are sleeping less than usual. Shall we review your sleep protocol?');

/* ---------- Bottom bar buttons ---------- */
$('scanBtn').addEventListener('click', () => {
  const btn = $('scanBtn');
  btn.disabled = true;
  let p = 0;
  const id = setInterval(() => {
    p += 8;
    btn.textContent = 'SCANNING… ' + Math.min(p, 100) + '%';
    if (p >= 100) {
      clearInterval(id);
      btn.disabled = false;
      btn.textContent = 'FULL BODY SCAN';
      say('Scan complete (simulated): no new findings. Hip and femur remain on watch; everything else is within your baseline.');
    }
  }, 240);
});

$('exportBtn').addEventListener('click', () => {
  if (!S.log.length) return;
  const cols = Object.keys(S.log[0]);
  const csv = [cols.join(',')].concat(S.log.map((r) => cols.map((c) => r[c]).join(','))).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'logs_' + CONFIG.subjectId + '.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

/* ---------- Start ---------- */
render();
setInterval(simulate, CONFIG.tickMs);



import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const container = document.getElementById("canvas-container");

const scene = new THREE.Scene();

// Cámara
const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.01,
  1000
);

// Renderizador
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Controles
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Iluminación
scene.add(new THREE.AmbientLight(0xffffff, 2));

const frontLight = new THREE.DirectionalLight(0xffffff, 2);
frontLight.position.set(0, 5, 5);
scene.add(frontLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 1);
fillLight.position.set(-5, 0, 2);
scene.add(fillLight);

// Cargar corazón
const loader = new GLTFLoader();




async function cargarModeloAleatorio() {

  try {

    const respuesta = await fetch("/src/models/modelos.json");
    if (!respuesta.ok) {
      throw new Error("Error leyendo JSON: " + respuesta.status);
    }

    const datos = await respuesta.json();

    const modelos = datos.modelos;

    const indice = Math.floor(Math.random() * modelos.length);
    const seleccionado = modelos[indice];

    console.log("Seleccionado:", seleccionado.nombre);
    console.log("Ruta:", seleccionado.archivo);

    loader.load(

      seleccionado.archivo,

      (gltf) => {

        const corazon = gltf.scene;

        // EXACTAMENTE EL MÉTODO QUE TE FUNCIONABA

        const box = new THREE.Box3().setFromObject(corazon);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        console.log("Dimensiones:", size);

        const maxDim = Math.max(size.x, size.y, size.z);

        if (!Number.isFinite(maxDim) || maxDim <= 0) {
          console.error("Modelo sin dimensiones válidas");
          return;
        }

        const scale = 2.0 / maxDim;

        corazon.scale.set(scale, scale, scale);
        corazon.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

        scene.add(corazon);
     


// Mostrar posición y escala
console.log("Posición:", corazon.position);
console.log("Escala:", corazon.scale);
console.log("Cámara:", camera.position);

        // Ajustar cámara
        const finalBox = new THREE.Box3().setFromObject(corazon);

        const sphere = finalBox.getBoundingSphere(
          new THREE.Sphere()
        );

        const radius = sphere.radius;

        camera.position.set(0, 0, radius * 3.5);

        camera.near = 0.01;
        camera.far = 1000;
        camera.updateProjectionMatrix();

        controls.target.set(0, 0, 0);
        controls.update();

        console.log("MODELO AÑADIDO A LA ESCENA:", seleccionado.nombre);

      },

      () => {
        console.log("Cargando modelo...");
      },

      (error) => {
        console.error("Error GLB:", error);
      }

    );

  } catch (error) {

    console.error("Error:", error);

  }

}

cargarModeloAleatorio();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});