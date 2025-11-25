# Video Fix - Required Code Changes

The video isn't showing because two functions need to be updated in `app.js`.

## Fix 1: Update `waitForBackgroundImage()` function (around line 584)

**REPLACE this section:**
```javascript
    bgImage.onload = function() {
        body.classList.remove('loading');
        body.classList.add('loaded');
        // Initialize typewriter after image loads
        initTypewriter();
    };
    
    bgImage.onerror = function() {
        // If image fails to load, still show content after a delay
        setTimeout(function() {
            body.classList.remove('loading');
            body.classList.add('loaded');
            initTypewriter();
        }, 1000);
    };
```

**WITH this:**
```javascript
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
```

**ALSO add this code RIGHT AFTER this line:**
```javascript
    bgImage.src = 'Assets/img/BackgroundLandingPage.png';
```

## Fix 2: Update `transitionToVideo()` function (around line 616)

**REPLACE this:**
```javascript
    const pageContainer = document.querySelector('.page-container');
    const video = document.getElementById('placeholder-video');
    const logo = document.querySelector('.logo');
    const waitlistButton = document.getElementById('waitlist-button');
    
    // Hide the page container (landing page content)
    if (pageContainer) {
        pageContainer.style.display = 'none';
    }
    
    // Make background black
    body.style.backgroundColor = '#000';
    body.style.backgroundImage = 'none';
```

**WITH this:**
```javascript
    const videoOverlay = document.getElementById('video-overlay');
    const video = document.getElementById('placeholder-video');
    const logo = document.querySelector('.logo');
    const waitlistButton = document.getElementById('waitlist-button');
    
    // Show black background overlay (keeps original content visible underneath)
    if (videoOverlay) {
        videoOverlay.style.display = 'block';
    }
```

**ALSO change this:**
```javascript
    // Show logo (already positioned)
    if (logo) {
        logo.style.display = 'block';
    }
```

**TO this:**
```javascript
    // Show logo (already positioned, ensure it's above video)
    if (logo) {
        logo.style.display = 'block';
        logo.style.zIndex = '100';
    }
```

## Summary

After making these changes:
1. The video will load during initial page load
2. After 10 seconds (8s animation + 2s pause), `transitionToVideo()` will be called
3. A black overlay will appear on top of the original content
4. The video will play on top of the overlay
5. The original content will remain visible underneath

