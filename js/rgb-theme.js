import {applyColors} from './theme.js';
import {hsvToHex,paletteFromColor} from './color-picker.js';
let active=false,frame=0,last=0,fallback={},listening=false,currentPalette;
export function rgbColorAt(time){return hsvToHex({h:((time%18000)+18000)%18000/50,s:0.88,v:0.95});}
function tick(time){
  if(!active||document.hidden)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced||time-last>=2000){currentPalette=paletteFromColor(rgbColorAt(Date.now()));applyColors(currentPalette);last=time;}
  frame=requestAnimationFrame(tick);
}
export function configureRgb(enabled,colors={}){
  fallback=colors||{};
  if(!listening){document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);if(active&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}});window.addEventListener('pagehide',()=>{if(active&&currentPalette)try{sessionStorage.setItem('jujutsu-rgb-palette',JSON.stringify(currentPalette));}catch{}});listening=true;}
  const wasActive=active;active=!!enabled;
  document.documentElement.classList.toggle('rgb-theme',active);
  if(!active){cancelAnimationFrame(frame);applyColors(fallback);return;}
  if(!wasActive&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}
}
