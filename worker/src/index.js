export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders(env) });
        }

        const url = new URL(request.url);

        if (url.pathname === '/track' && request.method === 'POST') {
            return handleTrack(request, env);
        }

        if (url.pathname === '/stats' && request.method === 'GET') {
            return handleStats(request, env);
        }

        return new Response('Not Found', { status: 404 });
    }
};

const MAX_TRACK_BODY_BYTES = 1024;

function corsHeaders(env) {
    return {
        'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

function jsonRes(data, env, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(env),
        },
    });
}

function isAllowedOrigin(request, env) {
    const allowed = env.ALLOWED_ORIGIN || '';
    if (!allowed) return true;
    return request.headers.get('Origin') === allowed;
}

async function listAllKeys(env, prefix) {
    const keys = [];
    let cursor;

    do {
        const options = { prefix };
        if (cursor) options.cursor = cursor;

        const page = await env.STATS.list(options);
        keys.push(...page.keys);
        cursor = page.list_complete ? null : page.cursor;
    } while (cursor);

    return keys;
}

async function readCounts(env, prefix) {
    const keys = await listAllKeys(env, prefix);
    const counts = {};

    await Promise.all(
        keys.map(async (k) => {
            const name = k.name.slice(prefix.length);
            const val = await env.STATS.get(k.name);
            counts[name] = parseInt(val, 10) || 0;
        })
    );

    return counts;
}

async function handleTrack(request, env) {
    if (!isAllowedOrigin(request, env)) {
        return jsonRes({ error: 'Forbidden' }, env, 403);
    }

    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > MAX_TRACK_BODY_BYTES) {
        return jsonRes({ error: 'Payload too large' }, env, 413);
    }

    let body;
    try {
        const raw = await request.text();
        if (raw.length > MAX_TRACK_BODY_BYTES) {
            return jsonRes({ error: 'Payload too large' }, env, 413);
        }
        body = JSON.parse(raw);
    } catch {
        return jsonRes({ error: 'Invalid JSON' }, env, 400);
    }

    const page = body.page;
    if (!page || typeof page !== 'string') {
        return jsonRes({ error: 'Missing page' }, env, 400);
    }

    const sanitized = page.replace(/[^a-zA-Z0-9\-]/g, '');
    if (!sanitized) {
        return jsonRes({ error: 'Invalid page' }, env, 400);
    }

    const today = new Date().toISOString().slice(0, 10);
    const hitKey = `hit:${today}:${sanitized}:${Date.now()}:${crypto.randomUUID()}`;
    await env.STATS.put(hitKey, '1');

    return jsonRes({ ok: true }, env);
}

async function handleStats(request, env) {
    if (!isAllowedOrigin(request, env)) {
        return jsonRes({ error: 'Forbidden' }, env, 403);
    }

    const [totalVal, posts, daily, hitKeys] = await Promise.all([
        env.STATS.get('meta:total'),
        readCounts(env, 'pv:'),
        readCounts(env, 'daily:'),
        listAllKeys(env, 'hit:'),
    ]);

    hitKeys.forEach((k) => {
        const [, date, page] = k.name.split(':');
        if (!date || !page) return;
        posts[page] = (posts[page] || 0) + 1;
        daily[date] = (daily[date] || 0) + 1;
    });

    const total = (parseInt(totalVal, 10) || 0) + hitKeys.length;

    return jsonRes({ total, posts, daily }, env);
}
