if (!Bun.env.WP_ADMIN_USERNAME || !Bun.env.WP_ADMIN_PASSWORD) {
  throw new Error("Credenziali WordPress mancanti nel .env");
}

export const config = {
  server: {
    port: 3000,
    prefix: '/cms/v1'
  },
  wp: {
    baseUrl: 'https://cms.test/wp-json/wp/v2',
    adminUsername: Bun.env.WP_ADMIN_USERNAME,
    adminPassword: Bun.env.WP_ADMIN_PASSWORD.replace(/\s/g, '')
  }
}