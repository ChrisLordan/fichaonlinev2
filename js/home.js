import{nav,recent}from'./ui.js';
nav();recent(document.querySelector('#recent-list'));
window.addEventListener('pageshow',()=>recent(document.querySelector('#recent-list')));
window.addEventListener('storage',()=>recent(document.querySelector('#recent-list')));
