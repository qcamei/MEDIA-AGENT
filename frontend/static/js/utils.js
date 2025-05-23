/**
 * 工具函数集合
 * 包含常用的辅助方法，如日期格式化、字符串处理、DOM操作等
 */
class Utils {
    /**
     * 格式化日期为本地字符串
     * @param {string|Date} date - 日期对象或ISO日期字符串
     * @returns {string} - 格式化后的日期字符串
     */
    static formatDate(date) {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleString();
    }

    /**
     * 生成唯一ID
     * @param {string} [prefix=''] - ID前缀
     * @returns {string} - 唯一ID
     */
    static generateUniqueId(prefix = '') {
        const random = Math.random().toString(36).substring(2, 10);
        const timestamp = Date.now().toString(36);
        return `${prefix}${timestamp}${random}`;
    }

    /**
     * 安全地获取对象属性，避免因未定义的路径导致错误
     * @param {Object} obj - 目标对象
     * @param {string} path - 属性路径，如 "user.profile.name"
     * @param {any} [defaultValue=null] - 默认值
     * @returns {any} - 属性值或默认值
     */
    static get(obj, path, defaultValue = null) {
        return path.split('.').reduce((o, p) => (o && o[p] !== undefined) ? o[p] : defaultValue, obj);
    }

    /**
     * 防抖函数，限制函数的执行频率
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间（毫秒）
     * @param {boolean} [immediate=false] - 是否立即执行
     * @returns {Function} - 防抖后的函数
     */
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    /**
     * 节流函数，限制函数的执行频率
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 限制时间（毫秒）
     * @returns {Function} - 节流后的函数
     */
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * 复制文本到剪贴板
     * @param {string} text - 要复制的文本
     * @returns {Promise<void>} - 复制成功的Promise
     */
    static copyToClipboard(text) {
        return navigator.clipboard.writeText(text);
    }

    /**
     * 下载文件
     * @param {string} url - 文件URL
     * @param {string} [filename='file'] - 文件名
     */
    static downloadFile(url, filename = 'file') {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 创建并下载JSON文件
     * @param {Object} data - 要转换为JSON的数据
     * @param {string} [filename='data.json'] - 文件名
     */
    static downloadJSON(data, filename = 'data.json') {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        this.downloadFile(url, filename);
        URL.revokeObjectURL(url);
    }

    /**
     * 检查对象是否为空
     * @param {Object} obj - 要检查的对象
     * @returns {boolean} - 对象是否为空
     */
    static isEmptyObject(obj) {
        return Object.keys(obj).length === 0;
    }

    /**
     * 深度合并多个对象
     * @param {...Object} objects - 要合并的对象
     * @returns {Object} - 合并后的对象
     */
    static deepMerge(...objects) {
        const isObject = (obj) => obj && typeof obj === 'object';

        return objects.reduce((prev, obj) => {
            Object.keys(obj).forEach(key => {
                const pVal = prev[key];
                const oVal = obj[key];

                if (Array.isArray(pVal) && Array.isArray(oVal)) {
                    prev[key] = pVal.concat(...oVal);
                } else if (isObject(pVal) && isObject(oVal)) {
                    prev[key] = this.deepMerge(pVal, oVal);
                } else {
                    prev[key] = oVal;
                }
            });

            return prev;
        }, {});
    }

    /**
     * 检查设备是否为移动设备
     * @returns {boolean} - 是否为移动设备
     */
    static isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * 获取URL参数
     * @param {string} [url=window.location.href] - URL
     * @returns {Object} - URL参数对象
     */
    static getURLParams(url = window.location.href) {
        const params = {};
        const queryString = url.split('?')[1];
        if (!queryString) return params;

        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[key] = decodeURIComponent(value || '');
        });

        return params;
    }

    /**
     * 平滑滚动到页面指定位置
     * @param {number|string} target - 目标位置（像素值或元素选择器）
     * @param {number} [duration=500] - 滚动持续时间（毫秒）
     */
    static smoothScrollTo(target, duration = 500) {
        if (typeof target === 'string') {
            const element = document.querySelector(target);
            if (!element) return;
            target = element.offsetTop;
        }

        const start = window.scrollY;
        const startTime = performance.now();

        const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        const scroll = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeProgress = easeInOutQuad(progress);

            window.scrollTo(0, start + (target - start) * easeProgress);

            if (progress < 1) {
                requestAnimationFrame(scroll);
            }
        };

        requestAnimationFrame(scroll);
    }

    /**
     * 创建通知消息
     * @param {string} message - 通知内容
     * @param {string} [type='info'] - 通知类型 ('info', 'success', 'warning', 'error')
     * @param {number} [duration=3000] - 显示持续时间（毫秒）
     */
    static showNotification(message, type = 'info', duration = 3000) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full opacity-0 flex items-center space-x-3 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            type === 'warning' ? 'bg-yellow-500 text-white' : 
            'bg-blue-500 text-white'
        }`;

        // 设置图标
        const icon = type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' :
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
        }, duration);
    }
}

// 导出工具类
export default Utils;