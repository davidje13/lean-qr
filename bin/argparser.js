function parseArg(flag, arg) {
  switch (flag.type) {
    case 'string': return arg;
    case 'enum':
      if (!flag.values.includes(arg)) {
        throw new Error(`Unknown value ${arg} for ${flag.name}; expected: ${flag.values.join(', ')}`);
      }
      return arg;
    case 'int': {
      const v = Math.round(Number(arg));
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
    default:
      throw new Error(`Internal error parsing ${flag.name}`);
  }
}

function printUsage(name, headline, flags, rest) {
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
      default:
    }
    if (flag.def !== undefined) {
      process.stdout.write(`  Default: ${flag.def}\n`);
    }
    process.stdout.write('\n\n');
  });
  process.stdout.write('\n');
}

function parseArgs(flags, argv) {
  let i = 2;
  const result = {};
  flags.forEach(({ id, def }) => { result[id] = def; });
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
      const keyName = arg.substr(2, p - 2);
      const flag = flags.find(({ name }) => (name === keyName));
      if (!flag) {
        throw new Error(`Unknown option ${keyName}`);
      }
      if (flag.type === 'presence') {
        result[flag.id] = true;
      } else {
        result[flag.id] = parseArg(flag, (p < arg.length) ? arg.substr(p) : argv[++i]);
      }
    } else if (arg.startsWith('-')) {
      for (let p = 1; p < arg.length; ++p) {
        const keyName = arg[p];
        const flag = flags.find(({ short }) => (short === keyName));
        if (!flag) {
          throw new Error(`Unknown shorthand option ${keyName}`);
        }
        if (flag.type === 'presence') {
          result[flag.id] = true;
        } else if (arg[p + 1] === '=') {
          result[flag.id] = parseArg(flag, arg.substr(p + 2));
          break;
        } else {
          result[flag.id] = parseArg(flag, (p < arg.length - 1) ? arg.substr(p + 1) : argv[++i]);
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

module.exports = {
  printUsage,
  parseArgs,
};
