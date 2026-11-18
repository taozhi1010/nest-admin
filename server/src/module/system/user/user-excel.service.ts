import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { createExcelTemplate } from 'src/common/utils/index';
import { ExportTable } from 'src/common/utils/export';
import * as ExcelJS from 'exceljs';

import { DelFlagEnum } from 'src/common/enum/index';
import { SYS_USER_TYPE } from 'src/common/constant/index';
import { ResultData } from 'src/common/utils/result';
import { ListUserDto } from './dto/index';
import { UserType } from './dto/user';
import { UserDto } from './user.decorator';

import { UserEntity } from './entities/sys-user.entity';
import { UserService } from './user.service';

@Injectable()
export class UserExcelService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly userService: UserService,
  ) {}

  /**
   * 导出用户信息数据为 xlsx
   * @param res
   * @param body
   * @param user
   */
  async export(res: Response, body: ListUserDto, user: UserType['user']) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.userService.findAll(body, user);
    const options = {
      sheetName: '用户数据',
      data: list.data.list,
      header: [
        { title: '用户序号', dataIndex: 'userId' },
        { title: '用户账号', dataIndex: 'userName' },
        { title: '用户昵称', dataIndex: 'nickName' },
        { title: '用户邮箱', dataIndex: 'email' },
        { title: '手机号码', dataIndex: 'phonenumber' },
        { title: '用户性别', dataIndex: 'sex' },
        { title: '账号状态', dataIndex: 'status' },
        { title: '最后登录 IP', dataIndex: 'loginIp' },
        { title: '最后登录时间', dataIndex: 'loginDate', width: 20 },
        { title: '部门', dataIndex: 'dept.deptName' },
        { title: '部门负责人', dataIndex: 'dept.leader' },
      ],
    };
    ExportTable(options, res);
  }

  /**
   * 从 Excel 导入用户数据
   * @param file - Excel 文件
   * @param updateSupport - 是否更新已存在的用户数据（true:更新，false:跳过）
   * @param user - 当前操作用户
   * @returns 导入结果
   */
  async importData(file: Express.Multer.File, updateSupport: boolean, user: UserDto) {
    try {
      // 读取 Excel 文件
      const workbook = new ExcelJS.Workbook();
      // @ts-expect-error - 处理 Multer Buffer 类型兼容性问题
      await workbook.xlsx.load(file.buffer);

      const worksheet = workbook.getWorksheet(1); // 获取第一个工作表

      if (!worksheet || worksheet.rowCount < 2) {
        return ResultData.fail(500, 'Excel 文件为空或格式不正确');
      }

      // 定义表头映射（第一行为表头）
      const headerMapping: Record<number, string> = {};
      const expectedHeaders: Record<string, string> = {
        用户账号: 'userName',
        用户昵称: 'nickName',
        '部门 ID': 'deptId',
        部门名称: 'deptName',
        用户邮箱: 'email',
        手机号码: 'phonenumber',
        性别: 'sex',
        账号状态: 'status',
        备注: 'remark',
      };

      // 解析表头
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        const header = cell.value?.toString()?.trim();
        if (header && expectedHeaders[header]) {
          headerMapping[colNumber] = expectedHeaders[header];
        }
      });

      // 验证必要字段是否存在
      if (!headerMapping || Object.keys(headerMapping).length === 0) {
        return ResultData.fail(500, 'Excel 表头格式不正确，请检查是否包含必要的列');
      }

      const successData: any[] = [];
      const errorData: any[] = [];
      const defaultPassword = await bcrypt.hash('123456', 10); // 默认密码

      // 从第二行开始解析数据
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const userData: any = {};
        const rowErrors: string[] = []; // 收集当前行的所有错误

        // 根据表头映射解析每列数据
        row.eachCell((cell, colNumber) => {
          const key = headerMapping[colNumber];
          if (key) {
            let value = cell.value?.toString()?.trim();

            // 处理空值
            if (!value || value === '') {
              if (key === 'userName' || key === 'nickName') {
                // 必填字段
                value = null;
                rowErrors.push(`${key === 'userName' ? '用户账号' : '用户昵称'}不能为空`);
              } else {
                value = undefined;
              }
            }

            // 特殊字段处理
            if (key === 'deptId' && value) {
              const deptId = parseInt(value);
              if (isNaN(deptId)) {
                rowErrors.push(`部门 ID 格式不正确（应为数字）：${value}`);
              } else {
                userData.deptId = deptId;
              }
            } else if (key === 'sex' && value) {
              // 性别转换：男->0, 女->1, 未知->2
              if (['男', '女', '未知'].includes(value)) {
                userData.sex = value === '男' ? '0' : value === '女' ? '1' : '2';
              } else {
                rowErrors.push(`性别格式不正确（应为：男/女/未知）：${value}`);
              }
            } else if (key === 'status' && value) {
              // 状态转换：正常->0, 停用->1
              if (['正常', '停用'].includes(value)) {
                userData.status = value === '正常' ? '0' : value === '停用' ? '1' : '0';
              } else {
                rowErrors.push(`账号状态格式不正确（应为：正常/停用）：${value}`);
              }
            } else if (key === 'email' && value) {
              // 邮箱格式验证
              const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
              if (!emailRegex.test(value)) {
                rowErrors.push(`邮箱格式不正确：${value}`);
              } else {
                userData[key] = value;
              }
            } else if (key === 'phonenumber' && value) {
              // 手机号格式验证（简单验证 11 位数字）
              const phoneRegex = /^1[3-9]\d{9}$/;
              if (!phoneRegex.test(value)) {
                rowErrors.push(`手机号码格式不正确（应为 11 位数字）：${value}`);
              } else {
                userData[key] = value;
              }
            } else if (key === 'userName' || key === 'nickName') {
              userData[key] = value;
            } else {
              userData[key] = value;
            }
          }
        });

        // 跳过空行（整行都为空）
        if (!userData.userName && !userData.nickName && rowErrors.length === 0) {
          continue;
        }

        // 如果有字段错误，直接记录错误
        if (rowErrors.length > 0) {
          errorData.push({
            row: rowNumber,
            data: userData,
            error: rowErrors.join('；'),
          });
          continue;
        }

        // 必填字段验证（再次检查）
        if (!userData.userName || !userData.nickName) {
          const missingFields = [];
          if (!userData.userName) missingFields.push('用户账号');
          if (!userData.nickName) missingFields.push('用户昵称');
          errorData.push({
            row: rowNumber,
            data: userData,
            error: `缺少必填字段：${missingFields.join('、')}`,
          });
          continue;
        }

        try {
          // 检查用户账号是否已存在
          const existUser = await this.userRepo.findOne({
            where: { userName: userData.userName },
          });

          if (existUser) {
            if (updateSupport) {
              // 更新已有用户
              await this.userRepo.update(
                { userId: existUser.userId },
                {
                  ...userData,
                  userType: SYS_USER_TYPE.CUSTOM,
                  updateBy: user.username,
                  updateTime: new Date(),
                },
              );
              successData.push({
                row: rowNumber,
                data: userData,
                message: '更新成功',
              });
            } else {
              // 不更新，跳过
              errorData.push({
                row: rowNumber,
                data: userData,
                error: `用户账号 ${userData.userName} 已存在（如要更新请设置 updateSupport=1）`,
              });
            }
          } else {
            // 创建新用户
            const newUser = await this.userRepo.save({
              ...userData,
              password: defaultPassword, // 使用默认密码
              userType: SYS_USER_TYPE.CUSTOM,
              createBy: user.username,
              createTime: new Date(),
              delFlag: DelFlagEnum.NORMAL,
              status: userData.status || '0', // 默认正常
              sex: userData.sex || '0', // 默认男
            });

            successData.push({
              row: rowNumber,
              data: userData,
              message: '导入成功',
            });
          }
        } catch (error) {
          errorData.push({
            row: rowNumber,
            data: userData,
            error: `数据库操作失败：${error.message}`,
          });
        }
      }

      // 返回导入结果
      const result = {
        success: successData.length,
        error: errorData.length,
        total: successData.length + errorData.length,
        // 成功行号列表
        successRowNums: successData.map((item) => item.row),
        // 失败行号列表
        errorRowNums: errorData.map((item) => item.row),
        details: {
          successData,
          errorData,
        },
      };

      // 无论是否有错误，都返回 200 状态码
      if (errorData.length > 0) {
        return ResultData.ok(result, `导入完成，成功 ${successData.length} 条，失败 ${errorData.length} 条`);
      }

      return ResultData.ok(result, `导入成功，共 ${successData.length} 条记录`);
    } catch (error) {
      return ResultData.fail(500, `导入失败：${error.message}`);
    }
  }

  /**
   * 下载用户导入模板
   * @param res
   */
  async downloadTemplate(res: Response): Promise<void> {
    const config = {
      sheetName: '用户数据',
      fileName: '用户导入模板.xlsx',
      columns: [
        { header: '用户账号', key: 'userName', width: 20, required: true },
        { header: '用户昵称', key: 'nickName', width: 20, required: true },
        { header: '部门 ID', key: 'deptId', width: 15 },
        { header: '用户邮箱', key: 'email', width: 25 },
        { header: '手机号码', key: 'phonenumber', width: 15 },
        { header: '性别', key: 'sex', width: 10, validation: ['男', '女', '未知'] },
        { header: '账号状态', key: 'status', width: 15, validation: ['正常', '停用'] },
        { header: '备注', key: 'remark', width: 30 },
      ],
      exampleData: {
        userName: 'zhangsan',
        nickName: '张三',
        deptId: 100,
        email: 'zhangsan@example.com',
        phonenumber: '13800138000',
        sex: '男',
        status: '正常',
        remark: '示例数据，请删除后填写实际数据',
      },
    };

    await createExcelTemplate(res, config);
  }
}
