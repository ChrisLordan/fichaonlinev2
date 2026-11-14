// Script clássico no <head>: aplica a preferência antes de pintar o conteúdo.
try {
  const prefs=JSON.parse(localStorage.getItem('jujutsu-preferences')||'{}');
  let colors=prefs.colors||{};
  if(prefs.rgbMode){document.documentElement.classList.add('rgb-theme');try{colors=JSON.parse(sessionStorage.getItem('jujutsu-rgb-palette')||'null')||colors;}catch{}}
  for(const [key,value]of Object.entries(colors))if(/^#[0-9a-f]{6}$/i.test(key)&&/^#[0-9a-f]{6}$/i.test(value))document.documentElement.style.setProperty('--site-color-'+key.slice(1).toLowerCase(),value);
} catch { /* Preferências indisponíveis: mantém o tema padrão. */ }
