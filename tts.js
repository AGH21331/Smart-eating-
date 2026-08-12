// Smart Meal Gemini TTS endpoint.
// Uses Gemini native audio instead of browser/device voice packs.
const MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';
function clampText(v){ return String(v||'').trim().slice(0,5000); }
function wavDataUrl(base64Pcm){
  const pcm=Buffer.from(base64Pcm,'base64');
  const header=Buffer.alloc(44);
  header.write('RIFF',0); header.writeUInt32LE(36+pcm.length,4); header.write('WAVE',8);
  header.write('fmt ',12); header.writeUInt32LE(16,16); header.writeUInt16LE(1,20);
  header.writeUInt16LE(1,22); header.writeUInt32LE(24000,24); header.writeUInt32LE(48000,28);
  header.writeUInt16LE(2,32); header.writeUInt16LE(16,34); header.write('data',36); header.writeUInt32LE(pcm.length,40);
  return 'data:audio/wav;base64,'+Buffer.concat([header,pcm]).toString('base64');
}
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  try{
    const key=process.env.GEMINI_API_KEY;
    if(!key) return res.status(503).json({error:'AI is not configured on the server yet'});
    const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
    const text=clampText(body.text); if(!text)return res.status(400).json({error:'Provide text'});
    const lang=body.language==='fr'?'French':body.language==='en'?'English':'Arabic';
    const prompt=`Read the following Smart Meal text aloud naturally in ${lang}. Speak only the text itself. Clear, warm, concise nutrition-assistant voice. Text:\n${text}`;
    const upstream=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,{
      method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},
      body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseModalities:['AUDIO'],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'Kore'}}}}})
    });
    const data=await upstream.json();
    if(!upstream.ok)return res.status(502).json({error:data?.error?.message||'TTS request failed'});
    const b64=data?.candidates?.[0]?.content?.parts?.find(p=>p.inlineData?.data)?.inlineData?.data;
    if(!b64)return res.status(502).json({error:'Empty TTS audio response'});
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({audio:wavDataUrl(b64)});
  }catch(e){console.error(e);return res.status(500).json({error:e?.message||'Server error'});}
}
