# Fix for Your Supabase Function

## Issues Found in Your Function

Your function has these problems:

1. ❌ **Missing function signature** - No `CREATE OR REPLACE FUNCTION` declaration
2. ❌ **Missing RETURNS clause** - Function doesn't declare what it returns
3. ❌ **Variables not declared** - `added` and `ok` are used but not declared
4. ❌ **No RETURN statement** - Function sets variables but never returns them
5. ❌ **Just `return;`** - This returns nothing, causing empty array `[]`

## The Fix

Your function logic is good, but it needs to **actually return the values**. Here's what changed:

### Key Changes:

1. ✅ Added proper function signature with `RETURNS TABLE(added boolean, ok boolean)`
2. ✅ Changed `return;` to `RETURN QUERY SELECT ...` to actually return the values
3. ✅ Removed undeclared variables - now using direct RETURN QUERY

## How to Fix It

1. **Open Supabase Dashboard** → SQL Editor

2. **Run this fixed function** (copy from `waitlist_signup_fixed.sql`):

```sql
CREATE OR REPLACE FUNCTION waitlist_signup(p_email text)
RETURNS TABLE(added boolean, ok boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email     text := lower(trim(p_email));
  v_inserted  boolean;
BEGIN
  -- Try to insert; if email (case-insensitive) already exists, do nothing
  WITH ins AS (
    INSERT INTO public.waitlist (email)
    VALUES (v_email)
    ON CONFLICT (lower(email))  -- uses your unique index on lower(email)
    DO NOTHING
    RETURNING 1
  )
  SELECT EXISTS(SELECT 1 FROM ins) INTO v_inserted;
  
  IF v_inserted THEN
    -- New row inserted
    RETURN QUERY SELECT true as added, true as ok;
  ELSE
    -- Email already in database, no insert
    RETURN QUERY SELECT false as added, true as ok;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Some unexpected error occurred
    RETURN QUERY SELECT false as added, false as ok;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION waitlist_signup(text) TO anon;
GRANT EXECUTE ON FUNCTION waitlist_signup(text) TO authenticated;
```

3. **Test the function**:

```sql
SELECT * FROM waitlist_signup('test@example.com');
```

Should return:
```
 added | ok
-------|----
 true  | true
```

4. **Verify permissions** (if needed):

```sql
GRANT INSERT ON TABLE waitlist TO anon;
GRANT SELECT ON TABLE waitlist TO anon;
```

## What Was Wrong

### Your Original Code:
```sql
if v_inserted then
  added := true;    -- ❌ Variable not declared
  ok    := true;    -- ❌ Variable not declared
else
  added := false;    -- ❌ Variable not declared
  ok    := true;     -- ❌ Variable not declared
end if;
return;              -- ❌ Returns nothing!
```

### Fixed Code:
```sql
IF v_inserted THEN
  RETURN QUERY SELECT true as added, true as ok;  -- ✅ Actually returns data
ELSE
  RETURN QUERY SELECT false as added, true as ok;  -- ✅ Actually returns data
END IF;
```

## After Fixing

1. ✅ Function will return a row with `added` and `ok` columns
2. ✅ Frontend will receive data instead of empty array `[]`
3. ✅ Data will be inserted into the database
4. ✅ Success/error messages will work correctly

## Verify It Works

After updating the function:

1. Test in SQL Editor: `SELECT * FROM waitlist_signup('test@example.com');`
2. Submit form on your landing page
3. Check browser console - should see data instead of empty array
4. Check Supabase table - email should be inserted

