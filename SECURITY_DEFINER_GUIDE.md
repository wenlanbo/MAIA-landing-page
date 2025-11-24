# How to Change Function from INVOKER to DEFINER

## Quick Method

### Option 1: Alter Existing Function (Fastest)

Run this single command in Supabase SQL Editor:

```sql
ALTER FUNCTION waitlist_signup(text) SECURITY DEFINER;
```

That's it! The function will now run with the function owner's permissions instead of the caller's permissions.

### Option 2: Recreate Function (Recommended)

If Option 1 doesn't work, recreate the function with `SECURITY DEFINER`:

1. Open Supabase Dashboard → SQL Editor
2. Copy the entire function from `waitlist_signup_fixed.sql` or `change_to_definer.sql`
3. Paste and run it

The function already has `SECURITY DEFINER` in the fixed version.

## What's the Difference?

### SECURITY INVOKER (Default)
- Function runs with the **caller's permissions** (anon role)
- Limited to what the anon role can do
- May need more table permissions granted to anon role

### SECURITY DEFINER (Recommended for this use case)
- Function runs with the **function owner's permissions** (usually postgres/superuser)
- Can bypass RLS (Row Level Security) policies
- More secure - caller can't abuse elevated permissions
- Better for functions that need to insert data

## Why Use SECURITY DEFINER?

For your waitlist function, `SECURITY DEFINER` is better because:

1. ✅ **Bypasses RLS** - If you have Row Level Security enabled, the function can still insert
2. ✅ **Simpler permissions** - Don't need to grant INSERT to anon role on the table
3. ✅ **More secure** - The function owner controls what happens, not the caller
4. ✅ **Standard practice** - Common pattern for functions that modify data

## Verify It Changed

After running the ALTER command, verify:

```sql
-- Check function security setting
SELECT 
    proname as function_name,
    prosecdef as is_security_definer
FROM pg_proc
WHERE proname = 'waitlist_signup';

-- Should show: is_security_definer = true
```

## Important Notes

- Even with `SECURITY DEFINER`, you still need to grant `EXECUTE` permission:
  ```sql
  GRANT EXECUTE ON FUNCTION waitlist_signup(text) TO anon;
  ```

- The function will run with the permissions of the user who created it (usually `postgres`)

- This is safe because the function code is controlled - callers can't execute arbitrary SQL

## Troubleshooting

If `ALTER FUNCTION` doesn't work:
- Make sure you're using the correct function signature: `waitlist_signup(text)`
- Try recreating the function with `CREATE OR REPLACE FUNCTION ... SECURITY DEFINER`
- Check that you have permission to alter functions (you should as the project owner)

