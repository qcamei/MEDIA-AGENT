/**
 * 事务管理模块
 * 负责处理应用中的各种事务（如媒体生成、文件上传等）的状态跟踪和进度监控
 */
class TransactionManager {
    constructor() {
        this.transactions = [];
        this.loadTransactions();
        this.render();
    }

    // 从本地存储加载事务
    loadTransactions() {
        const savedTransactions = localStorage.getItem('transactions');
        if (savedTransactions) {
            try {
                this.transactions = JSON.parse(savedTransactions);
            } catch (e) {
                console.error('Failed to parse transactions:', e);
                this.transactions = [];
            }
        }
    }

    // 保存事务到本地存储
    saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    // 添加新事务
    addTransaction(type, data) {
        const transaction = {
            id: `trans_${Date.now()}`,
            type,
            status: 'pending',
            progress: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            data
        };

        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.render();

        return transaction;
    }

    // 更新事务状态
    updateTransaction(id, status, progress = null, data = {}) {
        const transactionIndex = this.transactions.findIndex(t => t.id === id);

        if (transactionIndex !== -1) {
            this.transactions[transactionIndex] = {
                ...this.transactions[transactionIndex],
                status,
                progress: progress !== null ? progress : this.transactions[transactionIndex].progress,
                data: { ...this.transactions[transactionIndex].data, ...data },
                updated_at: new Date().toISOString()
            };

            this.saveTransactions();
            this.render();
        }
    }

    // 获取事务
    getTransaction(id) {
        return this.transactions.find(t => t.id === id);
    }

    // 获取所有事务
    getAllTransactions() {
        return this.transactions;
    }

    // 获取最近的事务
    getRecentTransactions(limit = 5) {
        return this.transactions.slice(0, limit);
    }

    // 删除事务
    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveTransactions();
        this.render();
    }

    // 清除所有已完成的事务
    clearCompletedTransactions() {
        this.transactions = this.transactions.filter(t => t.status === 'pending');
        this.saveTransactions();
        this.render();
    }

    // 渲染事务列表
    render() {
        const container = document.getElementById('transaction-status-container');
        if (!container) return;

        const transactions = this.getRecentTransactions();

        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400 py-2">
                    <p>暂无活动事务</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        transactions.forEach(transaction => {
            const item = document.createElement('div');
            item.className = 'transaction-item p-3 border-b border-gray-100 dark:border-gray-700 last:border-0';

            let statusIcon, statusClass;
            if (transaction.status === 'pending') {
                statusIcon = '<i class="fa fa-spinner fa-spin text-xs"></i>';
                statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
            } else if (transaction.status === 'success') {
                statusIcon = '<i class="fa fa-check text-xs"></i>';
                statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
            } else if (transaction.status === 'error') {
                statusIcon = '<i class="fa fa-times text-xs"></i>';
                statusClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
            } else {
                statusIcon = '<i class="fa fa-clock-o text-xs"></i>';
                statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            }

            let transactionType;
            switch (transaction.type) {
                case 'generate':
                    transactionType = '媒体生成';
                    break;
                case 'upload':
                    transactionType = '文件上传';
                    break;
                case 'download':
                    transactionType = '文件下载';
                    break;
                case 'sync':
                    transactionType = '数据同步';
                    break;
                default:
                    transactionType = transaction.type;
            }

            let progressBar = '';
            if (transaction.status === 'pending' && transaction.progress !== undefined) {
                progressBar = `
                    <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div class="bg-primary h-1.5 rounded-full" style="width: ${transaction.progress}%"></div>
                    </div>
                `;
            }

            let transactionDetails = '';
            if (transaction.data.prompt) {
                transactionDetails = `<p class="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate max-w-[180px]">${transaction.data.prompt}</p>`;
            } else if (transaction.data.file_path) {
                transactionDetails = `<p class="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate max-w-[180px]">${transaction.data.file_path}</p>`;
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
                        ${new Date(transaction.updated_at).toLocaleTimeString()}
                    </span>
                </div>
                ${transactionDetails}
                ${progressBar}
            `;

            container.appendChild(item);
        });
    }

    // 显示事务监控面板
    showMonitor() {
        const monitor = document.getElementById('transaction-monitor');
        if (monitor) {
            monitor.classList.remove('hidden');
        }
    }

    // 隐藏事务监控面板
    hideMonitor() {
        const monitor = document.getElementById('transaction-monitor');
        if (monitor) {
            monitor.classList.add('hidden');
        }
    }
}

// 导出事务管理器
export default TransactionManager;