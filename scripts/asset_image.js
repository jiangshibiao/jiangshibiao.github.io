'use strict';
// 文章资源文件夹图片链接修正（post_asset_folder）
// 源自本地打过补丁的 hexo-asset-image@1.0.0（官方原版在 permalink 不含 ".html" 时
// 会用 lastIndexOf('.') 截断链接，命中域名 "github.io" 里的点，生成 /.io//xxx.png 坏链）。
// 原插件已年久失修，故将其修正版收编到 scripts/ 下，保证本地与 CI 行为一致。
var cheerio = require('cheerio');

hexo.extend.filter.register('after_post_render', function (data) {
  var config = hexo.config;
  if (!config.post_asset_folder) return;

  var link = data.permalink;
  // 取第 3 个 '/' 之后的内容（跳过 "https://host" 部分），保留文章路径
  var beginPos = link.split('/', 3).join('/').length + 1;
  var endPos = link.lastIndexOf('/') + 1;
  link = link.substring(beginPos, endPos);

  var toprocess = ['excerpt', 'more', 'content'];
  for (var i = 0; i < toprocess.length; i++) {
    var key = toprocess[i];
    if (!data[key]) continue;

    var $ = cheerio.load(data[key], {
      ignoreWhitespace: false,
      xmlMode: false,
      lowerCaseTags: false,
      decodeEntities: false
    });

    $('img').each(function () {
      if ($(this).attr('src')) {
        // For windows style path, we replace '\' to '/'.
        var src = $(this).attr('src').replace('\\', '/');
        if (!/http[s]*.*|\/\/.*/.test(src) &&
            !/^\s*\//.test(src)) {
          // For "about" page, the first part of "src" can't be removed.
          // In addition, to support multi-level local directory.
          var srcArray = src.split('/').filter(function (elem) {
            return elem != '' && elem != '.';
          });
          if (srcArray.length > 1)
            srcArray.shift();
          src = srcArray.join('/');
          $(this).attr('src', config.root + link + src);
        }
      }
    });
    data[key] = $.html();
  }
});
