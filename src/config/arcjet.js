import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';


const aj = arcjet({
  
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: 'LIVE' }),
    detectBot({
      mode: 'LIVE', // Blocks requests. Use "DRY_RUN" to log only
      allow: [
        'CATEGORY:SEARCH_ENGINE', // Google, Bing, etc
        'CATEGORY:PREVIEW', // Link previews e.g. Slack, Discord
      ],
    }),
    slidingWindow({
      mode: 'LIVE',
      interval: 60, // 1 minute
      max: 5, // Max 5 requests per interval
    }),
  ],
});

export default aj;