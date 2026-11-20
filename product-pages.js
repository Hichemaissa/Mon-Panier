/* Route all products to their own independent HTML detail page. */
(()=>{
"use strict";
function target(id){return new URL("./produit.html?produit="+encodeURIComponent(id),location.href).href}
function open(id){if(id)location.assign(target(id))}
document.addEventListener("click",e=>{
 const action=e.target.closest("[data-action]");
 if(action&&action.dataset.action!=="detail")return;
 const direct=action&&action.dataset.action==="detail"?action:null;
 const card=e.target.closest(".product[data-mp-product],.featured-laptop[data-mp-product]");
 if(!direct&&!card)return;
 if(!direct&&e.target.closest("a,button,input,select,textarea"))return;
 const id=direct?.dataset.id||card?.dataset.mpProduct;
 if(!id)return;
 e.preventDefault();
 e.stopImmediatePropagation();
 open(id);
},true);
document.addEventListener("keydown",e=>{
 if(e.key!=="Enter"&&e.key!==" ")return;
 const card=e.target.closest(".product[data-mp-product],.featured-laptop[data-mp-product]");
 if(card&&e.target===card){e.preventDefault();open(card.dataset.mpProduct)}
},true);
const params=new URL(location.href).searchParams;
const id=params.get("produit");
if(id){
 location.replace(target(id));
}else if(params.has("panier")){
 window.addEventListener("load",()=>{
  if(typeof openDrawer==="function")openDrawer();
  const url=new URL(location.href);url.searchParams.delete("panier");
  history.replaceState(null,"",url.href);
 },{once:true});
}
window.MonPanierProductPages={open};
})();
