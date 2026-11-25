(async function(){
 const cfg=window.MONPANIER_SUPABASE;
 if(!cfg||!window.supabase)return;
 const db=window.supabase.createClient(cfg.url,cfg.anonKey);
 const {data:s,error}=await db.from("shop_settings").select("phone,whatsapp,facebook_url,instagram_url,tiktok_url,show_facebook,show_instagram,show_tiktok,show_whatsapp,footer_address,footer_hours,footer_text,header_logo_url,footer_logo_url,header_logo_width,footer_logo_width").eq("id",1).maybeSingle();
 if(error||!s){console.warn("Footer settings unavailable",error);return;}
 const q=x=>document.querySelector(x);
 const https=v=>{try{const u=new URL(v);return u.protocol==="https:"?u.href:null}catch{return null}};
 const phone=q(".footer-phone a"), number=s.phone||s.whatsapp;
 if(phone&&number){phone.href="tel:"+number.replace(/[^+0-9]/g,"");phone.querySelector("span").textContent=number;phone.setAttribute("aria-label","Appeler "+number);}
 const wa=q(".footer-social-wa");if(wa){if(s.whatsapp)wa.href="https://wa.me/"+s.whatsapp.replace(/\D/g,"");if(s.show_whatsapp===false)wa.style.display="none";}
 const social=q(".footer-social");
 for(const [key,cls,label] of [["facebook","fb","Facebook"],["instagram","ig","Instagram"],["tiktok","tt","TikTok"]]){
 let el=q(".footer-social-"+cls);
 if(!el&&social){el=document.createElement("span");el.className="footer-social-"+cls;el.textContent="♪";social.append(el);}
 if(!el)continue;
 const url=https(s[key+"_url"]);
 if(url){const a=document.createElement("a");a.className="footer-social-"+cls;a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.title=label;a.setAttribute("aria-label",label);while(el.firstChild)a.append(el.firstChild);el.replaceWith(a);el=a;}
 if(s["show_"+key]===false||(!url&&key==="tiktok"))el.style.display="none";
 }
 for(const key of ["header","footer"]){const img=q("."+key+"-full-logo img");if(!img)continue;const url=https(s[key+"_logo_url"]);if(url)img.src=url;const width=Number(s[key+"_logo_width"]);if(url&&width>=40&&width<=400){img.style.width=width+"px";img.style.maxWidth="100%";img.style.height="auto";img.style.objectFit="contain";}}
 if(s.footer_hours){const h=q(".shop-hours > div");if(h){h.replaceChildren();const b=document.createElement("strong");b.textContent="Horaires d’ouverture";const t=document.createElement("div");t.textContent=s.footer_hours;t.style.whiteSpace="pre-line";h.append(b,t);}}
 if(s.footer_address){const f=q(".footer-map-frame"),a=q(".footer-map-link");if(f){const mapUrl="https://maps.google.com/maps?q="+encodeURIComponent(s.footer_address)+"&output=embed";if(f.tagName==="BUTTON")f.dataset.mapSrc=mapUrl;else if(f.tagName==="IFRAME"&&f.src!==mapUrl)f.src=mapUrl;}if(a)a.href="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(s.footer_address);}
 if(s.footer_text){const p=document.createElement("p");p.textContent=s.footer_text;q(".footer-identity")?.append(p);}
})().catch(e=>console.warn("Footer settings",e));
