import { exec } from 'child_process';
import { promisify } from 'util';
import { environment, settings } from '../config/test-config';

const execAsync = promisify(exec);

// Test run configurations
interface TestRunConfig {
  name: string;
  command: string;
  description: string;
}

const testConfigs: TestRunConfig[] = [
  {
    name: 'all',
    command: 'npx playwright test',
    description: 'Run all tests'
  },
  {
    name: 'chrome',
    command: 'npx playwright test --project=chrome',
    description: 'Run tests in Chrome only'
  },
  {
    name: 'mobile',
    command: 'npx playwright test --project=mobile-safari',
    description: 'Run tests in mobile Safari'
  },
  {
    name: 'slow-3g',
    command: 'npx playwright test --project=slow-3g',
    description: 'Run tests with slow 3G network'
  },
  {
    name: 'accessibility',
    command: 'npx playwright test --project=accessibility',
    description: 'Run accessibility tests'
  },
  {
    name: 'performance',
    command: 'npx playwright test --project=performance',
    description: 'Run performance tests'
  },
  {
    name: 'debug',
    command: 'npx playwright test --debug',
    description: 'Run tests in debug mode'
  },
  {
    name: 'ui',
    command: 'npx playwright test --ui',
    description: 'Run tests with UI mode'
  }
];

// Test execution options
interface TestOptions {
  headed?: boolean;
  debug?: boolean;
  workers?: number;
  retries?: number;
  reporter?: string;
  timeout?: number;
  grep?: string;
  grepInvert?: string;
}

// Build test command with options
function buildTestCommand(config: TestRunConfig, options: TestOptions = {}): string {
  let command = config.command;
  
  if (options.headed) {
    command += ' --headed';
  }
  
  if (options.debug) {
    command += ' --debug';
  }
  
  if (options.workers !== undefined) {
    command += ` --workers=${options.workers}`;
  }
  
  if (options.retries !== undefined) {
    command += ` --retries=${options.retries}`;
  }
  
  if (options.reporter) {
    command += ` --reporter=${options.reporter}`;
  }
  
  if (options.timeout) {
    command += ` --timeout=${options.timeout}`;
  }
  
  if (options.grep) {
    command += ` --grep="${options.grep}"`;
  }
  
  if (options.grepInvert) {
    command += ` --grep-invert="${options.grepInvert}"`;
  }
  
  return command;
}

// Run tests with specified configuration
async function runTests(
  configName: string,
  options: TestOptions = {}
): Promise<void> {
  const config = testConfigs.find(c => c.name === configName);
  
  if (!config) {
    throw new Error(`Unknown test configuration: ${configName}`);
  }
  
  console.log(`Running ${config.description}...`);
  
  try {
    const command = buildTestCommand(config, options);
    const { stdout, stderr } = await execAsync(command);
    
    console.log(stdout);
    
    if (stderr) {
      console.error(stderr);
    }
  } catch (error) {
    console.error(`Error running tests: ${error.message}`);
    process.exit(1);
  }
}

// Run all test configurations
async function runAllConfigurations(): Promise<void> {
  for (const config of testConfigs) {
    if (config.name === 'all' || config.name === 'debug' || config.name === 'ui') {
      continue;
    }
    
    console.log(`\n=== Running ${config.description} ===\n`);
    
    try {
      await runTests(config.name);
    } catch (error) {
      console.error(`Error running ${config.name} tests: ${error.message}`);
    }
  }
}

// Parse command line arguments
function parseArguments(): { configName: string; options: TestOptions } {
  const args = process.argv.slice(2);
  const configName = args[0] || 'all';
  const options: TestOptions = {};
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--headed':
        options.headed = true;
        break;
      case '--debug':
        options.debug = true;
        break;
      case '--workers':
        options.workers = parseInt(args[++i], 10);
        break;
      case '--retries':
        options.retries = parseInt(args[++i], 10);
        break;
      case '--reporter':
        options.reporter = args[++i];
        break;
      case '--timeout':
        options.timeout = parseInt(args[++i], 10);
        break;
      case '--grep':
        options.grep = args[++i];
        break;
      case '--grep-invert':
        options.grepInvert = args[++i];
        break;
    }
  }
  
  return { configName, options };
}

// Main execution
async function main(): Promise<void> {
  const { configName, options } = parseArguments();
  
  if (configName === 'all') {
    await runAllConfigurations();
  } else {
    await runTests(configName, options);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

// Export functions for programmatic use
export {
  runTests,
  runAllConfigurations,
  buildTestCommand,
  testConfigs,
  TestRunConfig,
  TestOptions
}; 