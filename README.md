# MAIA Landing Page

A simple landing page with email validation and Supabase integration for waitlist signups.

## Setup Instructions

1. **Configure Supabase**:
   - Open `app.js`
   - Replace `YOUR_SUPABASE_URL` with your Supabase project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your Supabase anonymous key

2. **Set up Supabase RPC function**:
   Make sure you have a function called `waitlist_signup` in your Supabase database that:
   - Takes a parameter `p_email` (text)
   - Returns an object with `added` (boolean) and `ok` (boolean)

3. **Run the application**:
   - Simply open `index.html` in a browser, or
   - Use a local server (e.g., `python -m http.server` or `npx serve`)

## Features

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

