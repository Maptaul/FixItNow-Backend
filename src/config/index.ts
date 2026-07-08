import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  app_url: process.env.APP_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
  jwt_access_expiry_in: process.env.JWT_ACCESS_EXPIRY_IN!,
  jwt_refresh_expiry_in: process.env.JWT_REFRESH_EXPIRY_IN!,
  stripe_product_price_id: process.env.STRIPED_PRODUCT_PRICE_ID!,
  stripe_secret_key: process.env.STRIPED_SECRET_KEY!,
  stripe_webhook_secret: process.env.STRIPED_WEBHOOK_SECRET!,
};
