(() => {
"use strict";
const KEY="myfit.workplace.v1";
const categories={
"上半身":["壁腕立て","机腕立て","肩甲骨寄せ","肩回し","壁押し","タオルローイング","腕の外旋","ペットボトルカール"],
"下半身":["椅子スクワット","浅いスクワット","かかと上げ","つま先上げ","ヒップヒンジ","立位脚上げ","サイドレッグレイズ","座位膝伸ばし","立位ハムストリングカール","椅子から立ち上がり"],
"体幹":["立位ブレーシング","立位マーチ","座位マーチ","座位片膝上げ","パロフプレス","デスクプランク","立位バードドッグ","片手荷物保持"],
"リフレッシュ":["胸開き","肩甲骨運動","首の可動域運動","足首ポンプ","胸椎回旋","股関節ストレッチ"]
};
const exercises=Object.entries(categories).flatMap(([category,names])=>names.map(name=>({name,category})));
const plans={1:1,3:3,5:5,10:8};
const safeRead=()=>{try{const x=JSON.parse(localStorage.getItem(KEY));return x&&Array.isArray(x.sessions)?x:{sessions:[]};}catch{return {sessions:[]};}};
let state=safeRead(), minutes=3, chosen=[], completed=new Set();
const host=document.createElement("section");host.className="card";host.id="workplaceMini";host.innerHTML='<div class="section-title-row"><h3>職場ミニ筋トレ</h3><span class="badge">休憩ごとに</span></div><p class="muted">着替えず、短い休憩に。痛みがある運動は避けてください。</p><div id="wpDurations" class="button-row" style="grid-template-columns:repeat(4,1fr)"></div><label>場所・種目の分類<select id="wpCategory"><option value="all">すべて</option></select></label><div id="wpExercises"></div><button id="wpSave" class="primary full">今回の運動を保存</button><p id="wpStatus" class="muted" role="status" style="margin:12px 0 0"></p><details><summary>運動の一覧（32種類）</summary><div id="wpCatalog"></div></details>';
const target=document.querySelector("#todayView");if(!target)return;
target.append(host);
const $=id=>host.querySelector("#"+id);
Object.keys(categories).forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;$("wpCategory").append(o);});
$("wpCatalog").textContent=Object.entries(categories).map(([c,a])=>c+"："+a.join("、")).join("\n");
$("wpCatalog").style.whiteSpace="pre-wrap";
function pick(){const category=$("wpCategory").value;const pool=exercises.filter(e=>category==="all"||e.category===category);chosen=pool.slice(0,plans[minutes]);completed=new Set();render();}
function render(){
$("wpDurations").replaceChildren();
[1,3,5,10].forEach(n=>{const b=document.createElement("button");b.className=n===minutes?"primary small":"ghost small";b.textContent=n+"分";b.onclick=()=>{minutes=n;pick();};$("wpDurations").append(b);});
$("wpExercises").replaceChildren();
chosen.forEach((e,i)=>{const l=document.createElement("label");l.style.cssText="display:flex;gap:12px;align-items:center;border-bottom:1px solid #e5e7eb;padding:10px 0;margin:0";const c=document.createElement("input");c.type="checkbox";c.style.cssText="width:22px;height:22px;margin:0";c.checked=completed.has(i);c.onchange=()=>{c.checked?completed.add(i):completed.delete(i);};const t=document.createElement("span");t.textContent=e.name+"（"+e.category+"）";l.append(c,t);$("wpExercises").append(l);});
const today=new Date().toLocaleDateString("sv-SE");const sessions=state.sessions.filter(s=>s.day===today);$("wpStatus").textContent="今日 "+sessions.length+"回記録済み。保存先：この端末";
}
$("wpCategory").onchange=pick;
$("wpSave").onclick=()=>{if(!completed.size){$("wpStatus").textContent="完了した種目にチェックしてください。";return;}const now=new Date();state.sessions.push({id:crypto.randomUUID(),at:now.toISOString(),day:now.toLocaleDateString("sv-SE"),minutes,exercises:[...completed].map(i=>chosen[i].name)});try{localStorage.setItem(KEY,JSON.stringify(state));$("wpStatus").textContent="保存しました。";pick();}catch{$("wpStatus").textContent="保存できませんでした。空き容量を確認してください。";}};
pick();
})();