document.addEventListener('DOMContentLoaded', () => {
    initSmoothScrolling();
    initActiveNavHighlighting();
    initScrollAnimations();
    initHamburgerMenu();
    initTypingAnimation();

    // Initialize Hero Particles
    if (document.getElementById('hero-particles-canvas')) {
        initHeroParticles('hero-particles-canvas');
    }

    // Initialize Background Reaction Animation
    if (document.getElementById('background-reaction-canvas')) {
        initBackgroundReactionAnimation('background-reaction-canvas');
    }

    // Initialize Social Web Animation
    if (document.getElementById('social-web-svg')) {
        initSocialWeb('social-web-svg');
    }

    // Initialize Experience Slideshow
    initExperienceSlideshow();
});

// -------------------- SMOOTH SCROLLING --------------------
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('header nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                // Close hamburger menu on click if open
                const nav = document.querySelector('header nav ul');
                const menuToggle = document.querySelector('.menu-toggle');
                if (nav && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            }
        });
    });
}

// -------------------- ACTIVE NAV LINK HIGHLIGHTING --------------------
function initActiveNavHighlighting() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('header nav a');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 100) // Adjusted offset
                currentSectionId = section.getAttribute('id');
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
        // Highlight first link if at top
        if (sections.length > 0 && pageYOffset < sections[0].offsetTop - 100 && navLinks.length > 0) {
             navLinks.forEach(link => link.classList.remove('active'));
             if(navLinks[0].getAttribute('href').startsWith('#')) navLinks[0].classList.add('active');
        }
    });
}

// -------------------- SCROLL-TRIGGERED ANIMATIONS (Intersection Observer) --------------------
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries, observerInstance) => { // Renamed observer to observerInstance to avoid conflict
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // If the experience slideshow container becomes visible, initialize it
                if (entry.target.classList.contains('experience-slideshow-container')) {
                    if (!entry.target.dataset.slideshowInitialized) {
                        // console.log('Initializing experience slideshow via IntersectionObserver');
                        initExperienceSlideshow(); 
                        entry.target.dataset.slideshowInitialized = 'true';
                        // observerInstance.unobserve(entry.target); // Optionally unobserve if it only needs to init once
                    }
                }
                // observerInstance.unobserve(entry.target); // Original unobserve, decide if still needed for all elements
            } else {
                // Optional: Remove 'visible' class if element scrolls out of view and you want animations to re-trigger
                // entry.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

    document.querySelectorAll('.timeline-item, .project-card, .skill-category, .award-item, .connect .form-group, .connect button[type=\"submit\"], .connect .social-icons-container, section > .container > h2, .about-content > p, .about-content > h3, .experience-slideshow-container').forEach(el => {
        observer.observe(el);
    });
}

