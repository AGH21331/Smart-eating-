const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const fail=[];
const req=['index.html','style.css','app.js','recipes.json','manifest.json','vercel.json','api/health.js','api/ai.js','api/coach.js','api/_lib.js'];
for(const f of req)if(!fs.existsSync(path.join(root,f)))fail.push(`Missing ${f}`);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'app.js'),'utf8');
const recipes=JSON.parse(fs.readFileSync(path.join(root,'recipes.json'),'utf8'));
if(recipes.length!==100)fail.push(`Expected 100 recipes, found ${recipes.length}`);
const ids=new Set(recipes.map(r=>r.id)); if(ids.size!==recipes.length)fail.push('Duplicate recipe IDs');
for(const r of recipes){
  for(const l of ['en','ar','fr']){
    if(!r.name?.[l])fail.push(`${r.id}: missing ${l} name`);
    if(!Array.isArray(r.steps?.[l])||r.steps[l].length<4)fail.push(`${r.id}: incomplete ${l} steps`);
  }
  if(!Array.isArray(r.ingredients)||r.ingredients.length<3)fail.push(`${r.id}: too few ingredients`);
  for(const i of r.ingredients)for(const l of ['en','ar','fr'])if(!i[l])fail.push(`${r.id}: ingredient ${i.key} missing ${l}`);
}
if(!html.includes('/style.css')||!html.includes('/app.js'))fail.push('Frontend assets are not separated from index.html');
if(/const R=/.test(js))fail.push('Recipe database is embedded in app.js instead of recipes.json');
if(/voice|speechRecognition|SpeechRecognition|MediaRecorder|tts\.js/i.test(html+'\n'+js))fail.push('Voice code still exists');
if(fs.existsSync(path.join(root,'voice.js'))||fs.existsSync(path.join(root,'tts.js')))fail.push('Old voice files still exist');
const generic=/if listed|if present|as listed|listed in the recipe|ingredients not listed/i;
for(const r of recipes)for(const l of ['en','ar','fr'])for(const s of r.steps[l])if(generic.test(s))fail.push(`${r.id}: generic step text in ${l}: ${s}`);
const veg=recipes.filter(r=>r.vegetarian).length;if(veg<20)fail.push(`Vegetarian filter has only ${veg} recipes`);
const report={recipes:recipes.length,vegetarian:veg,languages:['ar','fr','en'],voice:false,externalFrontendAssets:true,errors:fail};
console.log(JSON.stringify(report,null,2));
if(fail.length)process.exit(1);
