export const DEFAULT_COLORS={background:'#09090b',surface:'#111114',card:'#18181c',accent:'#dc172c',bright:'#ff263e',text:'#f5f5f5',muted:'#a1a1aa',border:'#29292f'};
export const COLOR_LABELS={background:'Fundo principal',surface:'Fundo secundário',card:'Cards e painéis',accent:'Cor principal',bright:'Destaques',text:'Texto principal',muted:'Texto secundário',border:'Bordas'};
export function validColor(value){return typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value);}
export function applyColors(colors={}){
  const style=document.documentElement.style;
  const next=new Map(Object.entries(colors||{}).filter(([key,value])=>/^#[0-9a-f]{6}$/i.test(key)&&validColor(value)).map(([key,value])=>[`--site-color-${key.slice(1).toLowerCase()}`,value]));
  for(const key of [...style])if(key.startsWith('--site-color-')&&!next.has(key))style.removeProperty(key);
  for(const [key,value]of next)if(style.getPropertyValue?.(key)!==value)style.setProperty(key,value);
}
