# 字典一次性加载测试说明

## 测试目标
验证登录后一次性加载所有字典数据的功能是否正常工作。

## 测试步骤

### 1. 启动项目
```bash
npm run dev
```

### 2. 登录系统
- 使用有效的用户名和密码登录系统
- 登录成功后，系统会自动调用 `/system/dict/data/all` 接口获取所有字典数据

### 3. 查看控制台日志
在浏览器控制台中应该看到以下日志：
```
开始加载所有字典数据...
获取到字典数据类型数量: X
字典加载完成，已缓存 X 个字典类型
```

### 4. 访问用户管理页面
- 导航到 `系统管理 > 用户管理`
- 在控制台中应该看到：
```
用户页面 - sys_normal_disable: Ref {...}
用户页面 - sys_user_sex: Ref {...}
用户页面 - sys_normal_disable 数据: [...]
用户页面 - sys_user_sex 数据: [...]
```

### 5. 访问测试页面（可选）
- 如果配置了路由，可以访问 `/test/dict-test` 页面
- 该页面会显示所有已加载的字典数据和特定字典的详细信息

## 预期结果

1. **登录后**：只调用一次 `/system/dict/data/all` 接口
2. **字典数据**：所有字典类型都应该被正确加载并缓存
3. **组件使用**：在组件中使用 `useDict('sys_normal_disable', 'sys_user_sex')` 时，应该直接从缓存中获取数据，不再发起新的请求
4. **性能提升**：相比之前逐个加载字典的方式，减少了HTTP请求次数

## 验证要点

### ✅ 成功标志
- [ ] 控制台显示"字典加载完成"日志
- [ ] 用户页面的字典数据不为空
- [ ] 网络面板中只有一次 `/system/dict/data/all` 请求
- [ ] 后续使用 `useDict` 时没有额外的字典请求

### ❌ 失败标志
- [ ] 控制台出现"初始化字典失败"错误
- [ ] 字典数据为空或 undefined
- [ ] 仍然有多个单独的字典请求
- [ ] 回退方案也被触发

## 调试技巧

如果遇到问题，可以检查：

1. **API 接口是否正常**
   ```javascript
   // 在浏览器控制台执行
   fetch('/api/system/dict/data/all')
     .then(res => res.json())
     .then(data => console.log('API 响应:', data))
   ```

2. **Store 中的字典数据**
   ```javascript
   // 在浏览器控制台执行
   import useDictStore from '@/store/modules/dict'
   const dictStore = useDictStore()
   console.log('Store 中的字典:', dictStore.dict)
   console.log('已加载的类型:', Array.from(dictStore.loadedTypes))
   ```

3. **检查回退机制**
   如果新接口失败，系统会自动使用原有的逐个加载方式，控制台会显示：
   ```
   回退到原有字典加载方式...
   ```

## 下一步

如果测试通过，可以将这种模式推广到其他模块：
1. 移除各个组件中的调试日志
2. 确保所有使用 `useDict` 的地方都能正常工作
3. 考虑是否需要优化字典数据的更新机制
