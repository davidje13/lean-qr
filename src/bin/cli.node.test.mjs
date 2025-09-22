import { execFile } from 'node:child_process';

describe('CLI', () => {
  it('displays output using ansi invert sequences by default', async () => {
    const { exitCode, stdout, stderr } = await runCLI('hello');
    expect(stderr).toEqual('');
    expect(stdout).toContain('\u001b[7m');
    expect(stdout).toContain('\u001b[0m');
    expect(exitCode).toEqual(0);
  });

  it('prints help if invoked with --help', async () => {
    const { exitCode, stdout, stderr } = await runCLI('--help');
    expect(stderr).toEqual('');
    expect(stdout).toContain('CLI for generating a QR code');
    expect(exitCode).toEqual(0);
  });

  it('displays time taken in stderr if invoked with -i', async () => {
    const { exitCode, stderr } = await runCLI('-i', 'hello');
    expect(stderr).toContain('Time taken:');
    expect(exitCode).toEqual(0);
  });

  it('outputs as a PNG data URL if requested', async () => {
    const { exitCode, stdout, stderr } = await runCLI(
      '-f',
      'png-data-url',
      'hello',
    );
    expect(stderr).toEqual('');
    // the exact compression may vary, so we just check the non-compressed parts of the PNG format:
    expect(stdout).toMatch(
      /^data:image\/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOgAAADoAQMAAADfZzo7AAAABlBMVEX\/\/\/8AAABVwtN\+AAAA.*\n$/,
    );
    expect(exitCode).toEqual(0);
  });

  it('prints human-readable errors', async () => {
    const { exitCode, stdout, stderr } = await runCLI(
      '-V1',
      'too much data for this version',
    );
    expect(stderr).toEqual('Too much data\n\n');
    expect(stdout).toEqual('');
    expect(exitCode).toEqual(1);
  });
});

function runCLI(...args) {
  return new Promise((resolve) => {
    const proc = execFile(
      './src/bin/cli.mjs',
      args,
      (error, stdout, stderr) => {
        resolve({ error, exitCode: proc.exitCode, stdout, stderr });
      },
    );
  });
}
