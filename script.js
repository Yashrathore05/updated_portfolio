// Add initial-load class to body to prevent FOUC (Flash of Unstyled Content)
document.body.classList.add('initial-load');

// Wait for the page to load
window.addEventListener('load', () => {
    document.body.classList.remove('initial-load');
    initThreeJS();
    initParallax();
    initProfileImage();
    animateBackground();
    document.body.classList.add('cyberpunk-theme');
    initContactForm();
    initProficiencyBars();
    initVRMode();
});

// VR and 3D Controls
let isVRMode = false;
let isGyroscopeEnabled = false;
let gyroscopeData = { beta: 0, gamma: 0 };

// Initialize VR Mode components
function initVRMode() {
    // Create VR Toggle Button
    const vrButton = document.createElement('button');
    vrButton.classList.add('vr-button');
    vrButton.innerHTML = '🥽 VR Mode';
    document.body.appendChild(vrButton);
    
    // Create VR Modal
    const vrModal = document.createElement('div');
    vrModal.classList.add('vr-modal');
    vrModal.innerHTML = `
        <div class="vr-modal-content">
            <button class="vr-modal-close">&times;</button>
            <h3 class="vr-modal-title">VR Mode Information</h3>
            <div class="vr-modal-body">
                <p>VR Mode works best on devices with gyroscope sensors. You'll be able to look around the page by moving your device.</p>
                <p>For the best experience, use a mobile device or VR headset.</p>
            </div>
            <div class="vr-modal-buttons">
                <button class="vr-modal-button primary" id="enable-vr">Enable VR Mode</button>
                <button class="vr-modal-button secondary" id="cancel-vr">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(vrModal);
    
    // VR Button Click Event
    vrButton.addEventListener('click', () => {
        if (isVRMode) {
            // If already in VR mode, switch back to normal
            disableVRMode();
        } else {
            // Show the modal
            vrModal.classList.add('active');
        }
    });
    
    // Close modal button event
    const closeButton = vrModal.querySelector('.vr-modal-close');
    closeButton.addEventListener('click', () => {
        vrModal.classList.remove('active');
    });
    
    // Cancel button event
    const cancelButton = document.getElementById('cancel-vr');
    cancelButton.addEventListener('click', () => {
        vrModal.classList.remove('active');
    });
    
    // Enable VR button event
    const enableButton = document.getElementById('enable-vr');
    enableButton.addEventListener('click', () => {
        vrModal.classList.remove('active');
        enableVRMode();
    });
}

// Enable VR Mode
function enableVRMode() {
    isVRMode = true;
    document.body.classList.add('vr-mode');
    
    // Update VR button
    const vrButton = document.querySelector('.vr-button');
    vrButton.innerHTML = '🔍 Normal Mode';
    vrButton.style.transform = 'translateZ(50px)';
    
    // Enable gyroscope if available
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleGyroscope);
        isGyroscopeEnabled = true;
    }
}

// Disable VR Mode
function disableVRMode() {
    isVRMode = false;
    document.body.classList.remove('vr-mode');
    
    // Update VR button
    const vrButton = document.querySelector('.vr-button');
    vrButton.innerHTML = '🥽 VR Mode';
    vrButton.style.transform = 'none';
    
    // Disable gyroscope
    if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleGyroscope);
        isGyroscopeEnabled = false;
    }
    
    // Reset body transform
    document.body.style.transform = 'none';
    document.body.style.filter = 'none';
}

// Gyroscope handling
function handleGyroscope(event) {
    if (!isVRMode) return;
    
    gyroscopeData.beta = event.beta; // X-axis rotation (-180 to 180)
    gyroscopeData.gamma = event.gamma; // Y-axis rotation (-90 to 90)
    
    requestAnimationFrame(updateVRView);
}

function updateVRView() {
    if (!isVRMode) return;
    
    const rotateX = Math.min(Math.max(gyroscopeData.beta, -45), 45);
    const rotateY = Math.min(Math.max(gyroscopeData.gamma, -45), 45);
    
    document.body.style.transform = `
        rotateX(${-rotateX}deg)
        rotateY(${rotateY}deg)
        scale(0.8)
        translateZ(-800px)
    `;

    // Add motion blur effect
    document.body.style.filter = `blur(${Math.abs(rotateX + rotateY) / 90}px)`;
}

// Initialize Three.js background
let scene, camera, renderer, particles;
let clock = new THREE.Clock();

function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    
    renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add renderer to page
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = 0;
    renderer.domElement.style.left = 0;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '-1';
    renderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(renderer.domElement);
    
    // Create two particle systems - stars and nebula
    createStars();
    createNebula();
    
    // Set camera position
    camera.position.z = 1000;
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
}

function createStars() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const sizes = [];
    const colors = [];
    
    const colorOptions = [
        new THREE.Color(0x00ffff), // Cyan
        new THREE.Color(0xff00ff), // Magenta
        new THREE.Color(0xffffff)  // White
    ];
    
    for (let i = 0; i < 3000; i++) {
        // Random position in 3D space
        vertices.push(
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000
        );
        
        // Random size
        sizes.push(Math.random() * 5 + 1);
        
        // Random color from options
        const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        colors.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 2,
        transparent: true,
        opacity: 0.8,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createNebula() {
    // Create several particle clouds
    for (let i = 0; i < 5; i++) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];
        
        // Choose either cyan or magenta for this cloud
        const baseColor = Math.random() > 0.5 ? 
            new THREE.Color(0x00ffff) : new THREE.Color(0xff00ff);
        
        // Create a cloud of particles
        const particleCount = 500;
        const spread = 300;
        
        // Random center position for this cloud
        const centerX = (Math.random() - 0.5) * 1000;
        const centerY = (Math.random() - 0.5) * 1000;
        const centerZ = (Math.random() - 0.5) * 1000;
        
        for (let j = 0; j < particleCount; j++) {
            // Position around center with gaussian-like distribution
            const x = centerX + ((Math.random() + Math.random() + Math.random()) / 3 - 0.5) * spread;
            const y = centerY + ((Math.random() + Math.random() + Math.random()) / 3 - 0.5) * spread;
            const z = centerZ + ((Math.random() + Math.random() + Math.random()) / 3 - 0.5) * spread;
            
            vertices.push(x, y, z);
            
            // Vary color slightly
            const colorVariation = 0.2 * Math.random();
            colors.push(
                baseColor.r * (1 - colorVariation),
                baseColor.g * (1 - colorVariation),
                baseColor.b * (1 - colorVariation)
            );
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 4,
            transparent: true,
            opacity: 0.6,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });
        
        const cloud = new THREE.Points(geometry, material);
        scene.add(cloud);
    }
}

function animateBackground() {
    const delta = clock.getDelta();
    
    // Rotate particle system
    if (particles) {
        particles.rotation.x += 0.0003;
        particles.rotation.y += 0.0005;
    }
    
    // Rotate all points
    scene.children.forEach(child => {
        if (child instanceof THREE.Points) {
            child.rotation.y += delta * 0.05;
            
            // Pulse size of points
            const positions = child.geometry.attributes.position;
            const time = Date.now() * 0.001;
            
            if (child.geometry.attributes.size) {
                const sizes = child.geometry.attributes.size;
                for (let i = 0; i < sizes.count; i++) {
                    const pulseFactor = Math.sin(time + i * 0.1) * 0.5 + 1;
                    sizes.array[i] = (Math.random() * 3 + 1) * pulseFactor;
                }
                sizes.needsUpdate = true;
            }
        }
    });
    
    renderer.render(scene, camera);
    requestAnimationFrame(animateBackground);
}

// Enhanced 3D Parallax Effect
function initParallax() {
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - windowHalfX);
        mouseY = (e.clientY - windowHalfY);
    });

    function updateParallax() {
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        if (!isVRMode) {
            const hero = document.querySelector('.hero-content');
            if (hero) {
                hero.style.transform = `
                    translateZ(50px)
                    rotateY(${targetX / windowHalfX * 5}deg)
                    rotateX(${-targetY / windowHalfY * 5}deg)
                `;
            }
        }

        requestAnimationFrame(updateParallax);
    }

    updateParallax();
}

// Interactive Profile Image
function initProfileImage() {
    const profileImage = document.querySelector('.profile-image');
    if (!profileImage) return;

    let rotation = { x: 0, y: 0 };
    let targetRotation = { x: 0, y: 0 };
    let isHovered = false;

    // Add glow effect animation
    const glowAnimation = () => {
        const time = Date.now() * 0.001;
        const intensity = (Math.sin(time) * 0.5 + 0.5) * 0.7 + 0.3;
        profileImage.style.boxShadow = `
            0 0 20px rgba(0, 255, 255, ${intensity}),
            0 0 40px rgba(255, 0, 255, ${intensity * 0.6})
        `;
        
        requestAnimationFrame(glowAnimation);
    };
    
    glowAnimation();

    profileImage.addEventListener('mouseenter', () => {
        isHovered = true;
        profileImage.style.transition = 'transform 0.3s ease-out';
        
        // Create particles on hover
        createCardParticles(profileImage);
    });

    profileImage.addEventListener('mousemove', (e) => {
        if (!isHovered) return;

        const rect = profileImage.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        targetRotation.x = (y / rect.height - 0.5) * 30;
        targetRotation.y = (x / rect.width - 0.5) * 30;
    });

    profileImage.addEventListener('mouseleave', () => {
        isHovered = false;
        targetRotation = { x: 0, y: 0 };
    });

    function animateProfile() {
        rotation.x += (targetRotation.x - rotation.x) * 0.1;
        rotation.y += (targetRotation.y - rotation.y) * 0.1;

        const transform = `
            rotateX(${rotation.x}deg)
            rotateY(${rotation.y}deg)
            translateZ(50px)
            scale(${isHovered ? 1.1 : 1})
        `;

        profileImage.style.transform = transform;
        requestAnimationFrame(animateProfile);
    }

    animateProfile();
}

// Enhanced Particle Effect
function createParticles(element) {
    const colors = ['#00ffff', '#ff00ff', '#ffffff'];
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 4 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            box-shadow: 0 0 10px ${color};
        `;
        
        element.appendChild(particle);
        
        const angle = (i / 20) * Math.PI * 2;
        const velocity = Math.random() * 2 + 1;
        let x = 0;
        let y = 0;
        let scale = 1;
        
        function animateParticle() {
            x += Math.cos(angle) * velocity;
            y += Math.sin(angle) * velocity;
            scale -= 0.01;
            
            if (scale > 0) {
                particle.style.transform = `
                    translate(${x}px, ${y}px)
                    scale(${scale})
                    rotate(${x * 5}deg)
                `;
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        }
        
        requestAnimationFrame(animateParticle);
    }
}

