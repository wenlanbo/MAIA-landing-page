# MAIA Landing Page

A simple landing page with Supabase integration for waitlist signups.

## Setup Instructions

1. **Configure Supabase**:
   - Open `app.js`
   - Update `SUPABASE_URL` with your Supabase project URL
   - Update `SUPABASE_ANON_KEY` with your Supabase anonymous key

2. **Set up Supabase Database**:
   - Create a table called `waitlist` with columns: `name`, `org`, `email`
   - Create a unique index: `CREATE UNIQUE INDEX waitlist_email_lower_idx ON waitlist (lower(email));`
   - Copy and paste the function from `waitlist_signup_fixed.sql` into Supabase SQL Editor and run it

3. **Run the application**:
   - Simply open `index.html` in a browser, or
   - Use a local server (e.g., `python -m http.server` or `npx serve`)

## Features

- Name, organization, and email collection
- Email format validation
- Supabase RPC integration
- User-friendly error and success messages
- Responsive design
- Loading states

## Response Handling

The page handles three scenarios based on the Supabase response:

- **Success** (`added: true, ok: true`): Shows success message
- **Already registered** (`added: false, ok: true`): Shows info message that email is already registered
- **Error** (`ok: false`): Shows error message to try again later

