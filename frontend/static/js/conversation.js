/**
 * 对话管理模块
 * 负责处理对话的创建、选择、历史记录管理和交互功能
 */
class ConversationManager {
    constructor() {
        this.currentConversationId = null;
        this.conversations = [];
        this.loadConversations();
        this.initEventListeners();
        this.render();
    }

    // 从本地存储加载对话
    loadConversations() {
        const savedConversations = localStorage.getItem('conversations');
        if (savedConversations) {
            try {
                this.conversations = JSON.parse(savedConversations);
                // 如果有对话，选择第一个
                if (this.conversations.length > 0 && !this.currentConversationId) {
                    this.selectConversation(this.conversations[0].id);
                }
            } catch (e) {
                console.error('Failed to parse conversations:', e);
                this.conversations = [];
            }
        }
    }

    // 保存对话到本地存储
    saveConversations() {
        localStorage.setItem('conversations', JSON.stringify(this.conversations));
    }

    // 初始化事件监听器
    initEventListeners() {
        // 新对话按钮
        document.getElementById('new-conversation-btn').addEventListener('click', () => this.createNewConversation());
        document.getElementById('create-first-conversation').addEventListener('click', () => this.createNewConversation());

        // 删除选中对话按钮
        document.getElementById('delete-selected-btn').addEventListener('click', () => this.deleteCurrentConversation());

        // 生成媒体按钮
        document.getElementById('generate-media-btn').addEventListener('click', () => this.generateMedia());
    }

    // 创建新对话
    createNewConversation() {
        const newId = `conv_${Date.now()}`;
        const now = new Date();

        const newConversation = {
            id: newId,
            title: `对话 ${this.conversations.length + 1}`,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            interactions: []
        };

        this.conversations.unshift(newConversation);
        this.saveConversations();
        this.selectConversation(newId);
        this.render();

        // 显示对话容器
        document.getElementById('no-conversation-selected').classList.add('hidden');
        document.getElementById('conversation-container').classList.remove('hidden');
    }

    // 选择对话
    selectConversation(conversationId) {
        this.currentConversationId = conversationId;
        this.render();

        // 滚动到对话底部
        setTimeout(() => {
            const historyContainer = document.getElementById('history-container');
            historyContainer.scrollTop = historyContainer.scrollHeight;
        }, 100);
    }

    // 删除当前对话
    deleteCurrentConversation() {
        if (!this.currentConversationId) return;

        if (confirm('确定要删除这个对话吗？此操作不可撤销。')) {
            this.conversations = this.conversations.filter(conv => conv.id !== this.currentConversationId);
            this.saveConversations();

            if (this.conversations.length > 0) {
                this.selectConversation(this.conversations[0].id);
            } else {
                this.currentConversationId = null;
                document.getElementById('conversation-container').classList.add('hidden');
                document.getElementById('no-conversation-selected').classList.remove('hidden');
            }

            this.render();
        }
    }

    // 添加用户交互
    addUserInteraction(prompt) {
        const conversation = this.getActiveConversation();
        if (!conversation) return;

        const now = new Date();
        const interaction = {
            id: `int_${Date.now()}`,
            type: 'user',
            prompt,
            created_at: now.toISOString()
        };

        conversation.interactions.push(interaction);
        conversation.updated_at = now.toISOString();

        // 重新排序对话列表，最近更新的在前面
        this.conversations.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        this.saveConversations();
        this.render();

        // 自动滚动到底部
        setTimeout(() => {
            const historyContainer = document.getElementById('history-container');
            historyContainer.scrollTop = historyContainer.scrollHeight;
        }, 100);

        return interaction;
    }

    // 添加系统响应
    addSystemResponse(userInteractionId, mediaType, content) {
        const conversation = this.getActiveConversation();
        if (!conversation) return;

        // 找到对应的用户交互
        const userInteraction = conversation.interactions.find(int => int.id === userInteractionId);
        if (!userInteraction) return;

        const now = new Date();
        const interaction = {
            id: `int_${Date.now()}`,
            type: 'system',
            userInteractionId,
            mediaType,
            content,
            created_at: now.toISOString()
        };

        conversation.interactions.push(interaction);
        conversation.updated_at = now.toISOString();

        // 重新排序对话列表，最近更新的在前面
        this.conversations.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        this.saveConversations();
        this.render();

        // 自动滚动到底部
        setTimeout(() => {
            const historyContainer = document.getElementById('history-container');
            historyContainer.scrollTop = historyContainer.scrollHeight;
        }, 100);

        return interaction;
    }

