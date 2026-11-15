// Livro v2.5.2, p.276: testes comuns usam d20 + bônus aplicáveis.
import { getPreferences } from '../../../js/settings.js';
export function rollTest(bonus, random = Math.random) {
  const natural = 1 + Math.floor(random() * 20);
  const modifier = Number(bonus) || 0;
  return { natural, bonus: modifier, total: natural + modifier };
}

export function installRolls() {
  const history = [];
  const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='css/roll-notifications.css?v=20261115-mobile-temp-1';document.head.append(stylesheet);
  const stack=document.createElement('section');stack.className='roll-notifications';stack.setAttribute('aria-label','Resultados de rolagens');
  const announcement=document.createElement('div');announcement.className='roll-sr-only';announcement.setAttribute('role','status');announcement.setAttribute('aria-live','polite');announcement.setAttribute('aria-atomic','true');
  const historyPanel=document.createElement('details');historyPanel.className='roll-history';historyPanel.hidden=true;
  const historyTitle=document.createElement('summary');historyTitle.textContent='Histórico de rolagens';
  const log=document.createElement('ol');historyPanel.append(historyTitle,log);
  window.addEventListener('jujutsu-preferences-changed',()=>{
    if(getPreferences().disableRollHistory){history.length=0;log.replaceChildren();historyPanel.hidden=true;historyPanel.open=false;}
  });
  document.body.append(stack,historyPanel,announcement);
  const dismissers=new Map();
  function notify(name,roll){
    const card=document.createElement('article');card.className='roll-notice';
    const icon=document.createElement('div');icon.className='roll-notice__icon';icon.setAttribute('aria-hidden','true');
    icon.innerHTML='<svg viewBox="0 0 56 60" fill="none"><path d="M28 3 51 16v28L28 57 5 44V16Z"/><path d="m28 3-13 22 13 22 13-22L28 3ZM5 16l10 9-10 19m46-28-10 9 10 19M5 44l23 3 23-3M15 25h26M28 47v10"/></svg><span>20</span>';
    const content=document.createElement('div');content.className='roll-notice__content';
    const heading=document.createElement('h3');heading.textContent=name;
    const calculation=document.createElement('div');calculation.className='roll-notice__calculation';
    const expression=document.createElement('span');expression.textContent=`1d20 [${roll.natural}] ${roll.bonus>=0?'+':'−'} ${Math.abs(roll.bonus)}`;expression.title='Resultado natural do d20 e bônus aplicado';
    const equals=document.createElement('span');equals.textContent='=';equals.className='roll-notice__equals';
    const total=document.createElement('strong');total.textContent=roll.total;total.className='roll-notice__total';
    calculation.append(expression,equals,total);content.append(heading,calculation);
    const close=document.createElement('button');close.type='button';close.className='roll-notice__close';close.textContent='×';close.setAttribute('aria-label',`Fechar resultado de ${name}`);
    card.append(icon,content,close);
    let timer;
    const pause=()=>clearTimeout(timer);
    const dismiss=()=>{pause();dismissers.delete(card);card.remove();};
    const resume=()=>{pause();const seconds=getPreferences().rollDuration;if(seconds>0)timer=setTimeout(dismiss,seconds*1000);};
    close.onclick=dismiss;card.onmouseenter=pause;card.onmouseleave=resume;card.onfocusin=pause;card.onfocusout=resume;
    dismissers.set(card,dismiss);stack.prepend(card);
    while(stack.children.length>3)dismissers.get(stack.lastElementChild)();
    resume();
    announcement.textContent=`${name}. D20: ${roll.natural}. Bônus: ${roll.bonus}. Total: ${roll.total}.`;
  }
  document.addEventListener('click', event => {
    const trigger=event.target.closest('[data-roll-bonus]');if(!trigger)return;
    const roll=rollTest(trigger.dataset.rollBonus), name=trigger.dataset.rollName||'Teste';
    if(!getPreferences().disableRollHistory){
      history.unshift({name,...roll,time:new Date().toLocaleTimeString('pt-BR')});history.splice(20);
      log.replaceChildren(...history.map(item=>{const li=document.createElement('li');li.textContent=`${item.time} — ${item.name}: ${item.natural} ${item.bonus>=0?'+':''}${item.bonus} = ${item.total}`;return li;}));
      historyPanel.hidden=false;
    }else{history.length=0;log.replaceChildren();historyPanel.hidden=true;}
    notify(name,roll);
  });
}

