const n={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function r(t){return t==null?"":String(t).replace(/[&<>"']/g,e=>n[e]??e)}export{r as e};
