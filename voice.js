// Smart Meal Voice transcription endpoint for Vercel.
// Set GEMINI_API_KEY in Vercel Environment Variables.
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const schema = {type:'object',properties:{text:{type:'string'}},required:['text']};
function cleanAudio(dataUrl){
  if(!dataUrl || typeof dataUrl!=='string') return null;
  const m=dataUrl.match(/^data:(audio\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if(!m) return null;
  if(m[2].length>7_000_000) throw new Error('Audio is too large');
  return {mime_type:m[1],data:m[2]};
}
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  try{
    if(!process.env.GEMINI_API_KEY) return res.status(503).json({error:'AI is not configured on the server yet'});
    const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
    const audio=cleanAudio(body.audio);
    const lang=body.language==='fr'?'French':body.language==='en'?'English':'Arabic';
    if(!audio) return res.status(400).json({error:'Provide recorded audio'});
    const prompt=`Transcribe the user's spoken words accurately. Language: ${lang}. Return only the spoken words as plain text. Do not summarize, translate, or invent words.`;
    const upstream=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,{
      method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY},
      body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt},{inline_data:audio}]}],generationConfig:{response_mime_type:'application/json',response_schema:schema}})
    });
    const data=await upstream.json();
    if(!upstream.ok) return res.status(502).json({error:data?.error?.message||'Voice AI request failed'});
    const raw=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'';
    if(!raw) return res.status(502).json({error:'Empty voice response'});
    const result=JSON.parse(raw);
    return res.status(200).json({text:String(result.text||'').trim()});
  }catch(e){console.error(e);return res.status(500).json({error:e?.message||'Server error'});}
}
