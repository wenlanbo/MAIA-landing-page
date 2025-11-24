# Fix for Function Always Returning false, false

## The Problem

Your function was always returning `false, false`, which means it was hitting the `EXCEPTION` block. This happens because:

1. **`ON CONFLICT (lower(email))` doesn't work** - You can't use a function directly in `ON CONFLICT`
2. **Missing unique index** - You need a unique index on `lower(email)` for case-insensitive uniqueness
3. **Exception being caught** - Any error triggers the exception handler

## The Solution

I've updated the function to:

1. ✅ **Check for existing email first** - Uses a simple SELECT to check if email exists
2. ✅ **Insert if not exists** - Only inserts if email doesn't exist
3. ✅ **Handle race conditions** - Catches unique_violation if email is inserted between check and insert
4. ✅ **Better error handling** - Distinguishes between "already exists" and "error occurred"

## Step-by-Step Fix

### Step 1: Create the Unique Index

Run this in Supabase SQL Editor **first**:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_lower_idx 
ON public.waitlist (lower(email));
```

This creates a case-insensitive unique constraint on emails.

### Step 2: Update the Function

Copy and paste the updated function from `waitlist_signup_fixed.sql` into Supabase SQL Editor and run it.

### Step 3: Test

Test the function:

```sql
-- Test with new email (should return true, true)
SELECT * FROM waitlist_signup('John Doe', 'Acme Corp', 'john@example.com');

-- Test with same email again (should return false, true)
SELECT * FROM waitlist_signup('Jane Doe', 'Other Corp', 'john@example.com');
```

## What Changed

### Before (Problematic):
```sql
WITH ins AS (
  INSERT INTO public.waitlist (name, org, email)
  VALUES (v_name, v_org, v_email)
  ON CONFLICT (lower(email))  -- ❌ This doesn't work!
  DO NOTHING
  RETURNING 1
)
```

### After (Fixed):
```sql
-- Check first
SELECT EXISTS(...) INTO v_exists;

IF v_exists THEN
  -- Already exists
  RETURN QUERY SELECT false as added, true as ok;
ELSE
  -- Insert new
  INSERT INTO public.waitlist (name, org, email)
  VALUES (v_name, v_org, v_email);
  RETURN QUERY SELECT true as added, true as ok;
END IF;
```

## Why This Works

1. **Simple check** - Uses `EXISTS()` to check if email exists (case-insensitive)
2. **Direct insert** - No complex CTE, just a simple INSERT
3. **Exception handling** - Catches unique_violation for race conditions
4. **Clear logic** - Easy to understand and debug

## Alternative: Using ON CONFLICT with Index

If you prefer to use `ON CONFLICT`, you need to:

1. Create the unique index first (as shown above)
2. Then use the index name in ON CONFLICT:

```sql
-- This would work AFTER creating the index:
INSERT INTO public.waitlist (name, org, email)
VALUES (v_name, v_org, v_email)
ON CONFLICT ON CONSTRAINT waitlist_email_lower_idx
DO NOTHING;
```

But the check-then-insert approach is simpler and more reliable.