    // 生成媒体
    generateMedia() {
        const promptInput = document.getElementById('prompt');
        const prompt = promptInput.value.trim();

        if (!prompt) {
            alert('请输入主题');
            return;
        }

        const mediaTypeSelect = document.getElementById('media-type');
        const mediaType = mediaTypeSelect.value;

        // 添加用户交互
        const userInteraction = this.addUserInteraction(prompt);

        // 清空输入框
        promptInput.value = '';

        // 显示事务监控面板
        this.showTransactionMonitor();

        // 添加事务
        const transactionId = `trans_${Date.now()}`;
        this.addTransaction(transactionId, 'generate', {
            prompt,
            mediaType
        });

        // 更新事务进度
        let progress = 0;
        const updateInterval = setInterval(() => {
            progress += 10;
            if (progress >= 100) {
                clearInterval(updateInterval);
                this.updateTransaction(transactionId, 'confirmed', { progress: 100 });

                // 模拟生成完成，添加系统响应
                setTimeout(() => {
                    let content;
                    if (mediaType === 'image') {
                        content = `example_image_${Date.now()}.jpg`;
                    } else if (mediaType === '3d') {
                        content = `example_model_${Date.now()}.glb`;
                    } else if (mediaType === 'word') {
                        content = `example_document_${Date.now()}.docx`;
                    } else if (mediaType === 'ppt') {
                        content = `example_presentation_${Date.now()}.pptx`;
                    }

                    this.addSystemResponse(userInteraction.id, mediaType, content);

                    // 显示成功通知
                    this.showNotification('媒体生成成功', 'success');
                }, 500);
            } else {
                this.updateTransaction(transactionId, 'pending', { progress });
            }
        }, 300);
    }

    // 添加事务
    addTransaction(id, type, data) {
        const transactions = this.getTransactions();
        transactions.push({
            id,
            type,
            status: 'pending',
            created_at: new Date().toISOString(),
            data
        });
        localStorage.setItem('transactions', JSON.stringify(transactions));
        this.renderTransactions();
    }

    // 更新事务
    updateTransaction(id, status, data) {
        const transactions = this.getTransactions();
        const transactionIndex = transactions.findIndex(t => t.id === id);

        if (transactionIndex !== -1) {
            transactions[transactionIndex] = {
                ...transactions[transactionIndex],
                status,
                data: { ...transactions[transactionIndex].data, ...data }
            };

            localStorage.setItem('transactions', JSON.stringify(transactions));
            this.renderTransactions();
        }
    }

    // 获取事务列表
    getTransactions() {
        const savedTransactions = localStorage.getItem('transactions');
        return savedTransactions ? JSON.parse(savedTransactions) : [];
    }

    // 显示事务监控面板
    showTransactionMonitor() {
        const monitor = document.getElementById('transaction-monitor');
        monitor.classList.remove('hidden');

        // 30秒后自动隐藏
        setTimeout(() => {
            this.hideTransactionMonitor();
        }, 30000);
    }

    // 隐藏事务监控面板
    hideTransactionMonitor() {
        const monitor = document.getElementById('transaction-monitor');
        monitor.classList.add('hidden');
    }

