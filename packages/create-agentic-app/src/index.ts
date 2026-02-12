import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import { execSync } from 'child_process';

const program = new Command();

program
    .name('create-agentic-app')
    .description('Scaffold a new Agentic Website with the best-in-class SDK')
    .argument('[project-directory]', 'Directory to create the project in')
    .option('-t, --template <template>', 'Template to use (nextjs, vite)')
    .action(async (targetDir, options) => {
        console.log(chalk.bold.green('\n🚀 Welcome to Agentic Web Framework\n'));

        // 1. Interactive Prompts
        const response = await prompts(
            [
                {
                    type: targetDir ? null : 'text',
                    name: 'projectName',
                    message: 'What is your project named?',
                    initial: 'my-agentic-app',
                },
                {
                    type: options.template ? null : 'select',
                    name: 'template',
                    message: 'Which template would you like to use?',
                    choices: [
                        { title: 'Next.js App Router (Recommended)', value: 'nextjs' },
                        { title: 'Vite SPA (Minimal)', value: 'vite', disabled: true }, // Coming soon
                    ],
                    initial: 0,
                },
            ],
            {
                onCancel: () => {
                    console.log(chalk.red('✖ Operation cancelled'));
                    process.exit(0);
                },
            }
        );

        const projectName = targetDir || response.projectName;
        const projectPath = path.resolve(process.cwd(), projectName);
        const template = options.template || response.template || 'nextjs';

        if (fs.existsSync(projectPath)) {
            console.error(chalk.red(`\nError: Directory ${projectName} already exists.`));
            process.exit(1);
        }

        // 2. Scaffold Project
        const spinner = ora(`Creating a new Agentic app in ${chalk.bold(projectName)}...`).start();

        try {
            // Copy template
            const templateDir = path.join(__dirname, 'templates', template);
            await fs.copy(templateDir, projectPath);

            // Update package.json name
            const pkgPath = path.join(projectPath, 'package.json');
            const pkg = await fs.readJson(pkgPath);
            pkg.name = projectName;
            await fs.writeJson(pkgPath, pkg, { spaces: 2 });

            // Create .gitignore (npm publish strips it, so we rename it)
            // Note: In local testing, the source might be named 'gitignore' to avoid npm packing issues
            const sourceGitignore = path.join(templateDir, 'gitignore');
            if (fs.existsSync(sourceGitignore)) {
                await fs.move(path.join(projectPath, 'gitignore'), path.join(projectPath, '.gitignore'));
            } else {
                // If template didn't have a gitignore file (local dev env), create a basic one
                await fs.writeFile(path.join(projectPath, '.gitignore'), 'node_modules\n.next\n.env.local');
            }

            spinner.succeed(chalk.green('Project created successfully!'));

            // 3. Install Dependencies
            console.log('\nInstalling dependencies...');
            execSync('npm install', { stdio: 'inherit', cwd: projectPath });

            // 4. Git Init
            try {
                execSync('git init', { stdio: 'ignore', cwd: projectPath });
                execSync('git add .', { stdio: 'ignore', cwd: projectPath });
                execSync('git commit -m "Initial commit from create-agentic-app"', { stdio: 'ignore', cwd: projectPath });
                console.log(chalk.gray('Initialized a git repository.'));
            } catch (e) {
                // Ignore git errors
            }

            console.log(chalk.bold.green('\n🎉 Done! Now run:\n'));
            console.log(`  cd ${projectName}`);
            console.log(`  npm run dev`);
            console.log(chalk.dim('\nVisit http://localhost:3000 to see your agent in action.'));

        } catch (error) {
            spinner.fail('Failed to create project.');
            console.error(error);
            process.exit(1);
        }
    });

program.parse(process.argv);
