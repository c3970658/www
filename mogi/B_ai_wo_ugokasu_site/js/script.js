const toast = document.getElementById('toast');
function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(window.__toastTimer);
  window.__toastTimer = window.setTimeout(()=>toast.classList.remove('show'), 2200);
}

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuToggle?.addEventListener('click',()=>{
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded','false');
}));

const sodaGlass = document.getElementById('sodaGlass');
const colorName = document.getElementById('colorName');
const colorDescription = document.getElementById('colorDescription');
const colorButtons = [...document.querySelectorAll('.color-dot')];
let currentColorIndex = 0;
let autoColorTimer;

function applySodaColor(button, manual = false){
  if(!button || !sodaGlass) return;
  colorButtons.forEach(b=>b.classList.remove('active'));
  button.classList.add('active');
  sodaGlass.className = `soda-glass ${button.dataset.color} switching`;
  colorName.textContent = button.dataset.name;
  colorDescription.textContent = button.dataset.desc;
  currentColorIndex = colorButtons.indexOf(button);
  window.clearTimeout(window.__sodaSwitchTimer);
  window.__sodaSwitchTimer = window.setTimeout(()=>sodaGlass.classList.remove('switching'), 520);

  if(manual){
    window.clearInterval(autoColorTimer);
    autoColorTimer = window.setInterval(cycleSodaColor, 5200);
  }
}

function cycleSodaColor(){
  if(!colorButtons.length) return;
  currentColorIndex = (currentColorIndex + 1) % colorButtons.length;
  applySodaColor(colorButtons[currentColorIndex]);
}

colorButtons.forEach(button=>button.addEventListener('click',()=>applySodaColor(button, true)));
if(colorButtons.length){
  autoColorTimer = window.setInterval(cycleSodaColor, 5200);
}

const couponModal = document.getElementById('couponModal');
document.getElementById('showCoupon')?.addEventListener('click',()=>{
  couponModal.setAttribute('aria-hidden','false');
});
document.querySelectorAll('[data-close="modal"]').forEach(el=>el.addEventListener('click',()=>{
  couponModal.setAttribute('aria-hidden','true');
}));
document.getElementById('copyCoupon')?.addEventListener('click', async()=>{
  const code = document.getElementById('couponCode').textContent.trim();
  try{
    await navigator.clipboard.writeText(code);
    showToast('クーポンコードをコピーしました。');
  }catch(e){
    showToast(`クーポンコード：${code}`);
  }
});
