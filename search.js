const MODEL=process.env.GEMINI_MODEL||'gemini-3.6-flash';
const schema={type:'object',properties:{title:{type:'string'},answer:{type:'string'},highlights:{type:'array',items:{type:'string'}}},required:['title','answer','highlights']};
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 try{
  const key=process.env.GEMINI_API_KEY;if(!key)return res.status(503).json({error:'AI search is not configured'});
  const b=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});const q=String(b.q||'').trim().slice(0,240);if(!q)return res.status(400).json({error:'Query required'});
  const lang=b.language==='fr'?'French':b.language==='en'?'English':'Arabic';
  const payload={store:false,model:MODEL,input:[{type:'text',text:`You are the food-search assistant inside Smart Meal. Answer the user's food/nutrition search in ${lang}. Be concise, practical and non-medical. If the user asks for calories, give an approximate typical portion and clearly say it varies. Query: ${q}`}],response_format:{type:'text',mime_type:'application/json',schema},generation_config:{thinking_level:'minimal'}};
  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/interactions',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key,'Api-Revision':'2026-05-20'},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)return res.status(502).json({error:d?.error?.message||'Search failed'});const raw=String(d?.output_text||'').trim();const out=JSON.parse(raw);res.setHeader('Cache-Control','no-store');return res.status(200).json(out);
 }catch(e){console.error(e);return res.status(500).json({error:e?.message||'Search server error'})}
}
