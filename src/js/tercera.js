/* =====================================================
   CREW · Interfaz del astronauta (prototipo)
   Todos los datos son SIMULADOS. Para conectar datos reales,
   sustituye la función simulate() por tu fuente (API, WebSocket, modelo).
   ===================================================== */

const CONFIG = {
  firstName: 'Ericka',
  fullName: 'Ericka Alexis Venegas Gonzalez',
  subjectId: 'ASTRO-772',
  photo: 'assets/astronaut.jpg',          // pon aquí tu foto (opcional)
  missionStart: { d: 42, h: 18, m: 55, s: 9 },
  tickMs: 1000,
  // Rangos orientativos; deben ajustarlos los médicos de la misión
  ranges: {
    hr:   { warnLo: 55, warnHi: 100 },
    spo2: { warnLo: 95 },
    temp: { warnLo: 36.0, warnHi: 37.5 },
    sys:  { warnHi: 130 },
    glu:  { warnLo: 70, warnHi: 125 }
  }
};

/* ---------- Utilidades ---------- */
const $ = (id) => document.getElementById(id);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rnd = (lo, hi) => lo + Math.random() * (hi - lo);
const fmt = (n, d = 1) => n.toFixed(d).replace('.', ',');
const pad = (n, w = 2) => String(n).padStart(w, '0');

/* ---------- Estado ---------- */
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

/* ---------- Cabecera y foto ---------- */
$('subjectId').textContent = CONFIG.subjectId + ' / ' + CONFIG.fullName;
$('bubbleHi').textContent = 'Hola, ' + CONFIG.firstName;

(function loadPhoto() {
  const img = $('photo');
  img.onload = () => { img.hidden = false; $('avatar').style.display = 'none'; img.alt = 'Retrato de ' + CONFIG.fullName; };
  img.onerror = () => { img.hidden = true; };
  img.src = CONFIG.photo;
})();

/* ---------- Construcción de elementos dinámicos ---------- */
const gluBars = $('gluBars');
for (let i = 0; i < 7; i++) gluBars.appendChild(document.createElement('i'));

const tempSegs = $('tempSegs');
for (let i = 0; i < 12; i++) tempSegs.appendChild(document.createElement('i'));

const moodDots = $('moodDots');
for (let i = 0; i < 5; i++) moodDots.appendChild(document.createElement('i'));

/* ---------- Estados (semáforo con texto) ---------- */
function setStatus(el, level, text) {
  el.textContent = text;
  el.classList.toggle('warn', level === 'warn');
  el.classList.toggle('alert', level === 'alert');
}

/* ---------- Render ---------- */
function render() {
  // Frecuencia cardiaca
  $('hr').textContent = Math.round(S.hr);
  const pts = S.hrBuf.map((v, i) => {
    const x = (i / (S.hrBuf.length - 1)) * 200;
    const y = 60 - ((clamp(v, 55, 95) - 55) / 40) * 50 - 5;
    return x.toFixed(1) + ',' + y.toFixed(1);
  });
  $('hrLine').setAttribute('points', pts.join(' '));
  $('hrArea').setAttribute('points', '0,60 ' + pts.join(' ') + ' 200,60');

  // Presión arterial
  $('bp').textContent = Math.round(S.sys) + '/' + Math.round(S.dia);
  $('bpBar').style.width = clamp((S.sys / 180) * 100, 0, 100) + '%';
  const bpOk = S.sys < CONFIG.ranges.sys.warnHi;
  setStatus($('bpStatus'), bpOk ? 'ok' : 'warn', bpOk ? 'ESTADO: NOMINAL' : 'ESTADO: ELEVADA · VIGILAR');

  // Glucosa
  $('glu').textContent = Math.round(S.glu);
  [...gluBars.children].forEach((b, i) => {
    const v = S.gluBuf[i];
    b.style.height = clamp(((v - 70) / 60) * 100, 12, 100) + '%';
  });

  // Masa ósea (estimada)
  $('bone').textContent = fmt(S.bone, 2);
  const pct = (S.bone / S.boneBase) * 100;
  $('boneBar').style.width = clamp(pct, 0, 100) + '%';
  const drop = 100 - pct;
  const boneLevel = drop > 5 ? 'alert' : drop > 2 ? 'warn' : 'ok';
  setStatus($('boneStatus'), boneLevel,
    boneLevel === 'ok' ? 'ESTADO: NOMINAL' : 'ESTADO: ' + (boneLevel === 'warn' ? 'VIGILAR' : 'ATENCIÓN') + ' · −' + Math.round(drop) + ' % VS. LÍNEA BASE');
  $('boneBar').style.background = boneLevel === 'ok' ? '' : (boneLevel === 'warn' ? 'var(--amber)' : 'var(--red)');

  // SpO2
  $('spo2').textContent = Math.round(S.spo2);
  $('spo2Bar').style.width = clamp(S.spo2, 0, 100) + '%';

  // Temperatura
  $('temp').textContent = fmt(S.temp, 1);
  const idx = clamp(Math.round(((S.temp - 36.0) / 1.6) * 11), 0, 11);
  [...tempSegs.children].forEach((s, i) => s.classList.toggle('on', i === idx || i === idx + 1));

  // Ánimo
  [...moodDots.children].forEach((d, i) => d.classList.toggle('on', i < S.moodScore));
  moodDots.setAttribute('aria-label', 'Ánimo ' + S.moodScore + ' de 5');

  // Sueño
  const h = Math.floor(S.sleepMin / 60), m = S.sleepMin % 60;
  $('sleep').textContent = pad(h) + ':' + pad(m);
  const sleepOk = S.sleepMin >= 420;
  setStatus($('sleepStatus'), sleepOk ? 'ok' : 'warn', sleepOk ? 'DENTRO DE LO RECOMENDADO (7 A 9 H)' : 'POR DEBAJO DE LO RECOMENDADO (7 A 9 H)');

  // Radiación
  $('rad').textContent = fmt(S.radToday, 1);
  $('radBar').style.width = clamp((S.radCum / S.radLimit) * 100, 0, 100) + '%';
  $('radCum').textContent = 'ACUMULADA: ' + Math.round(S.radCum) + ' mSv';

  // Cabecera
  const d = Math.floor(S.elapsed / 86400);
  const r = S.elapsed % 86400;
  $('met').textContent = pad(d, 3) + ':' + pad(Math.floor(r / 3600)) + ':' + pad(Math.floor((r % 3600) / 60)) + ':' + pad(r % 60);
  $('battery').setAttribute('aria-label', 'Batería ' + Math.round(S.battery) + ' %');
  $('batFill').setAttribute('width', String(Math.max(1, Math.round(11 * S.battery / 100))));
  $('uplink').textContent = 'ENLACE SATELITAL (LAG ' + Math.round(S.lag) + ' MS)';
}

