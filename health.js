export default async function handler(req,res){
 if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
 res.setHeader('Cache-Control','no-store');
 return res.status(200).json({ok:true,aiConfigured:!!process.env.GEMINI_API_KEY,models:{vision:process.env.GEMINI_MODEL||'gemini-3.6-flash',voice:process.env.GEMINI_MODEL||'gemini-3.6-flash',tts:process.env.GEMINI_TTS_MODEL||'gemini-3.1-flash-tts-preview'}})
}
