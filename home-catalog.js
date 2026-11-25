
"use strict";
const STARTER_PRODUCTS=[
{"id":"demo-epson-l3250","category":"printers","name":"Epson EcoTank L3250","specs":"Multifonction à réservoirs d’encre • Wi-Fi • Démonstration","price":59000,"oldPrice":null,"badge":"Démo · prix indicatif","stock":0,"art":"printer","color":"#f58227","glow":"#ffe0b9","image_url":"https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=520&auto=format&fit=crop&q=75","gallery":["https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=520&auto=format&fit=crop&q=75&crop=center","https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=520&auto=format&fit=crop&q=75&crop=left","https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=520&auto=format&fit=crop&q=75&crop=right","https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=520&auto=format&fit=crop&q=75&crop=top","https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=520&auto=format&fit=crop&q=75&crop=bottom"]},
{"id":"demo-hp-m404dn","category":"printers","name":"HP LaserJet Pro M404dn","specs":"Laser monochrome • Ethernet • Démonstration","price":68000,"oldPrice":null,"badge":"Démo · prix indicatif","stock":0,"art":"printer","color":"#f58227","glow":"#ffe0b9","image_url":"https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?w=520&auto=format&fit=crop&q=75","gallery":["https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?w=520&auto=format&fit=crop&q=75&crop=center","https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?w=520&auto=format&fit=crop&q=75&crop=left","https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?w=520&auto=format&fit=crop&q=75&crop=right","https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?w=520&auto=format&fit=crop&q=75&crop=top","https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?w=520&auto=format&fit=crop&q=75&crop=bottom"]},
{"id":"suggest-laptop-office","category":"laptops","name":"PC Portable 14 pouces","specs":"Référence à confirmer","price":69000,"oldPrice":null,"badge":"Démonstration · prix indicatif","stock":0,"art":"laptop","color":"#f58227","glow":"#ffe0b9","image_url":"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=520&auto=format&fit=crop&q=75"},
{"id":"suggest-laptop-pro","category":"laptops","name":"PC Portable Pro 15 pouces","specs":"Référence à confirmer","price":119000,"oldPrice":null,"badge":"Démonstration · prix indicatif","stock":0,"art":"laptop","color":"#f58227","glow":"#ffe0b9","image_url":"https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=520&auto=format&fit=crop&q=75"},
{"id":"suggest-desktop-office","category":"desktops","name":"PC Bureautique","specs":"Référence à confirmer","price":58000,"oldPrice":null,"badge":"Démonstration · prix indicatif","stock":0,"art":"desktop","color":"#f58227","glow":"#ffe0b9","image_url":"https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=520&auto=format&fit=crop&q=75"},
{"id":"suggest-desktop-setup","category":"desktops","name":"PC Polyvalent","specs":"Référence à confirmer","price":108000,"oldPrice":null,"badge":"Démonstration · prix indicatif","stock":0,"art":"desktop","color":"#f58227","glow":"#ffe0b9","image_url":"https://images.unsplash.com/photo-1527430253228-e93688616381?w=520&auto=format&fit=crop&q=75"},
{"id":"suggest-screen-office","category":"screens","name":"Écran Bureautique","specs":"Référence à confirmer","price":22500,"oldPrice":null,"badge":"Démonstration · prix indicatif","stock":0,"art":"monitor","color":"#f58227","glow":"#ffe0b9","image_url":"https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=520&auto=format&fit=crop&q=75"},
{"id":"suggest-screen-wide","category":"screens","name":"Écran Grand Format","specs":"Référence à confirmer","price":39500,"oldPrice":null,"badge":"Démonstration · prix indicatif","stock":0,"art":"monitor","color":"#f58227","glow":"#ffe0b9","image_url":"https://images.unsplash.com/photo-1547082299-de196ea013d6?w=520&auto=format&fit=crop&q=75"},
{"id":"suggest-accessory-keyboard","category":"accessories","name":"Clavier pour ordinateur","specs":"Référence à confirmer","price":4500,"oldPrice":null,"badge":"Démonstration · prix indicatif","stock":0,"art":"keyboard","color":"#f58227","glow":"#ffe0b9","image_url":"https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=520&auto=format&fit=crop&q=75"},
{"id":"suggest-accessory-mouse","category":"accessories","name":"Souris pour ordinateur","specs":"Référence à confirmer","price":2200,"oldPrice":null,"badge":"Démonstration · prix indicatif","stock":0,"art":"mouse","color":"#f58227","glow":"#ffe0b9","image_url":"https://images.unsplash.com/photo-1527814050087-3793815479db?w=520&auto=format&fit=crop&q=75"}
];
const $=(sel,root=document)=>root.querySelector(sel);
const $$=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
function read(key,fallback){try{const v=JSON.parse(localStorage.getItem(key));return v??fallback}catch{return fallback}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
const requestedCategory=new URLSearchParams(location.search).get("categorie");
const initialCategory=["laptops","desktops","screens","accessories","printers","resellers"].includes(requestedCategory)?requestedCategory:"all";
const state={cat:initialCategory,sort:"default",query:"",favoritesOnly:false,cart:read("monpanier-cart",{}),favorites:new Set(read("monpanier-likes",[])),phone:read("monpanier-phone","213560283892"),custom:read("monpanier-custom",[])};
const categoryNames={laptops:"PC portables",desktops:"PC de bureau",screens:"Écrans",accessories:"Accessoires",printers:"Imprimantes",resellers:"Espace Revendeur"};
// Fixed sample catalog remains available if the live API returns partial results.
const CATEGORY_SAMPLES=STARTER_PRODUCTS.map(p=>({...p}));
const SHOP_LAPTOPS=[
 {id:"thinkpad-i5-5",category:"laptops",name:"Lenovo ThinkPad – Intel Core i5 (5ᵉ génération)",specs:"Intel Core i5 (5ᵉ génération) • 8 Go RAM • SSD 120 Go • Occasion",price:32000,badge:"Occasion",art:"laptop",color:"#f58227",glow:"#ffe0b9",image_url:"./images/lenovo-thinkpad-i5-5e.svg"},
 {id:"celeron-n2840",category:"laptops",name:"PC portable 14 pouces – Intel Celeron N2840",specs:"14 pouces • 2,16 GHz • 4 Go RAM • SSD 120 Go • Intel HD Graphics • Windows 10 64 bits • Batterie faible, chargeur d’origine inclus",price:null,badge:"Prix sur demande",art:"laptop",color:"#f58227",glow:"#ffe0b9",image_url:"./images/pc-portable-celeron-n2840.webp"}
];
const allProducts=()=>state.custom;
const getProduct=id=>allProducts().find(x=>x.id===id);
const fmt=n=>new Intl.NumberFormat("fr-DZ").format(n);
const priceHTML=p=>p.price==null?"Prix sur demande":`${fmt(p.price)} <span class="currency">DA</span>`;
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function art(p){
 if(p.image_url&&(/^https:\/\//i.test(p.image_url)||/^\.\/images\/[\w.-]+$/i.test(p.image_url)))return '<img loading="lazy" decoding="async" alt="'+safe(p.name)+'" src="'+safe(p.image_url)+'" style="width:100%;height:100%;max-height:none;object-fit:contain;padding:0">';
 const id=p.id.replace(/[^a-z0-9]/gi,""),c=p.color;
 const prefix=`<svg class="art-svg" viewBox="0 0 300 230" aria-hidden="true"><defs>
 <linearGradient id="met${id}" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#b6c7d6"/><stop offset=".52" stop-color="#ecf4f9"/><stop offset="1" stop-color="#66798e"/></linearGradient>
 <linearGradient id="scr${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#101e3b"/><stop offset=".65" stop-color="${c}"/><stop offset="1" stop-color="#171b4d"/></linearGradient></defs><ellipse cx="150" cy="196" rx="115" ry="15" fill="#0a264c" opacity=".08"/>`;
 let main="";
 if(["laptop","gaming"].includes(p.art)){
 main=`<g transform="translate(15 8)"><rect x="48" y="31" width="202" height="136" rx="8" fill="#42576b"/><rect x="54" y="36" width="190" height="125" rx="3" fill="url(#scr${id})"/><path d="M54 142q47-82 97-34t93-42v95H54Z" fill="${c}" opacity=".38"/><path d="M54 153q80-60 131-12t59-15v35H54Z" fill="#c4f8ff" opacity=".27"/><path d="M45 166h211l31 27q6 5-2 8H16q-9-3-2-8Z" fill="url(#met${id})"/><path d="M50 168h202l17 17H32Z" fill="#879bad" opacity=".75"/><path d="M104 186h91l9 11h-110Z" fill="#cad6df"/></g>`;
 }else if(["desktop","aio","mini","tower"].includes(p.art)){
 if(p.art==="tower")main=`<g><path d="M93 23h108l18 19v152l-18 16H93l-13-17V37Z" fill="#26334c"/><path d="M99 32h95v169H99Z" fill="#111c31"/><path d="M108 43h76v127h-76Z" fill="url(#scr${id})" opacity=".8"/><circle cx="146" cy="80" r="22" fill="none" stroke="${c}" stroke-width="6"/><circle cx="146" cy="80" r="9" fill="#8bdff0" opacity=".55"/><circle cx="146" cy="142" r="21" fill="none" stroke="#b7bbff" stroke-width="6"/><path d="M202 43v148" stroke="#a7d3db" stroke-width="3"/><circle cx="146" cy="189" r="3" fill="#a7ffe8"/></g>`;
 else {main=`<g><rect x="43" y="33" width="${p.art==="mini"?"185":"200"}" height="126" rx="7" fill="#26364b"/><rect x="49" y="39" width="${p.art==="mini"?"173":"188"}" height="114" rx="2" fill="url(#scr${id})"/><path d="M49 135q53-101 98-39t93-29v86H49Z" fill="${c}" opacity=".45"/><rect x="127" y="158" width="29" height="30" fill="#8094ab"/><path d="M98 188h88l15 7H85Z" fill="#a5b4c3"/>`;
 if(p.art==="mini")main+=`<rect x="235" y="142" width="48" height="40" rx="7" fill="#2e3e54"/><circle cx="259" cy="161" r="4" fill="${c}"/>`;
 else if(p.art==="desktop")main+=`<rect x="248" y="46" width="45" height="142" rx="8" fill="#1c2940"/><rect x="253" y="58" width="35" height="90" rx="4" fill="#223752"/><circle cx="271" cy="86" r="13" fill="none" stroke="${c}" stroke-width="4"/><circle cx="271" cy="124" r="13" fill="none" stroke="#89e3ed" stroke-width="4"/>`;
 else main+=`<path d="M78 156h129" stroke="#9eaab9" stroke-width="3"/>`;main+="</g>";}
 }else if(p.art==="keyboard"){
 main=`<g transform="translate(11 19) rotate(-9 150 125)"><path d="M24 69H267l21 93H10Z" fill="#22354b"/><path d="M31 77H260l16 76H21Z" fill="#41546b"/>`;
 for(let r=0;r<4;r++)for(let col=0;col<12;col++){let x=33+col*19+(r%2?3:0),y=84+r*17;main+=`<rect x="${x}" y="${y}" width="15" height="12" rx="3" fill="${(r+col)%3===0?c:"#c1cfda"}" opacity=".92"/>`};main+="</g>";
 }else if(p.art==="mouse"){
 main=`<g transform="translate(75 8)"><path d="M78 25C32 25 24 71 24 128c0 52 21 78 56 78s57-26 57-78c0-56-13-103-59-103Z" fill="#25364b"/><path d="M80 31v77" stroke="#7edacc" stroke-width="3"/><path d="M81 45c27 0 34 33 34 71" stroke="${c}" stroke-width="5" opacity=".8"/><rect x="74" y="61" width="12" height="25" rx="6" fill="#ffc987"/></g>`;
 }else if(p.art==="headset"){
 main=`<g><path d="M73 119V97a78 78 0 0 1 156 0v22" stroke="#293c54" stroke-width="23" fill="none" stroke-linecap="round"/><path d="M73 101a78 78 0 0 1 156 0" stroke="${c}" stroke-width="8" fill="none"/><rect x="53" y="109" width="52" height="80" rx="23" fill="#263b57"/><rect x="197" y="109" width="52" height="80" rx="23" fill="#263b57"/><rect x="65" y="119" width="26" height="60" rx="13" fill="${c}" opacity=".8"/><rect x="211" y="119" width="26" height="60" rx="13" fill="${c}" opacity=".8"/><path d="M249 176Q246 214 205 214" stroke="#30435c" fill="none" stroke-width="7" stroke-linecap="round"/></g>`;
 }else{
 main=`<g transform="translate(25 10) rotate(-8 150 120)"><path d="M61 77h173a16 16 0 0 1 16 16v56a16 16 0 0 1-16 16H61a16 16 0 0 1-16-16V93a16 16 0 0 1 16-16Z" fill="#26394e"/><path d="M57 90h181v60H57Z" fill="#536a83"/><g fill="#b8dcf3"><rect x="70" y="111" width="28" height="15" rx="3"/><rect x="110" y="111" width="28" height="15" rx="3"/><rect x="151" y="111" width="34" height="15" rx="3"/></g><rect x="201" y="105" width="23" height="26" rx="3" fill="${c}"/><path d="M45 122q-45 0-31 53" fill="none" stroke="#718b9e" stroke-width="7"/></g>`;
 }
 return prefix+main+"</svg>";
}
function renderProducts(){
 const q=state.query.trim().toLowerCase();
 let arr=allProducts().filter(p=>(state.cat==="all"||p.category===state.cat)&&(!state.favoritesOnly||state.favorites.has(p.id))&&(p.name+" "+p.specs+" "+(categoryNames[p.category]||p.category)).toLowerCase().includes(q));
 // A category is never empty merely because its remote records are not yet available.

 if(state.sort==="low")arr.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));
 if(state.sort==="high")arr.sort((a,b)=>(b.price??-Infinity)-(a.price??-Infinity));
 if(state.sort==="name")arr.sort((a,b)=>a.name.localeCompare(b.name));
 $("#resultsHint").textContent=`${categoryNames[state.cat]||"Tous les produits"} · ${arr.length} produits — ${state.favoritesOnly?"Favoris uniquement":"Prix indicatifs"}`;
 $$(".filter,.side-filter").forEach(b=>b.classList.toggle("active",b.dataset.category===state.cat));
 $("#productsGrid").innerHTML=arr.length?arr.map(p=>`<article class="product" data-mp-product="${safe(p.id)}" tabindex="0" role="link" aria-label="Voir le produit ${safe(p.name)}">
 <div class="product-art" data-action="detail" data-id="${p.id}" style="--glow:${p.glow||"#ffe3c2"}"><span class="tag ${p.oldPrice?"sale":""}">${safe(p.badge||"Nouveau")}</span><button class="heart ${state.favorites.has(p.id)?"active":""}" data-action="like" data-id="${p.id}" aria-label="Ajouter aux favoris">${state.favorites.has(p.id)?"♥":"♡"}</button>${art(p)}</div>
 <div class="product-content"><div class="product-category">${safe(categoryNames[p.category]||"Produits")}</div><h3 class="product-name">${safe(p.name)}</h3><div class="product-specs">${safe(p.specs)}</div>
 <div class="price-wrap"><span class="price">${priceHTML(p)}</span>${p.oldPrice?`<span class="old-price">${fmt(p.oldPrice)}</span>`:""}</div>
 <div class="product-actions"><button class="add-btn" data-action="requestWhatsApp" data-id="${p.id}">Demander sur WhatsApp</button><button class="view-btn" data-action="detail" data-id="${p.id}" aria-label="Détails du produit">↗</button></div></div></article>`).join(""):`<div class="empty"><h3>Aucun produit trouvé 🔍</h3><p>Essayez une autre recherche ou catégorie.</p><button class="btn btn-light" data-action="reset">Tous les produits</button></div>`;
 updateBadges();
}
function updateBadges(){$("#cartCount").textContent=Object.values(state.cart).reduce((a,n)=>a+n,0);$("#favCount").textContent=state.favorites.size}
function toast(message){const t=$("#toast");t.textContent=message;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2900)}
function setCategory(cat){
 if(cat!=="all"&&!Object.prototype.hasOwnProperty.call(categoryNames,cat))return;
 state.cat=cat;state.favoritesOnly=false;
 // Switching sections must not inherit a search that silently hides all products.
 state.query="";
 ["#searchDesktop","#searchMobile"].forEach(selector=>{const input=$(selector);if(input)input.value=""});
 renderProducts();
 document.querySelectorAll(".front-category-card").forEach(button=>{
  const current=button.dataset.categoryLink===cat;
  button.classList.toggle("active",current);
  if(current)button.setAttribute("aria-current","page");else button.removeAttribute("aria-current");
 });
 const url=new URL(location.href);if(cat==="all")url.searchParams.delete("categorie");else url.searchParams.set("categorie",cat);url.hash="products";history.replaceState(null,"",url);
 $("#products").scrollIntoView({behavior:"smooth",block:"start"});
}
function add(id){if(!getProduct(id))return;state.cart[id]=(state.cart[id]||0)+1;write("monpanier-cart",state.cart);updateBadges();renderCart();toast("✓ Produit ajouté au panier")}
function like(id){if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);write("monpanier-likes",[...state.favorites]);renderProducts();toast(state.favorites.has(id)?"Produit ajouté aux favoris ♥":"Produit retiré des favoris")}
function renderCart(){
 const items=Object.entries(state.cart).map(([id,qty])=>({p:getProduct(id),qty,id})).filter(i=>i.p&&i.qty>0);
 $("#cartTitleCount").textContent=`(${items.reduce((a,i)=>a+i.qty,0)})`;
 $("#cartItems").innerHTML=items.length?items.map(({p,qty,id})=>`<div class="cart-item"><div class="cart-thumb">${art(p)}</div><div><b>${safe(p.name)}</b><p>${fmt(p.price)} DA</p><div class="qty"><button data-action="qty" data-id="${safe(id)}" data-delta="-1" aria-label="Diminuer la quantité">−</button><strong>${qty}</strong><button data-action="qty" data-id="${safe(id)}" data-delta="1" aria-label="Augmenter la quantité">+</button></div></div><button class="remove" data-action="remove" data-id="${safe(id)}" aria-label="Supprimer">Supprimer</button></div>`).join(""):`<div class="empty" style="margin-top:30px">Votre panier est vide 🛒<p>Ajoutez des produits pour continuer.</p></div>`;
 $("#cartTotal").textContent=`${fmt(items.reduce((a,i)=>a+i.p.price*i.qty,0))} DA`;
 updateBadges();
}
function orderText(){
 const items=Object.entries(state.cart).map(([id,qty])=>({p:getProduct(id),qty})).filter(i=>i.p&&i.qty>0);
 if(!items.length)return "";
 const total=items.reduce((a,i)=>a+i.p.price*i.qty,0);
 return [
  "🛒 MON PANIER INFORMATIQUE",
  "Demande de disponibilité et de prix",
  "━━━━━━━━━━━━━━━━━━━━",
  ...items.map((x,i)=>[
   `${i+1}. ${x.p.name}`,
   `   Quantité : ${x.qty}`,
   `   Sous-total : ${fmt(x.p.price*x.qty)} DA (prix indicatif)`
  ].join("\n")),
  "━━━━━━━━━━━━━━━━━━━━",
  `TOTAL AFFICHÉ : ${fmt(total)} DA (non définitif)`,
  "",
  "Merci de confirmer les prix, les stocks et la livraison."
 ].join("\n");
}
function copyOrder(){const text=orderText();if(!text){toast("Ajoutez d’abord un produit au panier.");return}if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>toast("Commande copiée ✓")).catch(()=>fallbackCopy(text))}else fallbackCopy(text)}
function fallbackCopy(text){const el=document.createElement("textarea");el.value=text;document.body.appendChild(el);el.select();try{document.execCommand("copy");toast("Commande copiée ✓")}catch{toast("Copie impossible")}el.remove()}
function checkout(){const text=orderText();if(!text){toast("Le panier est vide");return}if(!state.phone){closeAll();openDialog("settingsDialog");toast("Renseignez le numéro WhatsApp.");return}window.open(`https://wa.me/${state.phone}?text=${encodeURIComponent(text)}`,"_blank","noopener,noreferrer")}
function openBackdrop(){document.body.style.overflow="hidden";$("#overlay").classList.add("show")}
function closeAll(){$(".drawer.show")?.classList.remove("show");$$(".dialog.show").forEach(el=>el.classList.remove("show"));$("#overlay").classList.remove("show");document.body.style.overflow=""}
function openDrawer(){closeAll();renderCart();openBackdrop();$("#cartDrawer").classList.add("show")}
function openDialog(id){closeAll();openBackdrop();$("#"+id).classList.add("show")}
function detail(id){const p=getProduct(id);if(!p)return;const gallery=Array.isArray(p.gallery)?`<div class="printer-gallery" style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:8px 0 15px">${p.gallery.map((url,i)=>`<button type="button" data-printer-image="${safe(url)}" aria-label="Vue ${i+1}" style="border:1px solid #ddd;border-radius:9px;padding:3px;background:white"><img src="${safe(url)}" alt="Vue ${i+1} de ${safe(p.name)}" style="width:100%;aspect-ratio:1;object-fit:contain"></button>`).join("")}</div>`:"";$("#detailBody").innerHTML=`<div class="art-large" id="detailMainArt">${art(p)}</div>${gallery}<span class="eyebrow">${safe(categoryNames[p.category]||"Produits")}</span><h3 style="margin:6px 0">${safe(p.name)}</h3><p style="font-size:12px;color:#65778a">Produit de démonstration · Prix et disponibilité à confirmer.</p><div class="details-spec">${safe(p.specs).split("•").map(s=>`<span>${s.trim()}</span>`).join("")}</div><div class="price" style="margin:11px 0">${priceHTML(p)}</div><button class="btn btn-primary full" data-action="requestWhatsApp" data-id="${p.id}">Demander sur WhatsApp</button>`;openDialog("detailDialog")}
function requestProductWhatsApp(id){const p=getProduct(id);if(!p)return;const message=`Bonjour, je souhaite connaître le prix et la disponibilité de ce produit : ${p.name}. Merci.`;window.open(`https://wa.me/213560283892?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer")}
function contact(){if(!state.phone){openDialog("settingsDialog");toast("Renseignez un numéro de contact.");return}window.open(`https://wa.me/${state.phone}?text=${encodeURIComponent("Bonjour, je souhaite obtenir des informations sur les produits Mon Panier Informatique.")}`,"_blank","noopener,noreferrer")}
document.addEventListener("click",e=>{const thumb=e.target.closest("[data-printer-image]");if(thumb){const main=$("#detailMainArt img");if(main)main.src=thumb.dataset.printerImage;return;}
 const btn=e.target.closest("[data-action],[data-category],[data-category-link]");if(!btn)return;
 if(btn.dataset.categoryLink){e.preventDefault();setCategory(btn.dataset.categoryLink);return}
 if(btn.dataset.category){e.preventDefault();setCategory(btn.dataset.category);return}
 const a=btn.dataset.action,id=btn.dataset.id;
 if(a==="cart")openDrawer();if(a==="close")closeAll();if(a==="settings"){$("#shopPhone").value=state.phone;openDialog("settingsDialog")}
 if(a==="add")add(id);if(a==="requestWhatsApp")requestProductWhatsApp(id);if(a==="like")like(id);if(a==="detail")detail(id);
 if(a==="favorites"){state.favoritesOnly=!state.favoritesOnly;state.cat="all";renderProducts();$("#products").scrollIntoView({behavior:"smooth"});toast(state.favoritesOnly?"Afficher les favoris":"Tous les produits")}
 if(a==="qty"){state.cart[id]=Math.max(0,(state.cart[id]||0)+Number(btn.dataset.delta));if(!state.cart[id])delete state.cart[id];write("monpanier-cart",state.cart);renderCart()}
 if(a==="remove"){delete state.cart[id];write("monpanier-cart",state.cart);renderCart()}
 if(a==="checkout")checkout();if(a==="copyOrder")copyOrder();if(a==="contact")contact();
 if(a==="reset"){state.query="";state.cat="all";state.favoritesOnly=false;$("#searchDesktop").value="";$("#searchMobile").value="";renderProducts()}
});
$("#overlay").addEventListener("click",closeAll);document.addEventListener("keydown",e=>{if(e.key==="Escape")closeAll()});
["#searchDesktop","#searchMobile"].forEach(sel=>{$(sel).addEventListener("input",e=>{state.query=e.target.value;$(sel==="#searchDesktop"?"#searchMobile":"#searchDesktop").value=e.target.value;renderProducts()})});
$("#sortSelect").addEventListener("change",e=>{state.sort=e.target.value;renderProducts()});
$("#settingsForm").addEventListener("submit",e=>{e.preventDefault();const value=$("#shopPhone").value.replace(/\D/g,"");if(value&&!(value.length>=9&&value.length<=15)){toast("Saisissez un numéro avec l’indicatif du pays.");return}state.phone=value;write("monpanier-phone",value);closeAll();toast(value?"Numéro WhatsApp enregistré ✓":"Numéro WhatsApp effacé")});
$("#newProductForm").addEventListener("submit",e=>{e.preventDefault();const name=$("#newName").value.trim(),cat=$("#newCat").value,price=Number($("#newPrice").value),specs=$("#newSpecs").value.trim();if(!name||!categoryNames[cat]||!(price>0&&price<=1e8)){toast("Vérifiez les informations du produit.");return}const colors={laptops:"#409ed5",desktops:"#e17d37",screens:"#ff7617",accessories:"#9070d6"},artNames={laptops:"laptop",desktops:"desktop",screens:"aio",accessories:"keyboard"};state.custom.push({id:"u"+Date.now().toString(36),name,category:cat,price,specs:specs||"Nouveau produit",badge:"Ajouté",art:artNames[cat],color:colors[cat],glow:"#d4eaf0"});write("monpanier-custom",state.custom);$("#newProductForm").reset();state.cat=cat;renderProducts();closeAll();toast("Produit ajouté localement ✓");$("#products").scrollIntoView({behavior:"smooth"})});
const categoryToggle=$("#categoryToggle"), categoryPanel=$("#sideCategoriesPanel"), shopLayout=$("#shopLayout");
const categoryBackdrop=$("#categoryBackdrop"), closeCategories=$("#closeCategories");
function setCategoriesOpen(show){
 categoryPanel.classList.toggle("is-open",show);
 categoryBackdrop.classList.toggle("is-open",show);
 document.body.classList.toggle("category-drawer-open",show);
 categoryPanel.setAttribute("aria-hidden",String(!show));
 categoryPanel.inert=!show;
 categoryToggle.setAttribute("aria-expanded",String(show));
 categoryToggle.setAttribute("aria-label",show?"Masquer les catégories":"Afficher les catégories");
 shopLayout.classList.toggle("categories-closed",!show);
 if(show)closeCategories.focus();else categoryToggle.focus();
}
categoryToggle.addEventListener("click",()=>setCategoriesOpen(!categoryPanel.classList.contains("is-open")));
closeCategories.addEventListener("click",()=>setCategoriesOpen(false));
categoryBackdrop.addEventListener("click",()=>setCategoriesOpen(false));
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&categoryPanel.classList.contains("is-open")){setCategoriesOpen(false);categoryToggle.focus();}});
document.addEventListener("click",e=>{if(categoryPanel.classList.contains("is-open")&&!e.target.closest(".header-category-controls"))setCategoriesOpen(false);});
categoryPanel.querySelectorAll(".side-filter").forEach(b=>b.addEventListener("click",()=>setCategoriesOpen(false)));
$("#year").textContent=new Date().getFullYear();renderProducts();renderCart();
