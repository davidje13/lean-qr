const readCompressed = (data) =>
  data.match(/.{4}/g).map((v) => {
    const g2n = v.charCodeAt(0) - 35;
    const g1n = v.charCodeAt(1) - 35;
    const gs = v.charCodeAt(2) * 92 + v.charCodeAt(3) - 35 * 93;
    const g1s = gs >> 5;
    return {
      c: (g1n * g1s + g2n * (g1s + 1)) * 8, // total bit capacity
      g: g2n
        ? [
            [g1n, g1s],
            [g2n, g1s + 1],
          ]
        : [[g1n, g1s]], // groups
      s: gs & 0b11111, // error correction size
    };
  });

// This was generated using tools/corrections-gen.mjs: it compresses the group 1 and
// group 2 values for each of the 40 QR code versions at each error correction level
const DATA_L =
  "#$)b#$.y#$6>#$?'#$Hq#%:q#%>C#%E##%Ka%%:q#'?G%%C;#'HQ$&KA$(AQ$(EC($HS$(M)'&J[(&HS''K_*%Iw('MI')L%'+H1%-J{'+Mi-&L%**Ka-(KA&0KA#4KA$4KA)0KA*/MI1)MI'4Mi5'Mi'7L%)6LE";
const DATA_M =
  "#$(a#$,w#$2Y#%.A#%27#',W#'-}%%0M%&/i$'29'$4e%)/i$+0-('13((1S&*2{$-3?',29.&2Y0&1U#41u#43?1'3_1)2{0+3_'63?&92{:&2{*82{-63_@%3?:-3?813?:13?=/3_E)3_1@3?C03?*K3_B53_";
const DATA_Q =
  "#$'`#$*u#%)-#%+]%%(I#')s'%()%')Q''(k%))s''*{)'*9'+*7(.(k*(+a%2)s2$*{$4*{'4*Y(2+a)4*{3*+a1.+a3.+a9*+a)?*{=++AB'+aH$+A<2+a$M+aF-+a6@+a*O+a1J+a-Q+a-T+a1S+a9N+aEE+a";
const DATA_H =
  "#$&@#$(s#%'i#'&?%%')#'(S$''m%'(1'''K%)(S+&'K'*(3'/')(.'K*.'K0&(U4%(36%(33,'m-2(S)6(u#E'k13(U%A(u09(U'D(u?/(UB.(U=6(U<:(U?:(UF6(UQ.(U$^(uL9(Uc%(UQ;(UCM(Uf-(U`7(U";

export const data = [
  { id: 0b01, v: readCompressed(DATA_L) },
  { id: 0b00, v: readCompressed(DATA_M) },
  { id: 0b11, v: readCompressed(DATA_Q) },
  { id: 0b10, v: readCompressed(DATA_H) },
];

export const names = {
  min: 0,
  L: 0,
  M: 1,
  Q: 2,
  H: 3,
  max: 3,
};
