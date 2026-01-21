# Jenkins 构建时忽略目录配置指南

## 📋 概述

在 Jenkins 构建和部署过程中，可以通过多种方式排除不需要的目录或文件。

## 🎯 使用场景

- **开发/测试目录**: 排除 `demo/`, `test/`, `dev/` 等目录
- **调试文件**: 排除 `.map`, `.sourcemap` 等调试文件
- **临时文件**: 排除 `temp/`, `tmp/` 等临时目录
- **文档目录**: 排除 `docs/`, `readme/` 等文档目录

## 🔧 配置方式

### 方式1：在 Jenkinsfile 中配置（推荐）

在 `Jenkinsfile` 的 `environment` 部分设置 `DEPLOY_EXCLUDES`：

```groovy
environment {
  // 排除多个目录或文件，使用逗号分隔
  DEPLOY_EXCLUDES = '**/demo/**,**/test/**,**/*.map'
}
```

### 方式2：在 Vite 构建时排除

在 `vite.config.mts` 中配置，构建时就不包含这些文件：

```typescript
export default defineConfig(async () => {
  return {
    vite: {
      build: {
        rollupOptions: {
          // 配置构建选项
        },
      },
    },
  };
});
```

## 📝 配置示例

### 示例1：排除单个目录

```groovy
environment {
  // 排除 dist/demo 目录
  DEPLOY_EXCLUDES = '**/demo/**'
}
```

### 示例2：排除多个目录

```groovy
environment {
  // 排除 demo、test、dev 目录
  DEPLOY_EXCLUDES = '**/demo/**,**/test/**,**/dev/**'
}
```

### 示例3：排除特定文件类型

```groovy
environment {
  // 排除 .map 和 .sourcemap 文件
  DEPLOY_EXCLUDES = '**/*.map,**/*.sourcemap'
}
```

### 示例4：排除多个目录和文件

```groovy
environment {
  // 排除目录和文件
  DEPLOY_EXCLUDES = '**/demo/**,**/test/**,**/*.map,**/*.sourcemap'
}
```

### 示例5：排除特定路径下的文件

```groovy
environment {
  // 排除 dist/assets/demo 目录下的所有文件
  DEPLOY_EXCLUDES = '**/assets/demo/**'
}
```

## 🔍 通配符说明

| 通配符 | 说明 | 示例 |
|--------|------|------|
| `**` | 匹配任意层级目录 | `**/demo/**` 匹配所有 demo 目录 |
| `*` | 匹配单个目录层级 | `*/demo/*` 只匹配一级目录下的 demo |
| `*.ext` | 匹配特定扩展名 | `*.map` 匹配所有 .map 文件 |
| `**/*.ext` | 匹配任意层级的特定扩展名 | `**/*.map` 匹配所有 .map 文件 |

## 📊 路径说明

### 重要提示

`excludes` 中的路径是**相对于 `sourceFiles`** 的，即相对于 `dist` 目录。

例如：
- `sourceFiles`: `apps/web-antd/dist/**`
- `excludes`: `**/demo/**` 
- 实际排除: `apps/web-antd/dist/demo/**`

### 路径示例

假设构建产物结构如下：
```
dist/
├── index.html
├── assets/
│   ├── demo/          ← 要排除
│   │   └── ...
│   ├── test/          ← 要排除
│   │   └── ...
│   └── main.js
└── docs/              ← 要排除
    └── ...
```

配置：
```groovy
DEPLOY_EXCLUDES = '**/demo/**,**/test/**,**/docs/**'
```

## 🚀 使用步骤

### 步骤1：修改 Jenkinsfile

编辑 `Jenkinsfile`，在 `environment` 部分添加：

```groovy
environment {
  // 其他配置...
  DEPLOY_EXCLUDES = '**/demo/**,**/test/**'  // 根据需求修改
}
```

### 步骤2：提交更改

```bash
git add Jenkinsfile
git commit -m "feat: 配置部署时排除 demo 和 test 目录"
git push
```

### 步骤3：触发 Jenkins 构建

在 Jenkins 中触发构建，部署时会自动排除配置的目录。

## ✅ 验证排除效果

### 方法1：查看 Jenkins 构建日志

在 Jenkins 构建日志中，Publish Over SSH 插件会显示：
```
Excluding: **/demo/**
Excluding: **/test/**
```

### 方法2：检查服务器上的文件

```bash
# SSH 登录到服务器
ssh root@182.92.106.252

# 检查部署目录
ls -la /usr/share/nginx/html/web/

# 确认排除的目录不存在
ls -la /usr/share/nginx/html/web/demo/  # 应该不存在
```

### 方法3：查看构建产物大小

排除前后对比构建产物大小：
```bash
# 排除前
du -sh dist/  # 例如: 10M

# 排除后
du -sh dist/  # 例如: 8M
```

## 🔄 常见场景

