"use strict";const e="http://www.w3.org/2000/svg",t=/[^-a-zA-Z0-9 .,:/#%()]/g,s=(t,s,o,r=[],i=t.createElementNS(e,s))=>(Object.entries(o).forEach((([e,t])=>i.setAttribute(e,t))),i.replaceChildren(...r),i),o=(e,s,o=[])=>[`<${e}`,...Object.entries(s).map((([e,s])=>` ${e}="${`${s}`.replaceAll(t,"")}"`)),">",...o,`</${e}>`].join(""),r=e=>{const t=new Map,s=[],o=e=>{const s=t.get(e);return t.delete(e),s};for(let r=0;r<=e.size;++r)for(let i=0;i<=e.size;++i){const n=e.get(i,r),a=e.get(i,r-1),l=[e.get(i-1,r)!==n&&i+" "+(r+1),i+" "+r,a!==n&&i+1+" "+r].filter((e=>e));if(l.length>1){n||l.reverse();const e=l.pop(),r=o(l[0])||[],i=o(e);r.push(...l),r===i?s.push(r):(i?i.unshift(...r):t.set(e,r),t.set(r[0],i||r))}}return s.map((e=>`M${e.join("L")}Z`)).join("")},i=(t,{on:s="black",off:o,padX:i=4,padY:n=4,width:a,height:l,scale:c=1},g,h)=>{const p=t.size+2*i,d=t.size+2*n;return g("svg",{xmlns:e,version:"1.1",viewBox:`${-i} ${-n} ${p} ${d}`,width:a??p*c,height:l??d*c,"shape-rendering":"crispedges"},[o?g("rect",{x:-i,y:-n,width:p,height:d,fill:o}):"",g("path",{d:r(t),fill:s})],h)},n=(e,t={})=>(t.xmlDeclaration?'<?xml version="1.0" encoding="UTF-8" ?>':"")+i(e,t,o);exports.toSvg=(e,t,o={})=>t.body?i(e,o,s.bind(0,t)):i(e,o,s.bind(0,t.ownerDocument),t),exports.toSvgDataURL=(e,t)=>"data:image/svg;base64,"+btoa(n(e,{xmlDeclaration:1,...t})),exports.toSvgPath=r,exports.toSvgSource=n;
