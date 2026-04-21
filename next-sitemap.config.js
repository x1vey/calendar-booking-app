/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://callme.hisubhadeep.com',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
      {
        userAgent: 'CCBot',
        allow: '/',
      },
      {
        userAgent: 'Anthropic-ai',
        allow: '/',
      },
    ],
  },
}