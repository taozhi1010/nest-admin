export class GenConstants {
  /** 单表（增删改查） */
  public static readonly TPL_CRUD: string = 'crud';

  /** 树表（增删改查） */
  public static readonly TPL_TREE: string = 'tree';

  /** 主子表（增删改查） */
  public static readonly TPL_SUB: string = 'sub';

  /** 树编码字段 */
  public static readonly TREE_CODE: string = 'treeCode';

  /** 树父编码字段 */
  public static readonly TREE_PARENT_CODE: string = 'treeParentCode';

  /** 树名称字段 */
  public static readonly TREE_NAME: string = 'treeName';

  /** 上级菜单ID字段 */
  public static readonly PARENT_MENU_ID: string = 'parentMenuId';

  /** 上级菜单名称字段 */
  public static readonly PARENT_MENU_NAME: string = 'parentMenuName';

  /** 数据库字符串类型 */
  public static readonly COLUMNTYPE_STR: string[] = ['char', 'varchar', 'nvarchar', 'varchar2'];

  /** 数据库文本类型 */
  public static readonly COLUMNTYPE_TEXT: string[] = ['tinytext', 'text', 'mediumtext', 'longtext'];

  /** 数据库时间类型 */
  public static readonly COLUMNTYPE_TIME: string[] = ['datetime', 'time', 'date', 'timestamp'];

  /** 数据库数字类型 */
  public static readonly COLUMNTYPE_NUMBER: string[] = ['tinyint', 'smallint', 'mediumint', 'int', 'number', 'integer', 'bit', 'bigint', 'float', 'double', 'decimal'];

  /** 页面不需要编辑字段 */
  public static readonly COLUMNNAME_NOT_EDIT: string[] = ['id', 'create_by', 'create_time', 'del_flag'];

  /** 页面不需要显示的列表字段 */
  public static readonly COLUMNNAME_NOT_LIST: string[] = ['id', 'create_by', 'create_time', 'del_flag', 'update_by', 'update_time'];

  /** 页面不需要查询字段 */
  public static readonly COLUMNNAME_NOT_QUERY: string[] = ['id', 'create_by', 'create_time', 'del_flag', 'update_by', 'update_time', 'remark'];

  /** Entity基类字段 */
  public static readonly BASE_ENTITY: string[] = ['createBy', 'createTime', 'updateBy', 'updateTime', 'remark'];

  /** Tree基类字段 */
  public static readonly TREE_ENTITY: string[] = ['parentName', 'parentId', 'orderNum', 'ancestors', 'children'];

  /** 文本框 */
  public static readonly HTML_INPUT: string = 'input';

  /** 文本域 */
  public static readonly HTML_TEXTAREA: string = 'textarea';

  /** 下拉框 */
  public static readonly HTML_SELECT: string = 'select';

  /** 单选框 */
  public static readonly HTML_RADIO: string = 'radio';

  /** 复选框 */
  public static readonly HTML_CHECKBOX: string = 'checkbox';

  /** 日期控件 */
  public static readonly HTML_DATETIME: string = 'datetime';

  /** 图片上传控件 */
  public static readonly HTML_IMAGE_UPLOAD: string = 'imageUpload';

  /** 文件上传控件 */
  public static readonly HTML_FILE_UPLOAD: string = 'fileUpload';

  /** 富文本控件 */
  public static readonly HTML_EDITOR: string = 'editor';

  /** 字符串类型 */
  public static readonly TYPE_STRING: string = 'String';

  /** 整型 */
  public static readonly TYPE_INTEGER: string = 'Integer';

  /** 长整型 */
  public static readonly TYPE_LONG: string = 'Long';

  /** 浮点型 */
  public static readonly TYPE_DOUBLE: string = 'Double';

  /** 高精度计算类型 */
  public static readonly TYPE_BIGDECIMAL: string = 'BigDecimal';

  /** 时间类型 */
  public static readonly TYPE_DATE: string = 'Date';

  /** 模糊查询 */
  public static readonly QUERY_LIKE: string = 'LIKE';

  /** 相等查询 */
  public static readonly QUERY_EQ: string = 'EQ';

  /** 需要 */
  public static readonly REQUIRE: string = '1';

  public static readonly TYPE_NUMBER: string = 'Number';

  /** 日期区间查询 */
  public static readonly QUERY_BETWEEN: string = 'BETWEEN';
}
