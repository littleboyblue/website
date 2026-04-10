// 工具集合 - JavaScript逻辑

// 工具切换
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// 显示Toast消息
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// 复制文本到剪贴板
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('复制成功！');
    } catch (err) {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('复制成功！');
    }
}

// ========== 1. 时间戳转换 ==========
const timestampInput = document.getElementById('timestamp-input');
const datetimeInput = document.getElementById('datetime-input');
const timestampResult = document.getElementById('timestamp-result');

document.getElementById('get-current').addEventListener('click', () => {
    const now = Date.now();
    timestampInput.value = Math.floor(now / 1000).toString();
    convertTimestamp();
});

document.getElementById('get-current-datetime').addEventListener('click', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    datetimeInput.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    convertDatetime();
});

timestampInput.addEventListener('input', convertTimestamp);
datetimeInput.addEventListener('input', convertDatetime);

function convertTimestamp() {
    let value = timestampInput.value.trim();
    if (!value) {
        timestampResult.innerHTML = '';
        return;
    }

    let timestamp = parseInt(value);
    if (isNaN(timestamp)) {
        timestampResult.innerHTML = '<span style="color: #ef4444;">时间戳格式不正确</span>';
        return;
    }

    // 处理13位毫秒时间戳
    if (value.length === 13) {
        timestamp = timestamp;
    } else if (value.length === 10) {
        timestamp = timestamp * 1000;
    }

    const date = new Date(timestamp);
    if (date.toString() === 'Invalid Date') {
        timestampResult.innerHTML = '<span style="color: #ef4444;">无效的时间戳</span>';
        return;
    }

    timestampResult.innerHTML = `
        <div class="result-item"><span class="result-item-label">本地时间:</span> ${date.toLocaleString('zh-CN')}</div>
        <div class="result-item"><span class="result-item-label">UTC 时间:</span> ${date.toUTCString()}</div>
        <div class="result-item"><span class="result-item-label">ISO 格式:</span> ${date.toISOString()}</div>
    `;
}

function convertDatetime() {
    const value = datetimeInput.value.trim();
    if (!value) {
        timestampResult.innerHTML = '';
        return;
    }

    let date;
    // 尝试解析 YYYY-MM-DD HH:mm:ss 格式
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
        date = new Date(value.replace(' ', 'T'));
    } else {
        date = new Date(value);
    }

    if (date.toString() === 'Invalid Date') {
        timestampResult.innerHTML = '<span style="color: #ef4444;">日期格式不正确，请使用 YYYY-MM-DD HH:mm:ss 格式</span>';
        return;
    }

    const timestampSeconds = Math.floor(date.getTime() / 1000);
    const timestampMs = date.getTime();

    timestampResult.innerHTML = `
        <div class="result-item"><span class="result-item-label">秒级时间戳:</span> ${timestampSeconds}</div>
        <div class="result-item"><span class="result-item-label">毫秒时间戳:</span> ${timestampMs}</div>
    `;
}

// ========== 2. 色值转换 ==========
const colorPicker = document.getElementById('color-picker');
const hexInput = document.getElementById('hex-input');
const rgbInput = document.getElementById('rgb-input');
const hslInput = document.getElementById('hsl-input');
const colorPreview = document.getElementById('color-preview');

let updating = false;

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        return x.toString(16).padStart(2, '0');
    }).join('');
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return { h, s, l };
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function updateAllFromHex(hex) {
    if (updating) return;
    updating = true;

    hex = hex.startsWith('#') ? hex : '#' + hex;
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);

    rgbInput.value = `rgb(${r}, ${g}, ${b})`;
    hslInput.value = `hsl(${h}, ${s}%, ${l}%)`;
    colorPicker.value = hex;
    updatePreview(hex);

    updating = false;
}

function updateAllFromRgb(rgbStr) {
    if (updating) return;
    updating = true;

    const match = rgbStr.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (!match) {
        updating = false;
        return;
    }

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const hex = rgbToHex(r, g, b);
    const { h, s, l } = rgbToHsl(r, g, b);

    hexInput.value = hex;
    hslInput.value = `hsl(${h}, ${s}%, ${l}%)`;
    colorPicker.value = hex;
    updatePreview(hex);

    updating = false;
}

