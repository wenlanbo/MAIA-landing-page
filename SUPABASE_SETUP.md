# Supabase RPC Function Setup Guide

## Issue: Empty Array Response `[]`

If you're getting an empty array `[]` instead of `{added: bool, ok: bool}`, the issue is likely in your Supabase function setup, not the frontend code.

## What to Check in Supabase

### 1. Function Exists and is Accessible

Go to Supabase Dashboard → Database → Functions

Verify that `waitlist_signup` function exists.

### 2. Function Return Type

**The function MUST return JSON, not TABLE.**

#### ✅ CORRECT Function Signature:
```sql
CREATE OR REPLACE FUNCTION waitlist_signup(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Your logic here
  -- Must return: {"added": true, "ok": true}
  RETURN json_build_object('added', true, 'ok', true);
END;
$$;
```

#### ❌ WRONG - Returns TABLE:
```sql
-- This will return an array, not an object
RETURNS TABLE(added boolean, ok boolean)
```

### 3. Function Implementation

Your function should return a JSON object with `added` and `ok` properties:

```sql
CREATE OR REPLACE FUNCTION waitlist_signup(p_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_exists boolean;
  insert_success boolean := false;
BEGIN
  -- Check if email exists
  SELECT EXISTS(SELECT 1 FROM waitlist WHERE email = p_email) INTO email_exists;
  
  IF email_exists THEN
    -- Email already exists
    RETURN json_build_object('added', false, 'ok', true);
  ELSE
    -- Insert new email
    BEGIN
      INSERT INTO waitlist (email) VALUES (p_email);
      insert_success := true;
      RETURN json_build_object('added', true, 'ok', true);
    EXCEPTION WHEN OTHERS THEN
      RETURN json_build_object('added', false, 'ok', false);
    END;
  END IF;
END;
$$;
```

### 4. Permissions

Grant execute permission to the `anon` role:

```sql
GRANT EXECUTE ON FUNCTION waitlist_signup(text) TO anon;
GRANT EXECUTE ON FUNCTION waitlist_signup(text) TO authenticated;
```

### 5. API Exposure

Make sure the function is exposed to the API:
- Go to Supabase Dashboard → API → Functions
- The function should be listed there

### 6. Test the Function Directly

Test in Supabase SQL Editor:

```sql
SELECT waitlist_signup('test@example.com');
```

Expected result:
```json
{"added": true, "ok": true}
```

NOT:
```
[]
```

## Common Issues

### Issue 1: Function Returns TABLE Instead of JSON
**Symptom:** Empty array `[]`  
**Solution:** Change `RETURNS TABLE(...)` to `RETURNS json`

### Issue 2: Function Returns NULL
**Symptom:** `null` or empty array  
**Solution:** Ensure function has a RETURN statement that returns JSON

### Issue 3: Permission Denied
**Symptom:** Error code `42501`  
**Solution:** Grant EXECUTE permission to anon role

### Issue 4: Function Not Found
**Symptom:** Error code `42883` or `PGRST301`  
**Solution:** 
- Check function name matches exactly: `waitlist_signup`
- Check parameter name matches: `p_email`
- Ensure function is exposed to API

## Debugging Steps

1. Open browser console (F12)
2. Look for `[DEBUG]` messages
3. Check the connection test that runs on page load
4. Submit the form and check the detailed error messages
5. Use the error codes to identify the specific issue

## Quick Fix Checklist

- [ ] Function exists in Supabase
- [ ] Function returns `json` type (not `TABLE`)
- [ ] Function has `RETURN json_build_object(...)` statement
- [ ] Function has `GRANT EXECUTE` permissions
- [ ] Parameter name is exactly `p_email`
- [ ] Function is exposed to API
- [ ] Test function directly in SQL Editor returns JSON object

