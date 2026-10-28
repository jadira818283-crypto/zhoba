/* BilimTech decorative animated network — offline, no third-party libraries */
(() => {
  'use strict';
  const canvas = document.getElementById('bilimtech-network');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d', {alpha:true});
  if (!ctx) return;
  const toggle = document.getElementById('network-control');
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = true;
  let raf = null;
  let frameTime = 0;
  let w = 0, h = 0, dpr = 1;
  let points = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, window.innerWidth);
    h = Math.max(1, window.innerHeight);
    canvas.width = Math.round(w*dpr);
    canvas.height = Math.round(h*dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(190, Math.max(78, Math.round(w*h / 9000)));
    points = Array.from({length:count}, (_,i) => ({
      x: Math.random()*w,
      y: Math.random()*h,
      vx: (Math.random()-.5)*1.46,
      vy: (Math.random()-.5)*1.46,
      r: Math.random()*1.7+1.15,
      tint: i % 6 === 0
    }));
    draw();
  }

  function draw() {
    ctx.clearRect(0,0,w,h);
    const reach = w < 700 ? 180 : 285;
    const reach2 = reach*reach;
    for (let i=0; i<points.length; i++) {
      const a = points[i];
      for (let j=i+1; j<points.length; j++) {
        const b = points[j];
        const dx=a.x-b.x, dy=a.y-b.y, ds=dx*dx+dy*dy;
        if (ds>=reach2) continue;
        const opacity=(1-Math.sqrt(ds)/reach)*.72 + .18;
        ctx.strokeStyle=i%3===0 ? `rgba(9,111,248,${opacity.toFixed(3)})` : `rgba(104,70,239,${opacity.toFixed(3)})`;
        ctx.lineWidth=1.42;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
    }
    for (const p of points) {
      // Soft halo makes the moving connection points visible even on pale sections.
      ctx.beginPath();
      ctx.fillStyle=p.tint?'rgba(0,193,255,.22)':'rgba(116,85,255,.25)';
      ctx.arc(p.x,p.y,p.r*3.4,0,Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle=p.tint?'rgba(1,164,247,.98)':'rgba(98,55,236,.98)';
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    }
  }

  function tick(now) {
    raf = null;
    if (!enabled || document.hidden || (reduced && reduced.matches)) return;
    // Faster motion: roughly up to 48 updates/second while staying smooth.
    if (now-frameTime>20) {
      frameTime=now;
      for (const p of points) {
        p.x+=p.vx;p.y+=p.vy;
        if (p.x < -10 || p.x > w+10) p.vx*=-1;
        if (p.y < -10 || p.y > h+10) p.vy*=-1;
      }
      draw();
    }
    raf=requestAnimationFrame(tick);
  }
  function start() {
    if (raf===null && enabled && !document.hidden && !(reduced&&reduced.matches))
      raf=requestAnimationFrame(tick);
  }
  function stop() {if(raf!==null){cancelAnimationFrame(raf);raf=null;}}
  if(toggle) toggle.addEventListener('click', () => {
    enabled=!enabled;
    toggle.setAttribute('aria-pressed',String(enabled));
    toggle.textContent=enabled?'✦ 3D анимация':'○ 3D анимация';
    if(enabled) start(); else stop();
  });
  window.addEventListener('resize', () => {resize();start();}, {passive:true});
  document.addEventListener('visibilitychange', () => {if(document.hidden) stop();else start();});
  if(reduced && reduced.addEventListener) reduced.addEventListener('change',()=>{stop();draw();start();});
  resize();start();
})();
