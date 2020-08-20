const nextMDX = require('@next/mdx');
const rehypePrism = require('@mapbox/rehype-prism');
const withOptimizedImages = require('next-optimized-images');
const admonitions = require('remark-admonitions');
const path = require('path');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [admonitions],
    rehypePlugins: [rehypePrism],
  },
});

module.exports = withBundleAnalyzer(
  withMDX(
    withOptimizedImages({
      target: 'experimental-serverless-trace',
      optimizeImagesInDev: false,
      handleImages: ['jpeg', 'jpg', 'png', 'svg'],
      inlineImageLimit: 1000,
      pageExtensions: ['tsx', 'md', 'mdx'],
      rewrites() {
        return [
          {
            source: '/feed.xml',
            destination: '/_next/static/feed.xml',
          },
          {
            source: '/sitemap.xml',
            destination: '/_next/static/sitemap.xml',
          },
        ];
      },
      webpack(config, { dev, isServer }) {
        if (!dev && isServer) {
          const originalEntry = config.entry;

          config.entry = async () => {
            const entries = { ...(await originalEntry()) };

            entries['./lib/build.ts'] = './lib/build.ts';

            return entries;
          };
        }
        config.resolve.alias['Public'] = path.resolve(__dirname, 'public');
        return config;
      },
    })
  )
);