// Experience Slideshow Logic
function initExperienceSlideshow() {
    console.log('Attempting to initialize Experience Slideshow...');
    const slideshowContainer = document.querySelector('.experience-slideshow-container');
    if (!slideshowContainer) {
        console.error('Experience slideshow container NOT FOUND.');
        return;
    }
    console.log('Slideshow container found:', slideshowContainer);

    // This check is important if initScrollAnimations is the primary entry point.
    // If the container is not yet visible (styled by CSS or not yet in DOM fully), offsetWidth might be 0.
    if (!slideshowContainer.classList.contains('visible')) {
        console.log('Slideshow container is not yet visible. Deferring full init until IntersectionObserver makes it visible.');
        // We rely on IntersectionObserver to call this function again when '.visible' is added.
        // However, the initial DOMContentLoaded call might still proceed if not guarded.
        // Let's ensure it doesn't fully initialize if not visible.
        return; 
    }
    
    if (slideshowContainer.dataset.slideshowInitialized === 'true') {
        console.log('Slideshow already marked as initialized. Skipping re-initialization unless forced.');
        // Potentially add logic here if re-initialization under certain conditions is needed.
        // For now, if it's marked and visible, assume it's working or another logic path handles it.
        // return; // This might prevent re-init on resize if not handled carefully.
    }


    const slideshowWrapper = slideshowContainer.querySelector('.slideshow-wrapper');
    const track = slideshowContainer.querySelector('.experience-grid');
    const nextButton = slideshowContainer.querySelector('.next-btn');
    const prevButton = slideshowContainer.querySelector('.prev-btn');

    if (!slideshowWrapper) console.error('Slideshow WRAPPER not found.');
    if (!track) console.error('Slideshow TRACK (experience-grid) not found.');
    if (!nextButton) console.warn('Slideshow NEXT button not found.');
    if (!prevButton) console.warn('Slideshow PREV button not found.');

    if (!slideshowWrapper || !track) {
        console.error('Critical slideshow elements (wrapper or track) missing. Aborting init.');
        if(nextButton) nextButton.style.display = 'none';
        if(prevButton) prevButton.style.display = 'none';
        return;
    }
    console.log('Slideshow wrapper and track found.');

    const items = Array.from(track.querySelectorAll('.experience-item'));
    console.log(`Found ${items.length} experience items.`);
    if (items.length === 0) {
        console.warn('No experience items found for the slideshow.');
        if(nextButton) nextButton.style.display = 'none';
        if(prevButton) prevButton.style.display = 'none';
        return;
    }

    let itemsPerSlide = 2;
    // Update itemsPerSlide based on screen width
    if (window.innerWidth <= 768) {
        itemsPerSlide = 1;
    }

    let currentIndex = 0;
    const totalSlides = Math.ceil(items.length / itemsPerSlide);
    console.log(`Items per slide: ${itemsPerSlide}, Total slides: ${totalSlides}`);
    let autoSlideInterval;
    const autoSlideDelay = 7000;

    // Hide buttons initially, show them if totalSlides > 1
    if(nextButton) nextButton.style.display = 'none';
    if(prevButton) prevButton.style.display = 'none';

    function updateSlideshow(reason = "general update") {
        console.log(`updateSlideshow called. Reason: ${reason}. Current index: ${currentIndex}`);
        if (!slideshowWrapper) {
            console.error("slideshowWrapper is null in updateSlideshow. Aborting.");
            return;
        }
        const slideWidth = slideshowWrapper.offsetWidth;
        console.log(`Slideshow wrapper offsetWidth: ${slideWidth}`);

        if (slideWidth === 0) {
            console.warn('Slideshow wrapper has 0 width during update. Retrying with rAF.');
            requestAnimationFrame(() => updateSlideshow("retry after 0 width"));
            return;
        }

        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        console.log(`Track transform: translateX(-${currentIndex * slideWidth}px)`);

        items.forEach((item, index) => {
            const itemSlideIndex = Math.floor(index / itemsPerSlide);
            if (itemSlideIndex === currentIndex) {
                item.classList.add('slide-active');
                const itemIndexInSlide = index % itemsPerSlide;
                item.style.transitionDelay = `${itemIndexInSlide * 0.15}s`;
                // console.log(`Item ${index} (in slide ${currentIndex}) is ACTIVE. Delay: ${item.style.transitionDelay}`);
            } else {
                item.classList.remove('slide-active');
                item.style.transitionDelay = '0s';
                // console.log(`Item ${index} (in slide ${itemSlideIndex}) is INACTIVE.`);
            }
        });
        console.log('Finished updating item active states and delays.');
    }

    function showNextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlideshow("next slide");
    }

    function showPrevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlideshow("prev slide");
    }

    function startAutoSlide() {
        stopAutoSlide(); 
        if (totalSlides > 1) { 
            console.log(`Starting auto-slide. Delay: ${autoSlideDelay}ms`);
            autoSlideInterval = setInterval(showNextSlide, autoSlideDelay);
        } else {
            console.log('Auto-slide not started: totalSlides <= 1.');
        }
    }

    function stopAutoSlide() {
        // console.log('Stopping auto-slide.');
        clearInterval(autoSlideInterval);
    }

    if (totalSlides <= 1) {
        console.log('Total slides <= 1. Hiding nav buttons and disabling auto-slide.');
        if (items.length > 0) { // If there's at least one item, make it active
            requestAnimationFrame(() => updateSlideshow("single slide setup"));
        }
    } else {
        console.log('Multiple slides detected. Setting up navigation and auto-slide.');
        if(nextButton) nextButton.style.display = 'flex';
        if(prevButton) prevButton.style.display = 'flex';

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                console.log('Next button clicked.');
                showNextSlide();
                stopAutoSlide(); // Stop auto-slide on manual interaction
                // Optionally restart auto-slide after a delay if desired
                // setTimeout(startAutoSlide, autoSlideDelay * 2); 
            });
        }
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                console.log('Previous button clicked.');
                showPrevSlide();
                stopAutoSlide(); // Stop auto-slide on manual interaction
                // setTimeout(startAutoSlide, autoSlideDelay * 2);
            });
        }
        slideshowContainer.addEventListener('mouseenter', () => {
            // console.log('Mouse entered slideshow. Stopping auto-slide.');
            stopAutoSlide();
        });
        slideshowContainer.addEventListener('mouseleave', () => {
            // console.log('Mouse left slideshow. Starting auto-slide.');
            startAutoSlide();
        });
        startAutoSlide();
    }
    
    // Initial call to set up the first slide.
    // Using requestAnimationFrame to ensure dimensions are calculated after any final browser rendering.
    console.log('Requesting initial updateSlideshow via rAF.');
    requestAnimationFrame(() => updateSlideshow("initial setup"));

    window.addEventListener('resize', () => {
        console.log('Window resize detected for slideshow.');
        stopAutoSlide();
        
        // Update itemsPerSlide on resize
        if (window.innerWidth <= 768) {
            itemsPerSlide = 1;
        } else {
            itemsPerSlide = 2;
        }
        // Recalculate totalSlides as itemsPerSlide might have changed
        const newTotalSlides = Math.ceil(items.length / itemsPerSlide);
        // If current index is out of bounds due to change in totalSlides, reset it
        if (currentIndex >= newTotalSlides) {
            currentIndex = Math.max(0, newTotalSlides - 1);
        }

        requestAnimationFrame(() => {
            console.log('Updating slideshow due to resize (after rAF).');
            updateSlideshow("resize"); 
            if (totalSlides > 1) { // Use the original totalSlides for this check or re-evaluate logic
                startAutoSlide();
            }
        });
    });

    slideshowContainer.dataset.slideshowInitialized = 'true';
    console.log('Experience slideshow initialization process COMPLETED.');
}

