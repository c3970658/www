const toast = document.getElementById('toast');
function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(window.__toastTimer);
  window.__toastTimer = window.setTimeout(()=>toast.classList.remove('show'), 2200);
}
document.querySelectorAll('[data-toast]').forEach(button=>{
  button.addEventListener('click',()=>showToast(button.dataset.toast));
});
document.getElementById('contactBtn')?.addEventListener('click',()=>showToast('お問い合わせを受け付けました。'));
