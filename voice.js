// Smart Meal voice transcription endpoint for Vercel.
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const schema={type:'object',properties:{text:{type:'string'}},required:['text']};
function cleanAudio(dataUrl){
  if(!dataUrl||typeof dataUrl!=='string')return null;
  const m=dataUrl.match(/^data:(audio\/(?:ogg|mp4|aac));base64,(.+)$/i);
  if(!m)return null;
  if(m[2].length>8_000_000)throw Error('Audio is too large');
  return {mime_type:m[1].toLowerCase(),data:m[2]};
}
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const key=process.env.GEMINI_API_KEY;if(!key)return res.status(503).json({error:'AI is not configured on the server yet'});
    const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});const audio=cleanAudio(body.audio);
    const lang=body.language==='fr'?'French':body.language==='en'?'English':'Arabic';
    if(!audio)return res.status(400).json({error:'Unsupported audio format. Please use the microphone again.'});
    const prompt=`Transcribe the speech exactly. Language: ${lang}. Return only the spoken words, with no summary or translation.`;
    const upstream=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt},{inline_data:audio}]}],generationConfig:{responseMimeType:'application/json',responseSchema:schema}})});
    const data=await upstream.json();if(!upstream.ok)return res.status(502).json({error:data?.error?.message||'Voice AI request failed'});
    const raw=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'';if(!raw)return res.status(502).json({error:'Empty voice response'});
    const result=JSON.parse(raw);return res.status(200).json({text:String(result.text||'').trim()});
  }catch(e){console.error(e);return res.status(500).json({error:e?.message||'Server error'});}
}
