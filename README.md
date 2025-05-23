# MEDIA-AGENT
使用各类大模型和AI工具生成和下载文档，图片，音乐，视频，3D
1. 在首页点击"创建媒体"按钮
2. 选择：
   - 主题
   - 媒体类型
3. 点击"生成媒体"按钮
4. 等待媒体生成完成
5. 下载或预览生成的媒体

项目的运行步骤:

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
   pip install -r requirements.txt.txt
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

2. **启动前端开发服务器** 
   ```bash
   # 如果需要修改前端代码
   npm install
   npm run dev
   # 前端将运行在 http://localhost:3000，自动代理 API 请求到后端

