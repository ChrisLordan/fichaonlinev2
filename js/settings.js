import {applyColors} from './theme.js';
import {createColorPicker,paletteFromColor} from './color-picker.js';
import {installResponsive} from './responsive.js';
import {configureRgb} from './rgb-theme.js';
const KEY='jujutsu-preferences';
export function getPreferences(){try{return {rollDuration:10,disableRollHistory:false,rgbMode:false,colors:{},...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch{return {rollDuration:10,disableRollHistory:false,rgbMode:false,colors:{}};}}
export function installSettings(){
  if(!getPreferences().rgbMode)applyColors(getPreferences().colors);
  configureRgb(getPreferences().rgbMode,getPreferences().colors);
  installResponsive();
  if(document.querySelector('#site-settings'))return;
  const nav=document.querySelector('.site-header nav,.portal-nav nav');if(!nav)return;
  for(const name of ['settings','color-picker'])if(!document.querySelector(`link[href$="css/${name}.css"]`)){const css=document.createElement('link');css.rel='stylesheet';css.href=new URL(`../css/${name}.css`,import.meta.url).href;document.head.append(css);}
  const button=document.createElement('button');button.type='button';button.className='settings-toggle';button.textContent='⚙ Configurações';button.setAttribute('aria-haspopup','dialog');nav.append(button);
  const dialog=document.createElement('dialog');dialog.id='site-settings';dialog.className='settings-dialog';dialog.setAttribute('aria-labelledby','settings-title');
  const title=document.createElement('h2');title.id='settings-title';title.textContent='Configurações';
  const close=document.createElement('button');close.type='button';close.className='settings-close';close.textContent='×';close.setAttribute('aria-label','Fechar configurações');close.onclick=()=>dialog.close();
  const status=document.createElement('p');status.setAttribute('role','status');
  function save(patch){try{const preferences={...getPreferences(),...patch};localStorage.setItem(KEY,JSON.stringify(preferences));configureRgb(preferences.rgbMode,preferences.colors);window.dispatchEvent(new Event('jujutsu-preferences-changed'));status.textContent='Preferências salvas neste navegador.';}catch{status.textContent='Não foi possível salvar as preferências.';}}
  const historyLabel=document.createElement('label');historyLabel.className='settings-check';const history=document.createElement('input');history.type='checkbox';history.checked=!!getPreferences().disableRollHistory;history.onchange=()=>save({disableRollHistory:history.checked});historyLabel.append(history,'Desabilitar Histórico de Rolagem');
  const label=document.createElement('label');label.textContent='Tempo das notificações de rolagem';const select=document.createElement('select');
  for(const [value,text]of [[5,'5 segundos'],[10,'10 segundos'],[20,'20 segundos'],[0,'Até fechar manualmente']])select.add(new Option(text,value));
  select.value=getPreferences().rollDuration;select.onchange=()=>save({rollDuration:Number(select.value)});label.append(select);
  const colors=document.createElement('section');colors.className='settings-colors';const colorTitle=document.createElement('h3');colorTitle.textContent='Cor do Site';colors.append(colorTitle);
  const rgbLabel=document.createElement('label');rgbLabel.className='settings-check';const rgb=document.createElement('input');rgb.type='checkbox';rgb.checked=!!getPreferences().rgbMode;rgbLabel.append(rgb,'RGB');
  const picker=createColorPicker(getPreferences().themeColor||getPreferences().colors?.['#dc172c']||'#dc172c',color=>{rgb.checked=false;save({rgbMode:false,themeColor:color,colors:paletteFromColor(color)});});
  rgb.onchange=()=>save({rgbMode:rgb.checked});
  const rgbHint=document.createElement('p');rgbHint.className='settings-note';rgbHint.textContent='Alterna as cores do site continuamente. Desative RGB ou escolha uma cor para voltar ao tema fixo.';
  const reset=document.createElement('button');reset.type='button';reset.className='settings-reset';reset.textContent='Restaurar cores originais';reset.onclick=()=>{rgb.checked=false;save({rgbMode:false,themeColor:null,colors:{}});picker.setColor('#dc172c');};
  colors.append(rgbLabel,rgbHint,picker.element,reset);dialog.append(close,title,historyLabel,label,colors,status);document.body.append(dialog);
  button.onclick=()=>dialog.showModal();dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  window.addEventListener('storage',event=>{if(event.key===KEY){const prefs=getPreferences();configureRgb(prefs.rgbMode,prefs.colors);rgb.checked=!!prefs.rgbMode;history.checked=prefs.disableRollHistory;select.value=prefs.rollDuration;picker.setColor(prefs.themeColor||prefs.colors?.['#dc172c']||'#dc172c');window.dispatchEvent(new Event('jujutsu-preferences-changed'));}});
}
