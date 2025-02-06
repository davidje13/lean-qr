// This was generated using tools/corrections-gen.mjs
const CORRECTION_DATA =
  "*-04-39?2$%%$%%'$%''%'''%')(%'))%(++'(++'(+.'+-.',/3',33)-/5)-43).36)058*18<+37<+4:<,4:E,5<A-7>C/8@F/:EH/<EK0=FM1?IP2@KS3BNV4DPY5FS\\6HV_6IXb7K[e8N^i9Pam;Rdp<Tgt";

const ECS_RATIO = [1 / 5, 3 / 8, 5 / 9, 2 / 3];

export const correctionData = (version, totalBytes) => (correctionIndex) => {
  const p = version * 4 + correctionIndex - 4;
  const d = CORRECTION_DATA.charCodeAt(p) - 35;
  const totalGroups = p > 8 ? d : 1;
  const gs = (totalBytes / totalGroups) | 0;
  const g2n = totalBytes % totalGroups;
  const g1n = totalGroups - g2n;
  const ecs =
    p > 8 ? (gs * ECS_RATIO[correctionIndex] + (version > 5)) & ~1 : d;
  const g1s = gs - ecs;

  return {
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

export const minCorrection = 0;
export const maxCorrection = 3;

export const correction = {
  min: 0,
  L: 0,
  M: 1,
  Q: 2,
  H: 3,
  max: 3,
};
