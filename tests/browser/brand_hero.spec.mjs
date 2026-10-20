import {test,expect} from '@playwright/test';

test('VibeCast hero and canonical micro/glass marks decode without implying a connection',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{level:1,name:'VibeCast',exact:true})).toBeVisible();
 await expect(page.locator('html')).toHaveAttribute('data-state','unavailable');
 await expect(page.locator('#qr-panel')).toBeHidden();
 const images=await page.evaluate(async()=>{
  const header=document.querySelector('.brand-mark'),maker=document.querySelector('.maker img');
  await Promise.all([header.decode(),maker.decode()]);
  return {header:[header.naturalWidth,header.getBoundingClientRect().width],maker:[maker.naturalWidth,maker.getBoundingClientRect().width],favicons:[...document.querySelectorAll('link[rel="icon"]')].map(n=>({size:n.sizes.value,type:n.type})),heroHidden:document.querySelector('.hero-symbol').getAttribute('aria-hidden')};
 });
 expect(images.header).toEqual([40,40]);expect(images.maker).toEqual([2048,512]);await expect(page.locator('.maker img')).toHaveAttribute('alt','DJConnect');
 expect(images.favicons).toEqual([{size:'16x16',type:'image/png'},{size:'32x32',type:'image/png'}]);
 expect(images.heroHidden).toBe('true');
 const response=await page.request.get('/brand-mark-32.png');
 expect(response.headers()['content-type']).toBe('image/png');
});

test('hero is static and drops transparency/glows for increased contrast',async({page})=>{
 await page.emulateMedia({contrast:'more',reducedMotion:'reduce'});await page.goto('/');
 const style=await page.locator('.vibecast-hero').evaluate(node=>{const s=getComputedStyle(node);return{background:s.backgroundImage,animation:s.animationName,shadow:s.boxShadow};});
 expect(style).toEqual({background:'none',animation:'none',shadow:'none'});
 await expect(page.getByRole('heading',{level:1,name:'VibeCast',exact:true})).toBeVisible();
});

for(const width of [320,390,1920])test(`canonical wordmark stays readable and within ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1080});await page.goto('/');
 await expect(page.locator('.maker img')).toBeVisible();
 const state=await page.locator('.maker img').evaluate(async image=>{await image.decode();const r=image.getBoundingClientRect();return{natural:[image.naturalWidth,image.naturalHeight],width:r.width,height:r.height,right:r.right,viewport:innerWidth};});
 expect(state.natural).toEqual(width>800?[2048,512]:[1728,448]);expect(state.width).toBeGreaterThanOrEqual(256);expect(state.right).toBeLessThanOrEqual(state.viewport);expect(state.height).toBeCloseTo(state.width*state.natural[1]/state.natural[0],1);if(width>800)expect(state.width).toBeGreaterThanOrEqual(512);
 await expect(page.locator('html')).toHaveAttribute('data-state','unavailable');await expect(page.locator('#qr-panel')).toBeHidden();
});
