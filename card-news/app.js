const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const themes={lime:{accent:'#d8ff63',ink:'#171815',card:'#fffdf5'},coral:{accent:'#ff796d',ink:'#4133a7',card:'#fff7e6'},blue:{accent:'#74d7ff',ink:'#102e46',card:'#f3fbff'},mono:{accent:'#e9e4d9',ink:'#171717',card:'#f8f5ed'}};
const state={active:0,theme:'lime',scale:.72,cards:[],brand:'@my.brand'};
const storageKey='next-centum-card-news-v1';

function saveState(){
  try{
    localStorage.setItem(storageKey,JSON.stringify({...state,topic:$('#topicInput').value,tone:$('#toneSelect').value,audience:$('#audienceSelect').value}));
  }catch{}
}
function restoreState(){
  try{
    const saved=JSON.parse(localStorage.getItem(storageKey));
    if(!saved||!Array.isArray(saved.cards)||saved.cards.length!==6)return false;
    Object.assign(state,{active:saved.active||0,theme:themes[saved.theme]?saved.theme:'lime',scale:saved.scale||.72,cards:saved.cards,brand:saved.brand||'@my.brand'});
    $('#topicInput').value=saved.topic||'작은 브랜드를 위한 인스타그램 콘텐츠 전략';
    $('#topicCount').textContent=$('#topicInput').value.length;
    $('#toneSelect').value=saved.tone||'friendly';
    $('#audienceSelect').value=saved.audience||'starter';
    $('#brandInput').value=state.brand;
    $('#zoomLabel').textContent=Math.round(state.scale*100)+'%';
    $$('.theme').forEach(b=>b.classList.toggle('active',b.dataset.theme===state.theme));
    return true;
  }catch{return false}
}

function cleanTopic(v){return v.trim().replace(/[.!?]+$/,'')||'나만의 콘텐츠';}
function highlight(title,keyword){const words=keyword.split(/\s+/).filter(w=>w.length>1);let found=words.find(w=>title.includes(w));if(!found)return title;return title.replace(found,`<strong>${found}</strong>`)}
function createCards(topic,tone,audience){
  const t=cleanTopic(topic), short=t.length>25?t.slice(0,25)+'…':t;
  const audienceText={starter:'처음 시작하는 사람도',creator:'혼자 만드는 사람도',owner:'작은 브랜드도',worker:'바쁜 직장인도'}[audience];
  const endings={friendly:'쉽고 부담 없이 시작해요.',expert:'핵심 원칙부터 정확히 짚어봅니다.',witty:'어렵게 말고, 센스 있게 가볼까요?',calm:'서두르지 않고 하나씩 살펴봐요.'}[tone];
  return [
    {kicker:'오늘의 콘텐츠 노트',title:`${short}\n지금 시작하는 법`,body:`복잡한 정보는 덜고, 바로 써먹을 핵심만 담았어요.\n${endings}`,align:'left',kind:'cover'},
    {kicker:'WHY IT MATTERS',title:`왜 지금\n‘${short}’일까요?`,body:`좋은 결과는 거창한 계획보다 분명한 기준에서 시작돼요. ${audienceText} 방향만 알면 훨씬 수월해집니다.`,align:'left',kind:'number'},
    {kicker:'핵심 01',title:'목표는 작게,\n기준은 선명하게',body:`“무엇을 할까?”보다 “무엇이 달라져야 할까?”를 먼저 정하세요. ${t}의 첫 단추는 결과를 한 문장으로 쓰는 것입니다.`,align:'left',kind:'standard'},
    {kicker:'핵심 02',title:'딱 3단계로\n가볍게 실행하기',body:'① 지금 상태를 한 줄로 적기\n② 오늘 할 수 있는 최소 행동 정하기\n③ 일주일 뒤 결과를 기록하기',align:'left',kind:'number'},
    {kicker:'DON’T FORGET',title:'완벽함보다\n반복이 이겨요',body:`처음부터 멋진 답을 찾지 마세요. 작게 시도하고 반응을 본 뒤 한 가지씩 고치는 것이 ${t}을 오래 이어가는 비결이에요.`,align:'center',kind:'standard'},
    {kicker:'SAVE & SHARE',title:'오늘의 한 줄',body:`“좋은 시작은 완벽한 준비가 아니라,\n다음 행동이 보이는 상태다.”\n\n필요할 때 다시 볼 수 있도록 저장해 두세요.`,align:'center',kind:'cta'}
  ];
}

