-- Change function from SECURITY INVOKER to SECURITY DEFINER
-- Run this in Supabase SQL Editor

-- Option 1: Alter the existing function (if it already exists)
-- Note: This will only work if the function signature matches
-- If you updated the function to accept 3 parameters, use:
ALTER FUNCTION waitlist_signup(text, text, text) SECURITY DEFINER;

-- Option 2: Recreate the function with SECURITY DEFINER (recommended)
-- Use this if Option 1 doesn't work or you want to ensure it's correct

CREATE OR REPLACE FUNCTION waitlist_signup(p_name text, p_org text, p_email text)
RETURNS TABLE(added boolean, ok boolean)
LANGUAGE plpgsql
SECURITY DEFINER  -- This is the key: runs with function owner's permissions
AS $$
DECLARE
  v_email     text := lower(trim(p_email));
  v_name      text := trim(p_name);
  v_org       text := trim(p_org);
  v_inserted  boolean;
BEGIN
  -- Try to insert; if email (case-insensitive) already exists, do nothing
  WITH ins AS (
    INSERT INTO public.waitlist (name, org, email)
    VALUES (v_name, v_org, v_email)
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

-- Grant execute permission (still needed even with SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION waitlist_signup(text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION waitlist_signup(text, text, text) TO authenticated;

