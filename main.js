// Arcane Dodger - simple endless dodger + shooting
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 800; canvas.height = 600;

let state = {running:false,score:0,player:{x:380,y:520,w:40,h:40,dx:0},bullets:[],enemies:[],spawnTimer:0,keys:{}};

document.getElementById('startBtn').addEventListener('click', startGame);
document.addEventListener('keydown', e=> state.keys[e.key]=true);
document.addEventListener('keyup', e=> state.keys[e.key]=false);
canvas.addEventListener('touchstart', e=>{ const t=e.touches[0]; state.player.x = Math.max(0, Math.min(canvas.width-state.player.w, t.clientX - canvas.getBoundingClientRect().left)); });

function startGame(){
  state.running=true; state.score=0; state.bullets=[]; state.enemies=[]; state.spawnTimer=0;
  state.player.x = 380; state.player.y = 520;
  last = performance.now(); requestAnimationFrame(loop);
}

function loop(ts){
  if(!state.running) return;
  const dt = Math.min(40, ts - (window.last||ts)); window.last = ts;
  update(dt/1000); draw();
  requestAnimationFrame(loop);
}

function update(dt){
  // input
  if(state.keys['ArrowLeft']) state.player.x -= 400*dt;
  if(state.keys['ArrowRight']) state.player.x += 400*dt;
  if(state.keys[' ']) shoot();
  state.player.x = Math.max(0, Math.min(canvas.width-state.player.w, state.player.x));
  // bullets
  for(let b of state.bullets) b.y -= 600*dt;
  state.bullets = state.bullets.filter(b=>b.y> -10);
  // enemies
  state.spawnTimer -= dt;
  if(state.spawnTimer <= 0){
    state.spawnTimer = 0.6 - Math.min(0.45, state.score/200);
    const ex = Math.random()*(canvas.width-40);
    state.enemies.push({x:ex,y:-40,w:40,h:40,vy:100+Math.random()*120});
  }
  for(let e of state.enemies) e.y += e.vy*dt;
  // collisions bullet-enemy
  for(let i=state.enemies.length-1;i>=0;i--){
    const e = state.enemies[i];
    for(let j=state.bullets.length-1;j>=0;j--){
      const b = state.bullets[j];
      if(collide(e,b)){ state.enemies.splice(i,1); state.bullets.splice(j,1); state.score += 10; document.getElementById('score').innerText = 'Score: ' + state.score; break;}
    }
  }
  // enemy-player collision or offscreen
  for(let i=state.enemies.length-1;i>=0;i--){
    const e = state.enemies[i];
    if(collide(e,state.player)){ endGame(); return; }
    if(e.y > canvas.height+50){ state.enemies.splice(i,1); state.score += 1; document.getElementById('score').innerText = 'Score: ' + state.score; }
  }
}

function shoot(){
  const now = performance.now();
  if(state.lastShoot && now - state.lastShoot < 180) return;
  state.lastShoot = now;
  state.bullets.push({x: state.player.x + state.player.w/2 - 4, y: state.player.y - 8, w:8, h:16});
}

function collide(a,b){
  return a.x < b.x + (b.w||0) && a.x + a.w > b.x && a.y < b.y + (b.h||0) && a.y + a.h > b.y;
}

function endGame(){
  state.running=false;
  alert('Game Over — Score: ' + state.score);
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // background stars
  for(let i=0;i<80;i++){
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect((i*47)%canvas.width, (i*89)%canvas.height, 2,2);
  }
  // player
  ctx.fillStyle = '#8be9fd';
  ctx.fillRect(state.player.x, state.player.y, state.player.w, state.player.h);
  // bullets
  ctx.fillStyle = '#ffd166';
  for(let b of state.bullets) ctx.fillRect(b.x,b.y,b.w,b.h);
  // enemies
  ctx.fillStyle = '#ff6b6b';
  for(let e of state.enemies) ctx.fillRect(e.x,e.y,e.w,e.h);
}