// Enhanced 3D Card Hover Effect - REMOVE COMPLEX ANIMATIONS
document.querySelectorAll('.project-card, .education-item, .experience-item, .achievement-item').forEach(card => {
    card.addEventListener('mouseenter', (e) => {
        card.style.transform = 'translateZ(10px)';
        card.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.4)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateZ(0)';
        card.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.2)';
    });
});

// Smooth scrolling with 3D effect
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Add 3D animation to target section
            target.style.transform = 'translateZ(100px) scale(0.95)';
            setTimeout(() => {
                target.style.transform = 'translateZ(0) scale(1)';
            }, 300);

            // Close mobile menu if open
            if (isMenuOpen) {
                mobileMenuButton.click();
            }
        }
    });
});

// Enhanced navbar effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.backdropFilter = 'blur(10px)';
        navbar.style.transform = 'translateY(0) translateZ(0)';
    } else {
        navbar.style.backdropFilter = 'blur(15px)';
        
        if (currentScroll > lastScroll && currentScroll > 80) {
            navbar.style.transform = 'translateY(-100%) translateZ(0)';
        } else {
            navbar.style.transform = 'translateY(0) translateZ(20px)';
        }
    }

    lastScroll = currentScroll;
});

// Skill items 3D effect
document.querySelectorAll('.skill-items span').forEach(skill => {
    skill.addEventListener('mouseenter', () => {
        skill.style.transform = 'translateZ(30px) scale(1.1)';
        skill.style.boxShadow = '0 0 20px rgba(37, 99, 235, 0.5)';
    });
    
    skill.addEventListener('mouseleave', () => {
        skill.style.transform = 'translateZ(0) scale(1)';
        skill.style.boxShadow = 'none';
    });
});

