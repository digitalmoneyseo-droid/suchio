import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
const audits=JSON.parse(await readFile('src/content/audits.json','utf8'));
const report={checkedAt:new Date().toISOString(),version:'96b4ea90-585c-4cc8-96e2-6cd82221523b',audits:[]};
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:390,height:844}});
const sitemap=await (await fetch('https://suchio.net/sitemap.xml')).text();
if(sitemap.includes('/audit/'))throw Error('Audit exposed in sitemap');
for(const a of audits){
 const url=`https://suchio.net/audit/${a.code}`;
 const r=await page.goto(url);if(r.status()!==200)throw Error(url);
 if(await page.locator('main h1').innerText()!==a.content.de.title)throw Error('Wrong audit');
 if(!(await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'))throw Error('Missing noindex');
 if(await page.locator('main a[href="/contact"]').count()<1)throw Error('Missing contact link');
 if(await page.locator('main a[href="/datenschutz#briefwerbung"]').count()<1)throw Error('Missing privacy link');
 for(const locale of ['en','fr']){const r=await fetch(`https://suchio.net/${locale}/audit/${a.code}`);if(r.status!==200)throw Error('Locale missing');}
 report.audits.push({company:a.company,url,status:200,locales:'de/en/fr',contact:true,privacy:true,noindex:true});
}
await page.goto(`https://suchio.net/audit/${audits[0].code}`);
await page.locator('.editorial-hero [data-reveal]').evaluate(async el=>{await Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{})));});
await page.screenshot({path:'tmp/audits/live-mobile.png'});
await page.locator('main a[href="/contact"]').first().click();
await page.locator('#contact-name').waitFor();
await page.setViewportSize({width:1440,height:1000});
await page.goto(`https://suchio.net/audit/${audits[0].code}`);
await page.locator('#measurements-title').scrollIntoViewIfNeeded();
await page.screenshot({path:'tmp/audits/live-desktop.png'});
await browser.close();
await writeFile('output/pdf/briefaktion-v2-luftiger/Live-Pruefung.json',JSON.stringify(report,null,2));
console.log('18 live audit URLs, all contact/privacy links, noindex, sitemap exclusion and contact navigation verified.');
