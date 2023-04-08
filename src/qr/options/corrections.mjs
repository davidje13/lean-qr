// This was generated using tools/corrections-gen.mjs
const CORRECTION_DATA =
  "$*$-$0$4$-$3$9$?$2$=%5%9$7%5%='3$=%;'5'9%5'3';'?%7'5)5(=%;'9)9)=%A(9+7+;'5(=+;+?'7(A+?.;';+9-=.?'=,9/;39'A,;373;)9-;/A5;);-?4;3A)?.?3?6?)A0=5?8?*?1=8=<=+?3=7A<?+?4=:?<A,?4?:AE;,A5?<AAA-A7?>ACA/=8?@AFA/?:?E?HA/A<?EAKA0A=?FAMA1A??IAPA2A@?KASA3AB?NAVA4AD?PAYA5AF?SA\\A6AH?VA_A6AI?XAbA7AK?[AeA8AN?^AiA9AP?aAmA;AR?dApA<AT?gAtA";

export const correctionData = (version, totalBytes) => (correctionIndex) => {
  const p = version * 8 + correctionIndex * 2 - 8;
  const totalGroups = CORRECTION_DATA.charCodeAt(p) - 35;
  const ecs = CORRECTION_DATA.charCodeAt(p + 1) - 35;

  const g1s = (totalBytes / totalGroups - ecs) | 0;
  const g2n = totalBytes % totalGroups;
  const g1n = totalGroups - g2n;

  return {
    _id: correctionIndex ^ 1,
    _capacityBits: (g1n * g1s + g2n * (g1s + 1)) * 8,
    _groups: g2n
      ? [
          [g1n, g1s],
          [g2n, g1s + 1],
        ]
      : [[g1n, g1s]],
    _ecSize: ecs,
  };
};

export const correction = {
  min: 0,
  L: 0,
  M: 1,
  Q: 2,
  H: 3,
  max: 3,
};
