'use strict';
// 首页等列表按 updated 倒序，而 front matter 里的 updated 通常只精确到天，
// 同一天更新的文章顺序不定。这里把 updated 合成：天（按配置时区）取 updated 的，
// 时分秒取创建时间 date 的。效果 = 先按更新日期（天）倒序；同一天内按创建时间倒序。
//
// 注意两点：
// 1. 必须用配置时区（timezone）做墙钟合成，不能用进程时区——CI 上是 UTC，
//    直接用 moment 的 hour()/minute() 会因跨日偏移导致平局顺序错误。
// 2. warehouse 里直接给 post.updated 赋值不会写入 store，必须用 update() 持久化，
//    并把返回的 Promise 交给 hexo 过滤器管线等待。
const moment = require('moment-timezone');

hexo.extend.filter.register('before_generate', function () {
  const tz = hexo.config.timezone || 'Asia/Shanghai';
  const tasks = [];
  hexo.locals.get('posts').forEach(function (post) {
    if (!post.updated || !post.date) return;
    const uMs = post.updated.valueOf();
    const dMs = post.date.valueOf();
    const dayStart = moment.tz(uMs, tz).startOf('day');
    const dateDayStart = moment.tz(dMs, tz).startOf('day');
    // 同一天内的先后与时区无关，直接用绝对毫秒差作为当日偏移
    const merged = dayStart.clone().add(dMs - dateDayStart.valueOf(), 'ms');
    if (uMs === merged.valueOf()) return;
    tasks.push(post.update({ updated: merged }));
  });
  return Promise.all(tasks);
});
