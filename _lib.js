const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const TTS_MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';
function json(res,status,body){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(body));}
async function parseBody(req){if(req.body&&typeof req.body==='object')return req.body;let raw='';for await(const c of req)raw+=c;try{return JSON.parse(raw||'{}')}catch(e){throw Object.assign(new Error('Invalid JSON body'),{status:400,code:'INVALID_JSON'})}}
function requireKey(){const key=process.env.GEMINI_API_KEY;if(!key)throw Object.assign(new Error('GEMINI_API_KEY is not configured in Vercel.'),{status:503,code:'AI_NOT_CONFIGURED'});return key}
async function geminiGenerate({model,inputParts,responseSchema,responseMimeType='application/json'}){
 const key=requireKey();
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts:inputParts}],generationConfig:responseSchema?{responseMimeType,responseSchema}:{}})});
 const raw=await r.text();let d=null;try{d=JSON.parse(raw)}catch{}
 if(!r.ok)throw Object.assign(new Error(d?.error?.message||`Gemini HTTP ${r.status}`),{status:r.status,code:'GEMINI_ERROR'});
 const text=d?.candidates?.[0]?.content?.parts?.filter(p=>typeof p.text==='string').map(p=>p.text).join('\n').trim()||'';
 return {raw:d,text};
}
function dataUrl(v){const m=String(v||'').match(/^data:([^;]+);base64,(.+)$/s);return m?{mime:m[1],data:m[2]}:null}
module.exports={MODEL,TTS_MODEL,json,parseBody,requireKey,geminiGenerate,dataUrl};
