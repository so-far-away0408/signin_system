class GitHubAPI {
    constructor() {
        this.config = GITHUB_CONFIG;
        this.headers = API_HEADERS;
        this.baseUrl = API_BASE;
    }

    // 通用API请求方法
    async apiRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: this.headers,
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // 读取文件
    async readFile(path) {
        const url = `${this.baseUrl}/${path}`;
        const data = await this.apiRequest(url);
        
        if (data.content) {
            return JSON.parse(atob(data.content));
        }
        return null;
    }

    // 创建或更新文件
    async writeFile(path, content, message = 'Update file') {
        const url = `${this.baseUrl}/${path}`;
        
        // 先检查文件是否存在，获取sha
        let sha = null;
        try {
            const existing = await this.apiRequest(url);
            sha = existing.sha;
        } catch (error) {
            // 文件不存在，正常创建
        }

        const body = {
            message: message,
            content: btoa(JSON.stringify(content, null, 2)),
            ...(sha && { sha: sha })
        };

        return await this.apiRequest(url, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    // 获取班级列表
    async getClasses() {
        try {
            const files = await this.apiRequest(`${this.baseUrl}/${PATHS.CLASSES}`);
            return files.filter(file => file.name.endsWith('.json'))
                       .map(file => file.name.replace('.json', ''));
        } catch (error) {
            return [];
        }
    }

    // 读取班级学生名单
    async getClassStudents(className) {
        return await this.readFile(`${PATHS.CLASSES}/${className}.json`);
    }

    // 保存班级学生名单
    async saveClassStudents(className, students) {
        return await this.writeFile(
            `${PATHS.CLASSES}/${className}.json`, 
            students, 
            `Update ${className} student list`
        );
    }

    // 获取今日考勤目录
    getTodayPath() {
        const today = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');
        return `${PATHS.ATTENDANCE}/${today}`;
    }

    // 获取班级特殊指令
    async getClassInstruction(className) {
        const todayPath = this.getTodayPath();
        try {
            return await this.readFile(`${todayPath}/${className}_instruction.json`);
        } catch (error) {
            return null;
        }
    }

    // 设置班级特殊指令
    async setClassInstruction(className, instruction) {
        const todayPath = this.getTodayPath();
        const instructionData = {
            instruction: instruction,
            timestamp: new Date().toISOString(),
            expires: Date.now() + 20 * 60 * 1000 // 20分钟过期
        };
        
        return await this.writeFile(
            `${todayPath}/${className}_instruction.json`,
            instructionData,
            `Set instruction for ${className}`
        );
    }

    // 获取考勤记录
    async getAttendanceRecords(className) {
        const todayPath = this.getTodayPath();
        try {
            return await this.readFile(`${todayPath}/${className}_records.json`) || [];
        } catch (error) {
            return [];
        }
    }

    // 保存考勤记录
    async saveAttendanceRecord(className, record) {
        const todayPath = this.getTodayPath();
        const records = await this.getAttendanceRecords(className);
        records.push(record);
        
        return await this.writeFile(
            `${todayPath}/${className}_records.json`,
            records,
            `Add attendance record for ${className}`
        );
    }

    // 获取班级锁状态
    async getClassLock(className) {
        const todayPath = this.getTodayPath();
        try {
            return await this.readFile(`${todayPath}/${className}_lock.json`);
        } catch (error) {
            return null;
        }
    }

    // 设置班级锁
    async setClassLock(className, teacherInfo) {
        const todayPath = this.getTodayPath();
        const lockData = {
            teacher: teacherInfo,
            timestamp: new Date().toISOString(),
            expires: Date.now() + 20 * 60 * 1000 // 20分钟自动解锁
        };
        
        return await this.writeFile(
            `${todayPath}/${className}_lock.json`,
            lockData,
            `Set lock for ${className}`
        );
    }

    // 释放班级锁
    async releaseClassLock(className) {
        const todayPath = this.getTodayPath();
        try {
            await this.writeFile(
                `${todayPath}/${className}_lock.json`,
                { locked: false },
                `Release lock for ${className}`
            );
        } catch (error) {
            console.error('Failed to release lock:', error);
        }
    }
}