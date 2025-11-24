// Initialize Supabase client
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://pbqlcshddndltrojbibd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ejxZpw66VQz9f1_v2Ewz2A_E6HB6PJQ';

console.log('[DEBUG] Initializing Supabase client...');
console.log('[DEBUG] Supabase URL:', SUPABASE_URL);
console.log('[DEBUG] Supabase Key (first 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...');

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('[DEBUG] Supabase client created:', supabase ? 'Success' : 'Failed');

// DOM elements
console.log('[DEBUG] Getting DOM elements...');
const form = document.getElementById('waitlist-form');
const emailInput = document.getElementById('email-input');
const emailError = document.getElementById('email-error');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');
const messageDiv = document.getElementById('message');

console.log('[DEBUG] DOM elements check:');
console.log('[DEBUG] - form:', form ? 'Found' : 'NOT FOUND');
console.log('[DEBUG] - emailInput:', emailInput ? 'Found' : 'NOT FOUND');
console.log('[DEBUG] - submitBtn:', submitBtn ? 'Found' : 'NOT FOUND');
console.log('[DEBUG] - messageDiv:', messageDiv ? 'Found' : 'NOT FOUND');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate email format
function validateEmail(email) {
    return emailRegex.test(email);
}

// Show error message
function showError(message) {
    emailError.textContent = message;
    emailInput.classList.add('invalid');
}

// Clear error message
function clearError() {
    emailError.textContent = '';
    emailInput.classList.remove('invalid');
}

// Show message to user
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Set loading state
function setLoading(loading) {
    if (loading) {
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
    } else {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('[DEBUG] Form submitted');
    
    const email = emailInput.value.trim();
    console.log('[DEBUG] Email entered:', email);
    
    // Clear previous errors
    clearError();
    messageDiv.style.display = 'none';
    
    // Validate email format
    if (!email) {
        console.log('[DEBUG] Validation failed: Empty email');
        showError('Please enter an email address');
        return;
    }
    
    if (!validateEmail(email)) {
        console.log('[DEBUG] Validation failed: Invalid email format');
        showError('Please enter a valid email address');
        return;
    }
    
    console.log('[DEBUG] Email validation passed');
    
    // Set loading state
    setLoading(true);
    console.log('[DEBUG] Loading state set to true');
    
    try {
        console.log('[DEBUG] Calling Supabase RPC function: waitlist_signup');
        console.log('[DEBUG] Parameters:', { p_email: email });
        
        // Call Supabase RPC function
        const { data, error } = await supabase.rpc('waitlist_signup', {
            p_email: email
        });
        
        console.log('[DEBUG] Supabase RPC call completed');
        console.log('[DEBUG] Response data:', JSON.stringify(data, null, 2));
        console.log('[DEBUG] Response error:', error);
        console.log('[DEBUG] Data is array?', Array.isArray(data));
        console.log('[DEBUG] Data length:', Array.isArray(data) ? data.length : 'N/A');
        
        if (error) {
            console.error('[DEBUG] Supabase returned an error:', error);
            console.error('[DEBUG] Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }
        
        // Handle response
        console.log('[DEBUG] Processing response data...');
        console.log('[DEBUG] Data type:', typeof data);
        console.log('[DEBUG] Is Array:', Array.isArray(data));
        console.log('[DEBUG] Data value:', data);
        
        // Check if data exists
        if (data === null || data === undefined) {
            console.error('[DEBUG] Response data is null or undefined');
            showMessage('Something went wrong. Please try again later.', 'error');
            return;
        }
        
        // Handle array response (Supabase RPC might return array)
        let responseData = data;
        if (Array.isArray(data)) {
            console.log('[DEBUG] Response is an array, length:', data.length);
            if (data.length === 0) {
                console.error('[DEBUG] Response array is empty');
                showMessage('Something went wrong. Please try again later.', 'error');
                return;
            }
            // Get first element if array
            responseData = data[0];
            console.log('[DEBUG] Using first element of array:', responseData);
        }
        
        // Check if responseData is an object
        if (typeof responseData !== 'object' || responseData === null) {
            console.error('[DEBUG] Response data is not an object:', typeof responseData);
            console.error('[DEBUG] Response data value:', responseData);
            showMessage('Something went wrong. Please try again later.', 'error');
            return;
        }
        
        // Extract values from response
        const { added, ok } = responseData;
        console.log('[DEBUG] Extracted values - added:', added, 'ok:', ok);
        console.log('[DEBUG] added type:', typeof added, 'ok type:', typeof ok);
        console.log('[DEBUG] Full responseData object:', responseData);
        
        // Check if both properties exist
        if (added === undefined || ok === undefined) {
            console.error('[DEBUG] Missing required properties in response');
            console.error('[DEBUG] Available properties:', Object.keys(responseData));
            showMessage('Something went wrong. Please try again later.', 'error');
            return;
        }
        
        if (added && ok) {
            // Success: email added to waitlist
            console.log('[DEBUG] Success: Email added to waitlist');
            showMessage('Your email has been successfully added to the waitlist!', 'success');
            emailInput.value = '';
        } else if (!added && ok) {
            // Email already registered
            console.log('[DEBUG] Info: Email already registered');
            showMessage('This email is already registered in our waitlist.', 'info');
        } else if (!ok) {
            // Something went wrong
            console.warn('[DEBUG] Warning: ok is false, added:', added);
            showMessage('Something went wrong. Please try again later.', 'error');
        } else {
            // Unexpected response structure
            console.warn('[DEBUG] Warning: Unexpected response structure');
            console.warn('[DEBUG] Full responseData object:', responseData);
            showMessage('Something went wrong. Please try again later.', 'error');
        }
        
    } catch (error) {
        console.error('[DEBUG] Exception caught in form submission');
        console.error('[DEBUG] Error type:', error?.constructor?.name);
        console.error('[DEBUG] Error message:', error?.message);
        console.error('[DEBUG] Full error object:', error);
        console.error('[DEBUG] Error stack:', error?.stack);
        
        // Show more detailed error message in console
        if (error?.message) {
            console.error('[DEBUG] Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
        }
        
        showMessage('Something went wrong. Please try again later.', 'error');
    } finally {
        console.log('[DEBUG] Setting loading state to false');
        setLoading(false);
    }
});

// Real-time email validation
emailInput.addEventListener('blur', () => {
    const email = emailInput.value.trim();
    if (email && !validateEmail(email)) {
        showError('Please enter a valid email address');
    } else {
        clearError();
    }
});

// Clear error on input
emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('invalid')) {
        clearError();
    }
});

// Debug: Log when page is fully loaded
console.log('[DEBUG] Page loaded, script initialized');
console.log('[DEBUG] Supabase library available:', typeof window.supabase !== 'undefined');

