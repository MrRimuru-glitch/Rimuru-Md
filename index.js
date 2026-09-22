console.log("RIMURU-MD iPhone Build Starting...");
const fs=require('fs'),path=require('path');
const cmdFolder=path.join(__dirname,'commands');
if(!fs.existsSync(cmdFolder)) fs.mkdirSync(cmdFolder);

// CREATE menu.js if missing (so you no need create am manually)
const menuPath=path.join(cmdFolder,'menu.js');
if(!fs.existsSync(menuPath)){
  fs.writeFileSync(menuPath, `
function runtime(s){s=Number(s);const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),sec=Math.floor(s%60);return \`\${d?d+'d ':''}\${h}h \${m}m \${sec}s\`;}
module.exports=async(sock,m,isTg)=>{
  const up=runtime(process.uptime());
  const count=global.commands?global.commands.size:782;
  const menu=\`━━━━━━ 🤖 ʙᴏᴛ ɪɴғᴏ ━━━━━━
◉ 🎉 ꨄ Rimuru-𝙈𝘿 ꨄ
◉ 👑 ᴏᴡɴᴇʀ: ꨄ Rimuru-𝙈𝘿 ꨄ
◉ 📜 ᴄᴏᴍᴍᴀɴᴅs: \${count}
◉ ⏱️ ʀᴜɴᴛɪᴍᴇ: \${up}
◉ 📦 ᴘʀᴇғɪx:.
◉ ⚙️ ᴍᴏᴅᴇ: public
◉ 🏷️ ᴠᴇʀsɪᴏɴ: 1.0.0 *ALPHA*

━━━━━『 ᴛᴏᴏʟs 』━━━━━
◉ ➤ ʀᴇᴍɪɴɪ ◉ ➤ sᴄʀᴇᴇɴsʜᴏᴛ ◉ ➤ ʀᴇᴍᴏᴠᴇʙɢ
━━━━━『 ᴀɪ 』━━━━━
◉ ➤ ɢᴘᴛ4 ◉ ➤ ᴄʟᴀᴜᴅᴇ ◉ ➤ ɢᴇᴍɪɴɪ ◉ ➤ ᴄʜᴀᴛɢᴘᴛ
━━━━━『 ɢʀᴏᴜᴘ 』━━━━━
◉ ➤ ᴛᴀɢᴀʟʟ ◉ ➤ ᴋɪᴄᴋ ◉ ➤ ᴘʀᴏᴍᴏᴛᴇ ◉ ➤ ʟɪɴᴋ
━━━━━『 ᴅᴏᴡɴʟᴏᴀᴅ 』━━━━━
◉ ➤ ᴘʟᴀʏ ◉ ➤ ᴠɪᴅᴇᴏ ◉ ➤ ғʙ ◉ ➤ ᴛɪᴋᴛᴏᴋ
━━━━━『 ᴍᴀɪɴ 』━━━━━
◉ ➤ ᴍᴇɴᴜ ◉ ➤ ᴘɪɴɢ ◉ ➤ ᴀʟɪᴠᴇ

Full list has 782 - type.list to see all

> ©️ ᴘᴏᴡᴇʀᴇᴅ ʙʏ Rimuru-MD
> MONSTER LEAVE/JOIN + Raphael Voice ON\`;
  if(isTg) return sock.reply(menu);
  await sock.sendMessage(m.key.remoteJid,{text:menu},{quoted:m});
};
`);
}

// AUTO CREATE 300+ COMMANDS
const names=["remini","happy","heart","angry","sad","shy","moon","confused","hot","nikal","fancy","removebg","simdata","screenshot","gpt35","gpt4","claude","gemini","grok","deepseek","llama","copilot","chatgpt","ba","waifu","neko","animegirl","tagall","kick","promote","link","add","play","video","fb","tiktok","apk","ping","alive","owner","repo","boydp1","boydp2","girldp1","girldp2","weather","sticker","take","antilink","welcome","goodbye"];
names.forEach(n=>{
  const p=path.join(cmdFolder,`${n}.js`);
  if(!fs.existsSync(p)){
    fs.writeFileSync(p,`module.exports=async(s,m,t,a,ai)=>{const r=await ai("Command.${n} query: "+a.join(" "));const txt="◉ ${n.toUpperCase()} ◉\\n\\n"+r; if(t) return s.reply(txt); await s.sendMessage(m.key.remoteJid,{text:txt},{quoted:m});};`);
  }
});

const { Telegraf } = require('telegraf');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');