// -------------------- HAMBURGER MENU --------------------
function initHamburgerMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('header nav ul'); // Assuming nav is 'header nav ul'

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active'); // For styling the toggle button itself
        });
    }
}

// -------------------- TYPING ANIMATION --------------------
function initTypingAnimation() {
    const typedTextElement = document.getElementById('typed-subtitle'); // Ensure this ID exists in HTML
    if (!typedTextElement) return;

    const phrases = JSON.parse(typedTextElement.dataset.phrases || '["Physicist.", "Researcher.", "Developer.", "Innovator."]');
    let phraseIndex = 0;
    let letterIndex = 0;
    let currentPhrase = '';
    let isDeleting = false;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const delayBetweenPhrases = 1500;

    function type() {
        currentPhrase = phrases[phraseIndex];
        if (isDeleting) {
            letterIndex--;
        } else {
            letterIndex++;
        }

        typedTextElement.textContent = currentPhrase.substring(0, letterIndex);

        if (!isDeleting && letterIndex === currentPhrase.length) {
            isDeleting = true;
            setTimeout(type, delayBetweenPhrases);
        } else if (isDeleting && letterIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(type, typingSpeed);
        } else {
            setTimeout(type, isDeleting ? deletingSpeed : typingSpeed);
        }
    }
    type();
}

