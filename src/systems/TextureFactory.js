// ============================================================
// Fábrica de texturas procedurales (Canvas 2D).
// No se carga ningún asset externo: todos los gráficos del
// juego se dibujan aquí una sola vez al arrancar.
// ============================================================

function cn(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  draw(ctx, w, h);
  tex.refresh();
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function radial(ctx, size, inner, mid, outer) {
  const g = ctx.createRadialGradient(size / 2, size / 2, 1, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.5, mid);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
}

// ---------- Danny ----------
function drawDanny(ctx, { leftLeg = 0, rightLeg = 0, arms = 0, eyesOpen = true } = {}) {
  ctx.clearRect(0, 0, 32, 32);

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(16, 29.5, 6.5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // piernas
  ctx.fillStyle = '#23262d';
  ctx.fillRect(12.5, 22 + leftLeg, 3.2, 6.5);
  ctx.fillRect(16.8, 22 + rightLeg, 3.2, 6.5);
  ctx.fillStyle = '#131417';
  ctx.fillRect(12.3, 27 + leftLeg, 3.6, 2);
  ctx.fillRect(16.6, 27 + rightLeg, 3.6, 2);

  // torso (suéter rojo)
  ctx.fillStyle = '#942418';
  rr(ctx, 10.2, 13.5, 11.6, 10, 3);
  ctx.fill();

  // brazos
  ctx.fillStyle = '#7e1f14';
  ctx.beginPath();
  ctx.arc(9.6, 16.5 + arms, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(22.4, 16.5 - arms, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // cuello de la camisa
  ctx.fillStyle = '#d8c8b0';
  ctx.fillRect(14.4, 13.2, 3.2, 1.6);

  // cabeza
  ctx.fillStyle = '#6b4429';
  ctx.beginPath();
  ctx.arc(16, 8.2, 4.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#eac7a1';
  ctx.beginPath();
  ctx.arc(16, 10.1, 4.1, 0, Math.PI * 2);
  ctx.fill();

  // ojos
  if (eyesOpen) {
    ctx.fillStyle = '#221610';
    ctx.fillRect(13.9, 9.7, 1.3, 1.6);
    ctx.fillRect(16.8, 9.7, 1.3, 1.6);
  } else {
    ctx.strokeStyle = '#221610';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(13.8, 10.4);
    ctx.lineTo(15.2, 10.4);
    ctx.moveTo(16.8, 10.4);
    ctx.lineTo(18.2, 10.4);
    ctx.stroke();
  }
}

// ---------- Fantasma ----------
function drawGhost(ctx, phase) {
  ctx.clearRect(0, 0, 32, 36);

  ctx.save();
  ctx.shadowColor = 'rgba(160,200,255,0.85)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = 'rgba(212,224,242,0.92)';
  const r = 8.5;
  ctx.beginPath();
  ctx.arc(16, 11, r, Math.PI, 0);
  ctx.lineTo(16 + r, 24);
  const waves = 4;
  const w = (2 * r) / waves;
  let x = 16 + r;
  for (let i = 0; i < waves; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const nx = x - w;
    ctx.quadraticCurveTo(x - w / 2, 24 + dir * (4 + Math.sin(phase + i) * 2.5), nx, 24);
    x = nx;
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = 'rgba(18,16,22,0.9)';
  ctx.beginPath();
  ctx.ellipse(12.6, 10.6, 1.7, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(19.4, 10.6, 1.7, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(16, 16.4, 1.5, 2.1, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(190,215,255,0.10)';
  ctx.beginPath();
  ctx.ellipse(16, 26, 9, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ---------- Gemelas ----------
function drawTwins(ctx) {
  ctx.clearRect(0, 0, 56, 56);
  ctx.save();
  ctx.shadowColor = 'rgba(160,200,255,0.9)';
  ctx.shadowBlur = 8;

  const girl = (ox) => {
    // piernas
    ctx.fillStyle = 'rgba(170,195,220,0.85)';
    ctx.fillRect(ox + 1, 34, 2.5, 9);
    ctx.fillRect(ox + 5.5, 34, 2.5, 9);
    // vestido
    ctx.fillStyle = 'rgba(185,210,235,0.9)';
    ctx.beginPath();
    ctx.moveTo(ox, 18);
    ctx.lineTo(ox + 9, 18);
    ctx.lineTo(ox + 12, 35);
    ctx.lineTo(ox - 3, 35);
    ctx.closePath();
    ctx.fill();
    // brazos
    ctx.strokeStyle = 'rgba(185,210,235,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox - 1, 20);
    ctx.lineTo(ox - 4, 30);
    ctx.moveTo(ox + 10, 20);
    ctx.lineTo(ox + 13, 30);
    ctx.stroke();
    // cabeza
    ctx.fillStyle = '#dbe6f2';
    ctx.beginPath();
    ctx.arc(ox + 4.5, 12, 4.6, 0, Math.PI * 2);
    ctx.fill();
    // pelo
    ctx.fillStyle = '#1f1a16';
    ctx.beginPath();
    ctx.arc(ox + 4.5, 10.5, 5, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(ox - 0.5, 10, 2, 7);
    ctx.fillRect(ox + 7.5, 10, 2, 7);
    // ojos
    ctx.fillStyle = '#0c0a08';
    ctx.fillRect(ox + 2.4, 11.2, 1.4, 1.8);
    ctx.fillRect(ox + 5.6, 11.2, 1.4, 1.8);
  };

  girl(16);
  girl(40);
  ctx.restore();
}

// ---------- Mobiliario ----------
function drawFurniture(scene) {
  cn(scene, 'dresser', 32, 32, (ctx) => {
    ctx.fillStyle = '#432a18';
    ctx.fillRect(3, 7, 26, 20);
    ctx.fillStyle = '#573a24';
    ctx.fillRect(3, 7, 26, 5);
    ctx.strokeStyle = '#2e1a0e';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 14, 20, 5);
    ctx.strokeRect(6, 21, 20, 5);
    ctx.fillStyle = '#caa24a';
    ctx.fillRect(14, 16, 3, 1.5);
    ctx.fillRect(14, 23, 3, 1.5);
    ctx.fillStyle = '#1c1008';
    ctx.fillRect(4, 27, 4, 3);
    ctx.fillRect(24, 27, 4, 3);
  });

  cn(scene, 'bed', 32, 32, (ctx) => {
    ctx.fillStyle = '#3a2416';
    ctx.fillRect(2, 2, 28, 6);
    ctx.fillStyle = '#7c7a74';
    ctx.fillRect(4, 8, 24, 22);
    ctx.fillStyle = '#cfc8bb';
    ctx.fillRect(7, 9, 18, 5);
    ctx.fillStyle = '#5b1e1e';
    ctx.fillRect(4, 15, 24, 15);
    ctx.strokeStyle = '#421515';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 18, 20, 10);
  });

  cn(scene, 'chair', 32, 32, (ctx) => {
    ctx.fillStyle = '#3a2312';
    ctx.fillRect(9, 4, 14, 7);
    ctx.fillStyle = '#4a2d1a';
    ctx.fillRect(8, 11, 16, 13);
    ctx.strokeStyle = '#2a170a';
    ctx.strokeRect(10, 13, 12, 9);
    ctx.fillStyle = '#241408';
    ctx.fillRect(9, 25, 3, 4);
    ctx.fillRect(20, 25, 3, 4);
  });

  cn(scene, 'table', 32, 32, (ctx) => {
    ctx.fillStyle = '#4e341f';
    ctx.beginPath();
    ctx.ellipse(16, 16, 13, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2c1a0d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(16, 16, 13, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#caa24a';
    ctx.beginPath();
    ctx.ellipse(16, 15, 2.5, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  cn(scene, 'sofa', 32, 32, (ctx) => {
    ctx.fillStyle = '#5a2222';
    rr(ctx, 3, 8, 26, 18, 6);
    ctx.fill();
    ctx.fillStyle = '#6b2b2b';
    rr(ctx, 5, 10, 22, 8, 4);
    ctx.fill();
    ctx.strokeStyle = '#3a1414';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(16, 10);
    ctx.lineTo(16, 18);
    ctx.moveTo(5, 18);
    ctx.lineTo(27, 18);
    ctx.stroke();
    ctx.fillStyle = '#2a0e0e';
    ctx.fillRect(4, 26, 4, 3);
    ctx.fillRect(24, 26, 4, 3);
  });

  cn(scene, 'painting', 26, 30, (ctx) => {
    ctx.fillStyle = '#8a6a2f';
    ctx.fillRect(0, 0, 26, 30);
    ctx.fillStyle = '#a8843c';
    ctx.fillRect(1, 1, 24, 28);
    ctx.fillStyle = '#232018';
    ctx.fillRect(3, 3, 20, 24);
    ctx.strokeStyle = '#6b5a4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(6, 20);
    ctx.lineTo(11, 10);
    ctx.lineTo(16, 17);
    ctx.lineTo(20, 8);
    ctx.stroke();
    ctx.fillStyle = '#7a1f16';
    ctx.beginPath();
    ctx.arc(14, 14, 2.4, 0, Math.PI * 2);
    ctx.fill();
  });

  cn(scene, 'redrum', 34, 30, (ctx) => {
    ctx.clearRect(0, 0, 34, 30);
    ctx.fillStyle = '#8f1810';
    ctx.font = 'bold 13px Georgia';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(17, 12);
    ctx.rotate(-0.05);
    ctx.fillText('RED', 0, 0);
    ctx.fillText('RUM', 0, 13);
    ctx.restore();
  });

  cn(scene, 'blood', 32, 32, (ctx) => {
    ctx.fillStyle = 'rgba(74,13,8,0.55)';
    ctx.beginPath();
    ctx.ellipse(15, 16, 8, 5.5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(22, 20, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(74,13,8,0.4)';
    for (let i = 0; i < 7; i++) {
      const a = i * 1.7;
      ctx.beginPath();
      ctx.arc(15 + Math.cos(a) * 9, 16 + Math.sin(a) * 7, 1 + (i % 3) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// ---------- Entorno ----------
function drawEnvironment(scene) {
  cn(scene, 'gradBg', 32, 512, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#050101');
    g.addColorStop(0.45, '#140505');
    g.addColorStop(0.78, '#2a0b08');
    g.addColorStop(1, '#060202');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 512);
  });

  cn(scene, 'floor', 32, 32, (ctx) => {
    ctx.fillStyle = '#60301a';
    ctx.fillRect(0, 0, 32, 32);

    // alfombra geométrica del Overlook
    ctx.strokeStyle = '#3a180b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(16, -2);
    ctx.lineTo(34, 16);
    ctx.lineTo(16, 34);
    ctx.lineTo(-2, 16);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = '#7a4423';
    ctx.lineWidth = 1;
    const d = 9;
    ctx.beginPath();
    ctx.moveTo(16, 16 - d);
    ctx.lineTo(16 + d, 16);
    ctx.lineTo(16, 16 + d);
    ctx.lineTo(16 - d, 16);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = 'rgba(192,122,60,0.75)';
    ctx.beginPath();
    ctx.moveTo(16, 12);
    ctx.lineTo(20, 16);
    ctx.lineTo(16, 20);
    ctx.lineTo(12, 16);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#33140a';
    const tri = (points) => {
      ctx.beginPath();
      ctx.moveTo(points[0], points[1]);
      ctx.lineTo(points[2], points[3]);
      ctx.lineTo(points[4], points[5]);
      ctx.closePath();
      ctx.fill();
    };
    tri([0, 0, 11, 0, 0, 11]);
    tri([32, 0, 21, 0, 32, 11]);
    tri([0, 32, 11, 32, 0, 21]);
    tri([32, 32, 21, 32, 32, 21]);

    ctx.fillStyle = 'rgba(20,8,4,0.18)';
    for (let i = 0; i < 14; i++) {
      ctx.fillRect((i * 7 + 3) % 32, (i * 11 + 5) % 32, 1, 1);
    }
  });

  cn(scene, 'stone', 32, 32, (ctx) => {
    ctx.fillStyle = '#262423';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#2e2b2a';
    ctx.fillRect(1, 1, 14, 14);
    ctx.fillStyle = '#232120';
    ctx.fillRect(17, 17, 14, 14);
    ctx.strokeStyle = '#141312';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 16.5);
    ctx.lineTo(32, 16.5);
    ctx.moveTo(16.5, 0);
    ctx.lineTo(16.5, 32);
    ctx.stroke();
  });

  cn(scene, 'wall', 32, 32, (ctx) => {
    ctx.fillStyle = '#241c18';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#2d231d';
    ctx.fillRect(0, 0, 32, 5);
    ctx.fillStyle = '#191210';
    ctx.fillRect(0, 5, 32, 2);
    ctx.fillStyle = '#1c1411';
    ctx.fillRect(0, 26, 32, 6);
    ctx.fillStyle = '#0f0a08';
    ctx.fillRect(0, 25, 32, 2);
    ctx.strokeStyle = '#1b1310';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0.5, 9);
    ctx.lineTo(0.5, 24);
    ctx.moveTo(31.5, 9);
    ctx.lineTo(31.5, 24);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,220,180,0.045)';
    ctx.fillRect(3, 10, 10, 3);
    ctx.fillRect(19, 19, 9, 2);
  });

  cn(scene, 'doorway', 32, 32, (ctx) => {
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = 'rgba(10,7,5,0.85)';
    ctx.fillRect(0, 24, 32, 8);
    ctx.fillStyle = '#33200f';
    ctx.fillRect(0, 0, 4, 32);
    ctx.fillRect(28, 0, 4, 32);
    ctx.fillStyle = '#4a2c16';
    ctx.beginPath();
    ctx.moveTo(5, 2);
    ctx.lineTo(14, 6);
    ctx.lineTo(14, 27);
    ctx.lineTo(5, 30);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2a170a';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#caa24a';
    ctx.beginPath();
    ctx.arc(12, 17, 1.4, 0, Math.PI * 2);
    ctx.fill();
  });

  cn(scene, 'exitDoor', 64, 32, (ctx) => {
    ctx.fillStyle = '#1c1512';
    ctx.fillRect(0, 0, 64, 32);
    ctx.fillStyle = '#0d0806';
    ctx.fillRect(4, 2, 56, 28);
    ctx.fillStyle = '#3b2414';
    ctx.fillRect(6, 4, 24, 26);
    ctx.fillRect(34, 4, 24, 26);
    ctx.strokeStyle = '#1e1108';
    ctx.lineWidth = 1;
    ctx.strokeRect(9, 8, 18, 20);
    ctx.strokeRect(37, 8, 18, 20);
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(29, 16, 2, 3);
    ctx.fillRect(33, 16, 2, 3);
    ctx.shadowColor = '#6dff9a';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#123b22';
    ctx.fillRect(26, 0, 12, 5);
    ctx.fillStyle = '#84ffb0';
    ctx.fillRect(28, 1, 8, 3);
    ctx.shadowBlur = 0;
  });

  cn(scene, 'lamp', 24, 24, (ctx) => {
    ctx.clearRect(0, 0, 24, 24);
    ctx.fillStyle = '#3a2c22';
    ctx.beginPath();
    ctx.arc(12, 12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#58422f';
    ctx.beginPath();
    ctx.arc(12, 12, 7, 0, Math.PI * 2);
    ctx.fill();
    const g = ctx.createRadialGradient(12, 12, 1, 12, 12, 6);
    g.addColorStop(0, 'rgba(255,238,190,1)');
    g.addColorStop(0.6, 'rgba(255,220,150,0.85)');
    g.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(12, 12, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  cn(scene, 'arrow', 26, 20, (ctx) => {
    ctx.clearRect(0, 0, 26, 20);
    ctx.fillStyle = 'rgba(217,176,100,0.95)';
    ctx.beginPath();
    ctx.moveTo(2, 2);
    ctx.lineTo(24, 10);
    ctx.lineTo(2, 18);
    ctx.lineTo(8, 10);
    ctx.closePath();
    ctx.fill();
  });

  cn(scene, 'orb', 64, 64, (ctx) => {
    radial(ctx, 64, 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0)');
  });

  cn(scene, 'lightPlayer', 340, 340, (ctx) => {
    radial(ctx, 340, 'rgba(255,246,235,1)', 'rgba(255,240,220,0.8)', 'rgba(255,235,215,0)');
  });
  cn(scene, 'lightLamp', 240, 240, (ctx) => {
    radial(ctx, 240, 'rgba(255,246,225,1)', 'rgba(255,238,205,0.7)', 'rgba(255,235,205,0)');
  });
  cn(scene, 'lightSmall', 160, 160, (ctx) => {
    radial(ctx, 160, 'rgba(255,255,255,1)', 'rgba(255,255,255,0.65)', 'rgba(255,255,255,0)');
  });
  cn(scene, 'lightTiny', 120, 120, (ctx) => {
    radial(ctx, 120, 'rgba(255,255,255,1)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0)');
  });

  cn(scene, 'vignette', 960, 640, (ctx) => {
    const g = ctx.createRadialGradient(480, 320, 200, 480, 320, 640);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.55, 'rgba(0,0,0,0.25)');
    g.addColorStop(1, 'rgba(0,0,0,0.88)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 960, 640);
  });
}

export function buildTextures(scene) {
  drawEnvironment(scene);
  drawFurniture(scene);

  // Danny: 4 frames de caminata + 2 de reposo
  cn(scene, 'playerWalk0', 32, 32, (ctx) => drawDanny(ctx, {}));
  cn(scene, 'playerWalk1', 32, 32, (ctx) => drawDanny(ctx, { leftLeg: -1.5, rightLeg: 1.5, arms: 1 }));
  cn(scene, 'playerWalk2', 32, 32, (ctx) => drawDanny(ctx, {}));
  cn(scene, 'playerWalk3', 32, 32, (ctx) => drawDanny(ctx, { leftLeg: 1.5, rightLeg: -1.5, arms: -1 }));
  cn(scene, 'playerIdle0', 32, 32, (ctx) => drawDanny(ctx, { eyesOpen: true }));
  cn(scene, 'playerIdle1', 32, 32, (ctx) => drawDanny(ctx, { eyesOpen: false }));

  // Fantasmas: 3 frames de ondulación
  cn(scene, 'ghost0', 32, 36, (ctx) => drawGhost(ctx, 0));
  cn(scene, 'ghost1', 32, 36, (ctx) => drawGhost(ctx, 1.6));
  cn(scene, 'ghost2', 32, 36, (ctx) => drawGhost(ctx, 3.2));

  cn(scene, 'twins', 56, 56, (ctx) => drawTwins(ctx));
}
