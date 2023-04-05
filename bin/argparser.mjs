function hex(value, flag) {
  return '0x' + value.toString(16).padStart(flag.length, '0').toUpperCase();
}

function parseArg(flag, arg) {
  switch (flag.type) {
    case 'string':
      return arg;
    case 'enum':
      if (!flag.values.includes(arg)) {
        throw new Error(
          `Unknown value ${arg} for ${flag.name}; expected: ${flag.values.join(
            ', ',
          )}`,
        );
      }
      return arg;
    case 'int': {
      const v = Number.parseInt(arg, 10);
      if (String(v) !== arg) {
        throw new Error(`Value for ${flag.name} must be an integer`);
      }
      if (flag.min !== undefined && v < flag.min) {
        throw new Error(`Value for ${flag.name} must be >= ${flag.min}`);
      }
      if (flag.max !== undefined && v > flag.max) {
        throw new Error(`Value for ${flag.name} must be <= ${flag.max}`);
      }
      return v;
    }
    case 'hex': {
      let base = 16;
      if (arg.startsWith('0b')) {
        base = 2;
        arg = arg.substring(2);
      } else if (arg.startsWith('0x')) {
        arg = arg.substring(2);
      } else if (arg.length === flag.length * 4) {
        base = 2;
      }
      const v = Number.parseInt(arg, base);
      const restringed = v
        .toString(base)
        .padStart(flag.length * (base === 2 ? 4 : 1), '0');
      if (restringed !== arg.toLowerCase()) {
        throw new Error(
          `Value for ${flag.name} must be a ${
            flag.length * 4
          }-bit integer in base 2 or 16`,
        );
      }
      if (flag.min !== undefined && v < flag.min) {
        throw new Error(
          `Value for ${flag.name} must be >= ${hex(flag.min, flag)}`,
        );
      }
      if (flag.max !== undefined && v > flag.max) {
        throw new Error(
          `Value for ${flag.name} must be <= ${hex(flag.max, flag)}`,
        );
      }
      return v;
    }
    default:
      throw new Error(`Internal error parsing ${flag.name}`);
  }
}

export function printUsage(name, headline, flags, rest) {
  process.stdout.write(`${headline}\n\n`);
  process.stdout.write(`Usage: ${name} [flags] [--] ${rest}\n\n`);
  flags.forEach((flag) => {
    process.stdout.write(`--${flag.name} / -${flag.short}\n\n`);
    process.stdout.write(`  ${flag.info}\n`);
    switch (flag.type) {
      case 'enum':
        process.stdout.write(`\n  One of: ${flag.values.join(', ')}\n`);
        break;
      case 'int':
        process.stdout.write('\n  Integer');
        if (flag.min !== undefined) {
          process.stdout.write(` >=${flag.min}`);
        }
        if (flag.max !== undefined) {
          process.stdout.write(` <=${flag.max}`);
        }
        process.stdout.write('\n');
        break;
      case 'hex':
        process.stdout.write('\n  Hexadecimal value');
        if (flag.min !== undefined) {
          process.stdout.write(` >=${hex(flag.min, flag)}`);
        }
        if (flag.max !== undefined) {
          process.stdout.write(` <=${hex(flag.max, flag)}`);
        }
        process.stdout.write('\n');
        break;
      default:
    }
    if (flag.def !== undefined) {
      if (flag.type === 'hex') {
        process.stdout.write(`  Default: ${hex(flag.def, flag)}\n`);
      } else {
        process.stdout.write(`  Default: ${flag.def}\n`);
      }
    }
    process.stdout.write('\n\n');
  });
  process.stdout.write('\n');
}

export function parseArgs(flags, argv) {
  let i = 2;
  const result = {};
  flags.forEach(({ id, def }) => {
    result[id] = def;
  });
  for (; i < argv.length; ++i) {
    const arg = argv[i];
    if (arg === '--') {
      ++i;
      break;
    }
    if (arg.startsWith('--')) {
      let p = arg.indexOf('=');
      if (p === -1) {
        p = arg.length;
      }
      const keyName = arg.slice(2, p);
      const flag = flags.find(({ name }) => name === keyName);
      if (!flag) {
        throw new Error(`Unknown option ${keyName}`);
      }
      if (flag.type === 'presence') {
        result[flag.id] = true;
      } else {
        result[flag.id] = parseArg(
          flag,
          p < arg.length ? arg.slice(p) : argv[++i],
        );
      }
    } else if (arg.startsWith('-')) {
      for (let p = 1; p < arg.length; ++p) {
        const keyName = arg[p];
        const flag = flags.find(({ short }) => short === keyName);
        if (!flag) {
          throw new Error(`Unknown shorthand option ${keyName}`);
        }
        if (flag.type === 'presence') {
          result[flag.id] = true;
        } else if (arg[p + 1] === '=') {
          result[flag.id] = parseArg(flag, arg.slice(p + 2));
          break;
        } else {
          result[flag.id] = parseArg(
            flag,
            p < arg.length - 1 ? arg.slice(p + 1) : argv[++i],
          );
          break;
        }
      }
    } else {
      break;
    }
  }
  result.rest = argv.slice(i).join(' ');
  return result;
}