// -------------------- HERO PARTICLES ANIMATION --------------------
function initHeroParticles(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particlesArray;
    let mouse = { x: null, y: null, radius: 80 }; // Mouse interaction radius

    window.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function setCanvasSize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    setCanvasSize();

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.originX = x; // Store origin for return effect
            this.originY = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
            this.density = (Math.random() * 30) + 10; // For mouse interaction force
            this.baseAlpha = parseFloat(this.color.split(',')[3]); // Get alpha from rgba
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            // Create a radial gradient for a glowing effect
            const gradient = ctx.createRadialGradient(this.x, this.y, this.size * 0.1, this.x, this.y, this.size * 1.2);
            gradient.addColorStop(0, this.color.replace(/[^,]+(?=\))/, '1)')); // Inner part full opacity
            gradient.addColorStop(0.8, this.color); // Original color
            gradient.addColorStop(1, this.color.replace(/[^,]+(?=\))/, '0)')); // Outer part transparent

            ctx.fillStyle = gradient;
            ctx.fill();
        }
        update() {
            // Mouse interaction
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance; // Normalized force
                
                if (distance < mouse.radius) {
                    this.x -= forceDirectionX * force * this.density * 0.08; // Push away
                    this.y -= forceDirectionY * force * this.density * 0.08;
                } else {
                    // Return to origin if not already there
                    if (this.x !== this.originX) {
                        let dxo = this.originX - this.x;
                        this.x += dxo * 0.02; // Slow return
                    }
                    if (this.y !== this.originY) {
                        let dyo = this.originY - this.y;
                        this.y += dyo * 0.02;
                    }
                }
            } else {
                 // Return to origin if mouse is out
                if (this.x !== this.originX) this.x += (this.originX - this.x) * 0.02;
                if (this.y !== this.originY) this.y += (this.originY - this.y) * 0.02;
            }


            // Wall collision
            if (this.x + this.size > canvas.width || this.x - this.size < 0) {
                this.directionX = -this.directionX;
                // Snap back to origin if stuck outside
                if(this.x + this.size > canvas.width) this.x = canvas.width - this.size;
                if(this.x - this.size < 0) this.x = this.size;
            }
            if (this.y + this.size > canvas.height || this.y - this.size < 0) {
                this.directionY = -this.directionY;
                if(this.y + this.size > canvas.height) this.y = canvas.height - this.size;
                if(this.y - this.size < 0) this.y = this.size;
            }

            // Only apply original movement if not strongly affected by mouse or returning
            if (mouse.x === null || Math.sqrt(Math.pow(mouse.x - this.x, 2) + Math.pow(mouse.y - this.y, 2)) > mouse.radius * 1.5) {
                 this.x += this.directionX * 0.3; // Slower base movement
                 this.y += this.directionY * 0.3;
            }
            
            this.draw();
        }
    }

    function initParticles() {
        particlesArray = [];
        const numberOfParticles = Math.min(100, (canvas.height * canvas.width) / 10000); // Adjusted density
        for (let i = 0; i < numberOfParticles; i++) {
            const size = (Math.random() * 2.5) + 1; // Slightly larger max size
            const x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
            const y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
            const directionX = (Math.random() * 0.6) - 0.3; // Slightly faster base random movement
            const directionY = (Math.random() * 0.6) - 0.3;
            const color = 'rgba(0, 180, 255, ' + (Math.random() * 0.4 + 0.3) + ')'; // Cyan particles, varying alpha
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    function connectParticles() {
        let opacityValue;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a + 1; b < particlesArray.length; b++) { // Start b from a + 1
                const distance = Math.sqrt(
                    Math.pow(particlesArray[a].x - particlesArray[b].x, 2) +
                    Math.pow(particlesArray[a].y - particlesArray[b].y, 2)
                );
                const connectionRadius = Math.min(canvas.width, canvas.height) / 6; // Dynamic radius

                if (distance < connectionRadius) {
                    opacityValue = 1 - (distance / connectionRadius);
                    ctx.strokeStyle = `rgba(0, 180, 255, ${opacityValue * 0.5})`; // Lighter cyan lines, more transparent
                    ctx.lineWidth = Math.max(0.1, opacityValue * 1.5); // Thinner, dynamic lines
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    function animateParticles() {
        requestAnimationFrame(animateParticles);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
    }

    initParticles();
    animateParticles();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            setCanvasSize();
            initParticles(); 
        }, 250);
    });
}


