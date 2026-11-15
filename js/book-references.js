// As fontes permanecem nos dados/código; números de página não aparecem na interface.
export function withoutBookPages(value){
  return String(value).replace(/\b(?:Livro(?:\s+v?\d+(?:\.\d+)*)?\s*[·,:—–-]?\s*)?(?:(?:veja|ver)\s+(?:a\s+)?)?(?:p[áa]ginas?|p[áa]gs?\.|p\.)\s*\d+(?:\s*(?:[-–—,]|e)\s*\d+)*/gi,'').replace(/\(\s*\)/g,'').replace(/\s+([,.;:])/g,'$1').replace(/\s+[·—–]\s*$/g,'').replace(/ {2,}/g,' ');
}
export function installBookReferenceCleanup(){
  function clean(root){
    if(root.nodeType===3){if(root.parentElement?.closest('script,style,textarea,input,[contenteditable="true"]'))return;const text=withoutBookPages(root.textContent);if(text!==root.textContent)root.textContent=text;return;}
    if(root.nodeType!==1)return;
    if(root.matches('script,style,textarea,input,[contenteditable="true"]'))return;
    for(const child of [...root.childNodes])clean(child);
  }
  clean(document.body);
  new MutationObserver(records=>{for(const record of records){if(record.type==='characterData')clean(record.target);else for(const node of record.addedNodes)clean(node);}}).observe(document.body,{childList:true,subtree:true,characterData:true});
}