function render(){
  const c=state.cards[state.active], theme=themes[state.theme], canvas=$('#cardCanvas'); if(!c)return;
  canvas.style.setProperty('--accent',theme.accent);canvas.style.setProperty('--ink',theme.ink);canvas.style.setProperty('--card',theme.card);canvas.style.setProperty('--scale',state.scale);
  $('#cardNumber').textContent=String(state.active+1).padStart(2,'0')+' / '+String(state.cards.length).padStart(2,'0');
  $('#cardBrand').textContent=state.brand||'@your.name';
  $('#cardCategory').textContent=c.kicker.toUpperCase();
  const number=c.kind==='number'?`<span class="big-number">0${state.active}</span>`:'';
  $('#cardContent').className='card-content '+c.align;
  $('#cardContent').innerHTML=`${number}<span class="kicker">${escapeHtml(c.kicker)}</span><h3>${highlight(escapeHtml(c.title),cleanTopic($('#topicInput').value))}</h3><p>${escapeHtml(c.body)}</p>`;
  $('#editingCard').textContent=`${state.active+1}번째 카드`;$('#kickerEdit').value=c.kicker;$('#titleEdit').value=c.title;$('#bodyEdit').value=c.body;
  $$('#alignSegment button').forEach(b=>b.classList.toggle('active',b.dataset.align===c.align));
  renderThumbs();
  saveState();
}
function renderThumbs(){
  const t=themes[state.theme];$('#thumbs').innerHTML=state.cards.map((c,i)=>`<button class="thumb ${i===state.active?'active':''}" data-i="${i}" style="--accent:${t.accent};--card:${t.card}"><span>${escapeHtml(c.kicker)}</span><em>0${i+1}</em></button>`).join('');
  $$('.thumb').forEach(b=>b.onclick=()=>{state.active=+b.dataset.i;render()});
}
function escapeHtml(v){return v.replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}
function generate(){
  const topic=cleanTopic($('#topicInput').value);$('#topicInput').value=topic;
  const btn=$('#generateBtn');btn.classList.add('loading');btn.querySelector('b').textContent='구성 짜는 중…';
  setTimeout(()=>{state.cards=createCards(topic,$('#toneSelect').value,$('#audienceSelect').value);state.active=0;btn.classList.remove('loading');btn.querySelector('b').textContent='카드뉴스 만들기';render();showToast('새로운 카드뉴스가 완성됐어요!')},650);
}
function applyTheme(name){state.theme=name;$$('.theme').forEach(b=>b.classList.toggle('active',b.dataset.theme===name));render()}
function showToast(msg){const t=$('#toast');t.querySelector('b').textContent=msg;t.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove('show'),2400)}
function wrapText(ctx,text,maxWidth){const paragraphs=text.split('\n'),lines=[];paragraphs.forEach((p,pi)=>{let line='';for(const ch of p){const test=line+ch;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=ch}else line=test}if(line)lines.push(line);if(pi<paragraphs.length-1)lines.push('')});return lines}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function drawCard(index,download=true){
  const c=state.cards[index],th=themes[state.theme],cv=document.createElement('canvas');cv.width=1080;cv.height=1350;const x=cv.getContext('2d');
  x.fillStyle=th.card;x.fillRect(0,0,1080,1350);x.strokeStyle=th.ink;x.globalAlpha=.13;x.lineWidth=2;x.beginPath();x.arc(1040,300,190,0,Math.PI*2);x.stroke();x.fillStyle=th.accent;x.beginPath();x.arc(80,1110,85,0,Math.PI*2);x.fill();x.globalAlpha=1;
  x.fillStyle=th.ink;x.font='700 18px Arial';x.letterSpacing='2px';x.fillText(c.kicker.toUpperCase(),76,82);x.textAlign='right';x.fillText(String(index+1).padStart(2,'0')+' / '+String(state.cards.length).padStart(2,'0'),1004,82);x.textAlign='left';x.globalAlpha=.55;x.fillRect(76,108,928,2);x.globalAlpha=1;
  const center=c.align==='center';x.textAlign=center?'center':'left';const startX=center?540:76;let y=330;
  if(c.kind==='number'){x.font='italic 150px Georgia';x.fillStyle=th.accent;x.strokeStyle=th.ink;x.lineWidth=2;x.fillText('0'+index,startX,y);x.strokeText('0'+index,startX,y);y+=70}
  x.font='700 21px Arial';const kickerW=x.measureText(c.kicker).width+42;x.fillStyle=th.ink;roundRect(x,center?540-kickerW/2:76,y,kickerW,48,24);x.fillStyle=th.accent;x.fillText(c.kicker,center?540:97,y+32);y+=112;
  x.fillStyle=th.ink;x.font='700 76px "Arial"';const titleLines=wrapText(x,c.title,880);titleLines.forEach(line=>{x.fillText(line,startX,y);y+=91});
  y+=25;x.font='400 31px Arial';x.globalAlpha=.82;const bodyLines=wrapText(x,c.body,860);bodyLines.forEach(line=>{x.fillText(line,startX,y);y+=50});x.globalAlpha=1;
  x.textAlign='left';x.font='700 18px Arial';x.fillText(state.brand||'@your.name',76,1282);x.textAlign='right';x.fillText('SWIPE  →',1004,1282);
  if(download){const a=document.createElement('a');a.download=`cardnews-${String(index+1).padStart(2,'0')}.png`;a.href=cv.toDataURL('image/png');a.click()}return cv;
}