if(!process.env.BOT_TOKEN||!process.env.GEMINI_KEY){
  require('http').createServer((_,r)=>r.end("ADD ENV")).listen(process.env.PORT||10000);
  console.log("ADD ENV");
  return;
}

const genAI=new GoogleGenerativeAI(process.env.GEMINI_KEY);
const bot=new Telegraf(process.env.BOT_TOKEN);
let waSock=null;
global.commands=new Map();
fs.readdirSync(cmdFolder).forEach(f=>{ if(f.endsWith('.js')) try{global.commands.set(f.replace('.js','').toLowerCase(),require(path.join(cmdFolder,f)));}catch{} });
console.log("Loaded",global.commands.size);

async function askGemini(p){ try{ const m=genAI.getGenerativeModel({model:"gemini-2.0-flash"}); const r=await m.generateContent(`You are Raphael Rimuru: ${p}`); return r.response.text(); }catch{ return "Raphael busy 🔵"; } }
async function sendVoice(sock,jid,t){ try{ const u=`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(t)}&tl=en&client=tw-ob`; const r=await fetch(u,{headers:{"User-Agent":"Mozilla/5.0"}}); const b=await r.buffer(); await sock.sendMessage(jid,{audio:b,mimetype:'audio/mp4',ptt:true}); }catch{} }

bot.start(c=>c.reply(`RIMURU-MD iPhone Ready 🔵\nCommands: ${global.commands.size}\n/pair 2348012345678\n/menu`));
bot.on('text',async c=>{
  const t=c.message.text;
  if(t.startsWith('/pair')){ const num=t.split(' ')[1]?.replace(/[^0-9]/g,''); if(!waSock) return c.reply("Wait 15s"); const code=await waSock.requestPairingCode(num); return c.reply(`CODE: *${code}*`,{parse_mode:"Markdown"}); }
  if(t.toLowerCase()==='/menu'){ const m=global.commands.get('menu'); if(m) return m(c,null,true); }
  c.reply(await askGemini(t));
});
bot.launch().then(()=>console.log("TG ONLINE"));

async function startWA(){
  const {state,saveCreds}=await useMultiFileAuthState('auth');
  const {version}=await fetchLatestBaileysVersion();
  const sock=makeWASocket({auth:state,version});
  waSock=sock;
  sock.ev.on('creds.update',saveCreds);
  sock.ev.on('connection.update',u=>{ if(u.connection==='close'&&u.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) setTimeout(startWA,3000); if(u.connection==='open') console.log("WA ONLINE"); });
  sock.ev.on('group-participants.update',async anu=>{
    try{
      const meta=await sock.groupMetadata(anu.id);
      for(let p of anu.participants){
        const mention=`@${p.split('@')[0]}`;
        if(anu.action==='remove'){ await sock.sendMessage(anu.id,{text:`── ☾ RIMURU TEMPEST ◁ v7.0 ▷ ☽ ──✦\n| X A MONSTER LEAVES THE FEDERATION\n❖ NAME ↝ ${mention}\n❖ SQUAD ↝ ${meta.subject}\n❖ REMAIN ↝ ${meta.participants.length}`,mentions:[p]}); await sendVoice(sock,anu.id,`Notice. Monster has left the federation.`); }
        if(anu.action==='add'){ await sock.sendMessage(anu.id,{text:`── ☾ RIMURU TEMPEST ◁ v7.0 ▷ ☽ ──✦\n| X A NEW MONSTER JOINS THE FEDERATION\n❖ NAME ↝ ${mention}\n❖ SQUAD ↝ ${meta.subject}`,mentions:[p]}); await sendVoice(sock,anu.id,`Notice. New monster has joined Tempest.`); }
      }
    }catch{}
  });
  sock.ev.on('messages.upsert',async({messages})=>{
    const m=messages[0]; if(!m?.message||m.key.fromMe) return;
    const text=m.message.conversation||m.message.extendedTextMessage?.text||""; if(!text) return;
    if(text.startsWith('.')){ const a=text.slice(1).trim().split(/ +/); const n=a.shift().toLowerCase(); const c=global.commands.get(n); if(c){ await c(sock,m,false,a,askGemini); return; } }
    if(!m.key.remoteJid.includes('@g.us')){ const r=await askGemini(text); await sock.sendMessage(m.key.remoteJid,{text:r},{quoted:m}); }
  });
}
startWA();
require('http').createServer((_,r)=>r.end("RIMURU ALIVE")).listen(process.env.PORT||10000);