    // 获取当前活跃对话
    getActiveConversation() {
        return this.conversations.find(conv => conv.id === this.currentConversationId);
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full opacity-0 flex items-center space-x-3 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;

        // 设置图标
        const icon = type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    'fa-info-circle';

        notification.innerHTML = `
            <i class="fa ${icon}"></i>
            <span>${message}</span>
        `;

        // 添加到页面
        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.classList.remove('translate-x-full', 'opacity-0');
        }, 10);

        // 自动关闭
        setTimeout(() => {
            notification.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // 渲染对话列表
    renderConversationList() {
        const conversationList = document.getElementById('conversation-list');
        conversationList.innerHTML = '';

        if (this.conversations.length === 0) {
            conversationList.innerHTML = `
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <i class="fa fa-comments-o text-4xl mb-2"></i>
                    <p>暂无对话</p>
                </div>
            `;
            document.getElementById('delete-selected-btn').classList.add('hidden');
            return;
        }

        // 显示删除按钮
        document.getElementById('delete-selected-btn').classList.remove('hidden');

        this.conversations.forEach(conv => {
            const isActive = conv.id === this.currentConversationId;
            const item = document.createElement('div');
            item.className = `conversation-item p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer border-l-4 ${
                isActive ? 'border-primary' : 'border-transparent'
            } hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 flex items-center justify-between`;

            item.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <i class="fa fa-comments-o"></i>
                    </div>
                    <div class="flex-grow">
                        <h4 class="font-medium truncate">${conv.title}</h4>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ${new Date(conv.updated_at).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div class="flex items-center space-x-1">
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                        ${conv.interactions.length}
                    </span>
                    <i class="fa fa-chevron-right text-xs text-gray-400 dark:text-gray-500"></i>
                </div>
            `;

            item.addEventListener('click', () => this.selectConversation(conv.id));
            conversationList.appendChild(item);
        });
    }

    // 渲染交互历史
    renderInteractionHistory() {
        const historyContainer = document.getElementById('history-container');
        historyContainer.innerHTML = '';

        const conversation = this.getActiveConversation();
        if (!conversation || conversation.interactions.length === 0) {
            historyContainer.innerHTML = `
                <div class="text-center py-12 text-gray-500 dark:text-gray-400">
                    <i class="fa fa-history text-4xl mb-2"></i>
                    <p>暂无交互历史</p>
                </div>
            `;
            document.getElementById('upload-to-github-btn').classList.add('hidden');
            return;
        }

        // 显示上传按钮
        document.getElementById('upload-to-github-btn').classList.remove('hidden');

        conversation.interactions.forEach(interaction => {
            if (interaction.type === 'user') {
                // 用户消息
                const userMsg = document.createElement('div');
                userMsg.className = 'user-interaction mb-6 flex items-start';
                userMsg.innerHTML = `
                    <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 mr-3 flex-shrink-0">
                        <i class="fa fa-user"></i>
                    </div>
                    <div class="bg-gray-100 dark:bg-slate-700 rounded-lg p-4 max-w-[90%]">
                        <p class="text-gray-800 dark:text-gray-200">${interaction.prompt}</p>
                        <div class="flex justify-between items-center mt-2">
                            <span class="text-xs text-gray-500 dark:text-gray-400">
                                ${new Date(interaction.created_at).toLocaleString()}
                            </span>
                            <div class="flex space-x-2">
                                <button class="text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors" title="复制" onclick="copyToClipboard('${interaction.prompt}')">
                                    <i class="fa fa-copy"></i>
                                </button>
                                <button class="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="删除" onclick="deleteInteraction('${interaction.id}')">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                historyContainer.appendChild(userMsg);
            } else if (interaction.type === 'system') {
                // 系统消息
                const sysMsg = document.createElement('div');
                sysMsg.className = 'system-interaction mb-6 flex items-start';

                let contentHtml = '';
                if (interaction.mediaType === 'image') {
                    contentHtml = `
                        <div class="relative">
                            <img src="https://picsum.photos/800/450?random=${Math.random()}" alt="生成的图片" class="rounded-lg max-w-full h-auto">
                            <div class="absolute top-2 right-2 flex space-x-2">
                                <button class="p-1.5 bg-white/80 dark:bg-slate-700/80 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-600 transition-colors" title="下载">
                                    <i class="fa fa-download"></i>
                                </button>
                                <button class="p-1.5 bg-white/80 dark:bg-slate-700/80 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-600 transition-colors" title="分享">
                                    <i class="fa fa-share-alt"></i>
                                </button>
                            </div>
                        </div>
                    `;
                } else if (interaction.mediaType === '3d') {
                    contentHtml = `
                        <div class="bg-gray-100 dark:bg-slate-700 rounded-lg p-6 text-center">
                            <i class="fa fa-cube text-4xl text-gray-400 dark:text-gray-500 mb-2"></i>
                            <p class="text-gray-600 dark:text-gray-400">3D 模型预览</p>
                            <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">点击下载查看完整模型</p>
                            <button class="mt-3 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow transition-all duration-300" onclick="downloadFile('${interaction.content}')">
                                <i class="fa fa-download mr-2"></i>下载模型
                            </button>
                        </div>
                    `;
                } else if (interaction.mediaType === 'word') {
                    contentHtml = `
                        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center">
                            <i class="fa fa-file-word-o text-3xl text-blue-600 dark:text-blue-400 mr-4"></i>
                            <div>
                                <h4 class="font-medium text-gray-800 dark:text-gray-200">Word 文档</h4>
                                <p class="text-sm text-gray-600 dark:text-gray-400">点击下载查看完整文档</p>
                                <button class="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition-all duration-300" onclick="downloadFile('${interaction.content}')">
                                    <i class="fa fa-download mr-1"></i>下载文档
                                </button>
                            </div>
                        </div>
                    `;
                } else if (interaction.mediaType === 'ppt') {
                    contentHtml = `
                        <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 flex items-center">
                            <i class="fa fa-file-powerpoint-o text-3xl text-red-600 dark:text-red-400 mr-4"></i>
                            <div>
                                <h4 class="font-medium text-gray-800 dark:text-gray-200">PPT 演示文稿</h4>
                                <p class="text-sm text-gray-600 dark:text-gray-400">点击下载查看完整演示文稿</p>
                                <button class="mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow transition-all duration-300" onclick="downloadFile('${interaction.content}')">
                                    <i class="fa fa-download mr-1"></i>下载演示文稿
                                </button>
                            </div>
                        </div>
                    `;
                }

                sysMsg.innerHTML = `
                    <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3 flex-shrink-0">
                        <i class="fa fa-robot"></i>
                    </div>
                    <div class="bg-white dark:bg-slate-800 rounded-lg p-4 max-w-[90%] shadow-sm">
                        ${contentHtml}
                        <div class="flex justify-between items-center mt-3">
                            <span class="text-xs text-gray-500 dark:text-gray-400">
                                ${new Date(interaction.created_at).toLocaleString()}
                            </span>
                            <div class="flex space-x-2">
                                <button class="text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors" title="复制">
                                    <i class="fa fa-copy"></i>
                                </button>
                                <button class="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" title="删除">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                historyContainer.appendChild(sysMsg);
            }
        });
    }

    // 渲染事务列表
    renderTransactions() {
        const container = document.getElementById('transaction-status-container');
        container.innerHTML = '';

        const transactions = this.getTransactions();
        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400 py-2">
                    <p>暂无活动事务</p>
                </div>
            `;
            return;
        }

        // 只显示最近的5个事务
        const recentTransactions = transactions.slice(-5).reverse();

        recentTransactions.forEach(transaction => {
            const item = document.createElement('div');
            item.className = 'transaction-item p-3 border-b border-gray-100 dark:border-gray-700 last:border-0';

            let statusIcon, statusClass;
            if (transaction.status === 'pending') {
                statusIcon = '<i class="fa fa-spinner fa-spin text-xs"></i>';
                statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
            } else if (transaction.status === 'confirmed') {
                statusIcon = '<i class="fa fa-check text-xs"></i>';
                statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
            } else {
                statusIcon = '<i class="fa fa-times text-xs"></i>';
                statusClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
            }

            let transactionType;
            if (transaction.type === 'generate') {
                transactionType = '媒体生成';
            } else if (transaction.type === 'upload') {
                transactionType = 'GitHub 上传';
            } else {
                transactionType = transaction.type;
            }

            let progressBar = '';
            if (transaction.status === 'pending' && transaction.data.progress !== undefined) {
                progressBar = `
                    <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div class="bg-primary h-1.5 rounded-full" style="width: ${transaction.data.progress}%"></div>
                    </div>
                `;
            }

            item.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex items-center space-x-2">
                        <div class="w-6 h-6 rounded-full flex items-center justify-center ${statusClass}">
                            ${statusIcon}
                        </div>
                        <h4 class="font-medium text-sm text-gray-800 dark:text-gray-200">
                            ${transactionType}
                        </h4>
                    </div>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                        ${new Date(transaction.created_at).toLocaleTimeString()}
                    </span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate max-w-[180px]">
                    ${transaction.data.prompt || transaction.data.file_path || '未知操作'}
                </p>
                ${progressBar}
            `;

            container.appendChild(item);
        });
    }

    // 上传到GitHub
    uploadToGitHub() {
        const conversation = this.getActiveConversation();
        if (!conversation || conversation.interactions.length === 0) {
            this.showNotification('没有可上传的内容', 'warning');
            return;
        }

        // 显示事务监控面板
        this.showTransactionMonitor();

        // 添加事务
        const transactionId = `trans_${Date.now()}`;
        this.addTransaction(transactionId, 'upload', {
            file_path: `${conversation.title.replace(/\s+/g, '_')}.zip`
        });

        // 更新事务进度
        let progress = 0;
        const updateInterval = setInterval(() => {
            progress += 10;
            if (progress >= 100) {
                clearInterval(updateInterval);
                this.updateTransaction(transactionId, 'confirmed', { progress: 100 });

                // 显示成功通知
                this.showNotification('已成功上传到 GitHub', 'success');
            } else {
                this.updateTransaction(transactionId, 'pending', { progress });
            }
        }, 200);
    }

    // 渲染所有UI组件
    render() {
        this.renderConversationList();
        this.renderInteractionHistory();
        this.renderTransactions();
    }
}

// 全局函数 - 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('已复制到剪贴板', 'success');
    }).catch(err => {
        showNotification('复制失败', 'error');
        console.error('复制失败:', err);
    });
}

// 全局函数 - 删除交互
function deleteInteraction(interactionId) {
    if (confirm('确定要删除此交互吗？')) {
        const conversationManager = window.conversationManager;
        const conversation = conversationManager.getActiveConversation();

        if (conversation) {
            conversation.interactions = conversation.interactions.filter(int => int.id !== interactionId);
            conversationManager.saveConversations();
            conversationManager.renderInteractionHistory();
        }
    }
}

// 全局函数 - 下载文件
function downloadFile(fileName) {
    // 模拟下载
    showNotification(`正在下载 ${fileName}`, 'info');

    // 创建一个临时的a标签用于下载
    const link = document.createElement('a');
    link.href = `https://picsum.photos/800/450?random=${Math.random()}`; // 使用随机图片作为示例
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 初始化对话管理器
window.addEventListener('DOMContentLoaded', () => {
    window.conversationManager = new ConversationManager();
});