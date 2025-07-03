// 确保DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 导航栏选中状态切换
    const navItems = document.querySelectorAll('nav > div');
    // 模态框控制

// 右侧任务详情面板控制
const taskDetailPanel = document.getElementById('task-detail-panel');
const togglePanelBtn = document.getElementById('toggle-panel-btn');
const closePanelBtn = document.getElementById('close-panel-btn');
const panelChevron = togglePanelBtn.querySelector('i');

// 切换面板显示/隐藏
function toggleTaskPanel() {
    if (taskDetailPanel.classList.contains('translate-x-full')) {
        // 显示面板
        taskDetailPanel.classList.remove('translate-x-full');
        panelChevron.classList.remove('fa-chevron-left');
        panelChevron.classList.add('fa-chevron-right');
    } else {
        // 隐藏面板
        taskDetailPanel.classList.add('translate-x-full');
        panelChevron.classList.remove('fa-chevron-right');
        panelChevron.classList.add('fa-chevron-left');
    }
}

togglePanelBtn.addEventListener('click', toggleTaskPanel);
closePanelBtn.addEventListener('click', toggleTaskPanel);

// 任务数据存储
// 清除测试数据
localStorage.removeItem('tasks');
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// 模态框控制
    const addTaskBtn = document.getElementById('add-task-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelTaskBtn = document.getElementById('cancel-task-btn');
    const addTaskModal = document.getElementById('add-task-modal');
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const taskCount = document.getElementById('task-count');
    const emptyState = document.getElementById('empty-state');
    const taskItemTemplate = document.querySelector('.task-item');
    
    // 保存任务到本地存储
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // 渲染任务列表
    function renderTasks() {
        // 过滤出待处理任务
        const pendingTasks = tasks.filter(task => task.status === 'pending');
        taskCount.textContent = pendingTasks.length;

        // 清空现有任务（保留模板）
        const taskItems = taskList.querySelectorAll('.task-item:not(.hidden)');
        taskItems.forEach(item => item.remove());

        // 显示/隐藏空状态
        if (pendingTasks.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        emptyState.classList.add('hidden');

        // 添加任务项
        pendingTasks.forEach(task => {
            const taskItem = taskItemTemplate.cloneNode(true);
            taskItem.classList.remove('hidden');
            taskItem.dataset.id = task.id;

            // 设置任务数据
            taskItem.querySelector('.task-title').textContent = task.title;
            taskItem.querySelector('.task-create-time').textContent = task.createTime;
            taskItem.querySelector('.task-estimated-time').textContent = task.estimatedTime + '分钟';

            // 设置状态下拉框
            const statusSelect = taskItem.querySelector('.task-status-select');
            statusSelect.value = task.status;

            // 状态变更事件
            statusSelect.addEventListener('change', (e) => {
                const taskId = parseInt(e.target.closest('.task-item').dataset.id);
                const newStatus = e.target.value;
                updateTaskStatus(taskId, newStatus);
            });

            taskList.appendChild(taskItem);
        });
    }
    
    // 更新任务状态
    function updateTaskStatus(taskId, newStatus) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = newStatus;
            saveTasks();
            renderTasks();
        }
    }
    
    // 生成单据编码
    function generateTaskCode() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        // 使用时间戳+随机数确保唯一性
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        const uniquePart = (timestamp + random).slice(-4);
        return `IT-${year}${month}${day}${uniquePart}`;
    }
    
    if (addTaskBtn && closeModalBtn && cancelTaskBtn && addTaskModal && taskForm) {
        addTaskBtn.addEventListener('click', function() {
            addTaskModal.classList.remove('hidden');
            // 设置单据编码
            document.getElementById('task-code').value = generateTaskCode();
        });
        
        // 关闭模态框
        function closeModal() {
            addTaskModal.classList.add('hidden');
            taskForm.reset();
        }
        
        closeModalBtn.addEventListener('click', closeModal);
        cancelTaskBtn.addEventListener('click', closeModal);
        
        // 点击模态框外部关闭
        addTaskModal.addEventListener('click', (e) => {
            if (e.target === addTaskModal) {
                closeModal();
            }
        });
        
        // 提交表单
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm()) {
                // 获取表单数据
                const newTask = {
                    id: Date.now(),
                    code: document.getElementById('task-code').value,
                    title: document.getElementById('task-title').value,
                    reporter: document.getElementById('task-reporter').value,
                    category: document.getElementById('task-category').value,
                    priority: document.getElementById('task-priority').value,
                    startTime: document.getElementById('task-date').value,
                    estimatedTime: document.getElementById('task-estimated-time').value,
                    description: document.getElementById('task-description').value,
                    status: 'pending', // 默认状态为待处理
                    createTime: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                };
                
                // 添加到任务列表
                tasks.push(newTask);
                saveTasks();
                renderTasks();
                closeModal();
            }
        });
    }
    
    // 初始渲染任务列表
    renderTasks();

    // 筛选任务
    window.filterTasks = function(status) {
        const filteredTasks = status === 'all' ? tasks : tasks.filter(task => task.status === status);
        renderFilteredTasks(filteredTasks);
    };

    // 按优先级排序
    window.sortTasks = function(type) {
        let sortedTasks = [...tasks];
        if (type === 'priority') {
            const priorityOrder = { '紧急': 3, '高': 2, '中': 1, '低': 0 };
            sortedTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        }
        renderFilteredTasks(sortedTasks);
    };

    // 按分类筛选
    window.filterByCategory = function(category) {
        const filteredTasks = category === 'all' ? tasks : tasks.filter(task => task.category === category);
        renderFilteredTasks(filteredTasks);
    };

    // 查看任务
    window.viewTask = function(taskId) {
        const task = tasks.find(t => t.code === taskId);
        if (task) {
            // 填充查看模态框数据
            document.getElementById('view-task-code').textContent = task.code;
            document.getElementById('view-task-title').textContent = task.title;
            document.getElementById('view-task-category').textContent = task.category;
            document.getElementById('view-task-priority').textContent = task.priority;
            document.getElementById('view-task-status').textContent = task.status === 'pending' ? '待处理' : task.status === 'processing' ? '处理中' : '已解决';
            document.getElementById('view-task-create-time').textContent = task.createTime;
            document.getElementById('view-task-description').textContent = task.description;
            document.getElementById('view-task-modal').classList.remove('hidden');
        }
    };

    // 编辑任务
    window.editTask = function(taskId) {
        const task = tasks.find(t => t.code === taskId);
        if (task) {
            // 填充编辑表单数据
            document.getElementById('edit-task-code').value = task.code;
            document.getElementById('edit-task-title').value = task.title;
            document.getElementById('edit-task-category').value = task.category;
            document.getElementById('edit-task-priority').value = task.priority;
            document.getElementById('edit-task-status').value = task.status;
            document.getElementById('edit-task-date').value = task.startTime;
            document.getElementById('edit-task-description').value = task.description;
            document.getElementById('edit-task-modal').classList.remove('hidden');
        }
    };

    // 渲染筛选后的任务
    function renderFilteredTasks(filteredTasks) {
        const taskItems = taskList.querySelectorAll('.task-item:not(.hidden)');
        taskItems.forEach(item => item.remove());

        if (filteredTasks.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        emptyState.classList.add('hidden');

        filteredTasks.forEach(task => {
            const taskItem = taskItemTemplate.cloneNode(true);
            taskItem.classList.remove('hidden');
            taskItem.dataset.id = task.id;
            taskItem.querySelector('.task-title').textContent = task.title;
            taskItem.querySelector('.task-create-time').textContent = task.createTime;
            taskItem.querySelector('.task-estimated-time').textContent = task.estimatedTime + '分钟';
            taskItem.querySelector('.task-status-select').value = task.status;
            taskItem.querySelector('.task-status-select').addEventListener('change', (e) => {
                updateTaskStatus(parseInt(taskItem.dataset.id), e.target.value);
            });
            taskList.appendChild(taskItem);
        });
    }

    // 初始化日期显示
    updateCurrentDate();
    navItems.forEach(item => {
        const link = item.querySelector('a');
        link.addEventListener('click', function() {
                // 移除所有项的active类
                navItems.forEach(i => i.classList.remove('nav-active'));
                // 给当前点击项的父容器添加active类
                item.classList.add('nav-active');
            });
    });

    // 监听滚动事件，自动激活对应导航项
    function highlightNavigationOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        let scrollPosition = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navItems.forEach(item => {
                    item.classList.remove('nav-active');
                    if (item.querySelector('a').getAttribute('href') === `#${sectionId}`) {
                        item.classList.add('nav-active');
                    }
                });
            }
        });
    }

    // 初始加载时触发一次
    // 初始加载时自动激活对应导航项
    highlightNavigationOnScroll();
    // 滚动时触发
    window.addEventListener('scroll', highlightNavigationOnScroll);

