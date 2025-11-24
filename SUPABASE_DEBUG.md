# Supabase Debugging Guide

## Issue: Empty Response and No Data Inserted

If you're getting an empty response `[]` or `null` and no data is being inserted, follow these steps:

## Step 1: Verify Function Exists

1. Go to Supabase Dashboard → Database → Functions
2. Look for `waitlist_signup` function
3. If it doesn't exist, create it (see Step 4)

## Step 2: Check Function Return Type

Your function **MUST** return a TABLE or JSON with `added` and `ok` columns.

### ✅ CORRECT - Returns TABLE:
```sql
CREATE OR REPLACE FUNCTION waitlist_signup(p_email text)
RETURNS TABLE(added boolean, ok boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_exists boolean;
BEGIN
  -- Check if email exists
  SELECT EXISTS(SELECT 1 FROM waitlist WHERE email = p_email) INTO email_exists;
  
  IF email_exists THEN
    -- Email already exists
    RETURN QUERY SELECT false as added, true as ok;
  ELSE
    -- Insert new email
    BEGIN
      INSERT INTO waitlist (email, created_at) 
      VALUES (p_email, NOW());
      RETURN QUERY SELECT true as added, true as ok;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT false as added, false as ok;
    END;
  END IF;
END;
$$;
```

### ❌ WRONG - No RETURN statement:
```sql
-- This will return empty array
CREATE OR REPLACE FUNCTION waitlist_signup(p_email text)
RETURNS TABLE(added boolean, ok boolean)
AS $$
BEGIN
  INSERT INTO waitlist (email) VALUES (p_email);
  -- Missing RETURN QUERY!
END;
$$;
```

## Step 3: Check Permissions

Run these SQL commands in Supabase SQL Editor:

```sql
-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION waitlist_signup(text) TO anon;
GRANT EXECUTE ON FUNCTION waitlist_signup(text) TO authenticated;

-- Grant insert permission on waitlist table
GRANT INSERT ON TABLE waitlist TO anon;
GRANT SELECT ON TABLE waitlist TO anon;
```

## Step 4: Verify Table Exists

Check if your `waitlist` table exists:

```sql
-- Check if table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'waitlist';

-- If it doesn't exist, create it:
CREATE TABLE IF NOT EXISTS waitlist (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Step 5: Test Function Directly

Test the function in Supabase SQL Editor:

```sql
-- Test the function
SELECT * FROM waitlist_signup('test@example.com');

-- Should return:
-- added | ok
-- ------|----
-- true  | true
```

If this returns empty, the function has a problem.

## Step 6: Check Function Code

Your function should:
1. ✅ Accept parameter `p_email` (text)
2. ✅ Check if email exists
3. ✅ Insert email if it doesn't exist
4. ✅ **RETURN** a row with `added` and `ok` columns
5. ✅ Handle errors properly

## Step 7: Check Browser Console

After submitting the form, check the browser console (F12) for:
- `[DEBUG] ===== RPC CALL RESPONSE =====`
- `[DEBUG] Response data:` - Should show the data
- `[DEBUG] Response error:` - Should be null if successful
- `[DEBUG] ===== EMPTY RESPONSE DIAGNOSIS =====` - Will show specific issues

## Common Issues and Solutions

### Issue 1: Function returns empty array `[]`
**Cause:** Function doesn't have `RETURN QUERY` statement
**Solution:** Add `RETURN QUERY SELECT ...` in your function

### Issue 2: Function returns null
**Cause:** Function doesn't return anything
**Solution:** Ensure function has a RETURN statement

### Issue 3: No data inserted
**Cause:** 
- Table doesn't exist
- No INSERT permission
- Function doesn't actually execute INSERT
**Solution:** Check table exists, grant permissions, verify INSERT statement

### Issue 4: Permission denied
**Cause:** anon role doesn't have EXECUTE permission
**Solution:** Run `GRANT EXECUTE ON FUNCTION waitlist_signup(text) TO anon;`

### Issue 5: Function not found
**Cause:** Function doesn't exist or wrong name
**Solution:** Create function or check function name matches exactly

## Complete Working Example

Here's a complete working function:

```sql
-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS waitlist (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function
CREATE OR REPLACE FUNCTION waitlist_signup(p_email text)
RETURNS TABLE(added boolean, ok boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_exists boolean;
BEGIN
  -- Check if email already exists
  SELECT EXISTS(SELECT 1 FROM waitlist WHERE email = p_email) INTO email_exists;
  
  IF email_exists THEN
    -- Email already registered
    RETURN QUERY SELECT false as added, true as ok;
  ELSE
    -- Try to insert new email
    BEGIN
      INSERT INTO waitlist (email, created_at) 
      VALUES (p_email, NOW());
      RETURN QUERY SELECT true as added, true as ok;
    EXCEPTION WHEN OTHERS THEN
      -- Insert failed (e.g., duplicate key)
      RETURN QUERY SELECT false as added, false as ok;
    END;
  END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION waitlist_signup(text) TO anon;
GRANT EXECUTE ON FUNCTION waitlist_signup(text) TO authenticated;
GRANT INSERT ON TABLE waitlist TO anon;
GRANT SELECT ON TABLE waitlist TO anon;
```

## Testing Checklist

- [ ] Function exists in Supabase
- [ ] Function has correct return type (TABLE with added, ok)
- [ ] Function has RETURN QUERY statement
- [ ] Table `waitlist` exists
- [ ] Permissions granted (EXECUTE, INSERT, SELECT)
- [ ] Function tested directly in SQL Editor returns data
- [ ] Browser console shows detailed debug info
- [ ] No errors in browser console