$('#topicInput').addEventListener('input',e=>{$('#topicCount').textContent=e.target.value.length;saveState()});
$$('[data-topic]').forEach(b=>b.onclick=()=>{$('#topicInput').value=b.dataset.topic;$('#topicCount').textContent=b.dataset.topic.length;generate()});
$('#generateBtn').onclick=generate;$('#prevBtn').onclick=()=>{state.active=(state.active-1+state.cards.length)%state.cards.length;render()};$('#nextBtn').onclick=()=>{state.active=(state.active+1)%state.cards.length;render()};
$('#brandInput').oninput=e=>{state.brand=e.target.value;$('#cardBrand').textContent=state.brand;saveState()};
['kicker','title','body'].forEach(k=>$('#'+k+'Edit').oninput=e=>{state.cards[state.active][k]=e.target.value;render()});
$$('.theme').forEach(b=>b.onclick=()=>applyTheme(b.dataset.theme));$('#randomTheme').onclick=()=>{const keys=Object.keys(themes).filter(k=>k!==state.theme);applyTheme(keys[Math.floor(Math.random()*keys.length)])};
$$('#alignSegment button').forEach(b=>b.onclick=()=>{state.cards[state.active].align=b.dataset.align;render()});
$('#zoomIn').onclick=()=>{state.scale=Math.min(.86,+(state.scale+.07).toFixed(2));$('#zoomLabel').textContent=Math.round(state.scale*100)+'%';render()};$('#zoomOut').onclick=()=>{state.scale=Math.max(.45,+(state.scale-.07).toFixed(2));$('#zoomLabel').textContent=Math.round(state.scale*100)+'%';render()};
$('#downloadBtn').onclick=()=>{drawCard(state.active);showToast('현재 카드를 저장했어요!')};$('#downloadAllBtn').onclick=()=>{state.cards.forEach((_,i)=>setTimeout(()=>drawCard(i),i*180));showToast('6장의 다운로드를 시작합니다!')};
$('#resetBtn').onclick=()=>{if(confirm('입력한 내용을 초기화할까요?')){localStorage.removeItem(storageKey);location.reload()}};
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;if(e.key==='ArrowLeft')$('#prevBtn').click();if(e.key==='ArrowRight')$('#nextBtn').click()});
if(!restoreState())state.cards=createCards($('#topicInput').value,'friendly','starter');render();
