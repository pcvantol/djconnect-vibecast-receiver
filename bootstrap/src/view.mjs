import { locales } from './locales.mjs';
export function renderState(document, language, current) {
 const byId = id => document.getElementById(id);
 const copy = locales[language]; document.documentElement.lang = language;
 byId('language').value = language;
 for (const key of ['eyebrow','headline','intro','step1','step2','privacy','footer','retry','effects']) byId(key).textContent = copy[key];
 byId('steps').setAttribute('aria-label',copy.step1+'; '+copy.step2);
 byId('language-label').textContent = copy.language; byId('state-label').textContent = copy.stateLabel;
 byId('state-title').textContent = copy[current.state][0]; byId('state-description').textContent = copy[current.state][1];
 byId('retry').hidden = !['unavailable','expired','recovering','unknown','unsafe'].includes(current.state);
 const visible = ['waiting','confirming'].includes(current.state) && !!current.challenge;
 byId('qr-panel').hidden = !visible;
 const canvas = byId('qr'), ctx = canvas.getContext('2d');
 ctx.clearRect(0,0,canvas.width,canvas.height);
 if (visible) {
  const matrix = current.challenge.matrix;
  const available = Math.max(185, Math.min(320, byId('qr-panel').clientWidth - 32 || 280));
  const scale = Math.max(1,Math.floor(available/(matrix.length+8)));
  canvas.width = canvas.height = (matrix.length+8)*scale;
  ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#000';
  matrix.forEach((row,y) => row.forEach((on,x) => {if(on) ctx.fillRect((x+4)*scale,(y+4)*scale,scale,scale);}));
  canvas.setAttribute('aria-label',copy.qr);
  byId('expiry').textContent = copy.expiry+' '+new Date(current.challenge.expiresAt).toLocaleTimeString(language);
 } else {canvas.width = canvas.height = 0; byId('expiry').textContent='';}
 document.documentElement.dataset.state=current.state;
}
