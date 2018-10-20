const loaderHTML = `<div class="full-page">\
<div class="spinner">\
<div class="rect1"></div>\
<div class="rect2"></div>\
<div class="rect3"></div>\
<div class="rect4"></div>\
<div class="rect5"></div>\
</div>\
</div>`;

module.exports = require('webpack-boiler')({
  googleAnalytics: 'UA-105229811-3',
  url: 'https://tely.app',
  react: true,
  pages: [{
    title: 'Tely',
    meta: [{
      name: 'description',
      content: 'Mom! Come look at the Tely!',
    }, {
      name: 'keywords',
      content: 'tely,discord,share,live,media,tv,television,movie,music,spotify,',
    }],
    loader: loaderHTML,
  }],
});
