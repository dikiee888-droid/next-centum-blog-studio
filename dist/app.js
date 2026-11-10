const $ = (id) => document.getElementById(id);
const formIds = ['topic','category','area','keywords','audience','facts','voice','sources','tone','image-count','length','disclosure'];
const storageKey = 'bloom-blog-studio-v1';

function values(){
  return Object.fromEntries(formIds.map(id => [id, $(id).type === 'checkbox' ? $(id).checked : $(id).value]));
}

function cleanLines(text){ return text.split(/\n+/).map(v => v.trim()).filter(Boolean); }
function cleanKeywords(text){ return text.split(',').map(v => v.trim()).filter(Boolean); }

function buildPrompt(v){
  const links = cleanLines(v.sources);
  return `당신은 독자의 검색 의도를 정확히 이해하고, 과장 없이 신뢰도 높은 글을 쓰는 한국어 전문 블로그 에디터입니다.

[목표]
아래 조건에 맞춰 ${Number(v.length).toLocaleString('ko-KR')}자 안팎의 완성도 높은 블로그 글을 작성하세요.

[작성 조건]
- 주제: ${v.topic}
- 글 유형: ${v.category}
- 지역/분야: ${v.area || '특정 지역 없음'}
- 핵심 키워드: ${v.keywords || '주제에 맞게 자연스럽게 선정'}
- 주요 독자: ${v.audience || '주제에 관심 있는 일반 독자'}
- 문체: ${v.tone}. 문장은 자연스러운 존댓말로 씁니다.
- 이미지: 본문 사이에 [이미지 1: 장면 설명] 형식으로 ${v['image-count']}개의 위치를 제안합니다.

[반드시 반영할 사실]
${v.facts || '- 제공된 사실 정보 없음. 구체적인 수치나 영업시간을 임의로 만들지 마세요.'}

[글쓴이의 경험과 관점]
${v.voice || '- 개인 경험을 임의로 꾸며내지 말고 일반적인 관점으로 작성하세요.'}

[참고 출처]
${links.length ? links.map(x => '- ' + x).join('\n') : '- 제공된 링크 없음. 검증되지 않은 사실은 단정하지 말고 [확인 필요]라고 표시하세요.'}

[구성]
1. 핵심 키워드를 포함한 매력적인 제목 3개를 먼저 제안하세요.
2. 첫 문단은 독자의 상황에 공감하며 이 글에서 얻을 수 있는 답을 분명히 알려주세요.
3. H2 소제목 3~5개로 내용을 나누고, 필요한 곳에는 목록을 활용하세요.
4. 키워드는 제목·첫 문단·소제목·본문에 자연스럽게 분산하되 반복하지 마세요.
5. 사실과 개인 의견을 구분하고, 확인되지 않은 가격·수치·효능·운영 정보는 만들지 마세요.
6. 마지막에는 핵심 요약과 독자가 바로 할 수 있는 행동 한 가지를 제안하세요.
${v.disclosure ? '7. 글 첫머리에 “본 글은 광고·협찬을 포함합니다.”라는 고지 문구를 넣으세요.' : '7. 광고나 협찬을 암시하는 표현을 임의로 넣지 마세요.'}

[출력 형식]
네이버 블로그에 붙여넣기 좋은 자연스러운 한국어 본문으로 작성하세요. 마크다운의 표는 사용하지 말고, 짧은 문단과 명확한 소제목으로 가독성을 높이세요.`;
}

