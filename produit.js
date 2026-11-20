/* Product page for Mon Panier Informatique. Each product has its own shareable URL. */
(() => {
"use strict";
const $=selector=>document.querySelector(selector);
const $id=id=>document.getElementById(id);
const names={laptops:"PC portables",desktops:"PC de bureau",accessories:"Accessoires"};
const demo=Array.isArray(window.MONPANIER_DEMO_PRODUCTS)?window.MONPANIER_DEMO_PRODUCTS:[];
const params=new URL(location.href).searchParams;
const id=params.get("produit")||params.get("id");
const cfg=window.MONPANIER_SUPABASE||{};
const db=cfg.url&&cfg.anonKey&&window.supabase?window.supabase.createClient(cfg.url,cfg.anonKey):null;
const money=n=>new Intl.NumberFormat("fr-DZ").format(Number(n))+" DA";
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const productSpecial={
  "thinkpad-i5-5":{id:"thinkpad-i5-5",name:"Lenovo ThinkPad – Intel Core i5 (5e génération)",category:"laptops",
    specs:"Intel Core i5 (5e génération) • 8 Go RAM • SSD 120 Go",price:32000,
    image_url:"./images/lenovo-thinkpad-i5-5e.svg",inquiryOnly:true,stock:null,
    note:"Prix indiqué sur la photo fournie par le vendeur. Disponibilité et état à confirmer."},
  "celeron-n2840":{id:"celeron-n2840",name:"PC portable 14 pouces – Intel Celeron N2840",category:"laptops",
    specs:"Écran 14 pouces • Intel Celeron N2840 • 4 Go RAM • SSD 120 Go • Windows 10 64 bits",
    price:null,image_url:"./images/pc-portable-celeron-n2840.webp",inquiryOnly:true,stock:null,
    note:"Batterie faible. Chargeur d'origine inclus. Prix sur demande."}
};
let current=null,photos=[],active=0,phone="213560283892";
function validImage(url){
 return typeof url==="string"&&(
   /^https:\/\//i.test(url) ||
   /^\.\/images\/[a-z0-9._\/-]+$/i.test(url)
 );
}
function galleryOf(p){
 const all=[p.image_url,...(Array.isArray(p.image_urls)?p.image_urls:[])];
 return [...new Set(all.filter(validImage))].slice(0,12);
}
function fallbackIllustration(category){
 const icon=category==="laptops"?"💻":category==="desktops"?"🖥️":"🎧";
 return '<div class="placeholder" role="img" aria-label="Visuel illustratif, pas de photo réelle">'+
 '<div><div style="font-size:84px;line-height:1.3">'+icon+'</div>'+
 '<span>Aucune photo réelle disponible pour ce produit</span></div></div>';
}
function renderPhoto(){
 const hero=$id("hero-photo"),thumbs=$id("thumbs");
 if(!photos.length){
   hero.innerHTML=fallbackIllustration(current.category);
   thumbs.innerHTML="";
   $id("photo-count").textContent="Photo du produit non disponible";
   $id("previous").hidden=true;$id("next").hidden=true;
   return;
 }
 const url=photos[active];
 hero.innerHTML='<img src="'+safe(url)+'" alt="'+safe(current.name)+' — photo '+(active+1)+'" loading="eager" decoding="async">';
 thumbs.innerHTML=photos.map((u,i)=>'<button type="button" class="thumb'+(i===active?" active":"")+'" data-photo="'+i+'" aria-label="Voir la photo '+(i+1)+'"><img loading="lazy" src="'+safe(u)+'" alt=""></button>').join("");
 $id("photo-count").textContent=photos.length===1?"1 photo disponible":"Photo "+(active+1)+" sur "+photos.length;
 $id("previous").hidden=photos.length<=1;
 $id("next").hidden=photos.length<=1;
}
function choosePhoto(i){
 if(!photos.length)return;
 active=(i+photos.length)%photos.length;
 renderPhoto();
}
$id("previous").addEventListener("click",()=>choosePhoto(active-1));
$id("next").addEventListener("click",()=>choosePhoto(active+1));
$id("thumbs").addEventListener("click",e=>{
 const node=e.target.closest("[data-photo]");if(node)choosePhoto(Number(node.dataset.photo));
});
const zoom=$id("zoom");
$id("hero-photo").addEventListener("click",e=>{
 if(!photos.length||!e.target.closest("img"))return;
 $id("zoom-image").src=photos[active];
 $id("zoom-image").alt=current.name;
 zoom.hidden=false;document.body.style.overflow="hidden";
});
function closeZoom(){zoom.hidden=true;document.body.style.overflow="";}
$id("close-zoom").addEventListener("click",closeZoom);
zoom.addEventListener("click",e=>{if(e.target===zoom||e.target.tagName==="IMG")closeZoom()});
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&!zoom.hidden)closeZoom();
 if(e.key==="ArrowRight"&&photos.length>1&&zoom.hidden===false)choosePhoto(active+1);
 if(e.key==="ArrowLeft"&&photos.length>1&&zoom.hidden===false)choosePhoto(active-1);
});
function productHTML(p){
 current=p;photos=galleryOf(p);active=0;
 $id("loading").hidden=true;
 $id("error").hidden=true;
 $id("product").hidden=false;
 $id("crumb-category").textContent=names[p.category]||"Produits";
 $id("crumb-name").textContent=p.name;
 $id("product-category").textContent=names[p.category]||"Produits";
 $id("product-name").textContent=p.name;
 document.title=p.name+" | Mon Panier Informatique";
 $id("product-price").textContent=p.price==null?"Prix sur demande":money(p.price);
 if(p.old_price&&Number(p.old_price)>Number(p.price)){
   const old=document.createElement("span");old.className="old-price";
   old.textContent=" "+money(p.old_price);$id("product-price").appendChild(old);
 }
 $id("product-notice").textContent=p.note||"Prix et disponibilité à confirmer auprès du vendeur.";
 const specList=String(p.specs||"").split("•").map(s=>s.trim()).filter(Boolean);
 $id("product-specs").innerHTML=specList.length?specList.map(v=>"<li>"+safe(v)+"</li>").join(""):"<li>Caractéristiques sur demande</li>";
 const wa="Bonjour, je souhaite des informations sur "+p.name+(p.price!=null?" — prix affiché : "+money(p.price):"")+". Est-il disponible ?";
 $id("whatsapp").href="https://wa.me/"+phone+"?text="+encodeURIComponent(wa);
 const add=$id("add-cart");
 add.hidden=!!p.inquiryOnly||p.price==null||p.stock===0;
 renderPhoto();
}
async function fetchProduct(id){
 if(productSpecial[id])return productSpecial[id];
 if(db){
   try{
     const {data,error}=await db.from("products").select("*").eq("id",id).eq("is_active",true).maybeSingle();
     if(error)throw error;
     if(data)return data;
   }catch(e){
     console.warn("Unable to read current Supabase product",e);
   }
 }
 return demo.find(x=>x.id===id)||null;
}
async function fetchRelated(p){
 const related=$id("related"),grid=$id("related-grid");
 let options=[];
 if(db){
  try{
   const {data,error}=await db.from("products").select("id,name,price,image_url,category,is_active").eq("is_active",true).eq("category",p.category).neq("id",p.id).limit(4);
   if(!error&&Array.isArray(data))options=data;
  }catch(e){console.warn(e)}
 }
 if(!options.length)options=demo.filter(x=>x.category===p.category&&x.id!==p.id).slice(0,4);
 if(!options.length){related.hidden=true;return}
 related.hidden=false;
 grid.innerHTML=options.map(x=>{
  const photo=validImage(x.image_url)?'<img loading="lazy" src="'+safe(x.image_url)+'" alt="'+safe(x.name)+'">': '<div class="placeholder" aria-label="Illustration">💻</div>';
  return '<a class="related-item" href="./produit.html?produit='+encodeURIComponent(x.id)+'"><div class="related-thumb">'+photo+'</div><b>'+safe(x.name)+'</b><span>'+money(x.price)+'</span></a>';
 }).join("");
}
async function load(){
 if(!id||id.length>140){$id("loading").hidden=true;$id("error").hidden=false;return}
 if(db){
  try{
   const {data}=await db.from("shop_settings").select("whatsapp").eq("id",1).maybeSingle();
   if(data&&/^\d{9,15}$/.test(String(data.whatsapp||"")))phone=String(data.whatsapp);
  }catch(e){console.warn(e)}
 }
 const p=await fetchProduct(id);
 if(!p){$id("loading").hidden=true;$id("error").hidden=false;return}
 productHTML(p);
 await fetchRelated(p);
}
$id("add-cart").addEventListener("click",()=>{
 if(!current||current.inquiryOnly||current.price==null||current.stock===0)return;
 try{
  const cart=JSON.parse(localStorage.getItem("monpanier-cart")||"{}");
  cart[current.id]=Math.min(99,(Number(cart[current.id])||0)+1);
  localStorage.setItem("monpanier-cart",JSON.stringify(cart));
  location.href="./index.html?panier=1";
 }catch(e){alert("Impossible d'ajouter au panier sur cet appareil.")}
});
load().catch(e=>{$id("loading").hidden=true;$id("error").hidden=false;console.error(e)});
})();
