# Supabase Setup Guide for Invoice App

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Project Name:** Invoice App
   - **Database Password:** (create a strong password)
   - **Region:** Choose closest to you
5. Click "Create new project"
6. Wait for project to be ready (~2 minutes)

## Step 2: Get Your Credentials

1. In your Supabase project dashboard
2. Click on **Settings** (gear icon) in the left sidebar
3. Click on **API** under Project Settings
4. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under Project API keys)

## Step 3: Create Environment File

1. In your project root, create a file named `.env`
2. Add your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Replace with your actual values from Step 2

## Step 4: Create Database Tables

1. In Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of `supabase_schema.sql` file
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned"

## Step 5: Verify Tables Created

1. Click **Table Editor** in the left sidebar
2. You should see two tables:
   - `customers`
   - `invoices`

## Step 6: Update Your App to Use Supabase

The app currently uses localStorage. To switch to Supabase:

### Option A: Replace localStorage completely

Update these files to use Supabase functions:
- `src/utils/customerStorage.ts` → use `supabaseStorage.ts`
- `src/utils/invoiceStorage.ts` → use `supabaseStorage.ts`

### Option B: Keep both (recommended for testing)

You can keep localStorage as fallback and add Supabase gradually.

## Step 7: Test the Connection

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Check browser console for any Supabase errors

3. Try creating a customer or invoice

4. Verify data appears in Supabase Table Editor

## Security Notes

### Row Level Security (RLS)

The schema includes RLS policies. Current setup:
- **Authenticated users:** Full access
- **Anonymous users:** No access (commented out)

To allow public access (not recommended for production):
- Uncomment the public policies in `supabase_schema.sql`

### API Keys

- **anon key:** Safe to use in frontend (public)
- **service_role key:** NEVER use in frontend (keep secret)

## Troubleshooting

### "Failed to fetch" errors
- Check your `.env` file has correct URL and key
- Restart dev server after creating `.env`

### "Permission denied" errors
- Check RLS policies in Supabase
- Make sure policies allow your operations

### Data not showing
- Check Supabase Table Editor to see if data is saved
- Check browser console for errors
- Verify table names match exactly

## Next Steps

1. ✅ Install Supabase client
2. ✅ Create `.env` file with credentials
3. ✅ Run SQL schema in Supabase
4. ⬜ Update app to use Supabase functions
5. ⬜ Test and verify data sync

## Migration from localStorage

To migrate existing data:
1. Export data from localStorage (browser DevTools)
2. Format as SQL INSERT statements
3. Run in Supabase SQL Editor

Or create a migration script to copy data automatically.
