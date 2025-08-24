const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const runCommand = (command, fallback = "") => {
  try {
    return execSync(command).toString().replace(/'/g, "").trim();
  } catch {
    return fallback;
  }
};

const getCurrentBranch = () => {
  return runCommand("git rev-parse --abbrev-ref HEAD", "unknown");
};

const getLastCommitterEmail = () => {
  return runCommand("git log -1 --pretty=format:'%ce'", "unknown@gmail.com");
};

const getUserRole = (email) => {
  const roleMap = {
    "devops@gmail.com": "devops",
    "qa@gmail.com": "qa",
    "admin@gmail.com": "admin",
  };

  // Check ENV variable first, then map from email, else default to admin
  if (process.env.USER_ROLE) {
    return process.env.USER_ROLE.toLowerCase();
  }

  return roleMap[email] || "admin"; // Default to admin for testing
};

const getTargetEnvironment = () => {
  return (process.env.ENVIRONMENT || "dev").toLowerCase();
};

const getDeploymentContext = () => {
  const branch = getCurrentBranch();
  const committerEmail = getLastCommitterEmail();
  const userRole = getUserRole(committerEmail);
  const environment = getTargetEnvironment();

  return {
    userEmail: committerEmail,
    userRole,
    branch,
    environment,
  };
};

const detectContext = () => {
  const context = getDeploymentContext();
  console.log(JSON.stringify(context, null, 2));

  const outputDir = path.resolve(__dirname, "../output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "detected-context.json");
  fs.writeFileSync(outputPath, JSON.stringify(context, null, 2));
  console.log(`Context saved to ${outputPath}`);
};

detectContext();
