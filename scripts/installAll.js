const { executeCli } = require("./execute");
async function installAll() {
  try {
    await Promise.all([
      executeCli("pnpm install", "admin"),
      executeCli("pnpm install", "server"),
    ]);
  } catch (error) {
    console.log("error: ", error);
  }
}

installAll();