### 场景1：排除开发测试目录

```groovy
DEPLOY_EXCLUDES = '**/demo/**,**/test/**,**/dev/**'
```

### 场景2：排除调试文件

```groovy
DEPLOY_EXCLUDES = '**/*.map,**/*.sourcemap'
```

### 场景3：排除文档目录

```groovy
DEPLOY_EXCLUDES = '**/docs/**,**/readme/**'
```

### 场景4：排除临时文件

```groovy
DEPLOY_EXCLUDES = '**/temp/**,**/tmp/**,**/*.tmp'
```

### 场景5：组合排除

```groovy
DEPLOY_EXCLUDES = '**/demo/**,**/test/**,**/*.map,**/*.sourcemap,**/docs/**'
```

## ⚠️ 注意事项

### 1. 路径是相对于 dist 目录的

```groovy
// ✅ 正确
excludes: '**/demo/**'  // 排除 dist/demo/**

// ❌ 错误
excludes: 'dist/**/demo/**'  // 不要包含 dist 前缀
```

### 2. 多个模式用逗号分隔

```groovy
// ✅ 正确
excludes: '**/demo/**,**/test/**'

// ❌ 错误
excludes: '**/demo/** **/test/**'  // 缺少逗号
```

### 3. 通配符匹配规则

- `**/demo/**` 会匹配所有层级的 demo 目录
- `*/demo/*` 只匹配一级目录下的 demo
- `demo/**` 只匹配根目录下的 demo

### 4. 排除后无法恢复

排除的文件不会部署到服务器，如果需要恢复，需要：
1. 修改 `DEPLOY_EXCLUDES` 配置
2. 重新构建和部署

### 5. 不影响构建过程

`excludes` 只影响**部署阶段**，不影响**构建阶段**。如果要在构建时排除，需要配置 Vite。

## 🆚 方式对比

| 方式 | 作用阶段 | 优点 | 缺点 | 适用场景 |
|------|----------|------|------|----------|
| **Jenkinsfile excludes** | 部署阶段 | 简单、灵活 | 文件仍会被构建 | 排除不需要部署的文件 |
| **Vite 配置** | 构建阶段 | 减少构建时间 | 配置复杂 | 排除不需要编译的文件 |
| **.gitignore** | Git 阶段 | 不拉取文件 | 不影响构建 | 排除不需要版本控制的文件 |

## 💡 最佳实践

### 1. 推荐组合使用

```groovy
// Jenkinsfile: 排除部署
DEPLOY_EXCLUDES = '**/demo/**,**/test/**'

// .gitignore: 排除版本控制
dist/
*.log

// vite.config.mts: 优化构建（可选）
build: {
  rollupOptions: {
    // 构建优化配置
  }
}
```

### 2. 环境变量配置

可以为不同环境配置不同的排除规则：

```groovy
environment {
  DEPLOY_EXCLUDES = env.BRANCH_NAME == 'main' 
    ? '**/demo/**,**/test/**'  // 生产环境排除更多
    : ''                        // 开发环境不排除
}
```

### 3. 定期检查

定期检查排除配置，确保：
- 没有排除必要的文件
- 排除的文件确实不需要部署
- 构建产物大小合理

## 🔍 故障排查

### 问题1：排除配置不生效

**检查**:
1. 确认 `DEPLOY_EXCLUDES` 格式正确（逗号分隔）
2. 确认路径相对于 `dist` 目录
3. 查看 Jenkins 构建日志

**解决**:
```groovy
// 检查配置
echo "DEPLOY_EXCLUDES: ${env.DEPLOY_EXCLUDES}"

// 验证路径
ls -la dist/
```

### 问题2：排除的文件仍被部署

**原因**: 可能是路径匹配不正确

**解决**:
```groovy
// 使用更精确的路径
DEPLOY_EXCLUDES = '**/demo/**,**/test/**'

// 或使用绝对路径（相对于 dist）
DEPLOY_EXCLUDES = 'demo/**,test/**'
```

### 问题3：排除后功能异常

**原因**: 可能排除了必要的文件

**解决**:
1. 检查排除配置
2. 移除不必要的排除规则
3. 重新构建部署

## 📚 相关文档

- [Jenkins Pipeline 文档](https://www.jenkins.io/doc/book/pipeline/)
- [Publish Over SSH 插件文档](https://plugins.jenkins.io/publish-over-ssh/)
- [Vite 构建配置](https://vitejs.dev/config/build-options.html)

## 🎯 快速参考

```groovy
// 最小配置示例
environment {
  DEPLOY_EXCLUDES = '**/demo/**,**/test/**'
}

// 完整配置示例
environment {
  DEPLOY_EXCLUDES = '**/demo/**,**/test/**,**/*.map,**/*.sourcemap'
}
```

---

**最后更新**: 2026-01-21  
**维护者**: DevOps Team
