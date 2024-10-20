export const jwtConstants = {
  access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
  refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
  temp_token_secret: process.env.TEMP_TOKEN_SECRET_KEY
}