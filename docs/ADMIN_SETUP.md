# Portfolio admin setup

The `/admin` page uses Supabase Auth for sign-in, Postgres with Row Level Security for portfolio content, and a public Storage bucket for images and resume files. Only user IDs explicitly added to `public.portfolio_admins` can edit content or upload files. The browser uses only the Supabase project URL and publishable/anon key; never put a `service_role` or secret key in this app.

## 1. Create and configure the Supabase project

1. Create a Supabase project and copy its Project URL and publishable key (or legacy anon key).
2. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or add those variables to your existing Vite environment file without removing its other settings).
3. Restart the Vite development server after changing `.env`.
4. In Supabase Auth settings, disable public sign-ups if only the portfolio owner should create accounts.

## 2. Create the database policies and file bucket

Open the Supabase Dashboard SQL Editor, paste the complete contents of `supabase/migrations/20261117154639_portfolio_admin_content.sql`, and run it. The migration creates the content and admin tables, enables row-level security, grants only the required client permissions, and creates the public `portfolio-assets` bucket with a 10 MB limit.

## 3. Create the first admin account

1. In Supabase Dashboard - Authentication - Users, add an account for the portfolio owner and set a strong password.
2. Copy that account's user UUID.
3. In the SQL Editor, run the following after replacing the value with that UUID:

   ```sql
   insert into public.portfolio_admins (user_id)
   values ('PASTE_AUTH_USER_UUID_HERE');
   ```

Admin status is granted by this database row, not by an email address, a URL, or user-editable profile metadata. Do not add a public admin-registration feature.

## 4. Sign in and publish

Deploy or run the site with the two Vite environment variables set, then visit `/admin` and sign in with the account created above. Admins are redirected to the public portfolio, where edit controls appear for the home introduction and each content section, including About, Skills, Certificates, Projects, Experience, Goals, and Contact. Edit the About section or either About card directly. Each section editor can update its text and entries, add or remove items, and upload replacement images or files. Use **Update resume** in the admin toolbar to upload a PDF (up to 10 MB); select **Save changes** to publish it and update the public download links. Select **Save changes** in an editor to publish its content.

The public site reads the saved content from Supabase. Until the first save, it uses the built-in portfolio content. The Storage bucket is public because these files are intended for the public portfolio; uploads are restricted by database policies to listed admins.
