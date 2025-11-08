// GitHub API 配置
const GITHUB_CONFIG = {
    username: 'so-far-away0408',
    repository: 'signin_system',
    token: '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'
};

// API 基础URL
const API_BASE = `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/contents`;

// 请求头
const API_HEADERS = {
    'Authorization': `token ${GITHUB_CONFIG.token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
};

// 系统路径配置
const PATHS = {
    CLASSES: 'classes',
    ATTENDANCE: 'attendance',
    TEACHERS: 'teachers',
    DEVICES: 'devices',
    CONFIG: 'config'
};