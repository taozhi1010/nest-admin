import { fileTypeFromBlob } from '@vben/utils';

/**
 * 不支持txt文件 @see https://github.com/sindresorhus/file-type/issues/55
 * 需要自行修改
 * @param file file对象
 * @param accepts 文件类型数组  包括拓展名(不带点) 文件头(image/png等 不包括泛写法即image/*)
 * @returns 是否通过文件类型校验
 */
export async function checkFileType(file: File, accepts: string[]) {
  if (!accepts || accepts?.length === 0) {
    return true;
  }
  console.log(file);
  const fileType = await fileTypeFromBlob(file);
  if (!fileType) {
    console.error('无法获取文件类型');
    return false;
  }
  console.log('文件类型', fileType);
  // 是否文件拓展名/文件头任意有一个匹配
  return accepts.includes(fileType.ext) || accepts.includes(fileType.mime);
}

/**
 * 默认图片类型
 */
export const defaultImageAccept = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
/**
 * 判断文件类型是否符合要求
 * @param file file对象
 * @param accepts 文件类型数组  包括拓展名(不带点) 文件头(image/png等 不包括泛写法即image/*)
 * @returns 是否通过文件类型校验
 */
export async function checkImageFileType(file: File, accepts: string[]) {
  // 空的accepts 使用默认规则
  if (!accepts || accepts.length === 0) {
    accepts = defaultImageAccept;
  }
  const fileType = await fileTypeFromBlob(file);
  if (!fileType) {
    console.error('无法获取文件类型');
    return false;
  }
  console.log('文件类型', fileType);
  // 是否文件拓展名/文件头任意有一个匹配
  if (accepts.includes(fileType.ext) || accepts.includes(fileType.mime)) {
    return true;
  }
  return false;
}
