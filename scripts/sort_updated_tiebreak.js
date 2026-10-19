'use strict';
// 首页等列表按 updated 倒序，而 front matter 里的 updated 通常只精确到天，
// 同一天更新的文章顺序不定。这里把 updated 的时分秒替换为创建时间 date 的时分秒：
// 效果 = 先按更新日期（天）倒序；同一天内按创建时间（秒）倒序。
// 注意：warehouse 里直接给 post.updated 赋值不会写入 store，必须用 update() 持久化；
// update() 返回 Promise，统一返回给 hexo 的过滤器管线等待完成。

const debugLog = { before: {}, after: {}, order: [] };

hexo.extend.filter.register('before_generate', function () {
  const tasks = [];
  hexo.locals.get('posts').forEach(function (post) {
    if (!post.updated || !post.date) return;
    const d = post.date;
    const u = post.updated;
    const merged = u.clone().hour(d.hour()).minute(d.minute()).second(d.second());
    if (/Travel-Notes-of-(Vienna|Prague|Split|Dubrovnik)/.test(post.slug)) {
      debugLog.before[post.slug] = { updated: u.format('YYYY-MM-DD HH:mm:ss'), date: d.format('YYYY-MM-DD HH:mm:ss'), merged: merged.format('YYYY-MM-DD HH:mm:ss') };
    }
    if (u.valueOf() === merged.valueOf()) return;
    tasks.push(post.update({ updated: merged }));
  });
  return Promise.all(tasks).then(function () {
    hexo.locals.get('posts').forEach(function (post) {
      if (/Travel-Notes-of-(Vienna|Prague|Split|Dubrovnik)/.test(post.slug)) {
        debugLog.after[post.slug] = post.updated.format('YYYY-MM-DD HH:mm:ss');
      }
    });
  });
});

hexo.extend.filter.register('after_generate', function () {
  const sorted = hexo.locals.get('posts').sort('-updated').toArray();
  for (let i = 0; i < Math.min(6, sorted.length); i++) {
    debugLog.order.push(sorted[i].slug + ' @ ' + (sorted[i].updated ? sorted[i].updated.format('MM-DD HH:mm:ss') : 'null'));
  }
  const fs = require('fs');
  fs.mkdirSync('public', { recursive: true });
  fs.writeFileSync('public/_sort_debug.json', JSON.stringify(debugLog, null, 2));
});
