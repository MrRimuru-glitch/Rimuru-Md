if(!global.crypto)global.crypto=require('crypto').webcrypto;
console.log("RIMURU DM MODE A");
const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'commands');
if(!fs.existsSync(dir))fs.mkdirSync(dir);
if(!fs.existsSync(path.join(dir,'menu.js'))){
 fs.writeFileSync(path.join(dir,'menu.js'),`module.exports=async(s,m,t)=>{let txt="RIMURU-MD MENU\\n.pair 234xxx\\n.ping\\n.menu"; if(t) return s.reply(txt); await s.sendMessage(m.key.remoteJid,{text:txt},{quoted:m})};`);
}

const {Telegraf}=require('telegraf');
const {default:makeWASocket,useMultiFileAuthState,DisconnectReason,fetchLatestBaileysVersion}=require('@whiskeysockets/baileys');
const {GoogleGenerativeAI}=require('@google/generative-ai');
const fetch=require('node-fetch');

if(!process.env.BOT_TOKEN||!process.env.GEMINI_KEY){
 require('http').createServer((_,r)=>r.end("ADD BOT_TOKEN & GEMINI_KEY")).listen(process.env.PORT||10000);
 console.log("NO ENV");
 return;
}

const genAI=new GoogleGenerativeAI(process.env.GEMINI_KEY);
const bot=new Telegraf(process.env.BOT_TOKEN);
let waSock=null; global.commands=new Map();
fs.readdirSync(dir).forEach(f=>{if(f.endsWith('.js'))try{global.commands.set(f.replace('.js',''),require(path.join(dir,f)))}catch{}});

async function ai(p){try{let m=genAI.getGenerativeModel({model:"gemini-2.0-flash"});let r=await m.generateContent(`You are Raphael: ${p}`);return r.response.text()}catch{return "Raphael busy"}}
async function voice(s,j,t){try{let u=`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(t)}&tl=en&client=tw-ob`;let r=await fetch(u,{headers:{"User-Agent":"Mozilla/5.0"}});let b=await r.buffer();await s.sendMessage(j,{audio:b,mimetype:'audio/mp4',ptt:true})}catch{}}

// TELEGRAM PART - FOR FIRST LINK
bot.start(c=>c.reply(`RIMURU DM READY 🔵\n\n/pair 234xxx - First link\n/menu`));
bot.command('pair',async c=>{
 let num=c.message.text.split(' ')[1]?.replace(/[^0-9]/g,'');
 if(!num) return c.reply("Usage: /pair 2348012345678");
 if(!waSock) return c.reply("WA starting, wait 10s and try again");
 try{
  let code=await waSock.requestPairingCode(num);
  c.replyWithMarkdown(`✅ DIRECT WHATSAPP CODE FOR *${num}*:\n\n*${code}*\n\nCheck your WhatsApp notification OR go to Linked Devices > Link with phone number > Enter code (20 sec)`);
 }catch(e){c.reply("Error: "+e.message)}
});
bot.command('menu',async c=>{let x=global.commands.get('menu'); if(x) return x(c,null,true)});
bot.on('text',async c=>{if(c.message.text.startsWith('/')) return; c.reply(await ai(c.message.text))});
bot.launch().then(()=>console.log("TG OK")).catch(e=>console.log("TG FAIL "+e.message));

// WHATSAPP PART
async function startWA(){
 let {state,saveCreds}=await useMultiFileAuthState('auth');
 let {version}=await fetchLatestBaileysVersion();
 let sock=makeWASocket({auth:state,version});
 waSock=sock;
 sock.ev.on('creds.update',saveCreds);
 sock.ev.on('connection.update',u=>{
  if(u.connection==='close'&&u.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut)setTimeout(startWA,3000);
  if(u.connection==='open')console.log("WA OK LINKED");
 });
 sock.ev.on('group-participants.update',async a=>{
  try{
   let meta=await sock.groupMetadata(a.id);
   for(let p of a.participants){
    let men=`@${p.split('@')[0]}`;
    if(a.action==='remove'){await sock.sendMessage(a.id,{text:`── ☾ RIMURU TEMPEST v7.0 ☽ ──\nMONSTER LEAVES\nNAME ↝ ${men}\nSQUAD ↝ ${meta.subject}`,mentions:[p]}); await voice(sock,a.id,"Monster has left.");}
    if(a.action==='add'){await sock.sendMessage(a.id,{text:`── ☾ RIMURU TEMPEST v7.0 ☽ ──\nNEW MONSTER JOINS\nNAME ↝ ${men}\nSQUAD ↝ ${meta.subject}`,mentions:[p]}); await voice(sock,a.id,"New monster has joined.");}
   }
  }catch{}
 });
 sock.ev.on('messages.upsert',async({messages})=>{
  let m=messages[0]; if(!m?.message||m.key.fromMe) return;
  let text=m.message.conversation||m.message.extendedTextMessage?.text||""; if(!text) return;

  // DIRECT DM PAIR FOR AFTER FIRST LINK
  if(text.startsWith('.pair')){
   let num=text.split(' ')[1]?.replace(/[^0-9]/g,'');
   if(!num) return sock.sendMessage(m.key.remoteJid,{text:"Usage:.pair 2348012345678"},{quoted:m});
   try{
    let code=await sock.requestPairingCode(num);
    await sock.sendMessage(m.key.remoteJid,{text:`Code for ${num}: ${code}`},{quoted:m});
    // SEND DIRECT DM TO THAT NUMBER
    await sock.sendMessage(num+"@s.whatsapp.net",{text:`🔵 RIMURU DIRECT PAIR\n\nYour code: *${code}*\n\nLinked Devices > Link with phone number > Enter code in 20 sec`});
    await sock.sendMessage(m.key.remoteJid,{text:`✅ I don send DM direct to ${num} with code ${code}`},{quoted:m});
   }catch(e){await sock.sendMessage(m.key.remoteJid,{text:"Error: "+e.message},{quoted:m})}
   return;
  }

  if(text.startsWith('.')){let a=text.slice(1).trim().split(/ +/);let n=a.shift().toLowerCase();let c=global.commands.get(n);if(c){await c(sock,m,false,a,ai);return}}
  if(!m.key.remoteJid.includes('@g.us')){let r=await ai(text);await sock.sendMessage(m.key.remoteJid,{text:r},{quoted:m})}
 });
}
startWA();
require('http').createServer((_,r)=>r.end("RIMURU DM A ALIVE")).listen(process.env.PORT||10000);