function buildDraft(v){
  const keys = cleanKeywords(v.keywords);
  const main = keys[0] || v.topic;
  const area = v.area || '일상 속';
  const disclosure = v.disclosure ? '[안내] 이 글은 광고·협찬을 포함하고 있습니다.\n\n' : '';
  const facts = cleanLines(v.facts);
  const voice = v.voice || '직접 경험해 보니 정보의 양보다 내 상황에 맞는 선택 기준이 더 중요했습니다.';
  return `${disclosure}# ${v.topic}

${v.topic}을(를) 찾고 계신가요? 정보는 많지만, 막상 내 상황에 맞는 답을 고르기는 쉽지 않습니다. 오늘은 ${v.audience || '이 주제에 관심 있는 분'}을 위해 꼭 필요한 기준만 차분히 정리해 보겠습니다.

이 글에서는 ${area}을(를) 중심으로 실제 선택에 도움이 되는 포인트와 놓치기 쉬운 확인 사항을 함께 살펴봅니다.

[이미지 1: 글의 분위기와 주제를 한눈에 보여주는 대표 이미지]

## 먼저 알아둘 핵심 포인트

${facts.length ? facts.map(x => `- ${x}`).join('\n') : '- 정확한 가격과 운영 정보는 방문 전 공식 채널에서 확인해 주세요.\n- 나의 목적과 동선을 먼저 정하면 선택이 쉬워집니다.'}

특히 ${main}을(를) 알아볼 때는 눈에 띄는 한 가지 장점만 보기보다 접근성, 시간, 비용, 실제 이용 목적을 함께 비교하는 것이 좋습니다.

## 내게 맞는 선택 기준

첫째, ‘왜 가는지’를 먼저 정해 보세요. 같은 장소나 서비스도 휴식, 데이트, 업무, 가족 나들이처럼 목적에 따라 만족도가 달라집니다.

둘째, 이동과 이용 시간을 현실적으로 계산하세요. 계획을 빽빽하게 채우기보다 한두 곳을 여유 있게 경험하는 편이 기억에 오래 남습니다.

[이미지 2: 공간·과정·제품의 디테일을 보여주는 가까운 장면]

셋째, 변동 가능한 정보는 마지막에 한 번 더 확인하세요. 운영 시간, 가격, 예약 방식은 달라질 수 있으니 공식 홈페이지나 최신 공지를 확인하는 습관이 필요합니다.

## 직접 적용해 본 관점

${voice}

이 관점으로 보면 ‘가장 유명한 곳’보다 ‘오늘의 나에게 잘 맞는 곳’을 찾게 됩니다. 검색 결과를 그대로 따라가기보다, 나의 우선순위를 세 가지 정도 적고 비교해 보세요.

[이미지 3: 실제 이용 상황이 자연스럽게 느껴지는 현장 이미지]

## 한눈에 정리하는 체크리스트

- 목적과 함께할 사람을 정했나요?
- 이동 동선과 머무를 시간을 확인했나요?
- 가격·운영 시간·예약 방법을 공식 채널에서 확인했나요?
- 후기의 작성 시점과 개인 취향을 구분했나요?
- 내 경험으로 덧붙일 한 문장이 있나요?

## 마무리

좋은 선택은 정보의 양보다 기준의 선명함에서 시작합니다. 오늘 소개한 내용을 바탕으로 ${main} 관련 후보를 두세 개로 좁힌 뒤, 가장 중요한 조건부터 비교해 보세요.

[이미지 4: 글의 여운을 남기는 마무리 장면]

※ 본문 속 변동 정보는 게시 전 반드시 다시 확인해 주세요.`;
}

function buildImages(v){
  const count = Number(v['image-count']);
  const ideas = [
    ['대표 이미지', `${v.topic}의 핵심 분위기가 한눈에 느껴지는 장면. 자연광, 여백 있는 구도, 텍스트 없는 가로 이미지.`],
    ['맥락과 장소', `${v.area || '주제와 관련된 공간'}의 특징을 보여주는 넓은 장면. 과도한 연출 없이 실제 방문한 듯 자연스럽게.`],
    ['디테일 컷', `${cleanKeywords(v.keywords)[0] || v.topic}을 상징하는 사물이나 과정을 가까이 촬영한 이미지.`],
    ['경험 장면', `${v.audience || '독자'}가 실제로 이용하는 상황을 보여주는 생생하지만 차분한 장면.`],
    ['체크리스트', `본문의 핵심 기준을 4~6개 항목으로 정리한 미니멀한 인포그래픽. 한국어, 밝은 배경.`],
    ['마무리 이미지', `글의 여운을 남기는 따뜻한 마무리 장면. 브랜드 컬러인 보라색을 작은 포인트로 사용.`]
  ];
  return ideas.slice(0,count).map((item,i) => `<article class="image-card"><div class="image-num">0${i+1}</div><div><h4>${item[0]}</h4><p>${item[1]}</p><small>본문 ${i === 0 ? '도입부' : i === count-1 ? '마무리' : `${i+1}번째 소제목 뒤`}</small></div></article>`).join('');
}

