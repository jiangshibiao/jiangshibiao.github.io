'use strict';
// 首页等列表按 updated 倒序，而 front matter 里的 updated 通常只精确到天，
// 同一天更新的文章顺序不定。这里把 updated 的时分秒替换为创建时间 date 的时分秒：
// 效果 = 先按更新日期（天）倒序；同一天内按创建时间（秒）倒序。
// 注意：warehouse 里直接给 post.updated 赋值不会写入 store，必须用 update() 持久化；
// update() 返回 Promise，统一返回给 hexo 的过滤器管线等待完成。
hexo.extend.filter.register('before_generate', function () {
  const tasks = [];
  hexo.locals.get('posts').forEach(function (post) {
    if (!post.updated || !post.date) return;
    const d = post.date;
    const merged = post.updated.clone()
      .hour(d.hour()).minute(d.minute()).second(d.second());
    if (post.updated.valueOf() === merged.valueOf()) return;
    tasks.push(post.update({ updated: merged }));
  });
  return Promise.all(tasks);
});
