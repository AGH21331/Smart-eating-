const MODEL=process.env.GEMINI_MODEL||'gemini-3.6-flash';
const BASE='https://generativelanguage.googleapis.com/v1beta/models/';
const WINDOW_MS=60000,MAX_REQ=30,MAX_KEYS=2000;
const hits=new Map();
function json(res,status,body){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('X-Frame-Options','DENY');
  const id=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;
  res.setHeader('X-Request-Id',id);
  res.end(JSON.stringify(body));
}
function rateLimit(req){
  const now=Date.now();
  const key=String(req.headers?.['x-forwarded-for']||req.socket?.remoteAddress||'anon').split(',')[0].trim();
  const list=(hits.get(key)||[]).filter(t=>now-t<WINDOW_MS);
  if(list.length>=MAX_REQ)throw Object.assign(new Error('Too many requests. Try again in a minute.'),{status:429,code:'RATE_LIMITED'});
  list.push(now); hits.set(key,list);
  if(hits.size>MAX_KEYS){for(const [k,v] of hits){if(!v.some(t=>now-t<WINDOW_MS))hits.delete(k);}}
}
async function body(req,max=12000000){
  if(req.body&&typeof req.body==='object')return req.body;
  let raw='';
  for await(const chunk of req){raw+=chunk;if(raw.length>max)throw Object.assign(new Error('Request too large.'),{status:413,code:'PAYLOAD_TOO_LARGE'});}
  try{return JSON.parse(raw||'{}')}catch{throw Object.assign(new Error('Invalid JSON.'),{status:400,code:'INVALID_JSON'})}
}
function apiKey(){if(!process.env.GEMINI_API_KEY)throw Object.assign(new Error('GEMINI_API_KEY is not configured in Vercel.'),{status:503,code:'AI_NOT_CONFIGURED'});return process.env.GEMINI_API_KEY}
function imageData(v){
  const m=String(v||'').match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/s);
  if(!m)throw Object.assign(new Error('Unsupported image format. Use JPEG, PNG or WebP.'),{status:415,code:'BAD_IMAGE'});
  if(m[2].length>7500000)throw Object.assign(new Error('Image is too large.'),{status:413,code:'IMAGE_TOO_LARGE'});
  return {inline_data:{mime_type:m[1]==='image/jpg'?'image/jpeg':m[1],data:m[2]}};
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function gemini(parts,{schema,maxTokens=2200}={}){
  const bodyBase={contents:[{role:'user',parts}],generationConfig:{maxOutputTokens:maxTokens}};
  if(schema){bodyBase.generationConfig.responseMimeType='application/json';bodyBase.generationConfig.responseSchema=schema;}
  let lastErr=null;
  for(let attempt=0;attempt<3;attempt++){
    const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),28000);
    try{
      const r=await fetch(`${BASE}${encodeURIComponent(MODEL)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':apiKey()},body:JSON.stringify(bodyBase),signal:ctrl.signal});
      const text=await r.text();let d;try{d=JSON.parse(text)}catch{d={}};
      if(!r.ok){
        const retryable=r.status===429||r.status>=500;
        lastErr=Object.assign(new Error(d?.error?.message||`Gemini HTTP ${r.status}`),{status:r.status,code:'GEMINI_ERROR'});
        if(retryable&&attempt<2){await sleep(500*(attempt+1));continue;}
        throw lastErr;
      }
      const out=d?.candidates?.[0]?.content?.parts?.filter(p=>typeof p.text==='string').map(p=>p.text).join('').trim();
      if(!out)throw Object.assign(new Error('Empty AI response.'),{status:502,code:'EMPTY_AI_RESPONSE'});
      return out;
    }catch(e){
      if(e.name==='AbortError')throw Object.assign(new Error('AI request timed out.'),{status:504,code:'AI_TIMEOUT'});
      if(e.code==='AI_NOT_CONFIGURED')throw e;
      if(e.code==='GEMINI_ERROR'){
        if(e.status===429||e.status>=500){lastErr=e;if(attempt<2){await sleep(500*(attempt+1));continue;}}
        throw e;
      }
      throw Object.assign(new Error('AI network request failed.'),{status:502,code:'AI_NETWORK_ERROR'});
    }finally{clearTimeout(timer)}
  }
  throw lastErr||Object.assign(new Error('AI request failed.'),{status:502,code:'AI_FAILED'});
}
module.exports={MODEL,json,rateLimit,body,apiKey,imageData,gemini};
