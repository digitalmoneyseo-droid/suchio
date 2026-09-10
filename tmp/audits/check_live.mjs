import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const data=JSON.parse(await readFile('src/content/audits.json','utf8'));
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:390,height:844}});
for(const d of data){
  const url=`https://suchio.net/audit/${d.code}`;
  const response=await page.goto(url);
  const text=await page.locator('main').innerText();
  const robots=await page.locator('meta[name="robots"]').getAttribute('content');
  console.log(JSON.stringify({company:d.company,url,status:response.status(),companyFound:text.includes(d.company),noindex:robots.includes('noindex'),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}));
}
const response=await page.goto('https://suchio.net/datenschutz#briefwerbung');
console.log(JSON.stringify({privacyStatus:response.status(),section:await page.locator('#briefwerbung').count()}));
await browser.close();
