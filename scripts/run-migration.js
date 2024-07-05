// Import the child_process module
const { exec } = require("child_process");

// Function to run the migrations command

function runMigrations() {
    exec(
        "NODE_ENV=migration npm run migration:run -- -d src/config/data-source.ts",
        (error, stdout, stderr) => {
            if (error) {
                console.log(`Error executing migration: ${error.message}`);
                return;
            }

            if (stderr) {
                console.log(`Error output:${stderr}`);
            }

            // log the output of the command
            console.log(`Migration output: ${stdout}`);
        },
    );
}

// Run the migrations function
runMigrations();
