if(!global.crypto)global.crypto=require('crypto').webcrypto;
console.log("RIMURU iPhone START");
const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'commands');
if(!fs.existsSync(dir))fs.mkdirSync(dir);
if(!fs.existsSync(path.join(dir,'menu.js'))){
fs.writeFileSync(path.join(dir,'menu.js'),`function r(s){s=Number(s);let d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);return d+'d '+h+'h '+m+'m'} module.exports=async(s,m,t)=>{let c=global.commands?global.commands.size:782;let up=r(process.uptime());let txt=\`━━━━━━ 🤖 ʙᴏᴛ ɪɴғᴏ ━━━━━━
◉ 🎉 Rimuru-MD ◉ 👑 Owner: Rimuru ◉ 📜 Cmds: \${c} ◉ ⏱️ Runtime: \${up} ◉ 📦 Prefix:. ◉ 🏷️ v1.0.0 ALPHA

Type.list to see all commands

©️ Powered by Rimuru-MD\`; if(t) return s.reply(txt); await s.sendMessage(m.key.remoteJid,{text:txt},{quoted:m})};`);
}
["ping","alive","menu","owner","repo","play","video","fb","tiktok","sticker","tagall","kick","promote","link","weather","remini"].forEach(n=>{let p=path.join(dir,n+'.js');if(!fs.existsSync(p))fs.writeFileSync(p,`module.exports=async(s,m,t,a,ai)=>{let r=await ai("cmd ${n}: "+a.join(" "));let x="◉ ${n.toUpperCase()} ◉\\\\n"+r; if(t) return s.reply(x); await s.sendMessage(m.key.remoteJid,{text:x},{quoted:m})};`);});
const {Telegraf}=require('telegraf');
const {default:makeWASocket,useMultiFileAuthState,DisconnectReason,fetchLatestBaileysVersion}=require('@whiskeysockets/baileys');
const {GoogleGenerativeAI}=require('@google/generative-ai');
const fetch=require('node-fetch');
if(!process.env.BOT_TOKEN||!process.env.GEMINI_KEY){require('http').createServer((_,r)=>r.end("ADD ENV")).listen(process.env.PORT||10000);return;}
const genAI=new GoogleGenerativeAI(process.env.GEMINI_KEY);
const bot=new Telegraf(process.env.BOT_TOKEN);
let waSock=null;global.commands=new Map();
fs.readdirSync(dir).forEach(f=>{if(f.endsWith('.js'))try{global.commands.set(f.replace('.js',''),require(path.join(dir,f)))}catch{}});
async function ai(p){try{let m=genAI.getGenerativeModel({model:"gemini-2.0-flash"});let r=await m.generateContent(`You are Raphael: ${p}`);return r.response.text()}catch{return "Raphael busy 🔵"}}
async function voice(s,j,t){try{let u=`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(t)}&tl=en&client=tw-ob`;let r=await fetch(u,{headers:{"User-Agent":"Mozilla/5.0"}});let b=await r.buffer();await s.sendMessage(j,{audio:b,mimetype:'audio/mp4',ptt:true})}catch{}}
bot.start(c=>c.reply(`RIMURU READY 🔵\nCmds: ${global.commands.size}\n/pair 234xxx\n/menu`));
bot.on('text',async c=>{let t=c.message.text;if(t.startsWith('/pair')){let n=t.split(' ')[1]?.replace(/[^0-9]/g,'');if(!waSock) return c.reply("Wait 15s");let code=await waSock.requestPairingCode(n);return c.reply(`CODE: *${code}*`,{parse_mode:"Markdown"})}if(t.toLowerCase()==='/menu'){let m=global.commands.get('menu');if(m) return m(c,null,true)}c.reply(await ai(t))});
bot.launch().then(()=>console.log("TG OK"));
async function startWA(){let {state,saveCreds}=await useMultiFileAuthState('auth');let {version}=await fetchLatestBaileysVersion();let sock=makeWASocket({auth:state,version});waSock=sock;sock.ev.on('creds.update',saveCreds);sock.ev.on('connection.update',u=>{if(u.connection==='close'&&u.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut)setTimeout(startWA,3000);if(u.connection==='open')console.log("WA OK")});sock.ev.on('group-participants.update',async a=>{try{let meta=await sock.groupMetadata(a.id);for(let p of a.participants){let men=`@${p.split('@')[0]}`;if(a.action==='remove'){await sock.sendMessage(a.id,{text:`── ☾ RIMURU TEMPEST ◁ v7.0 ▷ ☽ ──✦\n| X A MONSTER LEAVES\n❖ NAME ↝ ${men}\n❖ SQUAD ↝ ${meta.subject}`,mentions:[p]});await voice(sock,a.id,"Notice. Monster has left.")}if(a.action==='add'){await sock.sendMessage(a.id,{text:`── ☾ RIMURU TEMPEST ◁ v7.0 ▷ ☽ ──✦\n| X A NEW MONSTER JOINS\n❖ NAME ↝ ${men}\n❖ SQUAD ↝ ${meta.subject}`,mentions:[p]});await voice(sock,a.id,"New monster has joined.")}}}catch{}});sock.ev.on('messages.upsert',async({messages})=>{let m=messages[0];if(!m?.message||m.key.fromMe)return;let text=m.message.conversation||m.message.extendedTextMessage?.text||"";if(!text)return;if(text.startsWith('.')){let a=text.slice(1).trim().split(/ +/);let n=a.shift().toLowerCase();let c=global.commands.get(n);if(c){await c(sock,m,false,a,ai);return}}if(!m.key.remoteJid.includes('@g.us')){let r=await ai(text);await sock.sendMessage(m.key.remoteJid,{text:r},{quoted:m})}})}
startWA();
require('http').createServer((_,r)=>r.end("RIMURU ALIVE")).listen(process.env.PORT||10000);
