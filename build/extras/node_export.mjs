import{deflateSync as e}from"node:zlib";const f=Buffer.from([137,80,78,71,13,10,26,10]),r=Buffer.from([]),o=(o,{on:t=[0,0,0],off:l=[0,0,0,0],padX:a=4,padY:s=4,scale:u=1}={})=>{const c=(o.size+2*a)*u,B=(o.size+2*s)*u,p=1+(c+7>>3),d=Buffer.alloc(B*p);for(let e=0;e<B;++e)for(let f=0;f<c;++f)o.get(f/u-a|0,e/u-s|0)&&(d[e*p+1+(f>>3)]|=128>>(7&f));const i=l[3]??255,b=t[3]??255,m=(i&b)<255,g=l[0]|l[1]|l[2]||(t[0]&t[1]&t[2])<255||m,v=Buffer.alloc(13);return v.writeUInt32BE(c,0),v.writeUInt32BE(B,4),v[8]=1,v[9]=g?3:0,Buffer.concat([f,n(1229472850,v),g?n(1347179589,[l[0],l[1],l[2],t[0],t[1],t[2]]):r,m?n(1951551059,[i,b]):r,n(1229209940,e(d,{level:9})),n(1229278788,[])])},t=(e,f)=>"data:image/png;base64,"+o(e,f).toString("base64"),n=(e,f)=>{const r=f.length,o=Buffer.alloc(12+r);o.writeUInt32BE(r,0),o.writeUInt32BE(e,4),o.set(f,8);let t=-1;for(const e of o.subarray(4,8+r))t=l[255&(t^e)]^t>>>8;return o.writeUInt32BE(~t>>>0,8+r),o},l=new Uint32Array(256);for(let e=0;e<256;++e){let f=e;for(let e=0;e<8;++e)f=3988292384*(1&f)^f>>>1;l[e]=f}export{o as toPngBuffer,t as toPngDataURL};
