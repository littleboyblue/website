class SpeedTester {
    constructor() {
        this.downloadSpeed = 0;
        this.uploadSpeed = 0;
        this.history = this.loadHistory();
        this.chart = null;
        
        this.initElements();
        this.initEventListeners();
        this.updateTable();
        this.initChart();
    }

    initElements() {
        this.downloadSpeedEl = document.getElementById('download-speed');
        this.uploadSpeedEl = document.getElementById('upload-speed');
        this.downloadBtn = document.getElementById('download-test-btn');
        this.uploadBtn = document.getElementById('upload-test-btn');
        this.historyBody = document.getElementById('history-body');
        this.clearBtn = document.getElementById('clear-history');
    }

    initEventListeners() {
        this.downloadBtn.addEventListener('click', () => this.testDownload());
        this.uploadBtn.addEventListener('click', () => this.testUpload());
        this.clearBtn.addEventListener('click', () => this.clearHistory());
    }

    // 下载速度测试
    async testDownload() {
        this.downloadBtn.disabled = true;
        this.downloadBtn.textContent = '测试中...';
        
        const testUrl = 'https://httpbin.org/image/jpeg?cb=' + Date.now();
        const fileSize = 100000; // ~100KB 测试文件
        const iterations = 5; // 多次测试取平均
        let totalSpeed = 0;
        let successfulTests = 0;

        for (let i = 0; i < iterations; i++) {
            try {
                const startTime = performance.now();
                const response = await fetch(testUrl + '&size=' + fileSize + '&i=' + i);
                const blob = await response.blob();
                const endTime = performance.now();
                
                const duration = (endTime - startTime) / 1000; // 秒
                const bitsLoaded = blob.size * 8;
                const speedBps = bitsLoaded / duration;
                const speedMbps = speedBps / (1024 * 1024);
                
                totalSpeed += speedMbps;
                successfulTests++;
                
                // 更新显示当前速度
                const currentAvg = totalSpeed / successfulTests;
                this.downloadSpeed = currentAvg;
                this.downloadSpeedEl.textContent = currentAvg.toFixed(2);
            } catch (error) {
                console.error('Download test error:', error);
            }
        }

        if (successfulTests > 0) {
            this.downloadSpeed = totalSpeed / successfulTests;
            this.downloadSpeedEl.textContent = this.downloadSpeed.toFixed(2);
        }

        this.downloadBtn.disabled = false;
        this.downloadBtn.textContent = '开始下载测试';
        
        this.saveResult();
        this.updateChart();
    }

    // 上传速度测试
    async testUpload() {
        this.uploadBtn.disabled = true;
        this.uploadBtn.textContent = '测试中...';

        const iterations = 5;
        let totalSpeed = 0;
        let successfulTests = 0;

        // 创建测试数据 (约 100KB)
        const testData = new Blob([new Uint8Array(100000)]);

        for (let i = 0; i < iterations; i++) {
            try {
                const startTime = performance.now();
                
                const formData = new FormData();
                formData.append('file', testData, 'test.bin');

                const response = await fetch('https://httpbin.org/post', {
                    method: 'POST',
                    body: formData
                });

                await response.json();
                const endTime = performance.now();

                const duration = (endTime - startTime) / 1000;
                const bitsLoaded = testData.size * 8;
                const speedBps = bitsLoaded / duration;
                const speedMbps = speedBps / (1024 * 1024);

                totalSpeed += speedMbps;
                successfulTests++;

                const currentAvg = totalSpeed / successfulTests;
                this.uploadSpeed = currentAvg;
                this.uploadSpeedEl.textContent = currentAvg.toFixed(2);
            } catch (error) {
                console.error('Upload test error:', error);
            }
        }

        if (successfulTests > 0) {
            this.uploadSpeed = totalSpeed / successfulTests;
            this.uploadSpeedEl.textContent = this.uploadSpeed.toFixed(2);
        }

        this.uploadBtn.disabled = false;
        this.uploadBtn.textContent = '开始上传测试';

        this.saveResult();
        this.updateChart();
    }

    // 加载历史数据
    loadHistory() {
        const stored = localStorage.getItem('speedTestHistory');
        return stored ? JSON.parse(stored) : [];
    }

    // 保存结果
    saveResult() {
        const result = {
            timestamp: new Date().toLocaleString(),
            download: parseFloat(this.downloadSpeed.toFixed(2)),
            upload: parseFloat(this.uploadSpeed.toFixed(2))
        };

        this.history.unshift(result);
        
        // 只保留最近 20 条记录
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }

        localStorage.setItem('speedTestHistory', JSON.stringify(this.history));
        this.updateTable();
    }

    // 清空历史
    clearHistory() {
        if (confirm('确定要清空所有历史记录吗？')) {
            this.history = [];
            localStorage.removeItem('speedTestHistory');
            this.updateTable();
            this.updateChart();
        }
    }

    // 更新表格
    updateTable() {
        this.historyBody.innerHTML = '';
        
        this.history.slice(0, 10).forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.timestamp}</td>
                <td>${item.download.toFixed(2)}</td>
                <td>${item.upload.toFixed(2)}</td>
            `;
            this.historyBody.appendChild(row);
        });
    }

    // 初始化图表
    initChart() {
        const ctx = document.getElementById('speed-chart').getContext('2d');
        
        const labels = this.history.map(item => item.timestamp).reverse();
        const downloadData = this.history.map(item => item.download).reverse();
        const uploadData = this.history.map(item => item.upload).reverse();

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '下载速度 (Mbps)',
                        data: downloadData,
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: '上传速度 (Mbps)',
                        data: uploadData,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '速度 (Mbps)'
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    // 更新图表
    updateChart() {
        if (this.chart) {
            this.chart.data.labels = this.history.map(item => item.timestamp).reverse();
            this.chart.data.datasets[0].data = this.history.map(item => item.download).reverse();
            this.chart.data.datasets[1].data = this.history.map(item => item.upload).reverse();
            this.chart.update();
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new SpeedTester();
});