/* ---------- Simulación (sustituir por datos reales) ---------- */
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

  // Registro para exportar
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

/* ---------- Asistente (respuestas de ejemplo, sin IA real) ---------- */
const bubbleMsg = $('bubbleMsg');
const quick = $('quick');

function say(text) { bubbleMsg.textContent = text; }

const REPLIES = [
  { re: /(sue[ñn]o|dorm|descans|insomn)/i,
    text: 'Has dormido 6 h 24 min, por debajo de tu línea base. Te propongo: pantallas fuera 45 min antes, luz cálida en la cabina y ejercicio de resistencia antes de la tarde. ¿Lo programo?' },
  { re: /(hueso|cadera|f[eé]mur|densidad|calcio|ejercicio|resistencia)/i,
    text: 'La estimación ósea de cadera baja un 3 % respecto a tu línea base. No hay DXA a bordo, así que es una estimación. La mejor respuesta es completar las 3 sesiones de resistencia semanales; esta semana llevas 2.' },
  { re: /(ánimo|animo|triste|estres|estrés|ansied|solo|sola|echo de menos)/i,
    text: 'Tu ánimo lleva 3 días a la baja. Es frecuente en tránsitos largos. Puedo guiarte en una pausa de respiración de 5 minutos, o avisar a un compañero o a Tierra si prefieres hablarlo con una persona.' },
  { re: /(radiaci|dosis|sievert|msv)/i,
    text: 'Hoy llevas 1,8 mSv y unos 198 mSv acumulados, un tercio del límite de carrera de 600 mSv. El blindaje del módulo funciona al 98 %.' },
  { re: /(informe|tierra|m[eé]dico|doctor|flight)/i,
    text: 'He dejado un informe preparado para la flight surgeon con tus tendencias de las últimas 2 semanas. Se enviará en cuanto haya enlace estable.' }
];
const CRISIS = /(no puedo m[aá]s|hacerme da[ñn]o|quiero morir|acabar con todo|suicid)/i;

function reply(text) {
  if (CRISIS.test(text)) {
    say('Siento que estés pasando por esto, y me alegra que me lo cuentes. No quiero que lo afrontes solo/a: avisa ahora a un compañero o contacta con el equipo médico de Tierra. Estoy aquí contigo mientras tanto.');
    return;
  }
  const hit = REPLIES.find((r) => r.re.test(text));
  say(hit ? hit.text : 'Puedo ayudarte con tu sueño, tus huesos, tu ánimo, la radiación o preparar un informe para Tierra. ¿Por dónde empezamos?');
}

const QUICK = ['Revisar mi sueño', 'Estado de mis huesos', 'Pausa de respiración', 'Hablar con una persona'];
QUICK.forEach((label) => {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = label;
  b.addEventListener('click', () => {
    if (label === 'Pausa de respiración') {
      say('Vamos allá: inhala 4 segundos, mantén 4, exhala 6. Repite 5 veces. Cuando termines, dime cómo te sientes.');
    } else if (label === 'Hablar con una persona') {
      say('Entendido. Aviso al compañero de guardia y dejo un mensaje al equipo médico de Tierra para cuando haya enlace.');
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

say('He notado que tu ánimo ha bajado 3 días seguidos y que duermes menos de lo habitual. ¿Revisamos tu protocolo de sueño?');

/* ---------- Botones de la barra ---------- */
$('scanBtn').addEventListener('click', () => {
  const btn = $('scanBtn');
  btn.disabled = true;
  let p = 0;
  const id = setInterval(() => {
    p += 8;
    btn.textContent = 'ESCANEANDO… ' + Math.min(p, 100) + ' %';
    if (p >= 100) {
      clearInterval(id);
      btn.disabled = false;
      btn.textContent = 'ESCANEO CORPORAL';
      say('Escaneo completo (simulado): sin hallazgos nuevos. Cadera y fémur siguen en vigilancia; el resto, dentro de tu línea base.');
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
  a.download = 'registros_' + CONFIG.subjectId + '.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

/* ---------- Arranque ---------- */
render();
setInterval(simulate, CONFIG.tickMs);