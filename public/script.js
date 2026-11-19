const main=document.getElementById("main"),form=document.getElementById("searchForm"),input=document.getElementById("searchInput"),result=document.getElementById("result"),tabs=document.getElementById("tabs");
let lastQuery="";
function add(tag,text,parent,cls){const el=document.createElement(tag);el.textContent=text;if(cls)el.className=cls;parent.append(el);return el}
document.getElementById("clearBtn").addEventListener("click",()=>{input.value="";result.replaceChildren();input.focus()});
tabs.addEventListener("click",e=>{const b=e.target.closest("button[data-tab]");if(!b)return;tabs.querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));if(b.dataset.tab==="all")showSearch(lastQuery);else{result.replaceChildren();add("p",b.textContent+" results aren't available yet. Select All to see search results.",result,"meta")}});
async function showSearch(q){
 lastQuery=q;main.classList.add("results-mode");tabs.hidden=false;
 tabs.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.tab==="all"));
 result.replaceChildren();add("p","Searching Nebula...",result,"meta");
 try{
 const response=await fetch("/api/search?q="+encodeURIComponent(q));
 const data=await response.json();
 if(!response.ok)throw new Error(data.error||"Search failed");
 result.replaceChildren();
 add("p",(data.results||[]).length+" results · Wikipedia search",result,"meta");
 for(const item of data.results||[]){
 const article=document.createElement("article");
 add("span","en.wikipedia.org",article,"source");
 const link=add("a",item.title,article);link.href=item.url;link.target="_blank";link.rel="noopener noreferrer";
 add("p",item.description||"View article on Wikipedia.",article,"description");result.append(article);
 }
 if(!data.results?.length)add("p","No results found.",result);
 }catch(err){result.replaceChildren();add("p",err.message,result)}
}
form.addEventListener("submit",async e=>{
 e.preventDefault();const q=input.value.trim();if(!q)return;
 const isURL=!q.includes(" ")&&(/^(https?:\/\/)/i.test(q)||/^[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(q));
 if(!isURL){await showSearch(q);return}
 main.classList.add("results-mode");tabs.hidden=true;result.replaceChildren();add("p","Loading preview...",result);
 try{const url=/^https?:\/\//i.test(q)?q:"https://"+q;const response=await fetch("/api/proxy?url="+encodeURIComponent(url));const data=await response.json();if(!response.ok)throw new Error(data.error||"Preview unavailable");result.replaceChildren();add("h2",data.title||"Website Preview",result);add("p",data.content||"No text found.",result,"description")}catch(err){result.replaceChildren();add("p",err.message,result)}
});
