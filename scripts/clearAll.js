const fs = require('fs').promises;
const path = require('path');


const nodeModulesToDelete = ['admin', 'server']

async function deleteModule(dir) {
  try {
    console.log('正在删除 ==>> ' + dir)
    await fs.access(dir);
  } catch (error) {
    console.log('目录不存在', error)
    return
  }
  await fs.rm(dir, { recursive: true });
  console.log(dir + '已删除完成')
}


async function clearAll() {
  try {
    for (let d of nodeModulesToDelete) {
      const deletedPath = path.join(d, 'node_modules')
      await deleteModule(deletedPath)
    }
    console.log('success ==> 删除完成')
  } catch (error) {
    console.log("error: ", error);
  }
}

clearAll();
