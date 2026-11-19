const $=id=>document.getElementById(id);
const tabs=[];let active=null,nextId=1,bookmarks=[];
try{bookmarks=JSON.parse(localStorage.getItem("nebula-bookmarks")||"[]");if(!Array.isArray(bookmarks))bookmarks=[]}catch{bookmarks=[]}
const save=()=>{try{localStorage.setItem("nebula-bookmarks",JSON.stringify(bookmarks))}catch{}};
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e}
function current(){return tabs.find(t=>t.id===active)}
function isWebAddress(s){return !/\s/.test(s)&&(/^(https?:\/\/)/i.test(s)||/^(localhost|[a-z0-9-]+(\.[a-z0-9-]+)+)(:\d+)?(\/|$)/i.test(s))}
function normalize(s){try{const u=new URL(/^https?:\/\//i.test(s)?s:"https://"+s);if(!["https:","http:"].includes(u.protocol))return null;return u.href}catch{return null}}
function resolveInput(s){s=s.trim();if(!s)return {type:"home",value:""};if(isWebAddress(s)){const u=normalize(s);if(u)return{type:"web",value:u}}return{type:"search",value:s}}
function newTab(){const t={id:nextId++,history:[{type:"home",value:""}],index:0};tabs.push(t);active=t.id;render();return t}
function navigate(dest){const t=current();if(!t)return;t.history=t.history.slice(0,t.index+1);t.history.push(dest);t.index++;render()}
function switchTab(id){active=id;render()}
function closeTab(id){const i=tabs.findIndex(t=>t.id===id);if(i<0)return;tabs.splice(i,1);if(active===id)active=tabs[Math.min(i,tabs.length-1)]?.id??null;if(!tabs.length)newTab();else render()}
function position(){const t=current();return t?.history[t.index]}
function goBack(){const t=current();if(t&&t.index>0){t.index--;render()}}
function goForward(){const t=current();if(t&&t.index<t.history.length-1){t.index++;render()}}
function render(){
 const t=current(),p=position();if(!t||!p)return;
 $("tabList").replaceChildren();
 for(const tab of tabs){const page=tab.history[tab.index];const b=el("button",undefined,"tab"+(tab.id===active?" active":""));b.type="button";b.setAttribute("role","tab");b.setAttribute("aria-selected",String(tab.id===active));const title=el("span",page.type==="home"?"New tab":page.type==="search"?"Search: "+page.value:new URL(page.value).hostname,"tab-title");const x=el("span","×","tab-close");x.title="Close tab";x.addEventListener("click",e=>{e.stopPropagation();closeTab(tab.id)});b.append(title,x);b.addEventListener("click",()=>switchTab(tab.id));$("tabList").append(b)}
 $("address").value=p.type==="home"?"":p.value;$("back").disabled=t.index===0;$("forward").disabled=t.index===t.history.length-1;
 $("bookmark").textContent=bookmarks.some(b=>b.type===p.type&&b.value===p.value)?"★":"☆";
 const v=$("viewport");v.replaceChildren();
 if(p.type==="home")showHome(v);else if(p.type==="search")showSearch(v,p,t.id);else showWeb(v,p);
}
function showHome(v){const box=el("section",undefined,"start");box.append(el("h1","✦ Nebula"),el("p","Search or browse in your own tabs"));const f=el("form");const input=el("input");input.placeholder="Search Nebula or enter a website";input.setAttribute("aria-label","Search or enter website");const b=el("button","Search");f.append(input,b);f.addEventListener("submit",e=>{e.preventDefault();navigate(resolveInput(input.value))});box.append(f);v.append(box);input.focus()}
async function showSearch(v,p,tabId){const wrap=el("section",undefined,"results");wrap.append(el("h2","Search results for "+p.value),el("p","Searching Wikipedia..."));v.append(wrap);try{const r=await fetch("/api/search?q="+encodeURIComponent(p.value));const data=await r.json();if(!r.ok)throw Error(data.error||"Search failed");if(active!==tabId||position()!==p)return;wrap.replaceChildren(el("h2","Search results for "+p.value),el("p","Results from Wikipedia. Select a result to open it inside a Nebula tab where embedding is allowed."));for(const item of data.results||[]){const a=el("article");a.append(el("div",new URL(item.url).hostname,"source"));const link=el("a",item.title);link.href=item.url;link.addEventListener("click",e=>{e.preventDefault();navigate({type:"web",value:item.url})});a.append(link,el("p",item.description));wrap.append(a)}if(!data.results?.length)wrap.append(el("p","No results found."))}catch(e){if(active===tabId&&position()===p)wrap.append(el("p",e.message))}}
function showWeb(v,p){const shell=el("div",undefined,"embed-shell");const bar=el("div",undefined,"embed-banner");bar.append(el("span","Embedded page preview — some websites prevent embedding."));const external=el("a","Open original site ↗");external.href=p.value;external.target="_blank";external.rel="noopener noreferrer";bar.append(external);shell.append(bar);const iframe=el("iframe");iframe.title="Website preview";iframe.referrerPolicy="no-referrer";iframe.setAttribute("sandbox","allow-forms allow-scripts allow-same-origin allow-popups");iframe.src=p.value;shell.append(iframe);v.append(shell)}
function toggleBookmark(){const p=position();if(!p||p.type==="home")return;const i=bookmarks.findIndex(b=>b.type===p.type&&b.value===p.value);if(i>=0)bookmarks.splice(i,1);else bookmarks.push({...p});save();render();renderBookmarks()}
function renderBookmarks(){const list=$("bookmarksList");list.replaceChildren();if(!bookmarks.length)list.append(el("p","No bookmarks yet."));for(const b of bookmarks){const open=el("button",b.value);open.addEventListener("click",()=>{navigate({...b});$("bookmarksPanel").hidden=true});const remove=el("button","×","remove");remove.title="Remove bookmark";remove.addEventListener("click",()=>{bookmarks=bookmarks.filter(x=>x!==b);save();renderBookmarks();render()});list.append(open,remove)}}
$("newTab").addEventListener("click",newTab);$("back").addEventListener("click",goBack);$("forward").addEventListener("click",goForward);
$("home").addEventListener("click",()=>navigate({type:"home",value:""}));
$("refresh").addEventListener("click",render);
$("addressForm").addEventListener("submit",e=>{e.preventDefault();navigate(resolveInput($("address").value))});
$("bookmark").addEventListener("click",toggleBookmark);
$("showBookmarks").addEventListener("click",()=>{$("bookmarksPanel").hidden=!$("bookmarksPanel").hidden;renderBookmarks()});
newTab();