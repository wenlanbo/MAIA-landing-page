// Initialize Supabase client
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://pbqlcshddndltrojbibd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicWxjc2hkZG5kbHRyb2piaWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NTg0NTksImV4cCI6MjA3OTIzNDQ1OX0.LETFcKQLfOosqU6AEVx-2nOKrX7lWhd4RhMPmI1CntU';

console.log('[DEBUG] Initializing Supabase client...');
console.log('[DEBUG] Supabase URL:', SUPABASE_URL);
console.log('[DEBUG] Supabase Key (first 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...');

// Initialize Supabase client
    // Check for Supabase library on window object to avoid variable name conflicts
    let supabaseClient;
    try {
        // Check for Supabase library - only use window object to avoid variable name conflicts
        // The CDN exposes it as window.supabase
        const SupabaseLib = window.supabase;
    
    console.log('[DEBUG] Supabase library available:', !!SupabaseLib);
    console.log('[DEBUG] Supabase library type:', typeof SupabaseLib);
    
    if (SupabaseLib && SupabaseLib.createClient) {
        // Use Supabase library to create client
        supabaseClient = SupabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: false
            },
            global: {
                headers: {
                    'apikey': SUPABASE_ANON_KEY
                }
            }
        });
        console.log('[DEBUG] Using Supabase.createClient() - Success');
    } else {
        console.error('[DEBUG] Supabase library not found!');
        console.error('[DEBUG] Available globals:', Object.keys(window).filter(k => k.toLowerCase().includes('supabase')));
        console.error('[DEBUG] Window object keys (first 20):', Object.keys(window).slice(0, 20));
        throw new Error('Supabase library not loaded. Make sure the script tag loads before app.js');
    }
    
    console.log('[DEBUG] Supabase client created:', supabaseClient ? 'Success' : 'Failed');
    console.log('[DEBUG] Supabase client type:', typeof supabaseClient);
    
    // Verify the client has the expected methods
    if (supabaseClient && supabaseClient.rpc) {
        console.log('[DEBUG] Supabase client has rpc method: OK');
    } else {
        console.error('[DEBUG] Supabase client missing rpc method!');
        console.error('[DEBUG] Available methods:', Object.keys(supabaseClient || {}));
    }
    
    // Verify API key is stored in client
    if (supabaseClient) {
        console.log('[DEBUG] Client URL:', supabaseClient.supabaseUrl);
        console.log('[DEBUG] Client key exists:', !!supabaseClient.supabaseKey);
    }
} catch (error) {
    console.error('[DEBUG] Error creating Supabase client:', error);
    console.error('[DEBUG] Error stack:', error.stack);
    throw error;
}

// Export client as 'supabase' for use in the rest of the code
const supabase = supabaseClient;

// DOM elements
console.log('[DEBUG] Getting DOM elements...');
const form = document.getElementById('waitlist-form');
const nameInput = document.getElementById('name-input');
const orgInput = document.getElementById('org-input');
const emailInput = document.getElementById('email-input');
const nameError = document.getElementById('name-error');
const orgError = document.getElementById('org-error');
const emailError = document.getElementById('email-error');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');
const messageDiv = document.getElementById('message');

console.log('[DEBUG] DOM elements check:');
console.log('[DEBUG] - form:', form ? 'Found' : 'NOT FOUND');
console.log('[DEBUG] - nameInput:', nameInput ? 'Found' : 'NOT FOUND');
console.log('[DEBUG] - orgInput:', orgInput ? 'Found' : 'NOT FOUND');
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
function showError(message, field) {
    if (field === 'name') {
        nameError.textContent = message;
        nameInput.classList.add('invalid');
    } else if (field === 'org') {
        orgError.textContent = message;
        orgInput.classList.add('invalid');
    } else if (field === 'email') {
        emailError.textContent = message;
        emailInput.classList.add('invalid');
    }
}

