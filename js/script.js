document.addEventListener('DOMContentLoaded', () => {
    initSmoothScrolling();
    initActiveNavHighlighting();
    initScrollAnimations();
    initHamburgerMenu();
    initTypingAnimation();
    initHeroParticles();
    initBackgroundReactionAnimation();
    initSocialWeb();
    // initProfilePicAnimation(); // Placeholder for specific profile animation if needed
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
    console.log("ScrollAnimations: Initializing...");

    // Elements that animate individually
    const individualAnimatedElements = document.querySelectorAll(
        '.timeline-item, .project-card, .skill-category, .experience-item, ' 
        + '.award-item, ' // Added .award-item for individual animation
        + 'section > h2, section .about-content > h3, section > p, section .content-wrapper, '
        + 'section .container > ul, section .container > ol'
        // Removed .awards-list from individual, it's a container now
    );
    console.log("ScrollAnimations: Individual elements found:", individualAnimatedElements.length, individualAnimatedElements);

    // Containers whose children should animate when the container is visible
    const containerAnimatedElements = document.querySelectorAll(
        '.connect-grid' // .awards-list is handled by individual .award-item now
    );
    console.log("ScrollAnimations: Container elements found:", containerAnimatedElements.length, containerAnimatedElements);

    if (individualAnimatedElements.length === 0 && containerAnimatedElements.length === 0) {
        console.warn("ScrollAnimations: No animated elements or containers found. Check selectors.");
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log("ScrollAnimations: Element intersecting:", entry.target);

                // If it's an individual element, just add the class
                // Check against the live NodeList directly or convert to array if manipulation is needed before check
                if (Array.from(individualAnimatedElements).includes(entry.target)) {
                     entry.target.classList.add('visible');
                     console.log("ScrollAnimations: Added .visible to individual element:", entry.target);
                     obs.unobserve(entry.target); // Unobserve after animation
                }

                // If it's a container, find its animatable children and add the class
                // Removed .awards-list specific handling as .award-item is now individual

                if (entry.target.classList.contains('connect-grid')) {
                     console.log("ScrollAnimations: Connect grid container intersecting.");
                    // Target specific children within connect-grid for staggered animation
                    // The CSS already has animation-delay based on --animation-order
                    // So we just need to make the children visible.
                    // The children are .form-group, button, .social-icons-container
                    const connectElements = entry.target.querySelectorAll('.form-group, button[type="submit"], .social-icons-container');
                     connectElements.forEach(el => {
                         el.classList.add('visible');
                         console.log("ScrollAnimations: Added .visible to connect element:", el);
                     });
                    obs.unobserve(entry.target); // Unobserve the container
                }
            }
        });
    }, { threshold: 0.1 });

    // Observe individual elements
    individualAnimatedElements.forEach(el => {
        observer.observe(el);
    });

    // Observe containers
    containerAnimatedElements.forEach(el => {
        observer.observe(el);
    });
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
function initHeroParticles() {
    const canvas = document.getElementById('hero-particles-canvas');
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
function initBackgroundReactionAnimation() {
    const canvas = document.getElementById('background-reaction-canvas'); // Ensure this ID exists
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


// -------------------- DYNAMIC SOCIAL WEB --------------------
function initSocialWeb() {
    const svgContainer = document.getElementById('social-web-svg');
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