// Mobile menu functionality
const mobileMenuButton = document.createElement('button');
mobileMenuButton.classList.add('mobile-menu-button');
mobileMenuButton.innerHTML = '☰';
mobileMenuButton.style.transition = 'transform 0.3s ease';

const navContent = document.querySelector('.nav-content');
navContent.prepend(mobileMenuButton);

const navLinks = document.querySelector('.nav-links');

// Show/hide mobile menu button based on screen size
function toggleMobileMenuButton() {
    if (window.innerWidth <= 768) {
        mobileMenuButton.style.display = 'block';
        if (!isMenuOpen) {
            navLinks.style.display = 'none';
        }
    } else {
        mobileMenuButton.style.display = 'none';
        navLinks.style.display = 'flex';
        navLinks.style.opacity = '1';
        navLinks.style.transform = 'translateY(0)';
    }
}

window.addEventListener('resize', toggleMobileMenuButton);
toggleMobileMenuButton();

// Mobile menu functionality with animation
let isMenuOpen = false;

mobileMenuButton.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    
    if (isMenuOpen) {
        navLinks.style.display = 'flex';
        mobileMenuButton.style.transform = 'rotate(90deg)';
        requestAnimationFrame(() => {
            navLinks.classList.add('active');
        });
    } else {
        navLinks.classList.remove('active');
        mobileMenuButton.style.transform = 'rotate(0deg)';
        setTimeout(() => {
            if (!isMenuOpen) {
                navLinks.style.display = 'none';
            }
        }, 300);
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (isMenuOpen && !navContent.contains(e.target)) {
        mobileMenuButton.click();
    }
});

