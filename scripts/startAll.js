const { executeCli } = require("./execute");


async function startAll() {
  try {
    await executeCli("pnpm run start:dev", "server");
    await executeCli("pnpm run dev", "admin");
  } catch (error) {
    console.log("error: ", error);
  }
}

startAll();
