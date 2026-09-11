const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const output = process.env.QA_OUTPUT || 'qa-results';
fs.mkdirSync(output, {recursive:true});
const url = process.env.QA_URL || 'http://127.0.0.1:4173/ratoncito-clinical/';
const results = [];
async function inspect(page, label, terminal=false) {
  const metrics = await page.evaluate(() => {
    const d=document.documentElement;
    const clip=[...document.querySelectorAll('h1,h2,p,dt,dd,button')].filter(e => {
      const r=e.getBoundingClientRect();const s=getComputedStyle(e);
      return r.width && r.height && s.visibility !== 'hidden' && (e.scrollWidth>e.clientWidth+2 || ((s.overflowY==='hidden'||s.overflowY==='clip')&&e.scrollHeight>e.clientHeight+2));
    }).map(e=>({tag:e.tagName,text:e.textContent,sw:e.scrollWidth,cw:e.clientWidth}));
    const buttonIssues=[...document.querySelectorAll('button')].filter(e => {
      const r=e.getBoundingClientRect();const s=getComputedStyle(e);
      if(!r.width||!r.height||s.visibility==='hidden')return false;
      const text=(e.innerText||'').trim();
      const fill=s.webkitTextFillColor;
      return !text||s.opacity==='0'||s.color==='rgba(0, 0, 0, 0)'||
        fill==='rgba(0, 0, 0, 0)'||(!e.disabled&&s.color===s.backgroundColor);
    }).map(e=>({text:e.innerText,color:getComputedStyle(e).color,fill:getComputedStyle(e).webkitTextFillColor,background:getComputedStyle(e).backgroundColor}));
    return {w:innerWidth,h:innerHeight,sw:d.scrollWidth,sh:d.scrollHeight,clip,buttonIssues,text:document.body.innerText};
  });
  assert(metrics.sw<=metrics.w, label+' horizontal overflow '+JSON.stringify(metrics));
  assert(!/\b(fictif|fictive|fiction|simulation|prototype|démo|debug|jeu)\b/i.test(metrics.text),label+' immersion');
  assert.deepEqual(metrics.buttonIssues,[],label+' invisible or empty button '+JSON.stringify(metrics.buttonIssues));
  if(terminal){
    await snapshot(page,label);
    assert(metrics.sh<=metrics.h,label+' vertical overflow '+metrics.sh+' > '+metrics.h);
    assert.equal(await page.locator('.topbar,.sidebar,.mobile-nav').count(),0);
    const button=page.getByRole('button',{name:'Retour au dossier',exact:true});
    const r=await button.boundingBox();
    assert(r.y>=0 && r.y+r.height<=metrics.h && r.height>=44,label+' return button visibility');
    assert.deepEqual(metrics.clip,[],label+' clipping');
  }
  results.push({label,w:metrics.w,h:metrics.h,sw:metrics.sw,sh:metrics.sh,clip:metrics.clip});
}
async function assertDecisionButtons(page,label) {
  const cards=page.locator('.hypothesis-card');
  const labels=['Retenir','Incertain','Écarter'];
  for(let i=0;i<await cards.count();i++){
    const card=cards.nth(i);
    for(const choice of labels){
      const button=card.getByRole('button',{name:choice,exact:true});
      assert.equal((await button.innerText()).trim(),choice,label+' missing decision label '+i+' '+choice);
      await button.click();
      assert.equal(await button.getAttribute('aria-pressed'),'true',label+' decision not selected '+i+' '+choice);
      const style=await button.evaluate(e=>{
        const s=getComputedStyle(e);
        return {color:s.color,fill:s.webkitTextFillColor,background:s.backgroundColor,visibility:s.visibility,opacity:s.opacity};
      });
      assert.equal(style.visibility,'visible',label+' hidden decision '+i+' '+choice);
      assert.notEqual(style.opacity,'0',label+' transparent decision '+i+' '+choice);
      assert(!/rgba?\(0, 0, 0, 0\)/.test(style.color),label+' transparent text '+i+' '+choice);
      assert(!/rgba?\(0, 0, 0, 0\)/.test(style.fill),label+' transparent fill '+i+' '+choice);
      assert(/rgb\(255, 255, 255\)/.test(style.color)||/rgb\(255, 255, 255\)/.test(style.fill),label+' selected label contrast '+i+' '+choice);
    }
    await card.getByRole('button',{name:i<5?'Écarter':i===5?'Incertain':'Retenir',exact:true}).click();
  }
}
async function snapshot(page,label){ await page.screenshot({path:`${output}/${label}.png`,fullPage:true}); }
(async()=>{
for(const type of (process.env.QA_ENGINE==='chromium' ? [chromium]:[chromium,webkit])){
 const browser = await type.launch({headless:true});
 for(const [width,height] of [[390,844],[375,812],[393,852],[430,932],[768,1024],[1440,1000]]){
  const key=type.name()+'-'+width;
  const page=await browser.newPage({viewport:{width,height},isMobile:width<600,hasTouch:width<600,deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  await page.goto(url);
  await page.locator('.patient-photo').evaluate(e=>e.decode());
  await inspect(page,key+'-cover');
  if(width===390)await snapshot(page,key+'-cover');
  await page.getByRole('button',{name:'Examiner le dossier',exact:true}).click();
  await inspect(page,key+'-overview');
  if(width===390)await snapshot(page,key+'-overview');
  await page.locator('.next-step-bar').getByRole('button',{name:'Anamnèse',exact:true}).click();
  await inspect(page,key+'-history');
  if(width===390)await snapshot(page,key+'-history');
  await page.getByRole('button',{name:'Passer à l’examen',exact:true}).click();
  await inspect(page,key+'-examination');
  if(width===390)await snapshot(page,key+'-examination');
  await page.locator('.next-step-bar button').click();
  for(const id of ['hematology','biochemistry','exploration','behavior']){
   await page.locator('#panel-trigger-'+id).click();
   await inspect(page,key+'-'+id);
   if(width===390)await snapshot(page,key+'-'+id);
  }
  await page.getByRole('button',{name:'Classer les hypothèses',exact:true}).click();
  await assertDecisionButtons(page,key);
  await inspect(page,key+'-hypotheses');
  if(width===390)await snapshot(page,key+'-hypotheses');
  await page.getByRole('button',{name:'Établir le compte rendu',exact:true}).click();
  await page.locator('#adoption-contract').waitFor();
  await inspect(page,key+'-contract');
  if(width===390)await snapshot(page,key+'-contract');
  for(const [answer,title] of [['Oui, j’adopte Ratoncito','Adoption'],['Non','Décès'],['Oui, j’adopte Ratoncito','Adoption']]){
   await page.getByRole('button',{name:answer,exact:true}).click();
   await page.locator('#closure-title').waitFor();
   assert((await page.locator('#closure-title').innerText()).includes(title));
   await inspect(page,key+'-'+title,true);
   if(true)await snapshot(page,key+'-'+title);
   await page.getByRole('button',{name:'Retour au dossier',exact:true}).click();
   await page.locator('#adoption-contract').waitFor();
   assert.equal(await page.evaluate(()=>document.activeElement.id),'adoption-contract');
   assert.equal(await page.locator('.closure-document').count(),0);
   const r=await page.locator('#adoption-contract').boundingBox();
   assert(r.y>=0&&r.y<height, key+' contract not in view');
  }
  assert.deepEqual(errors,[],key+' errors');
  console.log('PASS',key);
  fs.writeFileSync(output+'/results.json',JSON.stringify(results,null,2));
  await page.close();
 }
 await browser.close();
}
})().catch(e=>{fs.writeFileSync(output+'/results.json',JSON.stringify(results,null,2));console.error(e);process.exit(1)});
