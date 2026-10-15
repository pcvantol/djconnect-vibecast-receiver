import {renderState} from './view.mjs';
import { BootstrapController, unavailableAdapter } from './lifecycle.mjs';
import { selectLocale } from './locales.mjs';
import { chooseEffects, sampleFrames } from './effects.mjs';
// Discard unsolicited URL input without interpreting it as a destination.
if(location.search || location.hash) history.replaceState(null,'',location.pathname);
const byId = id => document.getElementById(id);
let language = selectLocale(navigator.language), current = {state:'initializing'}, fewer = false;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const contrast = matchMedia('(prefers-contrast: more)');
const transparency = matchMedia('(prefers-reduced-transparency: reduce)');
let observed = [], effectGeneration = 0;
function paint(){ renderState(document,language,current); }

const controller = new BootstrapController({ adapter: unavailableAdapter, render: state => {current=state;paint();}, navigate: url => location.replace(url) });
function supported() {return isSecureContext && !!globalThis.crypto?.subtle && typeof AbortController === 'function' && typeof URL === 'function';}
async function effects() {
 const generation = ++effectGeneration;
 const reduced = fewer || motion.matches || transparency.matches;
 const supported = globalThis.CSS?.supports?.('backdrop-filter','blur(1px)') || globalThis.CSS?.supports?.('-webkit-backdrop-filter','blur(1px)');
 document.documentElement.dataset.effects=chooseEffects({supported,reduced,highContrast:contrast.matches,frames:observed});
 if (reduced || contrast.matches || !supported || observed.length) return;
 observed = await sampleFrames();
 if(generation !== effectGeneration) return;
 document.documentElement.dataset.effects=chooseEffects({supported,reduced:fewer || motion.matches || transparency.matches,highContrast:contrast.matches,frames:observed});
}
byId('language').addEventListener('change',event => {language=selectLocale(event.target.value);paint();});
byId('effects').addEventListener('click',() => {fewer=!fewer;byId('effects').setAttribute('aria-pressed',String(fewer));void effects();});
byId('retry').addEventListener('click',() => {void (current.state==='recovering' ? controller.reconnect() : controller.start(supported()));});
for(const preference of [motion,contrast,transparency]) preference.addEventListener?.('change',effects);
addEventListener('online',() => {if(current.state==='recovering') void controller.reconnect();});
addEventListener('pagehide',() => controller.stop());
addEventListener('pageshow',event => {if(event.persisted) void controller.start(supported());});
paint();void effects();void controller.start(supported());
