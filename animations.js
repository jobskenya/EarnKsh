/**
 * Animation Utilities
 * Handles various animations and effects
 */

/**
 * Show confetti animation
 */
export function showConfetti() {
    // Create canvas for confetti
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    document.body.appendChild(canvas);
    
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 150;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 4 + 1,
            d: Math.random() * particleCount,
            color: getRandomColor(),
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngle: Math.random() * 0.1,
            tiltAngleIncrement: Math.random() * 0.07
        });
    }
    
    // Colors for confetti
    function getRandomColor() {
        const colors = [
            '#3B82F6', // blue-500
            '#EF4444', // red-500
            '#10B981', // green-500
            '#F59E0B', // yellow-500
            '#8B5CF6', // purple-500
            '#EC4899', // pink-500
            '#06B6D4'  // cyan-500
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Animation loop
    let animationFrame;
    let angle = 0;
    
    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        angle += 0.01;
        
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            
            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt, p.y);
            ctx.lineTo(p.x + p.tilt + p.r * 2, p.y);
            ctx.stroke();
            
            p.tiltAngle += p.tiltAngleIncrement;
            p.y += (Math.cos(angle + p.d) + 3 + p.r / 2) / 2;
            p.tilt = Math.sin(p.tiltAngle) * 15;
            
            // Reset particle when it goes off screen
            if (p.y > canvas.height) {
                particles[i] = {
                    x: Math.random() * canvas.width,
                    y: -10,
                    r: p.r,
                    d: p.d,
                    color: getRandomColor(),
                    tilt: Math.floor(Math.random() * 10) - 10,
                    tiltAngle: p.tiltAngle,
                    tiltAngleIncrement: p.tiltAngleIncrement
                };
            }
        }
        
        animationFrame = requestAnimationFrame(loop);
    }
    
    // Start animation
    loop();
    
    // Stop animation after 5 seconds and remove canvas
    setTimeout(() => {
        cancelAnimationFrame(animationFrame);
        canvas.remove();
    }, 5000);
}

/**
 * Animate an element with a bounce effect
 * @param {HTMLElement} element - The element to animate
 * @param {number} duration - Animation duration in ms (default: 1000)
 */
export function bounce(element, duration = 1000) {
    if (!element) return;
    
    element.style.transform = 'scale(1.1)';
    element.style.transition = `transform ${duration}ms cubic-bezier(0.68, -0.6, 0.32, 1.6)`;
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, duration);
}

/**
 * Create a ripple effect on click
 * @param {Event} event - The click event
 * @param {HTMLElement} element - The element to apply the ripple to
 * @param {string} color - Ripple color (default: 'rgba(255, 255, 255, 0.7)')
 */
export function ripple(event, element, color = 'rgba(255, 255, 255, 0.7)') {
    if (!element) return;
    
    // Create ripple container if it doesn't exist
    let rippleContainer = element.querySelector('.ripple-container');
    if (!rippleContainer) {
        rippleContainer = document.createElement('div');
        rippleContainer.className = 'ripple-container';
        rippleContainer.style.position = 'absolute';
        rippleContainer.style.top = '0';
        rippleContainer.style.left = '0';
        rippleContainer.style.width = '100%';
        rippleContainer.style.height = '100%';
        rippleContainer.style.overflow = 'hidden';
        rippleContainer.style.pointerEvents = 'none';
        rippleContainer.style.borderRadius = 'inherit';
        element.style.position = 'relative';
        element.appendChild(rippleContainer);
    }
    
    // Create ripple
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.backgroundColor = color;
    ripple.style.pointerEvents = 'none';
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '1';
    
    // Position ripple
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    rippleContainer.appendChild(ripple);
    
    // Animate ripple
    setTimeout(() => {
        ripple.style.transform = 'scale(2)';
        ripple.style.opacity = '0';
        ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
    }, 10);
    
    // Remove ripple after animation
    setTimeout(() => {
        ripple.remove();
    }, 700);
}

/**
 * Scroll to element with smooth animation
 * @param {string} selector - The selector of the element to scroll to
 * @param {number} offset - Additional offset in pixels (default: 0)
 * @param {number} duration - Animation duration in ms (default: 800)
 */
export function scrollToElement(selector, offset = 0, duration = 800) {
    const element = document.querySelector(selector);
    if (!element) return;
    
    const start = window.pageYOffset;
    const target = element.getBoundingClientRect().top + start + offset;
    const distance = target - start;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, start, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

/**
 * Animate element when it comes into view
 * @param {HTMLElement} element - The element to animate
 * @param {string} animationClass - The CSS class with the animation
 * @param {number} threshold - Intersection threshold (default: 0.1)
 */
export function animateOnScroll(element, animationClass, threshold = 0.1) {
    if (!element) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(animationClass);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold });
    
    observer.observe(element);
}
