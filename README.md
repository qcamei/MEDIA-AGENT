# MEDIA-AGENT
使用各类大模型和AI工具生成和下载文档，图片，音乐，视频，3D
1. 在首页点击"创建媒体"按钮
2. 选择：
   - 主题
   - 媒体类型
3. 点击"生成媒体"按钮
4. 等待媒体生成完成（您可以实时查看进度）
5. 下载或预览生成的媒体

**业务架构图**和**技术架构图**：


### **一、业务架构图**
```mermaid
graph LR
    A[用户层] --> B[交互层]
    B --> C[业务逻辑层]
    C --> D[服务层]
    D --> E[数据与资源层]

    subgraph 用户层
        用户((用户)) -->|Web/APP| 交互界面
    end

    subgraph 交互层
        交互界面((前端界面)) -->|HTTP请求| API网关
        API网关((API Gateway)) -->|路由/限流/认证| 业务接口
    end

    subgraph 业务逻辑层
        业务接口((业务API)) -->|核心逻辑| 事务管理器
        事务管理器((Transaction Manager)) -->|协调| 服务编排器
        服务编排器((Orchestrator)) -->|调用| 媒体生成服务
        服务编排器 -->|调用| 存储服务
        服务编排器 -->|调用| 用户认证服务
    end

    subgraph 服务层(微服务集群)
        媒体生成服务((Media Gen Service)) -->|生成图片/文档| 第三方AI接口
        存储服务((Storage Service)) -->|文件存储| 对象存储(OSS)
        用户认证服务((Auth Service)) -->|JWT/会话| 权限数据库
    end

    subgraph 数据与资源层
        权限数据库((Users DB))
        事务数据库((Txn DB))
        对象存储((OSS))
        第三方AI接口((OpenAI等))
    end
```


### **二、技术架构图**
```mermaid
graph TD
    前端((Frontend)) -->|HTTP/HTTPS| 负载均衡器
    负载均衡器((LB)) -->|流量分发| API网关(Flask)
    
    subgraph 后端服务(微服务)
        API网关 -->|业务逻辑| 主服务(Media Agent)
        主服务 -->|TCC事务| 事务协调器(TCC Coordinator)
        主服务 -->|媒体生成| 媒体服务(Media Service)
        主服务 -->|存储操作| 存储服务(Storage Service)
        主服务 -->|用户认证| 认证服务(Auth Service)
    end

    subgraph 中间件与工具
        事务协调器 -->|状态存储| SQLite/Redis(事务日志)
        认证服务 -->|令牌管理| JWT/Redis(会话缓存)
        媒体服务 -->|AI能力| OpenAI SDK
        存储服务 -->|文件操作| MinIO/OSS
        主服务 -->|速率限制| 令牌桶算法(Limiter)
    end

    subgraph 数据存储
        SQLite((SQLite)) -->|业务数据| 对话表/交互表
        Redis((Redis)) -->|缓存| 幂等性键/会话数据
        OSS((OSS)) -->|文件存储| 生成的图片/文档
        AuthDB((Auth DB)) -->|用户数据| 用户名/密码哈希
    end

    subgraph 安全与监控
        前端 -->|CSP/XSS防护| 安全头信息
        API网关 -->|认证/授权| JWT校验
        主服务 -->|输入过滤| Bleach/正则表达式
        全链路 -->|监控| 事务状态面板(Transaction Monitor)
    end
```