function updateAllFromHsl(hslStr) {
    if (updating) return;
    updating = true;

    const match = hslStr.match(/(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%/);
    if (!match) {
        updating = false;
        return;
    }

    const h = parseInt(match[1]);
    const s = parseInt(match[2]);
    const l = parseInt(match[3]);
    const { r, g, b } = hslToRgb(h, s, l);
    const hex = rgbToHex(r, g, b);

    hexInput.value = hex;
    rgbInput.value = `rgb(${r}, ${g}, ${b})`;
    colorPicker.value = hex;
    updatePreview(hex);

    updating = false;
}

function updatePreview(color) {
    colorPreview.style.backgroundColor = color;
    // 判断颜色深浅，选择合适的文字颜色
    if (color) {
        const { r, g, b } = hexToRgb(color.startsWith('#') ? color : '#' + color);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        colorPreview.querySelector('span').style.color = brightness > 128 ? '#000' : '#fff';
    }
}

colorPicker.addEventListener('input', () => {
    hexInput.value = colorPicker.value;
    updateAllFromHex(hexInput.value);
});

hexInput.addEventListener('input', () => {
    let hex = hexInput.value.trim();
    if (hex.length === 6 || hex.length === 3) {
        updateAllFromHex(hex);
    }
});

rgbInput.addEventListener('input', () => {
    updateAllFromRgb(rgbInput.value);
});

hslInput.addEventListener('input', () => {
    updateAllFromHsl(hslInput.value);
});

// 初始化
updateAllFromHex('#2563eb');

// ========== 3. JSON 格式化压缩 ==========
const jsonInput = document.getElementById('json-input');
const jsonOutput = document.getElementById('json-output');

document.getElementById('format-json').addEventListener('click', () => {
    try {
        const input = jsonInput.value.trim();
        if (!input) {
            jsonOutput.value = '';
            return;
        }
        const obj = JSON.parse(input);
        jsonOutput.value = JSON.stringify(obj, null, 2);
    } catch (e) {
        jsonOutput.value = `JSON 解析错误: ${e.message}`;
    }
});

document.getElementById('minify-json').addEventListener('click', () => {
    try {
        const input = jsonInput.value.trim();
        if (!input) {
            jsonOutput.value = '';
            return;
        }
        const obj = JSON.parse(input);
        jsonOutput.value = JSON.stringify(obj);
    } catch (e) {
        jsonOutput.value = `JSON 解析错误: ${e.message}`;
    }
});

document.getElementById('clear-json').addEventListener('click', () => {
    jsonInput.value = '';
    jsonOutput.value = '';
});

// ========== 4. Base64 编码解码 ==========
const base64Input = document.getElementById('base64-input');
const base64Output = document.getElementById('base64-output');

document.getElementById('encode-base64').addEventListener('click', () => {
    try {
        const input = base64Input.value;
        if (!input) {
            base64Output.value = '';
            return;
        }
        const encoded = btoa(encodeURIComponent(input));
        base64Output.value = encoded;
    } catch (e) {
        base64Output.value = `编码错误: ${e.message}`;
    }
});

document.getElementById('decode-base64').addEventListener('click', () => {
    try {
        const input = base64Input.value.trim();
        if (!input) {
            base64Output.value = '';
            return;
        }
        const decoded = decodeURIComponent(atob(input));
        base64Output.value = decoded;
    } catch (e) {
        base64Output.value = `解码错误: ${e.message}`;
    }
});

document.getElementById('clear-base64').addEventListener('click', () => {
    base64Input.value = '';
    base64Output.value = '';
});

// ========== 5. UUID 生成 ==========
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const uuidResult = document.getElementById('uuid-result');
const copyUuidBtn = document.getElementById('copy-uuid');

document.getElementById('generate-uuid').addEventListener('click', () => {
    const count = parseInt(document.getElementById('uuid-count').value);
    if (isNaN(count) || count < 1 || count > 100) {
        uuidResult.innerHTML = '<span style="color: #ef4444;">请输入1-100之间的数字</span>';
        return;
    }

    const uuids = [];
    uuidResult.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const uuid = generateUUID();
        uuids.push(uuid);
        const div = document.createElement('div');
        div.className = 'uuid-item';
        div.textContent = uuid;
        div.style.cursor = 'pointer';
        div.addEventListener('click', () => {
            copyToClipboard(uuid);
        });
        uuidResult.appendChild(div);
    }

    if (count > 1) {
        copyUuidBtn.style.display = 'block';
        copyUuidBtn.dataset.uuids = uuids.join('\n');
    } else {
        copyUuidBtn.style.display = 'none';
    }
});

copyUuidBtn.addEventListener('click', () => {
    const uuids = copyUuidBtn.dataset.uuids;
    if (uuids) {
        copyToClipboard(uuids);
    }
});

// 初始生成一个UUID
document.getElementById('generate-uuid').click();