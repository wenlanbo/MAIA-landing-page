-- Change function from SECURITY INVOKER to SECURITY DEFINER
-- Run this in Supabase SQL Editor

-- Option 1: Alter the existing function (if it already exists)
-- Note: This will only work if the function signature matches
-- If you updated the function to accept 3 parameters, use:
ALTER FUNCTION waitlist_signup(text, text, text) SECURITY DEFINER;

-- Option 2: Recreate the function with SECURITY DEFINER (recommended)
-- Use this if Option 1 doesn't work or you want to ensure it's correct

-- FIRST: Create unique index on lower(email) if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_lower_idx ON public.waitlist (lower(email));

-- THEN: Create/update the function
CREATE OR REPLACE FUNCTION waitlist_signup(p_name text, p_org text, p_email text)
RETURNS TABLE(added boolean, ok boolean)
LANGUAGE plpgsql
SECURITY DEFINER  -- This is the key: runs with function owner's permissions
AS $$
DECLARE
  v_email     text := lower(trim(p_email));
  v_name      text := trim(p_name);
  v_org       text := trim(p_org);
  v_exists    boolean;
BEGIN
  -- Check if email already exists (case-insensitive)
  SELECT EXISTS(SELECT 1 FROM public.waitlist WHERE lower(email) = v_email) INTO v_exists;
  
  IF v_exists THEN
    -- Email already in database
    RETURN QUERY SELECT false as added, true as ok;
  ELSE
    -- Try to insert new email
    BEGIN
      INSERT INTO public.waitlist (name, org, email)
      VALUES (v_name, v_org, v_email);
      
      -- Successfully inserted
      RETURN QUERY SELECT true as added, true as ok;
    EXCEPTION
      WHEN unique_violation THEN
        -- Email was inserted by another process between check and insert
        RETURN QUERY SELECT false as added, true as ok;
      WHEN OTHERS THEN
        -- Some other error occurred
        RETURN QUERY SELECT false as added, false as ok;
    END;
  END IF;
END;
$$;

-- Grant execute permission (still needed even with SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION waitlist_signup(text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION waitlist_signup(text, text, text) TO authenticated;

