import { chromium } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
const targets=[['cw','https://www.cw-cosmetic.de/'],['marquardt','https://www.marquardt-kuechen.de/'],['lm','https://www.lmlimousines.com/'],['powerhouse','https://www.powerhouse-maintaunus.de/'],['varied','https://www.variedproject.de/'],['allrounder','https://infoallrounder-han.wixsite.com/hakob-avetisyan/home']];
const browser=await chromium.launch({headless:true,channel:'chrome'});
for(const [id,url] of targets){
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const page=await context.newPage(); const responses=[];
 page.on('response',r=>{if(r.status()>=400)responses.push({url:r.url(),status:r.status()})});
 try{await page.goto(url,{waitUntil:'networkidle',timeout:45000})}catch(e){console.log(id,String(e).slice(0,100))}
 await page.screenshot({path:`tmp/audits/${id}-mobile.png`});
 const data=await page.evaluate(()=>({url:location.href,title:document.title,description:document.querySelector('meta[name="description"]')?.content,canonical:document.querySelector('link[rel="canonical"]')?.href,robots:document.querySelector('meta[name="robots"]')?.content,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,text:document.body.innerText,headings:[...document.querySelectorAll('h1,h2,h3')].map(e=>({tag:e.tagName,text:e.textContent,y:Math.round(e.getBoundingClientRect().top+scrollY)})),links:[...document.querySelectorAll('a')].map(e=>({text:e.innerText,href:e.href})),inputs:[...document.querySelectorAll('input,textarea,select')].map(e=>({tag:e.tagName,type:e.type,name:e.name,placeholder:e.placeholder,label:e.getAttribute('aria-label')})),images:[...document.images].map(e=>({src:e.currentSrc,alt:e.getAttribute('alt'),width:e.width,naturalWidth:e.naturalWidth})),resources:performance.getEntriesByType('resource').map(e=>({url:e.name,size:e.transferSize,duration:e.duration}))}));
 data.errors=responses; await writeFile(`tmp/audits/${id}-dom.json`,JSON.stringify(data,null,2));
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:`tmp/audits/${id}-desktop.png`});
 console.log(id,JSON.stringify({title:data.title,description:data.description,width:data.width,scrollWidth:data.scrollWidth,h1:data.headings.filter(e=>e.tag==='H1'),errors:responses.length}));
 await context.close();
}
await browser.close();