// Clear error message
function clearError(field) {
    if (field === 'name') {
        nameError.textContent = '';
        nameInput.classList.remove('invalid');
    } else if (field === 'org') {
        orgError.textContent = '';
        orgInput.classList.remove('invalid');
    } else if (field === 'email') {
        emailError.textContent = '';
        emailInput.classList.remove('invalid');
    } else {
        // Clear all errors
        nameError.textContent = '';
        orgError.textContent = '';
        emailError.textContent = '';
        nameInput.classList.remove('invalid');
        orgInput.classList.remove('invalid');
        emailInput.classList.remove('invalid');
    }
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
    
    const name = nameInput.value.trim();
    const org = orgInput.value.trim();
    const email = emailInput.value.trim();
    
    console.log('[DEBUG] Form data:', { name, org, email });
    
    // Clear previous errors
    clearError();
    messageDiv.style.display = 'none';
    
    // Validate all fields
    let hasError = false;
    
    if (!name) {
        console.log('[DEBUG] Validation failed: Empty name');
        showError('Please enter your name', 'name');
        hasError = true;
    }
    
    if (!org) {
        console.log('[DEBUG] Validation failed: Empty organization');
        showError('Please enter your organization', 'org');
        hasError = true;
    }
    
    if (!email) {
        console.log('[DEBUG] Validation failed: Empty email');
        showError('Please enter an email address', 'email');
        hasError = true;
    } else if (!validateEmail(email)) {
        console.log('[DEBUG] Validation failed: Invalid email format');
        showError('Please enter a valid email address', 'email');
        hasError = true;
    }
    
    if (hasError) {
        return;
    }
    
    console.log('[DEBUG] All validations passed');
    
    // Set loading state
    setLoading(true);
    console.log('[DEBUG] Loading state set to true');
    
    try {
        console.log('[DEBUG] Calling Supabase RPC function: waitlist_signup');
        console.log('[DEBUG] Parameters:', { p_name: name, p_org: org, p_email: email });
        console.log('[DEBUG] Supabase client URL:', supabase?.supabaseUrl);
        console.log('[DEBUG] Supabase client key exists:', !!supabase?.supabaseKey);
        console.log('[DEBUG] Supabase client key (first 20 chars):', supabase?.supabaseKey?.substring(0, 20) || 'NOT FOUND');
        
        // Verify client is properly initialized
        if (!supabase || !supabase.rpc) {
            throw new Error('Supabase client not properly initialized');
        }
        
        // Call Supabase RPC function
        console.log('[DEBUG] Making RPC call to waitlist_signup...');
        console.log('[DEBUG] Full request details:', {
            function: 'waitlist_signup',
            params: { p_name: name, p_org: org, p_email: email },
            url: supabase?.supabaseUrl,
            hasKey: !!supabase?.supabaseKey
        });
        
        // Make the RPC call
        const rpcResponse = await supabase.rpc('waitlist_signup', {
            p_name: name,
            p_org: org,
            p_email: email
        });
        
        const { data, error } = rpcResponse;
        
        console.log('[DEBUG] ===== RPC CALL RESPONSE =====');
        console.log('[DEBUG] Full response object:', rpcResponse);
        console.log('[DEBUG] Response data:', data);
        console.log('[DEBUG] Response data (stringified):', JSON.stringify(data, null, 2));
        console.log('[DEBUG] Response error:', error);
        console.log('[DEBUG] Data type:', typeof data);
        console.log('[DEBUG] Data is array?', Array.isArray(data));
        console.log('[DEBUG] Data length:', Array.isArray(data) ? data.length : 'N/A');
        console.log('[DEBUG] Data is null?', data === null);
        console.log('[DEBUG] Data is undefined?', data === undefined);
        
        // Check for network/HTTP errors
        if (error) {
            console.error('[DEBUG] ===== ERROR DETAILS =====');
            console.error('[DEBUG] Error object:', error);
            console.error('[DEBUG] Error message:', error.message);
            console.error('[DEBUG] Error code:', error.code);
            console.error('[DEBUG] Error details:', error.details);
            console.error('[DEBUG] Error hint:', error.hint);
            
            // Check if it's a function not found error
            if (error.message && error.message.includes('function') && error.message.includes('does not exist')) {
                console.error('[DEBUG] DIAGNOSIS: Function does not exist in database');
                console.error('[DEBUG] SOLUTION: Create the waitlist_signup function in Supabase SQL Editor');
            }
            
            // Check if it's a permission error
            if (error.code === '42501' || (error.message && error.message.includes('permission'))) {
                console.error('[DEBUG] DIAGNOSIS: Permission denied');
                console.error('[DEBUG] SOLUTION: Grant EXECUTE permission: GRANT EXECUTE ON FUNCTION waitlist_signup(text, text, text) TO anon;');
            }
        } else if (data === null || (Array.isArray(data) && data.length === 0)) {
            console.warn('[DEBUG] ===== EMPTY RESPONSE DIAGNOSIS =====');
            console.warn('[DEBUG] The function was called successfully but returned empty/null');
            console.warn('[DEBUG] Possible causes:');
            console.warn('[DEBUG] 1. Function exists but returns NULL');
            console.warn('[DEBUG] 2. Function returns TABLE but query returns no rows');
            console.warn('[DEBUG] 3. Function logic has an error and doesn\'t return anything');
            console.warn('[DEBUG] 4. Function doesn\'t actually insert data (check function code)');
            console.warn('[DEBUG] SOLUTION: Check your Supabase function code - it should RETURN a row with added and ok columns');
        }
        
        if (error) {
            console.error('[DEBUG] Supabase returned an error:', error);
            console.error('[DEBUG] Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            
            // Provide user-friendly error messages based on error code
            if (error.code === '42883') {
                showMessage('Function not found. Please check Supabase setup.', 'error');
            } else if (error.code === '42501') {
                showMessage('Permission denied. Please check Supabase permissions.', 'error');
            } else if (error.code === 'PGRST301') {
                showMessage('Function not available. Please check Supabase API configuration.', 'error');
            } else {
                showMessage(`Error: ${error.message || 'Something went wrong. Please try again later.'}`, 'error');
            }
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
        
        // Handle table/array response (Supabase RPC returns TABLE as array)
        let responseData = data;
        if (Array.isArray(data)) {
            console.log('[DEBUG] Response is an array (table), length:', data.length);
            if (data.length === 0) {
                console.error('[DEBUG] ===== EMPTY ARRAY RESPONSE =====');
                console.error('[DEBUG] Function returned empty array - no rows returned');
                console.error('[DEBUG] This means the function executed but returned no data');
                console.error('[DEBUG] CHECK YOUR SUPABASE FUNCTION:');
                console.error('[DEBUG] 1. Does it have a RETURN statement?');
                console.error('[DEBUG] 2. Does it actually insert the email?');
                console.error('[DEBUG] 3. Does it return a row with {added: bool, ok: bool}?');
                console.error('[DEBUG] 4. Check function permissions and table permissions');
                showMessage('Function returned empty result. Check Supabase function code and database permissions.', 'error');
                return;
            }
            // Get first element if array (table returns array of rows)
            responseData = data[0];
            console.log('[DEBUG] Using first row from table:', responseData);
        } else if (data === null) {
            console.error('[DEBUG] ===== NULL RESPONSE =====');
            console.error('[DEBUG] Function returned NULL');
            console.error('[DEBUG] CHECK YOUR SUPABASE FUNCTION:');
            console.error('[DEBUG] 1. Function must RETURN a value (not just execute)');
            console.error('[DEBUG] 2. If using TABLE return type, it must RETURN QUERY SELECT ...');
            console.error('[DEBUG] 3. If using JSON return type, it must RETURN json_build_object(...)');
            showMessage('Function returned null. Check Supabase function return statement.', 'error');
            return;
        }
        
        // Check if responseData is an object
        if (typeof responseData !== 'object' || responseData === null) {
            console.error('[DEBUG] Response data is not an object:', typeof responseData);
            console.error('[DEBUG] Response data value:', responseData);
            showMessage('Something went wrong. Please try again later.', 'error');
            return;
        }
        
        // Extract values from response (table row should have 'added' and 'ok' columns)
        const { added, ok } = responseData;
        console.log('[DEBUG] Extracted values - added:', added, 'ok:', ok);
        console.log('[DEBUG] added type:', typeof added, 'ok type:', typeof ok);
        console.log('[DEBUG] Full responseData object:', responseData);
        console.log('[DEBUG] All available columns/keys:', Object.keys(responseData));
        
        // Check if both properties exist
        if (added === undefined || ok === undefined) {
            console.error('[DEBUG] Missing required properties in response');
            console.error('[DEBUG] Available properties:', Object.keys(responseData));
            console.error('[DEBUG] Expected: added (boolean) and ok (boolean)');
            showMessage('Something went wrong. Please try again later.', 'error');
            return;
        }
        
        if (added && ok) {
            // Success: email added to waitlist
            console.log('[DEBUG] Success: Email added to waitlist');
            showMessage('Your information has been successfully added to the waitlist!', 'success');
            // Clear all form fields
            nameInput.value = '';
            orgInput.value = '';
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

// Real-time validation
nameInput.addEventListener('blur', () => {
    const name = nameInput.value.trim();
    if (!name) {
        showError('Please enter your name', 'name');
    } else {
        clearError('name');
    }
});

orgInput.addEventListener('blur', () => {
    const org = orgInput.value.trim();
    if (!org) {
        showError('Please enter your organization', 'org');
    } else {
        clearError('org');
    }
});

emailInput.addEventListener('blur', () => {
    const email = emailInput.value.trim();
    if (email && !validateEmail(email)) {
        showError('Please enter a valid email address', 'email');
    } else {
        clearError('email');
    }
});

// Clear error on input
nameInput.addEventListener('input', () => {
    if (nameInput.classList.contains('invalid')) {
        clearError('name');
    }
});

orgInput.addEventListener('input', () => {
    if (orgInput.classList.contains('invalid')) {
        clearError('org');
    }
});

emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('invalid')) {
        clearError('email');
    }
});

// Debug: Log when page is fully loaded
console.log('[DEBUG] Page loaded, script initialized');
console.log('[DEBUG] Supabase library available:', typeof window.supabase !== 'undefined');

// Typewriter Animation
const typewriterTexts = [
    "Segment the tumor",
    "What's the recommended trajectory?",
    "Show me the exact location of the lesion",
    "Where is this structure relative to landmarks?"    
];

const opacityValues = [1.0, 0.5, 0.3, 0.2]; // 100%, 50%, 30%, 20% from bottom to top

function initTypewriter() {
    const container = document.getElementById('typewriter-container');
    if (!container) return;
    
    let currentTextIndex = 0; // Index in typewriterTexts array (cycles through)
    let currentCharIndex = 0;
    const lines = []; // Array of DOM elements: [0]=top, [1]=second, [2]=third, [3]=bottom (container 0)
    
    // Pre-create 4 empty line containers
    // With column-reverse, we need to prepend so they appear in correct order
    // lines[0] = container 3 (top, appears at top visually)
    // lines[1] = container 2
    // lines[2] = container 1
    // lines[3] = container 0 (bottom, appears at bottom visually, where typing happens)
    for (let i = 0; i < 4; i++) {
        const line = document.createElement('div');
        line.className = 'typewriter-line';
        line.style.opacity = '0';
        line.textContent = '';
        // Prepend so with column-reverse they appear in order 0,1,2,3 from bottom to top
        container.insertBefore(line, container.firstChild);
        lines.push(line);
    }
    
    function typeNextChar() {
        // Container 0 (bottom) is always lines[3] - this is where typing happens
        const container0 = lines[3];
        const currentText = typewriterTexts[currentTextIndex];
        
        if (currentCharIndex < currentText.length) {
            // Type next character in container 0 (bottom)
            container0.textContent = currentText.substring(0, currentCharIndex + 1);
            // Update opacities for all containers immediately
            updateOpacities();
            currentCharIndex++;
            
            // Continue typing this line
            setTimeout(typeNextChar, 50); // 50ms delay between characters
        } else {
            // Line is complete in container 0 (lines[3], bottom visually)
            // Shift all texts up visually from bottom to top
            // With column-reverse: lines[3]=bottom, lines[2]=second, lines[1]=third, lines[0]=top
            // To move up: bottom→second, second→third, third→top, top clears
            const textFromBottom = container0.textContent; // Save text from bottom (lines[3])
            const textFromSecond = lines[2].textContent; // Save text from second (lines[2])
            const textFromThird = lines[1].textContent; // Save text from third (lines[1])
            
            // Shift up in order: bottom→second, second→third, third→top, top clears
            lines[2].textContent = textFromBottom; // bottom → second
            lines[1].textContent = textFromSecond; // second → third
            lines[0].textContent = textFromThird; // third → top
            lines[3].textContent = ''; // clear bottom for new text
            
            // Update opacities immediately
            updateOpacities();
            
            // Move to next text in cycle
            currentTextIndex = (currentTextIndex + 1) % typewriterTexts.length;
            currentCharIndex = 0;
            
            // Start typing next line immediately
            setTimeout(typeNextChar, 100); // Small delay before starting next line
        }
    }
    
    function updateOpacities() {
        // Update opacities for all containers
        // Container 0 (bottom, lines[3]) = 100%, Container 1 (lines[2]) = 50%, Container 2 (lines[1]) = 30%, Container 3 (lines[0]) = 20%
        // Position from bottom: 0 = bottom (container 0), 1 = container 1, 2 = container 2, 3 = container 3 (top)
        
        // Count visible lines (lines with text) from bottom to top
        const visibleLines = [];
        for (let i = 3; i >= 0; i--) {
            if (lines[i].textContent.trim() !== '') {
                visibleLines.push(i);
            }
        }
        
        for (let i = 0; i < 4; i++) {
            const line = lines[i];
            const hasText = line.textContent.trim() !== '';
            
            if (hasText) {
                // Show the line
                line.classList.remove('hidden');
                line.style.display = 'flex';
                
                // Find position from bottom (0 = bottom, 1 = second, etc.)
                const positionFromBottom = visibleLines.indexOf(i);
                
                if (positionFromBottom < opacityValues.length) {
                    line.style.opacity = opacityValues[positionFromBottom].toString();
                } else {
                    line.style.opacity = opacityValues[opacityValues.length - 1].toString();
                }
            } else {
                // Hide empty lines
                line.classList.add('hidden');
                line.style.opacity = '0';
            }
        }
    }
    
    // Start the animation
    typeNextChar();
}

// Wait for background image to load before showing content
function waitForBackgroundImage() {
    const body = document.body;
    body.classList.add('loading');
    
    const bgImage = new Image();
    bgImage.src = 'Assets/img/BackgroundLandingPage.png';
    
    // Load video (but don't play it yet)
    const video = document.getElementById('placeholder-video');
    let videoLoaded = false;
    let imageLoaded = false;
    
    function checkBothLoaded() {
        if (videoLoaded && imageLoaded) {
            body.classList.remove('loading');
            body.classList.add('loaded');
            // Initialize typewriter after both load
            initTypewriter();
            // After 8 seconds (loading animation) + 2 seconds pause, transition to video
            setTimeout(transitionToVideo, 10000);
        }
    }
    
    bgImage.onload = function() {
        imageLoaded = true;
        checkBothLoaded();
    };
    
    bgImage.onerror = function() {
        // If image fails to load, still proceed
        imageLoaded = true;
        checkBothLoaded();
    };
    
    if (video) {
        video.load(); // Start loading the video
        video.addEventListener('loadeddata', function() {
            videoLoaded = true;
            checkBothLoaded();
        }, { once: true });
        video.addEventListener('error', function() {
            // If video fails to load, still proceed
            videoLoaded = true;
            checkBothLoaded();
        }, { once: true });
    } else {
        // If video element doesn't exist, proceed without it
        videoLoaded = true;
        checkBothLoaded();
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForBackgroundImage);
} else {
    waitForBackgroundImage();
}

// Transition to video mode: black background, play video, show logo and button
function transitionToVideo() {
    const body = document.body;
    const videoOverlay = document.getElementById('video-overlay');
    const video = document.getElementById('placeholder-video');
    const logo = document.querySelector('.logo');
    const waitlistButton = document.getElementById('waitlist-button');
    
    // Add video mode class to body for CSS styling (triggers fade-in)
    body.classList.add('video-mode');
    
    // Show black background overlay (keeps original content visible underneath)
    if (videoOverlay) {
        videoOverlay.style.display = 'block';
        // Trigger fade-in by forcing reflow, then setting opacity
        videoOverlay.offsetHeight; // Force reflow
        videoOverlay.style.opacity = '1';
    }
    
    // Show and play video on top of original content
    if (video) {
        video.style.display = 'block';
        // Trigger fade-in by forcing reflow, then setting opacity
        video.offsetHeight; // Force reflow
        video.style.opacity = '1';
        video.play().catch(function(error) {
            console.error('Error playing video:', error);
        });
    }
    
    // Show logo (already positioned, z-index set in CSS to be above everything)
    if (logo) {
        logo.style.display = 'block';
    }
    
    // Show waitlist button
    if (waitlistButton) {
        waitlistButton.style.display = 'block';
    }
    
    // After 15 seconds of video playing, show the content overlay
    if (video) {
        let overlayShown = false;
        let overlayTimeout = null;
        video.addEventListener('timeupdate', function() {
            if (!overlayShown && video.currentTime >= 15) {
                overlayShown = true;
                const videoContentOverlay = document.getElementById('video-content-overlay');
                const videoWaitlistButton = document.getElementById('video-waitlist-button');
                
                if (videoContentOverlay) {
                    videoContentOverlay.style.display = 'flex';
                    // Use requestAnimationFrame to ensure display change is rendered before opacity transition
                    requestAnimationFrame(function() {
                        videoContentOverlay.classList.add('show');
                    });
                    
                    // Set timeout to fade out overlay after 5 seconds if button not clicked
                    overlayTimeout = setTimeout(function() {
                        if (videoContentOverlay.classList.contains('show')) {
                            videoContentOverlay.classList.remove('show');
                            // Remove overlay from display after fade out completes
                            setTimeout(function() {
                                videoContentOverlay.style.display = 'none';
                            }, 800); // Match the 0.8s transition duration
                        }
                    }, 5000);
                    
                    // If button is clicked, cancel the auto-fade timeout
                    if (videoWaitlistButton) {
                        videoWaitlistButton.addEventListener('click', function() {
                            if (overlayTimeout) {
                                clearTimeout(overlayTimeout);
                                overlayTimeout = null;
                            }
                        }, { once: true });
                    }
                }
            }
        });
    }
}