// -------------------- BACKGROUND REACTION ANIMATION --------------------
function initBackgroundReactionAnimation(canvasId) {
    const canvas = document.getElementById(canvasId); // Ensure this ID exists
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let reactionParticles;
    // let hue = 0; // Removed hue cycling for a more monochromatic theme

    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    setCanvasSize();

    class ReactionParticle {
        constructor(x, y) {
            this.x = x || Math.random() * canvas.width;
            this.y = y || Math.random() * canvas.height;
            this.size = Math.random() * 3.5 + 0.5; // Range: 0.5 to 4
            this.speedX = Math.random() * 1.0 - 0.5; // Slower speeds: -0.5 to 0.5
            this.speedY = Math.random() * 1.0 - 0.5;
            const alpha = Math.random() * 0.35 + 0.05; // Opacity between 0.05 and 0.4
            this.color = `rgba(0, 170, 255, ${alpha})`; // Shades of cyan/light blue
            this.life = 0;
            this.maxLife = Math.random() * 150 + 80; // Longer life: 80 to 230 frames
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.size *= 0.985; // Shrink a bit slower for longer visibility
            this.life++;

            if (this.size < 0.1 || this.life > this.maxLife) { // Reset particle when too small or life ended
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3.5 + 0.5;
                this.speedX = Math.random() * 1.0 - 0.5;
                this.speedY = Math.random() * 1.0 - 0.5;
                const alpha = Math.random() * 0.35 + 0.05;
                this.color = `rgba(0, 170, 255, ${alpha})`;
                this.life = 0;
            }

            // Boundary check
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initReactionParticles() {
        reactionParticles = [];
        const particleCount = Math.min(60, (canvas.width * canvas.height) / 18000); // Further reduced particle count
        for (let i = 0; i < particleCount; i++) {
            reactionParticles.push(new ReactionParticle());
        }
    }

    function handleReactionParticles() {
        for (let i = 0; i < reactionParticles.length; i++) {
            reactionParticles[i].update();
            reactionParticles[i].draw();

            for (let j = i + 1; j < reactionParticles.length; j++) {
                const dx = reactionParticles[i].x - reactionParticles[j].x;
                const dy = reactionParticles[i].y - reactionParticles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) { // Connect if close
                    ctx.beginPath();
                    ctx.strokeStyle = reactionParticles[i].color;
                    ctx.lineWidth = reactionParticles[i].size / 10;
                    ctx.moveTo(reactionParticles[i].x, reactionParticles[i].y);
                    ctx.lineTo(reactionParticles[j].x, reactionParticles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateReaction() {
        ctx.fillStyle = 'rgba(3, 0, 28, 0.12)'; // Adjusted alpha for clearing, makes trails smoother
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        handleReactionParticles();
        // hue = (hue + 0.5) % 360; // Removed hue cycling
        requestAnimationFrame(animateReaction);
    }

    initReactionParticles();
    animateReaction();

    window.addEventListener('resize', () => {
        setCanvasSize();
        initReactionParticles();
    });
}

// -------------------- EXPERIENCE SLIDESHOW --------------------
function initExperienceSlideshow() {
    console.log('Attempting to initialize Experience Slideshow...');
    const slideshowContainer = document.querySelector('.experience-slideshow-container');
    if (!slideshowContainer) {
        console.error('Experience slideshow container NOT FOUND.');
        return;
    }
    console.log('Slideshow container found:', slideshowContainer);

    // This check is important if initScrollAnimations is the primary entry point.
    // If the container is not yet visible (styled by CSS or not yet in DOM fully), offsetWidth might be 0.
    if (!slideshowContainer.classList.contains('visible')) {
        console.log('Slideshow container is not yet visible. Deferring full init until IntersectionObserver makes it visible.');
        // We rely on IntersectionObserver to call this function again when '.visible' is added.
        // However, the initial DOMContentLoaded call might still proceed if not guarded.
        // Let's ensure it doesn't fully initialize if not visible.
        return; 
    }
    
    if (slideshowContainer.dataset.slideshowInitialized === 'true') {
        console.log('Slideshow already marked as initialized. Skipping re-initialization unless forced.');
        // Potentially add logic here if re-initialization under certain conditions is needed.
        // For now, if it's marked and visible, assume it's working or another logic path handles it.
        // return; // This might prevent re-init on resize if not handled carefully.
    }


    const slideshowWrapper = slideshowContainer.querySelector('.slideshow-wrapper');
    const track = slideshowContainer.querySelector('.experience-grid');
    const nextButton = slideshowContainer.querySelector('.next-btn');
    const prevButton = slideshowContainer.querySelector('.prev-btn');

    if (!slideshowWrapper) console.error('Slideshow WRAPPER not found.');
    if (!track) console.error('Slideshow TRACK (experience-grid) not found.');
    if (!nextButton) console.warn('Slideshow NEXT button not found.');
    if (!prevButton) console.warn('Slideshow PREV button not found.');

    if (!slideshowWrapper || !track) {
        console.error('Critical slideshow elements (wrapper or track) missing. Aborting init.');
        if(nextButton) nextButton.style.display = 'none';
        if(prevButton) prevButton.style.display = 'none';
        return;
    }
    console.log('Slideshow wrapper and track found.');

    const items = Array.from(track.querySelectorAll('.experience-item'));
    console.log(`Found ${items.length} experience items.`);
    if (items.length === 0) {
        console.warn('No experience items found for the slideshow.');
        if(nextButton) nextButton.style.display = 'none';
        if(prevButton) prevButton.style.display = 'none';
        return;
    }

    let itemsPerSlide = 2;
    // Update itemsPerSlide based on screen width
    if (window.innerWidth <= 768) {
        itemsPerSlide = 1;
    }

    let currentIndex = 0;
    const totalSlides = Math.ceil(items.length / itemsPerSlide);
    console.log(`Items per slide: ${itemsPerSlide}, Total slides: ${totalSlides}`);
    let autoSlideInterval;
    const autoSlideDelay = 7000;

    // Hide buttons initially, show them if totalSlides > 1
    if(nextButton) nextButton.style.display = 'none';
    if(prevButton) prevButton.style.display = 'none';

    function updateSlideshow(reason = "general update") {
        console.log(`updateSlideshow called. Reason: ${reason}. Current index: ${currentIndex}`);
        if (!slideshowWrapper) {
            console.error("slideshowWrapper is null in updateSlideshow. Aborting.");
            return;
        }
        const slideWidth = slideshowWrapper.offsetWidth;
        console.log(`Slideshow wrapper offsetWidth: ${slideWidth}`);

        if (slideWidth === 0) {
            console.warn('Slideshow wrapper has 0 width during update. Retrying with rAF.');
            requestAnimationFrame(() => updateSlideshow("retry after 0 width"));
            return;
        }

        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        console.log(`Track transform: translateX(-${currentIndex * slideWidth}px)`);

        items.forEach((item, index) => {
            const itemSlideIndex = Math.floor(index / itemsPerSlide);
            if (itemSlideIndex === currentIndex) {
                item.classList.add('slide-active');
                const itemIndexInSlide = index % itemsPerSlide;
                item.style.transitionDelay = `${itemIndexInSlide * 0.15}s`;
                // console.log(`Item ${index} (in slide ${currentIndex}) is ACTIVE. Delay: ${item.style.transitionDelay}`);
            } else {
                item.classList.remove('slide-active');
                item.style.transitionDelay = '0s';
                // console.log(`Item ${index} (in slide ${itemSlideIndex}) is INACTIVE.`);
            }
        });
        console.log('Finished updating item active states and delays.');
    }

    function showNextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlideshow("next slide");
    }

    function showPrevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlideshow("prev slide");
    }

    function startAutoSlide() {
        stopAutoSlide(); 
        if (totalSlides > 1) { 
            console.log(`Starting auto-slide. Delay: ${autoSlideDelay}ms`);
            autoSlideInterval = setInterval(showNextSlide, autoSlideDelay);
        } else {
            console.log('Auto-slide not started: totalSlides <= 1.');
        }
    }

    function stopAutoSlide() {
        // console.log('Stopping auto-slide.');
        clearInterval(autoSlideInterval);
    }

    if (totalSlides <= 1) {
        console.log('Total slides <= 1. Hiding nav buttons and disabling auto-slide.');
        if (items.length > 0) { // If there's at least one item, make it active
            requestAnimationFrame(() => updateSlideshow("single slide setup"));
        }
    } else {
        console.log('Multiple slides detected. Setting up navigation and auto-slide.');
        if(nextButton) nextButton.style.display = 'flex';
        if(prevButton) prevButton.style.display = 'flex';

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                console.log('Next button clicked.');
                showNextSlide();
                stopAutoSlide(); // Stop auto-slide on manual interaction
                // Optionally restart auto-slide after a delay if desired
                // setTimeout(startAutoSlide, autoSlideDelay * 2); 
            });
        }
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                console.log('Previous button clicked.');
                showPrevSlide();
                stopAutoSlide(); // Stop auto-slide on manual interaction
                // setTimeout(startAutoSlide, autoSlideDelay * 2);
            });
        }
        slideshowContainer.addEventListener('mouseenter', () => {
            // console.log('Mouse entered slideshow. Stopping auto-slide.');
            stopAutoSlide();
        });
        slideshowContainer.addEventListener('mouseleave', () => {
            // console.log('Mouse left slideshow. Starting auto-slide.');
            startAutoSlide();
        });
        startAutoSlide();
    }
    
    // Initial call to set up the first slide.
    // Using requestAnimationFrame to ensure dimensions are calculated after any final browser rendering.
    console.log('Requesting initial updateSlideshow via rAF.');
    requestAnimationFrame(() => updateSlideshow("initial setup"));

    window.addEventListener('resize', () => {
        console.log('Window resize detected for slideshow.');
        stopAutoSlide();
        
        // Update itemsPerSlide on resize
        if (window.innerWidth <= 768) {
            itemsPerSlide = 1;
        } else {
            itemsPerSlide = 2;
        }
        // Recalculate totalSlides as itemsPerSlide might have changed
        const newTotalSlides = Math.ceil(items.length / itemsPerSlide);
        // If current index is out of bounds due to change in totalSlides, reset it
        if (currentIndex >= newTotalSlides) {
            currentIndex = Math.max(0, newTotalSlides - 1);
        }

        requestAnimationFrame(() => {
            console.log('Updating slideshow due to resize (after rAF).');
            updateSlideshow("resize"); 
            if (totalSlides > 1) { // Use the original totalSlides for this check or re-evaluate logic
                startAutoSlide();
            }
        });
    });

    slideshowContainer.dataset.slideshowInitialized = 'true';
    console.log('Experience slideshow initialization process COMPLETED.');
}

