# Video Fix Instructions

The video is not playing because the `waitForBackgroundImage()` function in `app.js` needs to be updated to:
1. Load the video during initial loading
2. Wait for both image and video to load
3. Call `transitionToVideo()` after 10 seconds (8s animation + 2s pause)

## What to Change

In `app.js`, find the `waitForBackgroundImage()` function (around line 584) and replace the section from `bgImage.src = ...` to the end of the function with this code:

```javascript
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
```

## What's Already Fixed

✅ Video element has `loop` attribute added
✅ CSS changed from `object-fit: cover` to `object-fit: contain` to maintain aspect ratio
✅ `transitionToVideo()` function is already in the file

## After Making the Change

Once you update the function, the video should:
1. Load during the initial page load
2. Wait for both background image and video to be ready
3. Show the landing page with typewriter animation
4. After 10 seconds, transition to fullscreen video with black background

