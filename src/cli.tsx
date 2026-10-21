#!/usr/bin/env node

import {renderToString} from 'ink';
import {helpText, parseCliOptions} from './cli/options.js';
import {DemoApp} from './demo/index.js';
import {runShell} from './run.js';
import {relayShellVersion} from './version.js';

const main = async (): Promise<void> => {
  let options;
  try {
    options = parseCliOptions(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n\n${helpText}`,
    );
    process.exitCode = 2;
    return;
  }
  if (options.help) return void process.stdout.write(helpText);
  if (options.version) return void process.stdout.write(`${relayShellVersion}\n`);
  if (!options.demo) {
    process.stderr.write(`Choose --demo to open the demonstration.\n\n${helpText}`);
    process.exitCode = 2;
    return;
  }

  if (options.snapshot || !process.stdout.isTTY || !process.stdin.isTTY) {
    const columns = process.stdout.columns || 80;
    const frame = renderToString(<DemoApp width={columns} height={24} interactive={false} />, {
      columns,
    });
    process.stdout.write(`${frame}\n`);
    return;
  }

  await runShell(<DemoApp />, {alternateScreen: !options.inline});
};

await main();