// Add active class to current section in navigation
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');

function setActiveNavItem() {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 150) {
            current = section.getAttribute('id');
        }
    });
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').slice(1) === current) {
            item.classList.add('active');
        }
    });
}

window.addEventListener('scroll', setActiveNavItem);
window.addEventListener('load', setActiveNavItem);

// Add 3D effect to social links
document.querySelectorAll('.social-links a').forEach(link => {
    link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateZ(30px) scale(1.2)';
    });
    
    link.addEventListener('mouseleave', () => {
        link.style.transform = 'translateZ(0) scale(1)';
    });
});

// Add floating animation to profile image
const profileImage = document.querySelector('.profile-image');
if (profileImage) {
    let floatY = 0;
    let floatRotate = 0;
    
    function animateProfile() {
        floatY = Math.sin(Date.now() / 1000) * 10;
        floatRotate = Math.sin(Date.now() / 2000) * 5;
        
        profileImage.style.transform = `
            translateY(${floatY}px)
            rotateY(${floatRotate}deg)
            translateZ(20px)
        `;
        
        requestAnimationFrame(animateProfile);
    }
    
    animateProfile();
}

// Enhanced Card Interaction with Particles - SIMPLIFY
document.querySelectorAll('.project-card, .education-item, .experience-item, .achievement-item').forEach(card => {
    card.addEventListener('mouseenter', (e) => {
        // Keep particles for visual interest but remove complex animations
        createCardParticles(card);
        
        // Simple hover effect
        card.style.transform = 'translateZ(10px)';
        card.style.boxShadow = `
            0 0 20px var(--primary-color),
            0 0 40px var(--secondary-color)
        `;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateZ(0)';
        card.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.2)';
    });
});