// 更新当前时间
function updateCurrentTime() {
    const now = new Date();
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
}

// 更新当前日期
function updateCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const dateString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = dateString;
    }
    const mainContentDatetimeElement = document.getElementById('main-content-datetime');
    if (mainContentDatetimeElement) {
        mainContentDatetimeElement.textContent = dateString;
    }
}

// 初始化日期和时间
updateCurrentTime();
setInterval(() => {
    updateCurrentTime();
    updateCurrentDate();
}, 1000);

// 表单验证
function validateForm() {
    const title = document.getElementById('task-title');
    const category = document.getElementById('task-category');
    const reporter = document.getElementById('task-reporter');
    const priority = document.getElementById('task-priority');
    const startTime = document.getElementById('task-date');
    const description = document.getElementById('task-description');
    
    let isValid = true;
    
    // 清除之前的错误提示
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    if (!title.value.trim()) {
        showError(title, '问题标题不能为空');
        isValid = false;
    }
    
    if (!category.value.trim()) {
        showError(category, '请选择问题分类');
        isValid = false;
    }
    
    if (!reporter.value.trim()) {
        showError(reporter, '提问人不能为空');
        isValid = false;
    }
    
    if (!priority.value.trim() ) {
        showError(priority, '请选择优先级');
        isValid = false;
    }
    
    if (!startTime.value) {
        showError(startTime, '开始时间不能为空');
        isValid = false;
    }
    
    
    if (!description.value.trim()) {
        showError(description, '问题描述不能为空');
        isValid = false;
    }

// 确保日期显示初始化
updateCurrentDate();
    
    return isValid;
}

// 确保页面加载后更新日期
window.addEventListener('load', updateCurrentDate);
updateCurrentDate();

// 显示错误提示
function showError(element, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-red-500 text-xs mt-1';
    errorDiv.textContent = message;
    element.parentElement.appendChild(errorDiv);
    element.classList.add('border-red-500');
    
    // 移除错误样式的事件监听
    element.addEventListener('input', function() {
        errorDiv.remove();
        element.classList.remove('border-red-500');
    }, { once: true });
}

// 初始化表单提交事件
function initFormSubmit() {
    const form = document.getElementById('task-form');
    const submitBtn = document.querySelector('button[type="submit"]');
    
    if (form && submitBtn) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm()) {
                // 这里可以添加表单提交逻辑
                alert('问题提交成功！');
                document.getElementById('add-task-modal').classList.remove('show');
                form.reset();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initFormSubmit);

    // 初始化隐藏移动端菜单
document.getElementById('mobile-menu-button')?.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
});
});