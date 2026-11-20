/* Mon Panier Informatique — accessible product detail pages and image gallery.
   URL format: ?produit=PRODUCT_ID. No invented alternative product photographs. */
(function(){
"use strict";
const d=document;
const main=d.querySelector("main");
if(!main) return;
const css=d.createElement("style");
css.textContent=[
".mp-detail[hidden]{display:none!important}.mp-detail{max-width:1200px;margin:0 auto;padding:22px 22px 80px;color:#2f292b;font-family:Outfit,Arial,sans-serif}",
".mp-detail a{color:inherit;text-decoration:none}.mp-detail .mp-back{display:inline-flex;align-items:center;gap:9px;border:1px solid #f3d7bf;border-radius:12px;background:#fff;padding:9px 17px;color:#a95110;font-weight:750;cursor:pointer}",
".mp-detail .mp-crumb{margin:18px 0;color:#966c4f;font-size:12px}",
".mp-panel{background:white;border:1px solid #f4e5d8;border-radius:22px;box-shadow:0 10px 32px #da8d3a12;padding:23px;display:grid;grid-template-columns:minmax(0,1.04fr) minmax(0,1fr);gap:34px}",
".mp-gallery-main{width:100%;aspect-ratio:1.13;display:flex;align-items:center;justify-content:center;border:1px solid #f0e2d6;background:#fffaf5;border-radius:17px;overflow:hidden;cursor:zoom-in}",
".mp-gallery-main img{display:block;max-width:100%;max-height:100%;width:100%;height:100%;object-fit:contain}",
".mp-gallery-main svg{width:100%;max-height:100%}.mp-gallery-main .art-svg{width:100%;height:100%}",
".mp-gallery-thumbs{display:flex;gap:10px;flex-wrap:wrap;margin:13px 0}.mp-thumb{width:76px;height:76px;border:2px solid #eee0d5;background:white;border-radius:12px;padding:3px;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden}",
".mp-thumb.active{border-color:#f47619;box-shadow:0 0 0 2px #fbe1c6}.mp-thumb img{height:100%;width:100%;object-fit:contain}",
".mp-gallery-caption{font-size:12px;color:#866c5d;margin:9px 0}",
".mp-gallery-nav{display:flex;justify-content:space-between;gap:12px;margin-top:10px}.mp-gallery-nav button{border:1px solid #f3d7bf;background:white;color:#ae5d24;border-radius:10px;padding:8px 16px;font-size:13px;cursor:pointer}",
".mp-eyebrow{font-weight:900;letter-spacing:.08em;font-size:12px;color:#ec7718;text-transform:uppercase}",
".mp-name{font-size:clamp(23px,3vw,33px);line-height:1.27;margin:10px 0 13px;color:#30242d}",
".mp-price{font-size:30px;color:#ef6d12;font-weight:900;margin:20px 0 8px}.mp-original{font-size:16px;color:#8e8a88;text-decoration:line-through;margin-left:8px}",
".mp-notice{background:#fff4e8;padding:12px 14px;border-radius:10px;color:#775339;font-size:12px;margin:12px 0 20px}",
".mp-info h3{font-size:17px;margin:26px 0 12px}.mp-specs{list-style:none;margin:0;padding:0;display:grid;gap:8px}.mp-specs li{padding:11px 12px;background:#fff8f2;border-radius:11px;color:#554537;font-size:13px}",
".mp-buy{display:flex;gap:10px;flex-wrap:wrap;margin-top:25px}.mp-buy button,.mp-buy a{background:#f47a17;color:#fff;border:0;border-radius:12px;padding:12px 20px;font-size:14px;font-weight:800;cursor:pointer;text-align:center}.mp-buy .mp-secondary{background:#fff7ee;color:#be5c14;border:1px solid #f6d1b1}",
".mp-related{margin-top:30px}.mp-related h2{font-size:21px}.mp-related-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.mp-related-card{display:block;border:1px solid #f3dfcd;border-radius:15px;background:white;padding:12px;cursor:pointer;text-align:left}.mp-related-card .mp-art{height:135px;background:#fff7f0;display:grid;place-items:center;border-radius:10px;overflow:hidden}.mp-related-card img{width:100%;height:100%;object-fit:contain}.mp-related-card svg{width:100%;height:100%}.mp-related-card strong{display:block;margin-top:8px;font-size:13px}.mp-related-card span{color:#e97013;font-weight:850}",
".mp-zoom{position:fixed;inset:0;background:#140e12ed;display:flex;align-items:center;justify-content:center;z-index:1000;padding:30px;cursor:zoom-out}.mp-zoom[hidden]{display:none}.mp-zoom img{max-width:96vw;max-height:94vh;object-fit:contain}",
"body.mp-detail-open>main,body.mp-detail-open>footer{display:none}",
"@media(max-width:780px){.mp-panel{grid-template-columns:1fr;gap:12px;padding:13px}.mp-detail{padding:13px 13px 55px}.mp-gallery-main{aspect-ratio:1.17}.mp-thumb{width:62px;height:62px}.mp-related-grid{grid-template-columns:repeat(2,1fr)}.mp-name{font-size:25px}.mp-buy>*{flex:1}}"
].join("\n");
d.head.appendChild(css);
const view=d.createElement("section");
view.className="mp-detail";view.id="mp-product-view";view.hidden=true;
view.setAttribute("aria-label","Détails du produit");
main.parentNode.insertBefore(view,main);
const zoom=d.createElement("div");
zoom.className="mp-zoom";zoom.hidden=true;zoom.setAttribute("role","dialog");zoom.setAttribute("aria-label","Photo agrandie");
zoom.addEventListener("click",()=>{zoom.hidden=true;d.body.style.overflow=""});
d.body.appendChild(zoom);
function safe(v){return String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function imageOK(v){
 if(typeof v!=="string")return false;
 return /^https:\/\//i.test(v)||/^\.?\/?images\/[a-z0-9._\/-]+$/i.test(v);
}
function photos(p){
 let candidates=[];
 if(typeof p.image_url==="string")candidates.push(p.image_url);
 if(Array.isArray(p.image_urls))candidates.push(...p.image_urls);
 if(Array.isArray(p.images))candidates.push(...p.images);
 return [...new Set(candidates.filter(imageOK))].slice(0,12);
}
function special(id){
 if(id==="thinkpad-i5-5")return {
 id:id,name:"Lenovo ThinkPad – Intel Core i5 (5e génération)",
 category:"laptops",specs:"Intel Core i5 (5e génération) • 8 Go RAM • SSD 120 Go",
 price:32000,image_url:"./images/lenovo-thinkpad-i5-5e.svg",
 availabilityNote:"Prix affiché sur la photo du vendeur. Confirmer le stock et les conditions avant achat.",inquiryOnly:true
 };
 if(id==="celeron-n2840")return {
 id:id,name:"PC portable 14 pouces – Intel Celeron N2840",category:"laptops",
 specs:"14 pouces • Intel Celeron N2840 • 4 Go RAM • SSD 120 Go • Windows 10 64 bits",
 price:null,image_url:"./images/pc-portable-celeron-n2840.webp",
 availabilityNote:"Batterie faible. Chargeur d'origine inclus. Prix sur demande.",inquiryOnly:true
 };
 return null;
}
function product(id){
 if(typeof getProduct==="function"){
   const found=getProduct(id);if(found)return found;
 }
 return special(id);
}
function money(v){return new Intl.NumberFormat("fr-DZ").format(Number(v))+" DA";}
let currentId=null,images=[],active=0,current=null;
function renderImage(){
 const holder=view.querySelector("#mp-gallery-main");
 const thumbs=view.querySelector("#mp-gallery-thumbs");
 if(!holder||!thumbs)return;
 if(!images.length){
  holder.innerHTML=typeof art==="function"?art(current):'<span>Photo non disponible</span>';
  thumbs.innerHTML="";
  holder.style.cursor="default";
  return;
 }
 holder.innerHTML='<img src="'+safe(images[active])+'" alt="'+safe(current.name)+' — photo '+(active+1)+'" loading="eager">';
 holder.style.cursor="zoom-in";
 thumbs.innerHTML=images.map((url,i)=>'<button class="mp-thumb'+(i===active?" active":"")+'" type="button" data-mp-photo="'+i+'" aria-label="Voir la photo '+(i+1)+'"><img src="'+safe(url)+'" alt="" loading="lazy"></button>').join("");
 const counter=view.querySelector("#mp-photo-counter");
 if(counter)counter.textContent="Photo "+(active+1)+" sur "+images.length;
 const nav=view.querySelector(".mp-gallery-nav");
 if(nav)nav.style.display=images.length>1?"flex":"none";
}
function relatedCards(p){
 if(typeof allProducts!=="function")return "";
 return allProducts().filter(x=>x.category===p.category&&x.id!==p.id&&x.is_active!==false).slice(0,4).map(x=>{
  const pics=photos(x);
  const visual=pics.length?'<img loading="lazy" src="'+safe(pics[0])+'" alt="">':typeof art==="function"?art(x):"";
  return '<button type="button" class="mp-related-card" data-mp-product="'+safe(x.id)+'"><div class="mp-art">'+visual+'</div><strong>'+safe(x.name)+'</strong><span>'+money(x.price)+'</span></button>';
 }).join("");
}
function show(id){
 const p=product(id);
 currentId=id;
 view.hidden=false;d.body.classList.add("mp-detail-open");
 if(!p){
  view.innerHTML='<button type="button" class="mp-back" data-mp-back>← Retour à la boutique</button><p style="padding:40px 0">Chargement du produit…</p>';
  d.title="Produit | Mon Panier Informatique";
  return false;
 }
 current=p;images=photos(p);active=0;
 const category=({laptops:"PC portables",desktops:"PC de bureau",accessories:"Accessoires"})[p.category]||"Produits";
 const specs=String(p.specs||"").split("•").map(s=>s.trim()).filter(Boolean);
 const price=p.price==null||p.inquiryOnly&&p.price==null?"Prix sur demande":money(p.price);
 const priceHtml='<div class="mp-price">'+safe(price)+(p.oldPrice?'<span class="mp-original">'+money(p.oldPrice)+'</span>':"")+'</div>';
 const note=p.availabilityNote||(p.inquiryOnly?"Disponibilité à confirmer auprès du vendeur.":"Prix et stock à confirmer au moment de la commande.");
 const whatsapp=(typeof state==="object"&&state.phone)||"213560283892";
 const query="Bonjour, je souhaite des informations sur "+p.name+(p.price?" (prix affiché : "+money(p.price)+")":"")+". Est-il disponible ?";
 const wa="https://wa.me/"+encodeURIComponent(whatsapp.replace(/\D/g,""))+"?text="+encodeURIComponent(query);
 const buying=p.inquiryOnly?'<a target="_blank" rel="noopener noreferrer" href="'+safe(wa)+'">Demander sur WhatsApp</a>':'<button type="button" data-mp-add>+ Ajouter au panier</button><a class="mp-secondary" target="_blank" rel="noopener noreferrer" href="'+safe(wa)+'">Poser une question</a>';
 const related=relatedCards(p);
 view.innerHTML='<button type="button" class="mp-back" data-mp-back>← Retour à la boutique</button>'+
 '<p class="mp-crumb">Mon Panier Informatique / '+safe(category)+' / '+safe(p.name)+'</p>'+
 '<div class="mp-panel">'+
 '<div class="mp-gallery"><div class="mp-gallery-main" id="mp-gallery-main"></div>'+
 '<div class="mp-gallery-thumbs" id="mp-gallery-thumbs" aria-label="Photos du produit"></div>'+
 '<div class="mp-gallery-nav"><button type="button" data-mp-prev>‹ Photo précédente</button><button type="button" data-mp-next>Photo suivante ›</button></div>'+
 '<p class="mp-gallery-caption" id="mp-photo-counter"></p>'+
 '</div>'+
 '<div class="mp-info"><span class="mp-eyebrow">'+safe(category)+'</span><h1 class="mp-name">'+safe(p.name)+'</h1>'+
 priceHtml+'<p class="mp-notice">'+safe(note)+'</p>'+
 '<h3>Caractéristiques</h3><ul class="mp-specs">'+(specs.length?specs.map(x=>'<li>'+safe(x)+'</li>').join(""):'<li>Caractéristiques disponibles sur demande</li>')+'</ul>'+
 '<div class="mp-buy">'+buying+'</div>'+
 '</div></div>'+
 (related?'<div class="mp-related"><h2>Autres produits similaires</h2><div class="mp-related-grid">'+related+'</div></div>':'');
 renderImage();
 if(images.length===1){view.querySelector("#mp-photo-counter").textContent="1 photo disponible — d'autres vues seront ajoutées quand elles seront fournies."}
 if(images.length===0){view.querySelector("#mp-photo-counter").textContent="Aucune photo réelle disponible pour ce produit."}
 d.title=p.name+" | Mon Panier Informatique";
 return true;
}
function open(id,replace){
 if(!id)return;
 const url=new URL(location.href);url.searchParams.set("produit",id);
 if(replace)history.replaceState({product:id},"",url);
 else history.pushState({product:id},"",url);
 show(id);window.scrollTo({top:0,behavior:"auto"});
}
function back(){
 const url=new URL(location.href);url.searchParams.delete("produit");
 history.pushState({},"",url);
 view.hidden=true;d.body.classList.remove("mp-detail-open");
 d.title="Mon Panier Informatique";
 window.scrollTo({top:0,behavior:"auto"});
}
d.addEventListener("click",event=>{
 const direct=event.target.closest('[data-action="detail"]');
 const card=event.target.closest(".product[data-mp-product],.featured-laptop[data-mp-product]");
 if(direct || card){
  if(!direct && event.target.closest("a,button,input,select,textarea,[data-action]"))return;
  const id=(direct&&direct.dataset.id)||(card&&card.dataset.mpProduct);
  if(id){event.preventDefault();event.stopImmediatePropagation();open(id);return;}
 }
},true);
d.addEventListener("keydown",event=>{
 if(event.key!=="Enter"&&event.key!==" ")return;
 const card=event.target.closest(".product[data-mp-product],.featured-laptop[data-mp-product]");
 if(card&&event.target===card){event.preventDefault();open(card.dataset.mpProduct)}
});
view.addEventListener("click",event=>{
 const photoBtn=event.target.closest("[data-mp-photo]");
 if(photoBtn){active=Number(photoBtn.dataset.mpPhoto);renderImage();return;}
 if(event.target.closest("[data-mp-next]")){active=(active+1)%images.length;renderImage();return;}
 if(event.target.closest("[data-mp-prev]")){active=(active-1+images.length)%images.length;renderImage();return;}
 if(event.target.closest("[data-mp-back]")){back();return;}
 if(event.target.closest("[data-mp-add]")){
  if(current&&!current.inquiryOnly&&typeof add==="function"){add(current.id)}return;
 }
 const rel=event.target.closest("[data-mp-product]");
 if(rel){open(rel.dataset.mpProduct);return;}
 if(event.target.closest("#mp-gallery-main") && images.length){
  zoom.innerHTML='<img src="'+safe(images[active])+'" alt="'+safe(current.name)+'">';
  zoom.hidden=false;d.body.style.overflow="hidden";
 }
});
d.addEventListener("keydown",event=>{if(event.key==="Escape"&&!zoom.hidden){zoom.hidden=true;d.body.style.overflow="";event.stopImmediatePropagation()}},true);
window.addEventListener("popstate",()=>{
 const id=new URL(location.href).searchParams.get("produit");
 if(id)show(id);else{view.hidden=true;d.body.classList.remove("mp-detail-open");d.title="Mon Panier Informatique";}
});
window.MonPanierProductPages={open,show};
const id=new URL(location.href).searchParams.get("produit");
if(id){show(id);window.scrollTo(0,0)}
d.addEventListener("monpanier:catalog-ready",()=>{if(currentId)show(currentId)});
})();