# Contributing

Lean QR welcomes contributions!

Pull requests will always be warmly received, but please be aware that they may
not always be merged, even if they are well written and appear to be an obvious
improvement. Lean-QR's raison d'être is to be small (really, _really_ small) and
in general some performance is traded-off in exchange for fewer bytes of code.
If your PR makes the library _bigger_, you will probably need to justify _why_
the changes are worth the increase in size.

If your PR is rejected, that does not mean it isn't correct or useful; it just
means it doesn't align with Lean QR's [_primary goals_](#goals). You may also
trigger a discussion which leads to a different change being made. These
discussions are very useful!

## Guidance

When making a pull request, please follow these steps. None of these are strict
requirements, but they will help your contribution get reviewed a bit faster:

- when you're adding a new feature or fixing a bug, adding a corresponding test
  is always welcome
  - if you don't add a test, one will probably be added for you in the merge,
    but this will slow things down a bit
- run `npm run format` to auto-format your changes with the project's style
- run `npm test` (or at least `npm run reduced-test`, which omits browser tests)
  to confirm the tests are passing
  - this will also update `docs/stats.txt` and `docs/integrity.txt`; please
    include these changes in your PR (it's helpful to be able to quickly see
    what impact your changes have made to the code size). Don't worry if these
    files cause merge conflicts; those can be resolved easily when merging.
- include an explanation of your changes in the pull request's description
  - if your changes are in the
    ["risky"](#risky-things-to-contribute-will-need-some-justification) section
    below, be sure to explain the tangible benefits of your changes so that they
    can be weighed against the trade-offs.

## Goals

Lean QR's _primary_ use-case is being used on the client side (in-browser) to
generate a small number of QR codes on a page. Secondary use-cases include
running on the server-side or as a local tool to generate large numbers of QR
codes (e.g. for statically-rendered pages, or bulk generation).

These use cases mean that Lean QR's _primary goals_ are (in order of highest to
lowest priority):

1. correctness (e.g. ISO 18004 compliance)
2. small code size (minified + compressed; see the auto-generated
   [/docs/stats.txt](./stats.txt) file)
3. performance (when it can be achieved without adversely affecting the size too
   much)

Code clarity — though welcome where possible — is not a primary goal and is
often sacrificed in exchange for smaller code size or better performance. This
is balanced by the use of an extensive set of automated tests.

A wide feature set is also not a primary goal; Lean QR is intended to do one job
very well, and does not include extras such as being able to decorate the
resulting QR codes (though this can easily be built on top of its outputs by
users of the library).

## Good things to contribute (very likely to be accepted)

- bug fixes affecting stability or correctness of the output
- improvements to the documentation ([README.md](../README.md) /
  [API page](../web/static/docs/index.html))
- TypeScript fixes ([index.d.ts](../src/index.d.ts))
- improving ISO 18004 compliance
- improvements to the automated tests (e.g. extending coverage, or improving
  robustness)
- reducing the minified code size (without affecting correctness)
- bug fixes for a particular runtime, build setup, or browser (excluding "dead"
  browsers)

## Risky things to contribute (will need some justification)

- performance improvements which increase the code size
- new features (such as a new mode or output format)
- wrappers for uncommon libraries or frameworks
- breaking changes to public APIs
- adding a build-time ("dev") dependency on another library

## Bad things to contribute (will not be accepted)

- adding a runtime dependency on another library
- unsafe code (e.g. code which uses `eval` or `new Function`)
- spam / malicious changes
