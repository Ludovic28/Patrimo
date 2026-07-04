import { neon } from "@neondatabase/serverless";

const sql = neon(
  import.meta.env.VITE_NEON_DATABASE_URL,
  {
    disableWarningInBrowsers: true,
  }
);

export default sql;