function updateScore(v){
  let score = 58;
  if(v.topic.length > 8) score += 8;
  if(cleanKeywords(v.keywords).length >= 2) score += 8;
  if(v.audience.length > 8) score += 7;
  if(v.facts.length > 25) score += 9;
  if(v.voice.length > 20) score += 7;
  if(v.sources.trim()) score += 3;
  $('score').textContent = Math.min(score,100);
}

function render(regenerate = false){
  const v = values();
  $('prompt-text').textContent = buildPrompt(v);
  $('image-briefs').innerHTML = buildImages(v);
  if(regenerate || !$('draft').value.trim()) $('draft').value = buildDraft(v);
  updateCount(); updateScore(v); save(false);
}

function updateCount(){ $('word-count').textContent = `${$('draft').value.length.toLocaleString('ko-KR')}자`; }
function toast(message){ const el=$('toast'); el.textContent=message; el.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>el.classList.remove('show'),2200); }
async function copyText(text){ try{ await navigator.clipboard.writeText(text); toast('클립보드에 복사했습니다.'); }catch{ toast('복사하지 못했습니다. 텍스트를 직접 선택해 주세요.'); } }

function save(showToast=true){
  localStorage.setItem(storageKey, JSON.stringify({form:values(),draft:$('draft').value,updated:Date.now()}));
  $('save-state').textContent='수정 내용 저장됨'; if(showToast) toast('초안을 브라우저에 저장했습니다.');
}

function restore(){
  try{
    const data=JSON.parse(localStorage.getItem(storageKey)); if(!data) return false;
    formIds.forEach(id=>{ if(data.form[id] === undefined) return; $(id).type === 'checkbox' ? $(id).checked=data.form[id] : $(id).value=data.form[id]; });
    $('draft').value=data.draft || ''; return true;
  }catch{return false;}
}

function download(name,content,type){ const blob=new Blob([content],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url); }
function safeName(){ return (values().topic || 'blog-draft').replace(/[\\/:*?"<>|]/g,'').slice(0,40); }

$('blog-form').addEventListener('submit',e=>{ e.preventDefault(); render(true); document.querySelector('[data-tab="draft"]').click(); toast('새 프롬프트와 초안을 만들었습니다.'); });
$('length').addEventListener('input',e=>{ $('length-output').textContent=`${Number(e.target.value).toLocaleString('ko-KR')}자 안팎`; e.target.style.background=`linear-gradient(90deg,var(--purple) ${(e.target.value-1000)/30}%,#e7e8ef ${(e.target.value-1000)/30}%)`; });
formIds.forEach(id=>$(id).addEventListener('input',()=>{ $('save-state').textContent='저장 중…'; clearTimeout(window.saveTimer); window.saveTimer=setTimeout(()=>render(false),450); }));
$('draft').addEventListener('input',()=>{ updateCount(); $('save-state').textContent='저장 중…'; clearTimeout(window.draftTimer); window.draftTimer=setTimeout(()=>save(false),500); });
document.querySelectorAll('.tabs button').forEach(btn=>btn.addEventListener('click',()=>{ document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active')); document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active')); btn.classList.add('active'); $(`${btn.dataset.tab}-panel`).classList.add('active'); }));
$('copy-prompt').addEventListener('click',()=>copyText($('prompt-text').textContent));
$('inline-copy').addEventListener('click',()=>copyText($('prompt-text').textContent));
$('save-draft').addEventListener('click',()=>save(true));
$('download-md').addEventListener('click',()=>download(`${safeName()}.md`,$('draft').value,'text/markdown;charset=utf-8'));
$('download-html').addEventListener('click',()=>{ const body=$('draft').value.split('\n').map(line=>line.startsWith('# ') ? `<h1>${line.slice(2)}</h1>` : line.startsWith('## ') ? `<h2>${line.slice(3)}</h2>` : line.startsWith('- ') ? `<li>${line.slice(2)}</li>` : line ? `<p>${line}</p>` : '').join('\n'); download(`${safeName()}.html`,`<!doctype html><html lang="ko"><meta charset="utf-8"><title>${safeName()}</title><body>${body}</body></html>`,'text/html;charset=utf-8'); });
$('open-chatgpt').addEventListener('click',async()=>{ await copyText($('prompt-text').textContent); window.open('https://chatgpt.com/','_blank','noopener'); });

restore();
$('length').dispatchEvent(new Event('input'));
render(false);
