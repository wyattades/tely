const loaderHTML = `<div class="full-page">\
<div class="spinner">\
<div class="rect1"></div>\
<div class="rect2"></div>\
<div class="rect3"></div>\
<div class="rect4"></div>\
<div class="rect5"></div>\
</div>\
</div>`;

const config = require('webpack-boiler')({
  googleAnalytics: 'UA-105229811-3',
  url: 'https://tely.app',
  react: true,
  manifest: {
    background_color: '#00d1b2',
    display: 'standalone',
    start_url: '/list',
  },
  pages: [{
    title: 'Tely',
    favicon: './src/assets/favicon.png',
    meta: {
      'theme-color': '#ffffff',
      description: 'Create and share lists of media with your Discord pals!',
      keywords: 'tely,discord,share,live,media,tv,television,movie,music,spotify',
    },
    loader: loaderHTML,
  }],
});

const OfflinePlugin = require('offline-plugin');
config.plugins.push(new OfflinePlugin());

module.exports = config;
