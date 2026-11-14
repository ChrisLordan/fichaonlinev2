import {THEME_COLORS} from './theme-palette.js';
export function hexToHsv(hex){const [r,g,b]=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;if(d)h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;return {h:(h*60+360)%360,s:max?d/max:0,v:max};}
export function hsvToHex({h,s,v}){const c=v*s,x=c*(1-Math.abs(((h/60)%2)-1)),m=v-c;const rgb=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return '#'+rgb.map(n=>Math.round((n+m)*255).toString(16).padStart(2,'0')).join('');}
export function paletteFromColor(hex){
  const selected=hexToHsv(hex),result={};
  for(const original of THEME_COLORS){const old=hexToHsv(original);
    // Preserva a hierarquia de luminosidade do tema escuro e tinge superfícies/textos.
    const neutral=old.s<0.25;
    result[original]=hsvToHex({h:selected.h,s:neutral?Math.min(0.13,selected.s*0.15):selected.s,v:neutral?old.v:Math.max(0.10,Math.min(1,selected.v*(old.v/0.863)))});
  }
  result['#dc172c']=hex;return result;
}
export function createColorPicker(initial,onChange){
  let hsv=hexToHsv(initial);const make=(tag,cls)=>{const n=document.createElement(tag);n.className=cls;return n;};
  const root=make('div','theme-picker'),square=make('div','theme-picker__square'),cursor=make('span','theme-picker__cursor');square.append(cursor);square.setAttribute('role','slider');square.tabIndex=0;square.setAttribute('aria-label','Saturação e brilho da cor');square.setAttribute('aria-valuemin','0');square.setAttribute('aria-valuemax','100');
  const tools=make('div','theme-picker__tools'),preview=make('span','theme-picker__preview'),hue=make('input','theme-picker__hue');hue.type='range';hue.min=0;hue.max=359;hue.setAttribute('aria-label','Tonalidade');tools.append(preview,hue);
  const values=make('div','theme-picker__values'),rgb=[];
  for(const name of ['R','G','B']){const label=make('label',''),input=make('input','');input.type='number';input.min=0;input.max=255;input.step=1;input.setAttribute('aria-label',name);label.append(input,document.createTextNode(name));rgb.push(input);values.append(label);}
  const label=make('label','theme-picker__hex'),hex=make('input','');label.append(document.createTextNode('HEX'),hex);hex.setAttribute('aria-label','Cor hexadecimal');hex.maxLength=7;hex.pattern='#[0-9a-fA-F]{6}';
  const hint=make('p','settings-note');hint.textContent='Uma cor para o site inteiro. Fundos, textos, bordas e destaques são combinados automaticamente.';
  root.append(square,tools,values,label,hint);
  function draw(emit=true){const color=hsvToHex(hsv);square.style.setProperty('--picker-hue',`hsl(${hsv.h} 100% 50%)`);cursor.style.left=`${hsv.s*100}%`;cursor.style.top=`${(1-hsv.v)*100}%`;preview.style.background=color;hue.value=hsv.h;hex.value=color.toUpperCase();const channels=color.slice(1).match(/../g).map(v=>parseInt(v,16));rgb.forEach((input,i)=>input.value=channels[i]);square.setAttribute('aria-valuenow',Math.round(hsv.s*100));square.setAttribute('aria-valuetext',`Saturação ${Math.round(hsv.s*100)}%, brilho ${Math.round(hsv.v*100)}%`);if(emit)onChange(color);}
  function point(event){const rect=square.getBoundingClientRect();hsv.s=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));hsv.v=1-Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));draw();}
  square.onpointerdown=event=>{square.setPointerCapture(event.pointerId);point(event);};square.onpointermove=event=>{if(square.hasPointerCapture(event.pointerId))point(event);};
  square.onkeydown=event=>{const step=event.shiftKey?0.1:0.01;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();if(event.key==='ArrowLeft')hsv.s=Math.max(0,hsv.s-step);if(event.key==='ArrowRight')hsv.s=Math.min(1,hsv.s+step);if(event.key==='ArrowUp')hsv.v=Math.min(1,hsv.v+step);if(event.key==='ArrowDown')hsv.v=Math.max(0,hsv.v-step);draw();};
  hue.oninput=()=>{hsv.h=Number(hue.value);draw();};
  rgb.forEach(input=>input.oninput=()=>{if(rgb.some(n=>n.value===''||!n.validity.valid))return;const color='#'+rgb.map(n=>Number(n.value).toString(16).padStart(2,'0')).join('');hsv=hexToHsv(color);draw();});
  hex.oninput=()=>{const valid=/^#[0-9a-f]{6}$/i.test(hex.value);hex.setCustomValidity(valid?'':'Use # seguido de seis dígitos hexadecimais.');if(valid){hsv=hexToHsv(hex.value);draw();}};
  draw(false);return {element:root,setColor(color){hsv=hexToHsv(color);draw(false);}};
}
