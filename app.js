// Initialize Supabase client
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://pbqlcshddndltrojbibd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ejxZpw66VQz9f1_v2Ewz2A_E6HB6PJQ';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const form = document.getElementById('waitlist-form');
const emailInput = document.getElementById('email-input');
const emailError = document.getElementById('email-error');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');
const messageDiv = document.getElementById('message');

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
    
    const email = emailInput.value.trim();
    
    // Clear previous errors
    clearError();
    messageDiv.style.display = 'none';
    
    // Validate email format
    if (!email) {
        showError('Please enter an email address');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Set loading state
    setLoading(true);
    
    try {
        // Call Supabase RPC function
        const { data, error } = await supabase.rpc('waitlist_signup', {
            p_email: email
        });
        
        if (error) {
            throw error;
        }
        
        // Handle response
        const { added, ok } = data;
        
        if (added && ok) {
            // Success: email added to waitlist
            showMessage('Your email has been successfully added to the waitlist!', 'success');
            emailInput.value = '';
        } else if (!added && ok) {
            // Email already registered
            showMessage('This email is already registered in our waitlist.', 'info');
        } else if (!ok) {
            // Something went wrong
            showMessage('Something went wrong. Please try again later.', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('Something went wrong. Please try again later.', 'error');
    } finally {
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

