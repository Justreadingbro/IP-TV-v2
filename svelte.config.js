import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter({
      fallback: '404.html',
      pages: 'build',
      assets: 'build',
      precompress: false,
      strict: true
    })
  }
};

export default config;
