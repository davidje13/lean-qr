const t=[.2,3/8,5/9,2/3],o=(o,e)=>r=>{const n=4*o+r-4,s="*-04-39?2$%%$%%'$%''%'''%')(%'))%(++'(++'(+.'+-.',/3',33)-/5)-43).36)058*18<+37<+4:<,4:E,5<A-7>C/8@F/:EH/<EK0=FM1?IP2@KS3BNV4DPY5FS\\6HV_6IXb7K[e8N^i9Pam;Rdp<Tgt".charCodeAt(n)-35,f=n>8?s:1,c=e/f|0,i=e%f,l=f-i,a=n>8?c*t[r]+(o>5)&-2:s,u=c-a;return{t:8*(l*u+i*(u+1)),o:i?[[l,u],[i,u+1]]:[[l,u]],i:a}},e={min:0,L:0,M:1,Q:2,H:3,max:3},r=t=>new Uint8Array(t),n=t=>{const o=new Error(`lean-qr error ${t}`);throw o.code=t,o},s=t=>"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:".indexOf(t),f=t=>t.charCodeAt(0),c=(...t)=>(o,e)=>t.forEach((t=>t(o,e))),i=t=>o=>{o.eci!==t&&(o.push(7,4),o.push(t,8),o.eci=t)},l=t=>(o,e)=>{o.push(4,4),o.push(t.length,8+8*(e>9)),t.forEach((t=>o.push(t,8)))},a=(t,o,e,r,n=((t,o)=>e(t.length,o)),s=(r?o=>c(i(r),t(o)):t))=>(s.test=o,s.l=e,s.est=n,s.eci=r&&[r],s),u=a((t=>(o,e)=>{o.push(1,4),o.push(t.length,10+2*(e>26)+2*(e>9));let r=0;for(;r<t.length-2;r+=3)o.push(+t.slice(r,r+3),10);r<t.length-1?o.push(+t.slice(r,r+2),7):r<t.length&&o.push(+t[r],4)}),/./.test.bind(/[0-9]/),((t,o)=>14+2*(o>26)+2*(o>9)+10*t/3)),_=a((t=>(o,e)=>{o.push(2,4),o.push(t.length,9+2*(e>26)+2*(e>9));let r=0;for(;r<t.length-1;r+=2)o.push(45*s(t[r])+s(t[r+1]),11);r<t.length&&o.push(s(t[r]),6)}),(t=>s(t)>=0),((t,o)=>13+2*(o>26)+2*(o>9)+5.5*t)),d=a((t=>l([...t].map(f))),(t=>f(t)<128),((t,o)=>12+8*(o>9)+8*t));d.u=!0;const m=a(d,(t=>f(t)<256),d.l,3);m.u=!0;const p=new TextEncoder,h=a((t=>l(p.encode(t))),(()=>1),0,26,((t,o)=>12+8*(o>9)+8*p.encode(t).length));h.u=!0;let w=()=>{const t=new Map,o=new TextDecoder("sjis"),e=r(2);for(let r=0;r<7973;++r)e[0]=r/192+129+64*(r>5951),e[1]=r%192+64,t.set(o.decode(e),r);return t.delete("\ufffd"),w=()=>t,t};const g=a((t=>(o,e)=>{o.push(8,4),o.push(t.length,8+2*(e>26)+2*(e>9));for(const e of t)o.push(w().get(e),13)}),(t=>w().has(t)),((t,o)=>12+2*(o>26)+2*(o>9)+13*t));g.u=!0;const y=[u,_,d,m,g,h],x={auto:(t,{modes:o=y}={})=>(e,r)=>{let s=1;for(const e of o){const o=new Map;e._=s<<=1,e.m=e.est("",r),e.h=e.l?(t,n)=>{const s=n-t,f=o.get(s)??e.l(s,r);return o.set(s,f),f}:(n,s)=>{const f=t.slice(n,s),c=o.get(f)??e.est(f,r);return o.set(f,c),c}}let f=[{S:0}],c=0,i=0,l=-1;for(const e of[...t,""]){let t=0;if(e)for(const r of o)r.test(e)&&(t|=r._);if(!e||t!==l){if(-1!==l){const t=new Set(f.map((t=>t.v))),e=[];for(const r of o.filter((t=>l&t._))){const o=r.h(c,i);for(const n of r.eci??t){if(r===d&&n)continue;let t;for(const e of f)if(e.v===n||r.eci){const s=e.C===r&&e.v===n,f=s?e.D:e,l=s?e.V:c;let a;a=r.u&&s?e.S+o-r.m:f.S+12*(f.v!==n)+(l===c?o:r.h(l,i)),(!t||a<t.S)&&(t={V:l,D:f,C:r,v:n,$:i,S:a})}t&&e.push(t)}}e.length||n(5),f=e}l=t,c=i}i+=e.length}const a=[];for(let o=f.reduce(((t,o)=>o.S<t.S?o:t));o.C;o=o.D)a.unshift(o.C(t.slice(o.V,o.$)));a.forEach((t=>t(e,r)))},multi:c,eci:i,numeric:u,alphaNumeric:_,bytes:l,ascii:d,iso8859_1:m,shift_jis:g,utf8:h},z=()=>({A:r(2956),F:0,push(t,o){for(let e=o,r=8-(7&this.F);e>0;e-=r,r=8)this.A[this.F>>3]|=t<<r>>e,this.F+=e<r?e:r}}),E=(t,o=t*t,e=r(o))=>({size:t,I:e,get:(o,r)=>o>=0&&o<t&&!!(1&e[r*t+o]),K(o,r,n){e[r*t+o]=n},toString({on:o="##",off:e="  ",lf:r="\n",padX:n=4,padY:s=4}={}){let f="";for(let c=-s;c<t+s;++c){for(let r=-n;r<t+n;++r)f+=this.get(r,c)?o:e;f+=r}return f},toImageData(o,{on:e=[0,0,0],off:r=[0,0,0,0],padX:n=4,padY:s=4}={}){const f=t+2*n,c=t+2*s,i=o.createImageData(f,c),l=new Uint32Array(i.data.buffer);i.data.set([...e,255]);const a=l[0];i.data.set([...r,255]);const u=l[0];for(let t=0;t<c;++t)for(let o=0;o<f;++o)l[t*f+o]=this.get(o-n,t-s)?a:u;return i},toCanvas(t,o){const e=t.getContext("2d"),r=this.toImageData(e,o);t.width=r.width,t.height=r.height,e.putImageData(r,0,0)},toDataURL({type:t="image/png",scale:o=1,...e}={}){const r=document.createElement("canvas"),n=r.getContext("2d"),s=this.toImageData(n,e);return r.width=s.width*o,r.height=s.height*o,n.putImageData(s,0,0),n.imageSmoothingEnabled=!1,n.globalCompositeOperation="copy",n.drawImage(r,0,0,s.width,s.height,0,0,r.width,r.height),r.toDataURL(t,1)}}),M=[(t,o)=>!(1&(t^o)),(t,o)=>!(1&o),t=>!(t%3),(t,o)=>!((t+o)%3),(t,o)=>!(1&((t/3|0)^o>>1)),(t,o)=>!((t&o&1)+t*o%3),(t,o)=>!((t&o&1)+t*o%3&1),(t,o)=>!((1&(t^o))+t*o%3&1)],S=r(512);S[0]=1;for(let t=0,o=1;t<255;S[++t]=o)S[o+256]=t,o*=2,256&o&&(o^=285);const v=t=>S[t%255],C=t=>S[t+256],D=(t,o)=>{const e=r(t.length+o.length-1);for(let r=0;r<t.length;++r)for(let n=0;n<o.length;++n)e[r+n]^=v(t[r]+o[n]);return e.map(C)},L=(t,o)=>{const e=r(t.length+o.length-1);e.set(t,0);for(let r=0;r<t.length;++r)if(e[r]){const t=C(e[r]);for(let n=0;n<o.length;++n)e[r+n]^=v(o[n]+t)}return e.slice(t.length)},V=[[0],[0,0]];for(let t=1,o=V[1];t<30;++t){const e=D(o,[0,t]);V.push(e),o=e}const $=(t,o)=>{const e=[[],[]];let n=0,s=0;for(const[r,f]of o.o)for(let c=0;c<r;++c,n+=f){const r=t.slice(n,n+f);e[0].push(r),e[1].push(L(r,V[o.i])),s+=f+o.i}const f=r(s);let c=0;for(const t of e)for(let o,e=0;c!==o;++e){o=c;for(const o of t)e<o.length&&(f[c++]=o[e])}return f},b=(t,o,e)=>{let r=t<<e-1;for(let t=134217728;t;t>>=1)r&t&&(r^=o*(t>>e-1));return r},A=({size:t,I:o,K:e},r)=>{const n=(e,r,n,s,f)=>{for(;s-- >0;){const c=(r+s)*t+e;o.fill(f,c,c+n)}},s=(t,o)=>{n(t-3,o-3,7,7,3),n(t-2,o-2,5,5,2),n(t-1,o-1,3,3,3)},f=(t,o)=>{n(t-2,o-2,5,5,3),n(t-1,o-1,3,3,2),e(t,o,3)};n(7,0,2,9,2),n(t-8,0,8,9,2);for(let o=0;o<t;++o)e(o,6,3^1&o);if(s(3,3),s(t-4,3),r>1){const o=1+(r/7|0),e=2*((t-13)/o/2+.75|0);for(let r=0;r<o;++r){const n=t-7-r*e;r&&f(n,6);for(let r=0;r<o;++r)f(n,t-7-r*e)}}if(r>6)for(let o=r<<12|b(r,7973,13),n=0;n<6;++n)for(let r=12;r-- >9;o>>=1)e(t-r,n,2|1&o);for(let e=0;e<t;++e)for(let r=e;r<t;++r)o[r*t+e]=o[e*t+r];e(8,t-8,3)},F=({size:t,I:o})=>{const e=[];for(let r=t-2,n=t,s=-1;r>=0;r-=2){for(5===r&&(r=4);n+=s,-1!==n&&n!==t;){const s=n*t+r;o[s+1]<2&&e.push(s+1),o[s]<2&&e.push(s)}s*=-1}return e},H=({I:t},o,e)=>o.forEach(((o,r)=>t[o]=e[r>>3]>>7-(7&r)&1)),I=({size:t,I:o,K:e},r,n,s)=>{for(let e=0;e<t;++e)for(let n=0;n<t;++n){const s=e*t+n;o[s]^=r(n,e)&(o[s]>>1^1)}const f=(1^s)<<3|n;let c=21522^(f<<10|b(f,1335,11));for(let o=8;o-- >0;c>>=1)e(8,(o>1?7:8)-o,c),e(t-8+o,8,c);for(let o=7;o-- >0;c>>=1)e(o>5?7:o,8,c),e(8,t-o-1,c)},K=({size:t,I:o},e=0,r=0)=>{for(let n=0;n<t;++n){for(let s=0;s<2;++s)for(let f,c=0,i=0,l=0;c<t;++c){const a=1&o[s?n*t+c:c*t+n];r+=a,i=(i>>1|2098176)&(3047517^a-1),2049&i&&(e+=40),a!==f?(l=1,f=a):++l>4&&(e+=l<6?3:1)}if(n)for(let r=1,s=1&o[n-1],f=(1&o[n])===s;r<t;++r){const c=1&o[r*t+n-1],i=(1&o[r*t+n])===c;e+=3*(f&&i&&s===c),s=c,f=i}}return e+10*(20*Math.abs(r/(t*t*2)-.5)|0)},N=[],P=(t=n(1),{minCorrectionLevel:r=e.min,maxCorrectionLevel:s=e.max,minVersion:f=1,maxVersion:c=40,mask:i,trailer:l=60433,...a}={})=>{s<r&&n(3),c<f&&n(2),"string"==typeof t&&(t=x.auto(t,a));for(let e=f,n=0;e<=c;++e){let f=N[e];f||(N[e]=f=E(4*e+17),A(f,e),f.p=F(f));const c=o(e,f.p.length>>3);if(c(r).t<n)continue;const a=z();t(a,e),n=a.F;for(let t=s;t>=r;--t){const o=c(t);if(o.t<n)continue;for(a.push(0,4),a.F=a.F+7&-8;a.F<o.t;)a.push(l,16);const e=E(f.size,f.I);return H(e,f.p,$(a.A,o)),(M[i??-1]?[M[i]]:M).map(((o,r)=>{const n=E(e.size,e.I);return I(n,o,i??r,t),n.s=K(n),n})).reduce(((t,o)=>o.s<t.s?o:t))}}n(4)};P.with=(...t)=>(o,e)=>P(o,{modes:[...y,...t],...e});export{e as correction,P as generate,x as mode};