// Create Particles for Card
function createCardParticles(element) {
    const colors = ['#00ffff', '#ff00ff', '#ffffff'];
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 6 + 2;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                box-shadow: 0 0 15px ${color}, 0 0 5px ${color};
                opacity: 0.8;
            `;
            
            // Randomize starting position on the edge of the card
            const rect = element.getBoundingClientRect();
            const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
            let startX, startY;
            
            switch(side) {
                case 0: // top
                    startX = Math.random() * rect.width;
                    startY = 0;
                    break;
                case 1: // right
                    startX = rect.width;
                    startY = Math.random() * rect.height;
                    break;
                case 2: // bottom
                    startX = Math.random() * rect.width;
                    startY = rect.height;
                    break;
                case 3: // left
                    startX = 0;
                    startY = Math.random() * rect.height;
                    break;
            }
            
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            
            element.appendChild(particle);
            
            // Create movement animation
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            let x = startX;
            let y = startY;
            let scale = 1;
            let opacity = 0.8;
            
            function animateParticle() {
                x += Math.cos(angle) * speed;
                y += Math.sin(angle) * speed;
                scale -= 0.01;
                opacity -= 0.01;
                
                if (scale > 0 && opacity > 0) {
                    particle.style.transform = `translate(${x - startX}px, ${y - startY}px) scale(${scale}) rotate(${x * 5}deg)`;
                    particle.style.opacity = opacity;
                    requestAnimationFrame(animateParticle);
                } else {
                    particle.remove();
                }
            }
            
            requestAnimationFrame(animateParticle);
        }, i * 100); // Stagger particle creation
    }
}

// Contact Form Handling
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    // Initialize EmailJS with your public key
    emailjs.init("HAVMhHXyZrplCnKuF");

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        
        // Create glowing effect on submit button
        const submitBtn = contactForm.querySelector('.submit-btn');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Prepare data for EmailJS
        const templateParams = {
            from_name: name,
            from_email: email,
            subject: subject,
            message: message,
            to_email: "yashrathore.yr05@gmail.com" // Your email address
        };
        
        // Send email using EmailJS
        emailjs.send('service_g94h78q', 'template_6oopjgl', templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                
                // Create success message
                const successMessage = document.createElement('div');
                successMessage.className = 'form-message success';
                successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Message sent successfully!';
                
                // Clear the form
                contactForm.reset();
                
                // Reset button
                submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
                submitBtn.disabled = false;
                
                // Add the message to the form
                contactForm.appendChild(successMessage);
                
                // Create particle effect
                createParticles(successMessage);
                
                // Remove message after 5 seconds
                setTimeout(() => {
                    successMessage.style.animation = 'fadeOut 0.5s forwards';
                    setTimeout(() => {
                        successMessage.remove();
                    }, 500);
                }, 5000);
            }, function(error) {
                console.log('FAILED...', error);
                
                // Create error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'form-message error';
                errorMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to send message. Please try again later.';
                
                // Reset button
                submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
                submitBtn.disabled = false;
                
                // Add the message to the form
                contactForm.appendChild(errorMessage);
                
                // Remove message after 5 seconds
                setTimeout(() => {
                    errorMessage.style.animation = 'fadeOut 0.5s forwards';
                    setTimeout(() => {
                        errorMessage.remove();
                    }, 500);
                }, 5000);
            });
    });
}

// Add styles for form animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);

// Initialize proficiency bars animation
function initProficiencyBars() {
    const proficiencyBars = document.querySelectorAll('.proficiency-bar');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'loadBar 1.5s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    proficiencyBars.forEach(bar => {
        // Reset width to 0
        bar.style.width = '0';
        observer.observe(bar);
    });
}

// Update active nav item to include languages and interests
function setActiveNavItem() {
    let current = '';
    
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 150) {
            current = section.getAttribute('id');
        }
    });
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').slice(1) === current) {
            item.classList.add('active');
        }
    });
} 