# MEDIA-AGENT
使用各类大模型和AI工具生成和下载文档，图片，音乐，视频，3D
1. 在首页点击"创建媒体"按钮
2. 选择：
   - 主题
   - 媒体类型
3. 点击"生成媒体"按钮
4. 等待媒体生成完成（您可以实时查看进度）
5. 下载或预览生成的媒体

项目的运行，包括环境配置、依赖安装、服务启动及测试验证：

### **一、环境准备**
1. **安装 Python 3.9+**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install python3.9 python3.9-venv

   # macOS (使用 Homebrew)
   brew install python@3.9
   ```

2. **安装 Node.js 和 npm** (用于前端构建)
   ```bash
   # 使用 nvm (Node Version Manager)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
   nvm install node
   ```

3. **获取 GitHub Token**
   - 登录 GitHub，进入 [Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - 点击 **Generate new token**，选择 `repo` 权限
   - 保存生成的 Token (格式类似 `ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)


### **二、项目配置**
1. **克隆代码仓库**
   ```bash
   git clone https://github.com/your-repo/media-agent.git
   cd media-agent
   ```

2. **创建虚拟环境**
   ```bash
   python3.9 -m venv venv
   source venv/bin/activate  # Linux/macOS
   .\venv\Scripts\activate   # Windows
   ```

3. **安装 Python 依赖**
   ```bash
   pip install -r requirements.txt
   ```

4. **配置环境变量**
   ```bash
   # Linux/macOS
   export FLASK_APP=app.py
   export FLASK_DEBUG=True
   export SECRET_KEY=your-secret-key-here
   export OPENAI_API_KEY=your-openai-api-key
   export GITHUB_REPO_OWNER=your-github-username
   export GITHUB_REPO_NAME=your-github-repo
   export GITHUB_BRANCH=main
   export GITHUB_TOKEN=your-github-token

   # Windows (PowerShell)
   $env:FLASK_APP = "app.py"
   $env:FLASK_DEBUG = "True"
   $env:SECRET_KEY = "your-secret-key-here"
   $env:OPENAI_API_KEY = "your-openai-api-key"
   $env:GITHUB_REPO_OWNER = "your-github-username"
   $env:GITHUB_REPO_NAME = "your-github-repo"
   $env:GITHUB_BRANCH = "main"
   $env:GITHUB_TOKEN = "your-github-token"
   ```

5. **初始化数据库**
   ```bash
   flask db init
   flask db migrate
   flask db upgrade
   ```


### **三、启动服务**
1. **启动 Flask 后端**
   ```bash
   flask run
   # 服务将运行在 http://localhost:5000
   ```

2. **启动前端开发服务器** (可选)
   ```bash
   # 如果需要修改前端代码
   cd frontend
   npm install
   npm run dev
   # 前端将运行在 http://localhost:3000，自动代理 API 请求到后端
   ```


### **四、测试与验证**
1. **访问应用**
   - 打开浏览器，访问 `http://localhost:5000`
   - 注册新用户或使用默认账户登录

2. **生成媒体内容**
   - 创建新对话
   - 输入提示词 (如 "一只可爱的小猫")
   - 选择媒体类型 (如图像)
   - 点击 **生成媒体** 按钮

3. **验证分布式事务**
   - 查看右下角的 **事务状态** 面板
   - 确认事务状态从 "处理中" 变为 "已确认"
   - 检查数据库中的事务记录：
     ```bash
     sqlite3 media_agent.db
     SELECT * FROM distributed_transactions;
     ```

4. **上传到 GitHub**
   - 生成媒体文件后，点击 **上传到 GitHub** 按钮
   - 检查 GitHub 仓库，确认文件已成功上传
   - 点击历史记录中的 GitHub 链接，验证文件可访问


### **五、常见问题解决**
1. **依赖安装失败**
   ```bash
   # 更新 pip
   pip install --upgrade pip

   # 手动安装缺失的包
   pip install flask openai bleach python-dotenv
   ```

2. **GitHub 上传失败**
   - 检查 GitHub Token 是否有效且有 `repo` 权限
   - 确认仓库存在且名称拼写正确
   - 查看服务器日志获取详细错误信息

3. **前端显示异常**
   ```bash
   # 清除浏览器缓存
   # 重新构建前端
   cd frontend
   npm run build
   ```


### **六、生产环境部署建议**
1. **使用生产级 Web 服务器**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:8000 app:app
   ```

2. **配置 Nginx 反向代理**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **启用 HTTPS**
   ```bash
   # 使用 Certbot 获取免费 SSL 证书
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

4. **使用环境变量文件**
   ```bash
   # 创建 .env 文件
   cp .env.example .env
   # 编辑 .env 文件，添加所有环境变量
   nano .env
   ```


### **七、服务监控与日志**
1. **查看应用日志**
   ```bash
   tail -f logs/application.log
   ```

2. **监控事务状态**
   ```bash
   # 使用 Redis CLI 查看事务缓存
   redis-cli KEYS "transaction:*"
   ```

3. **配置日志级别**
   ```python
   # 在 app.py 中设置日志级别
   import logging
   app.logger.setLevel(logging.INFO)
   ```


通过以上步骤，你可以完整地部署和运行媒体生成助手，并验证分布式事务和 GitHub 集成功能。如果遇到任何问题，请参考错误日志或社区支持文档进行排查。
