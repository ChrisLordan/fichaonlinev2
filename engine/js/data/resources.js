export const isRestricted=char=>char.identificacao?.especializacao==='Restringido';
// A interface reutiliza os controles de recurso, sem misturar os campos persistidos.
export function resourcePoints(char){char.pontos ||= {};return new Proxy(char.pontos,{get(target,key){return target[isRestricted(char)&&typeof key==='string'&&key.startsWith('pe')?'estamina'+key.slice(2):key];},set(target,key,value){target[isRestricted(char)&&typeof key==='string'&&key.startsWith('pe')?'estamina'+key.slice(2):key]=value;return true;}});}
export function labelResources(root,char){
 if(!isRestricted(char))return;
 const walker=document.createTreeWalker(root,4),nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){
  if(node.textContent.includes('PE por nível: 4 (Lutador'))node.textContent='4 pontos de Estamina por nível (livro p.114).';
  else node.textContent=node.textContent.replace(/Pontos de Energia Amaldiçoada/gi,'Pontos de Estamina').replace(/Energia Amaldiçoada/gi,'Estamina').replace(/\bPE\b/g,'Estamina');
 }
 root.querySelectorAll('[aria-label]').forEach(n=>n.setAttribute('aria-label',n.getAttribute('aria-label').replace(/\bPE\b/g,'Estamina')));
}
