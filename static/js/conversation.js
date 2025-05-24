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
    render() {
        const conversationList = document.getElementById('conversation-list');
        conversationList.innerHTML = '';

        this.conversations.forEach(conversation => {
            const conversationItem = document.createElement('div');
            conversationItem.className = 'conversation-item p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer border-l-4 border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 flex items-center justify-between';
            conversationItem.dataset.conversationId = conversation.id;

            conversationItem.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <i class="fa fa-comments-o"></i>
                    </div>
                    <div class="flex-grow">
                        <h4 class="font-medium truncate">${conversation.title}</h4>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ${new Date(conversation.updated_at).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div class="flex items-center space-x-1">
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                        ${conversation.interactions.length}
                    </span>
                    <i class="fa fa-chevron-right text-xs text-gray-400 dark:text-gray-500"></i>
                </div>
            `;

            conversationItem.addEventListener('click', () => this.selectConversation(conversation.id));
            conversationList.appendChild(conversationItem);
        });

        // 渲染对话历史记录
        const historyContainer = document.getElementById('history-container');
        historyContainer.innerHTML = '';

        const activeConversation = this.getActiveConversation();
        if (activeConversation) {
            activeConversation.interactions.forEach(interaction => {
                const interactionElement = document.createElement('div');
                interactionElement.className = `mb-4 ${interaction.type === 'user' ? 'text-right' : 'text-left'}`;

                if (interaction.type === 'user') {
                    interactionElement.innerHTML = `
                        <div class="bg-gray-100 dark:bg-slate-700 rounded-lg p-4 inline-block">
                            <p class="text-sm text-gray-600 dark:text-gray-400">${interaction.prompt}</p>
                        </div>
                    `;
                } else {
                    let mediaContent = '';
                    if (interaction.mediaType === 'image') {
                        mediaContent = `
                            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex items-center">
                                <i class="fa fa-image text-3xl text-green-600 dark:text-green-400 mr-4"></i>
                                <div>
                                    <h4 class="font-medium text-gray-800 dark:text-gray-200">图片</h4>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">点击下载查看图片</p>
                                    <button class="mt-3 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow transition-all duration-300">
                                        <i class="fa fa-download mr-2"></i>下载图片
                                    </button>
                                </div>
                            </div>
                        `;
                    } else if (interaction.mediaType === '3d') {
                        mediaContent = `
                            <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 flex items-center">
                                <i class="fa fa-cube text-3xl text-yellow-600 dark:text-yellow-400 mr-4"></i>
                                <div>
                                    <h4 class="font-medium text-gray-800 dark:text-gray-200">3D 模型</h4>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">点击下载查看模型</p>
                                    <button class="mt-3 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow transition-all duration-300">
                                        <i class="fa fa-download mr-2"></i>下载模型
                                    </button>
                                </div>
                            </div>
                        `;
                    } else if (interaction.mediaType === 'word') {
                        mediaContent = `
                            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-center">
                                <i class="fa fa-file-word-o text-3xl text-blue-600 dark:text-blue-400 mr-4"></i>
                                <div>
                                    <h4 class="font-medium text-gray-800 dark:text-gray-200">Word 文档</h4>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">点击下载查看完整文档</p>
                                    <button class="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition-all duration-300">
                                        <i class="fa fa-download mr-1"></i>下载文档
                                    </button>
                                </div>
                            </div>
                        `;
                    } else if (interaction.mediaType === 'ppt') {
                        mediaContent = `
                            <div class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 flex items-center">
                                <i class="fa fa-file-powerpoint-o text-3xl text-red-600 dark:text-red-400 mr-4"></i>
                                <div>
                                    <h4 class="font-medium text-gray-800 dark:text-gray-200">PPT 演示文稿</h4>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">点击下载查看演示文稿</p>
                                    <button class="mt-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow transition-all duration-300">
                                        <i class="fa fa-download mr-1"></i>下载演示文稿
                                    </button>
                                </div>
                            </div>
                        `;
                    }

                    interactionElement.innerHTML = mediaContent;
                }

                historyContainer.appendChild(interactionElement);
            });
        }
    }

    // 渲染事务列表
    renderTransactions() {
        const transactionContainer = document.getElementById('transaction-status-container');
        transactionContainer.innerHTML = '';

        const transactions = this.getTransactions();
        transactions.forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item';

            const statusText = document.createElement('span');
            statusText.className = `transaction-status ${transaction.status}`;
            statusText.textContent = transaction.status;

            const progressBar = document.createElement('div');
            progressBar.className = 'transaction-progress';

            const progressBarInner = document.createElement('div');
            progressBarInner.className = 'transaction-progress-bar';
            progressBarInner.style.width = `${transaction.data.progress || 0}%`;

            progressBar.appendChild(progressBarInner);

            transactionItem.appendChild(statusText);
            transactionItem.appendChild(progressBar);

            transactionContainer.appendChild(transactionItem);
        });
    }
}

// 初始化对话管理
const conversationManager = new ConversationManager();