const base = process.env.WARM_BASE || 'http://localhost:3000';
const paths = [
    '/',
    '/search',
    '/posteditor',
    '/posteditor/warmup',
    '/hcsongi/warmup',
    '/hcsongi',
    '/admin',
    '/aboutMe',
    '/editprofile',
    '/logmein',
];
(async () => {
    for (const p of paths) {
        const url = base + p;
        try {
            const res = await fetch(url, { cache: 'no-store' });
            console.log(res.status, url);
        } catch (e) {
            console.error('ERR', url, e.message);
        }

    }
    console.log('\x1b[32m%s\x1b[0m', '_____________Compiling done_____________');
    console.log('\x1b[32m%s\x1b[0m', '_____________Compiling done_____________');
    console.log('\x1b[32m%s\x1b[0m', '_____________Compiling done_____________');
})();
