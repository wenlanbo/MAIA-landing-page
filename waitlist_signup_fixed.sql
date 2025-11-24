-- Updated waitlist_signup function for Supabase
-- Copy and paste this into Supabase SQL Editor
-- Now accepts: p_name, p_org, and p_email

CREATE OR REPLACE FUNCTION waitlist_signup(p_name text, p_org text, p_email text)
RETURNS TABLE(added boolean, ok boolean)
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION waitlist_signup(text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION waitlist_signup(text, text, text) TO authenticated;

