export interface CliOptions {
  help: boolean;
  version: boolean;
  demo: boolean;
  inline: boolean;
  snapshot: boolean;
}

export const helpText = `Relay Shell

Usage:
  relay-shell --demo
  relay-shell --demo --snapshot

Options:
  --demo             Open the built-in demonstration application
  --inline           Render in the current screen instead of the alternate screen
  --snapshot         Print one frame of the demonstration and exit
  -h, --help         Show this help
  -v, --version      Show the version

Relay Shell is a library. Import it from @relay-cli/shell to build your own application.
`;

export const parseCliOptions = (arguments_: readonly string[]): CliOptions => {
  const options: CliOptions = {
    help: false,
    version: false,
    demo: false,
    inline: false,
    snapshot: false,
  };
  for (const argument of arguments_) {
    if (argument === '-h' || argument === '--help') options.help = true;
    else if (argument === '-v' || argument === '--version') options.version = true;
    else if (argument === '--demo') options.demo = true;
    else if (argument === '--inline') options.inline = true;
    else if (argument === '--snapshot') options.snapshot = true;
    else throw new Error(`Unknown option: ${argument}`);
  }
  return options;
};
