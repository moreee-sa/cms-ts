if (!Bun.env.WP_ADMIN_USERNAME || !Bun.env.WP_ADMIN_PASSWORD) {
  throw new Error("Credenziali WordPress mancanti nel .env");
}

export const config = {
  server: {
    port: 3000,
    prefix: '/cms/v1'
  },
  wp: {
    baseUrl: Bun.env.WP_BASE_URL,
    adminUsername: Bun.env.WP_ADMIN_USERNAME,
    adminPassword: Bun.env.WP_ADMIN_PASSWORD.replace(/\s/g, '')
  },
  jwt: {
    secret: Bun.env.JWT_KEY
  },
  gemini: {
    apiKey: Bun.env.GEMINI_API_KEY
  }
}