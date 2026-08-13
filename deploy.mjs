import { execSync } from "child_process";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const config = require("./config.json");

const { user, server, remote_path } = config.deploy ?? {};

if (!server) {
  console.error('Deploy abortado: preencha "deploy.server" no config.json.');
  process.exit(1);
}

const dest = `${user}@${server}:${remote_path}`;
console.log(`Enviando dist/ → ${dest}`);
execSync(`scp -r -o BatchMode=yes dist/. ${dest}`, { stdio: "inherit" });
console.log("Ajustando permissões do Nginx no servidor...");
execSync(`ssh -o BatchMode=yes ${user}@${server} "chown -R www-data:www-data ${remote_path} && find ${remote_path} -type d -exec chmod 755 {} + && find ${remote_path} -type f -exec chmod 644 {} +"`, { stdio: "inherit" });
