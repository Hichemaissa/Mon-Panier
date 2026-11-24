/* Mon Panier / Supabase storefront bridge.
   Without Supabase configuration the original demo store remains unchanged.
   Public users can read only published products; place_order validates prices server-side. */
(function(){
"use strict";
const cfg=window.MONPANIER_SUPABASE||{};
if(!cfg.url||!cfg.anonKey||!window.supabase){
 // Show demo products even if Supabase configuration or CDN is unavailable.
 STARTER_PRODUCTS.splice(0,STARTER_PRODUCTS.length);state.custom=[];renderProducts();renderCart();
 return;
}
const db=window.supabase.createClient(cfg.url,cfg.anonKey);
const shopOriginalPhone=state.phone;
function showDisplayFallback(){STARTER_PRODUCTS.splice(0,STARTER_PRODUCTS.length);state.custom=[];renderProducts();renderCart();}

// Keep database categories compatible with the four storefront filters.
function normalizeCategory(value){
 const v=String(value||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
 if(["laptops","laptop","pc-portables","pc_portables","pc portable","ordinateurs portables","portable","portables"].includes(v))return "laptops";
 if(["desktops","desktop","pc-de-bureau","pc_de_bureau","pc de bureau","ordinateurs de bureau","computers","ordinateurs"].includes(v))return "desktops";
 if(["screens","screen","ecrans","ecran","monitors","monitor","moniteurs"].includes(v))return "screens";
 if(["accessories","accessory","accessoires","accessoire","peripheriques"].includes(v))return "accessories";
 return v;
}
async function loadDynamicCategories(){
 const {data,error}=await db.from("categories").select("name,slug").eq("is_active",true).order("sort_order").order("name");
 if(error){console.warn("Catégories non activées",error.message);return}
 if(!data?.length)return;
 const allowed=["laptops","desktops","screens","printers","accessories"];
 const fixedNames={laptops:"PC portables",desktops:"PC de bureau",screens:"Écrans",printers:"Imprimantes",accessories:"Accessoires"};
 data.splice(0,data.length,...allowed.map(slug=>({slug,name:fixedNames[slug]})));
 data.forEach(c=>categoryNames[c.slug]=c.name);
 const filters=document.querySelector(".filters");
 if(filters){filters.replaceChildren();for(const c of [{slug:"all",name:"Tous les produits"},...data]){
 const b=document.createElement("button");b.className="filter"+(state.cat===c.slug?" active":"");b.dataset.category=c.slug;b.textContent=c.name;filters.appendChild(b)}}
 const nav=document.querySelector(".nav");
 if(nav){nav.querySelectorAll("[data-category]").forEach(x=>x.remove());for(const c of data){
 const b=document.createElement("button");b.dataset.category=c.slug;b.textContent=c.name;nav.appendChild(b)}}
 if(state.cat!=="all"&&!data.some(c=>c.slug===state.cat))state.cat="all";
}
function alertError(message){toast(message||"Une erreur est survenue.")}
async function refreshCatalog(){
 try{
  const [prod,settings]=await Promise.all([
   db.from("products").select("id,category,name,specs,price,old_price,badge,art,color,glow,image_url,image_urls,stock,is_active").eq("is_active",true).order("created_at",{ascending:false}),
   db.from("shop_settings").select("whatsapp").eq("id",1).maybeSingle()
  ]);
  if(prod.error)throw prod.error;
  if(settings.error)throw settings.error;
  // Remove all demonstration products in database mode.
  STARTER_PRODUCTS.splice(0,STARTER_PRODUCTS.length);
  state.custom=(prod.data||[]).map(p=>({
   id:p.id,category:normalizeCategory(p.category),name:p.name,specs:p.specs||"",price:Number(p.price),
   oldPrice:p.old_price===null?null:Number(p.old_price),
   badge:p.badge||"",art:p.art||"laptop",color:p.color||"#f58227",
   glow:p.glow||"#ffe0b9",image_url:p.image_url||(p.image_urls||[])[0]||({printers:"./images/generic-printer.svg",laptops:"./images/generic-laptop.svg"})[p.category]||"",image_urls:p.image_urls||[],stock:p.stock
  }));
  // Keep all eight illustrated showcase products visible alongside genuine published items.
  // Existing database products take priority when identifiers match.

  categoryNames.screens=categoryNames.screens||"Écrans";
  // Optional migration: additional photo URLs for the product detail gallery.
  // Keep the live catalogue usable if the owner has not applied the migration yet.
  try {
    const album=await db.from("products").select("id,image_urls").eq("is_active",true);
    if(!album.error){
      const extra=new Map((album.data||[]).map(row=>[row.id,Array.isArray(row.image_urls)?row.image_urls:[]]));
      state.custom.forEach(item=>{item.image_urls=extra.get(item.id)||[]});
    }
  }catch(err){console.warn("Product gallery not yet configured.",err)}
  state.phone=settings.data?.whatsapp||shopOriginalPhone;
  await loadDynamicCategories();
  // Synchroniser la photo de la fiche mise en avant avec le vrai produit.
  const featured=document.getElementById("featured-laptop-n2840");
  if(featured){
    const media=featured.querySelector(".featured-media");
    const match=(prod.data||[]).find(p=>
      p.category==="laptops" && ((p.name||"")+" "+(p.specs||"")).toUpperCase().includes("N2840") &&
      typeof p.image_url==="string" && p.image_url.startsWith("https://")
    );
    if(media&&match){
      const visual=media.querySelector(".visual"),note=media.querySelector(".photo-note");
      const photo=document.createElement("img");
      photo.src=match.image_url;
      photo.alt="Photo réelle du "+match.name;
      photo.loading="lazy";
      photo.style.cssText="display:block;width:100%;height:100%;min-height:230px;object-fit:contain;padding:12px";
      photo.addEventListener("error",()=>{
        photo.remove();
        if(visual)visual.style.display="";
        if(note)note.style.display="";
        media.setAttribute("aria-label","Emplacement réservé à la photo réelle du PC portable");
      },{once:true});
      if(visual)visual.style.display="none";
      if(note)note.style.display="none";
      media.setAttribute("aria-label",photo.alt);
      media.prepend(photo);
    }
  }
  const current=new Set(state.custom.map(x=>x.id));
  for(const key of Object.keys(state.cart)){if(!current.has(key))delete state.cart[key]}
  write("monpanier-cart",state.cart);
  if(document.querySelector("#catLaptop"))document.querySelector("#catLaptop").innerHTML='<span style="font-size:64px">💻</span>';
  if(document.querySelector("#catDesktop"))document.querySelector("#catDesktop").innerHTML='<span style="font-size:64px">🖥️</span>';
  if(document.querySelector("#catAccessory"))document.querySelector("#catAccessory").innerHTML='<span style="font-size:64px">⌨️</span>';
  renderProducts();renderCart();
  // All catalog changes happen in /admin.html, not in public local settings.
  const form=document.querySelector("#newProductForm");if(form)form.closest("div[style]")?.remove();
  const note=document.querySelector("#settingsDialog .note");if(note)note.textContent="Les produits sont gérés uniquement depuis le tableau de bord administrateur.";
  const settingsForm=document.querySelector("#settingsForm");
  if(settingsForm)settingsForm.closest(".dialog")?.classList.add("hidden"); // no public shop phone overrides
  const btns=document.querySelectorAll('[data-action="settings"]');btns.forEach(b=>b.style.display="none");
  document.dispatchEvent(new Event("monpanier:catalog-ready"));
  toast("Catalogue synchronisé ✓");
 }catch(error){console.error("Supabase catalog:",error);showDisplayFallback();toast("Catalogue de démonstration affiché · disponibilité à confirmer.");}
}
const curtain=document.createElement("div");
curtain.id="orderModal";curtain.hidden=true;
curtain.style.cssText="position:fixed;z-index:10000;inset:0;background:#1f1729b9;display:none;align-items:center;justify-content:center;padding:16px";
curtain.innerHTML='<form id="dbOrderForm" style="background:#fff;border-radius:20px;max-width:500px;width:100%;padding:24px;max-height:95vh;overflow:auto;box-shadow:0 12px 48px #19152455">' +
'<div style="display:flex;justify-content:space-between;align-items:center;gap:15px"><h2 style="margin:0;font-size:23px">Finaliser votre commande</h2><button type="button" id="closeDbOrder" aria-label="Fermer" style="border:0;background:none;font-size:28px;cursor:pointer">×</button></div>'+
'<p style="font-size:13px;color:#536070">Vos coordonnées servent uniquement au traitement de votre commande. Aucun paiement en ligne.</p>'+
'<label style="display:block;font-weight:600">Nom complet<input id="dbName" required minlength="2" maxlength="100" autocomplete="name" style="display:block;width:100%;margin:5px 0 12px;padding:11px;border:1px solid #ddd;border-radius:8px"></label>'+
'<label style="display:block;font-weight:600">Téléphone<input id="dbPhone" type="tel" required minlength="8" maxlength="20" autocomplete="tel" style="display:block;width:100%;margin:5px 0 12px;padding:11px;border:1px solid #ddd;border-radius:8px"></label>'+
'<label style="display:block;font-weight:600">Ville / Wilaya<input id="dbCity" required minlength="2" maxlength="80" style="display:block;width:100%;margin:5px 0 12px;padding:11px;border:1px solid #ddd;border-radius:8px"></label>'+
'<label style="display:block;font-weight:600">Adresse de livraison (facultatif)<input id="dbAddress" maxlength="250" style="display:block;width:100%;margin:5px 0 12px;padding:11px;border:1px solid #ddd;border-radius:8px"></label>'+
'<label style="display:block;font-weight:600">Notes (facultatif)<textarea id="dbNotes" maxlength="500" rows="2" style="display:block;width:100%;margin:5px 0 12px;padding:11px;border:1px solid #ddd;border-radius:8px"></textarea></label>'+
'<button id="dbSubmit" type="submit" style="padding:13px 16px;width:100%;background:#f58227;border:0;color:white;font-weight:800;border-radius:10px">Envoyer la demande de commande</button>'+
'<small style="display:block;margin-top:8px;color:#5d6775">Le vendeur confirmera les prix définitifs, la disponibilité et la livraison.</small></form>';
document.body.appendChild(curtain);
const close=()=>{curtain.style.display="none";curtain.hidden=true;document.body.style.overflow=""};
document.getElementById("closeDbOrder").addEventListener("click",close);
curtain.addEventListener("click",e=>{if(e.target===curtain)close()});
window.checkout=function(){
 const items=Object.entries(state.cart).filter(([id,qty])=>getProduct(id)&&qty>0);
 if(!items.length){alertError("Votre panier est vide.");return}
 curtain.hidden=false;curtain.style.display="flex";document.body.style.overflow="hidden";
};
document.getElementById("dbOrderForm").addEventListener("submit",async event=>{
 event.preventDefault();
 const items=Object.entries(state.cart).filter(([id,qty])=>getProduct(id)&&qty>0).map(([id,qty])=>({id,qty}));
 if(!items.length){close();alertError("Votre panier est vide.");return}
 const button=document.getElementById("dbSubmit");button.disabled=true;button.textContent="Enregistrement…";
 try{
  const {data,error}=await db.rpc("place_order",{
   p_customer_name:document.getElementById("dbName").value.trim(),
   p_customer_phone:document.getElementById("dbPhone").value.trim(),
   p_customer_city:document.getElementById("dbCity").value.trim(),
   p_customer_address:document.getElementById("dbAddress").value.trim(),
   p_notes:document.getElementById("dbNotes").value.trim(),
   p_items:items
  });
  if(error)throw error;
  const whatsappText=orderText();
  state.cart={};write("monpanier-cart",state.cart);renderCart();close();
  alert("Demande enregistrée ! Référence : "+String(data).slice(0,8)+". Le vendeur vous contactera pour confirmer.");
  if(state.phone)window.open("https://wa.me/"+state.phone+"?text="+encodeURIComponent("Bonjour, j'ai enregistré une commande n° "+String(data).slice(0,8)+".\n\n"+whatsappText),"_blank","noopener,noreferrer");
 }catch(err){
  console.error("Order failed",err);
  alertError("Commande non enregistrée : "+(err.message||"erreur de connexion"));
 }finally{button.disabled=false;button.textContent="Envoyer la demande de commande"}
});
refreshCatalog();
})();