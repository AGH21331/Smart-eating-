const {MODEL,TTS_MODEL,json}=require('./_lib');
module.exports=(req,res)=>json(res,200,{ok:true,version:'19.0.0',aiConfigured:Boolean(process.env.GEMINI_API_KEY),model:MODEL,ttsModel:TTS_MODEL,time:new Date().toISOString()});
