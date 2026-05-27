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

async function handleTrack(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || '';
    if (allowed && origin !== allowed) {
        return jsonRes({ error: 'Forbidden' }, env, 403);
    }

    let body;
    try {
        body = await request.json();
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

    const pvKey = `pv:${sanitized}`;
    const dailyKey = `daily:${today}`;
    const totalKey = 'meta:total';

    const [pvVal, dailyVal, totalVal] = await Promise.all([
        env.STATS.get(pvKey),
        env.STATS.get(dailyKey),
        env.STATS.get(totalKey),
    ]);

    const pvCount = (parseInt(pvVal, 10) || 0) + 1;
    const dailyCount = (parseInt(dailyVal, 10) || 0) + 1;
    const totalCount = (parseInt(totalVal, 10) || 0) + 1;

    await Promise.all([
        env.STATS.put(pvKey, String(pvCount)),
        env.STATS.put(dailyKey, String(dailyCount)),
        env.STATS.put(totalKey, String(totalCount)),
    ]);

    return jsonRes({ ok: true }, env);
}

async function handleStats(request, env) {
    const totalVal = await env.STATS.get('meta:total');
    const total = parseInt(totalVal, 10) || 0;

    const pvList = await env.STATS.list({ prefix: 'pv:' });
    const posts = {};
    await Promise.all(
        pvList.keys.map(async (k) => {
            const page = k.name.slice(3);
            const val = await env.STATS.get(k.name);
            posts[page] = parseInt(val, 10) || 0;
        })
    );

    const dailyList = await env.STATS.list({ prefix: 'daily:' });
    const daily = {};
    await Promise.all(
        dailyList.keys.map(async (k) => {
            const date = k.name.slice(6);
            const val = await env.STATS.get(k.name);
            daily[date] = parseInt(val, 10) || 0;
        })
    );

    return jsonRes({ total, posts, daily }, env);
}
