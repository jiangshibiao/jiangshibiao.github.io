'use strict';
// 临时调试探针：对比本地与 CI 构建时文章图片链接的处理过程，用完即删
const early = {};
const late = {};

hexo.extend.filter.register('after_post_render', data => {
  if (data.path && String(data.path).includes('ACM-From-Zero')) {
    early.permalink = data.permalink;
    early.path = data.path;
    early.full_source = data.full_source;
    early.asset_dir = data.asset_dir;
    early.imgs = (String(data.content).match(/<img[^>]*>/g) || []).slice(0, 4);
  }
  return data;
}, 1);

hexo.extend.filter.register('after_post_render', data => {
  if (data.path && String(data.path).includes('ACM-From-Zero')) {
    late.imgs = (String(data.content).match(/<img[^>]*>/g) || []).slice(0, 4);
  }
  return data;
}, 1000);

hexo.extend.filter.register('after_generate', () => {
  const fs = require('fs');
  fs.mkdirSync('public', { recursive: true });
  fs.writeFileSync('public/_debug_ci.json', JSON.stringify({
    platform: process.platform,
    node: process.version,
    hexo: hexo.version,
    config_url: hexo.config.url,
    config_root: hexo.config.root,
    markdown_config: hexo.config.markdown,
    early,
    late
  }, null, 2));
});