// -------------------- DYNAMIC SOCIAL WEB --------------------
function initSocialWeb(svgId) {
    const svgContainer = document.getElementById(svgId);
    if (!svgContainer) return;

    const socialIconWrappers = Array.from(document.querySelectorAll('#connect .social-icon-wrapper'));
    if (socialIconWrappers.length < 2) return;

    let lines = [];
    let mousePos = { x: undefined, y: undefined };
    let animationFrameId;

    function getIconCenter(wrapper) {
        const icon = wrapper.querySelector('a'); // Get the <a> tag for bounding rect
        const rect = icon.getBoundingClientRect();
        const svgRect = svgContainer.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2 - svgRect.left,
            y: rect.top + rect.height / 2 - svgRect.top,
            element: wrapper, // Store the wrapper for hover effects
        };
    }

    function createLine(p1, p2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', p1.x);
        line.setAttribute('y1', p1.y);
        line.setAttribute('x2', p2.x);
        line.setAttribute('y2', p2.y);
        // Initial style set via CSS, but can be dynamically changed
        line.classList.add('social-web-line');
        return line;
    }
    
    function drawWeb() {
        if (!svgContainer.isConnected) return; // Don't run if container is not in DOM
        svgContainer.innerHTML = ''; // Clear previous lines
        lines = [];
        const iconPositions = socialIconWrappers.map(wrapper => getIconCenter(wrapper));

        if (iconPositions.some(p => isNaN(p.x) || isNaN(p.y))) {
            // console.warn("Social web: Some icon positions are NaN. Retrying draw.");
            requestAnimationFrame(drawWeb); // Retry if positions are not ready
            return;
        }

        for (let i = 0; i < iconPositions.length; i++) {
            for (let j = i + 1; j < iconPositions.length; j++) {
                const lineElement = createLine(iconPositions[i], iconPositions[j]);
                svgContainer.appendChild(lineElement);
                lines.push({
                    element: lineElement,
                    p1: iconPositions[i],
                    p2: iconPositions[j],
                    originalStrokeWidth: 1.5, // Store original for reset
                    originalOpacity: 0.3      // Store original for reset
                });
            }
        }
    }
    
    function updateWebInteractions() {
        if (!svgContainer.isConnected) return;
        const svgRect = svgContainer.getBoundingClientRect();
        const relativeMouseX = mousePos.x !== undefined ? mousePos.x - svgRect.left : undefined;
        const relativeMouseY = mousePos.y !== undefined ? mousePos.y - svgRect.top : undefined;

        const iconPositions = socialIconWrappers.map(wrapper => getIconCenter(wrapper));

        // Update icon states based on mouse proximity
        iconPositions.forEach(pos => {
            if (relativeMouseX !== undefined) {
                const distToMouse = Math.hypot(pos.x - relativeMouseX, pos.y - relativeMouseY);
                if (distToMouse < 50) { // Hover radius for icon
                    pos.element.classList.add('hovered');
                } else {
                    pos.element.classList.remove('hovered');
                }
            } else {
                pos.element.classList.remove('hovered');
            }
        });

        lines.forEach(lineData => {
            const p1Hovered = lineData.p1.element.classList.contains('hovered');
            const p2Hovered = lineData.p2.element.classList.contains('hovered');
            
            let targetOpacity = lineData.originalOpacity;
            let targetStrokeWidth = lineData.originalStrokeWidth;

            if (p1Hovered || p2Hovered) {
                targetOpacity = 0.9;
                targetStrokeWidth = 3;
                lineData.element.classList.add('active');
            } else {
                lineData.element.classList.remove('active');
            }
            
            // Smooth transition for opacity and stroke-width (optional, can be CSS driven)
            // For direct JS animation:
            // let currentOpacity = parseFloat(lineData.element.getAttribute('stroke-opacity')) || targetOpacity;
            // let currentStrokeWidth = parseFloat(lineData.element.getAttribute('stroke-width')) || targetStrokeWidth;
            // lineData.element.setAttribute('stroke-opacity', currentOpacity + (targetOpacity - currentOpacity) * 0.2);
            // lineData.element.setAttribute('stroke-width', currentStrokeWidth + (targetStrokeWidth - currentStrokeWidth) * 0.2);
        });
        animationFrameId = requestAnimationFrame(updateWebInteractions);
    }


    if (socialIconWrappers.length > 0) {
        // Initial draw might need a slight delay for layout to settle
        if (document.readyState === 'complete') {
            setTimeout(drawWeb, 100);
        } else {
            window.addEventListener('load', () => setTimeout(drawWeb, 100));
        }

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                drawWeb(); // Redraw
                updateWebInteractions(); // Restart animation loop
            }, 250);
        });

        document.addEventListener('mousemove', (e) => {
            mousePos = { x: e.clientX, y: e.clientY };
        });
        
        svgContainer.addEventListener('mouseleave', () => {
            mousePos = { x: undefined, y: undefined }; // Reset mouse position
            // Icon and line states will be reset by updateWebInteractions
        });
        
        // Start the animation loop
        updateWebInteractions();

    } else {
        // console.log("Social web icons not found or less than 2.");
    }
}

// Optional: Profile Picture Animation (Example: Simple pulse)
// function initProfilePicAnimation() {
//     const profilePic = document.querySelector('.profile-picture img'); // Adjust selector
//     if (profilePic) {
//         // This could trigger a CSS animation or be a canvas based effect
//         // Example: Add a class for a CSS pulse animation
//         // profilePic.classList.add('pulsing-profile-pic');
//         // Ensure .pulsing-profile-pic is defined in your CSS
//     }
// }

// Ensure CSS for socialWebPulse is added to your style.css:
/*
@keyframes socialWebPulse {
    to {
        stroke-dashoffset: -8; // Adjust value for speed/direction of dash movement
    }
}
#social-web-svg line {
    stroke-dasharray: 4 4; // Defines the dash pattern (4px line, 4px gap)
    animation: socialWebPulse 2s linear infinite;
}
*/