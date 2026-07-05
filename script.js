document.addEventListener("DOMContentLoaded", () => {
    // Register GSAP ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    /* ==========================================================================
       LENIS SMOOTH SCROLLING
       ========================================================================== */
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Synchronize Lenis scrolling with GSAP ScrollTrigger updates
    lenis.on("scroll", ScrollTrigger.update);

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                lenis.scrollTo(target);
            }
        });
    });

    /* ==========================================================================
       CUSTOM CURSOR
       ========================================================================== */
    // Custom cursor disabled to prevent mouse click blockages.

    /* ==========================================================================
       HERO NAME CHARACTER SPLITTER
       ========================================================================== */
    const titleLine1 = document.getElementById("hero-title-1");
    const titleLine2 = document.getElementById("hero-title-2");
    
    if (titleLine1 && titleLine2) {
        const splitLine = (el) => {
            const text = el.textContent.trim();
            let newHTML = "";
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                // Alternate fill and outline starting with fill (even indexes fill, odd indexes stroke)
                const styleClass = i % 2 === 0 ? "letter-fill" : "letter-stroke";
                newHTML += `<span class="letter ${styleClass}">${char}</span>`;
            }
            el.innerHTML = newHTML;
        };
        
        splitLine(titleLine1);
        splitLine(titleLine2);
        
        // Set initial state for letters to prevent flash before load
        gsap.set(".hero-title span.letter", { y: "110%" });
    }

    /* ==========================================================================
       PAGE LOADER
       ========================================================================== */
    const loaderObj = { val: 0 };
    const percentageEl = document.getElementById("loader-percentage");
    const progressLine = document.getElementById("loader-progress-line");

    const loaderTL = gsap.timeline({
        onComplete: () => {
            // Slide up preloader screen
            gsap.to("#loader", {
                yPercent: -100,
                duration: 1.2,
                ease: "power4.inOut",
                onComplete: () => {
                    const loaderScreen = document.getElementById("loader");
                    if (loaderScreen) loaderScreen.style.display = "none";
                    // Trigger Hero entry animations
                    initHeroAnimations();
                }
            });
        }
    });

    // Stagger loader name text up on startup
    loaderTL.to(".loader-name-word", {
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power4.out"
    });

    // Count percentage and fill progress bar
    loaderTL.to(loaderObj, {
        val: 100,
        duration: 2.2,
        ease: "power2.out",
        onUpdate: () => {
            const progress = Math.floor(loaderObj.val);
            if (percentageEl) percentageEl.textContent = String(progress).padStart(2, '0');
            if (progressLine) progressLine.style.width = `${progress}%`;
        }
    }, "-=0.2");

    /* ==========================================================================
       HERO ENTRY ANIMATION
       ========================================================================== */
    function initHeroAnimations() {
        const tl = gsap.timeline();

        // 1. Fade tagline in
        tl.to(".hero-tagline-container", {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out"
        });

        // 2. Stagger characters up from bottom
        tl.to(".hero-title span.letter", {
            y: 0,
            stagger: 0.03,
            duration: 1,
            ease: "power4.out"
        }, "-=0.3");

        // 3. Fade description in
        tl.from(".hero-description-container", {
            x: -40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.6");

        // 4. Reveal CTA buttons
        tl.from(".hero-actions", {
            y: 35,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.6");

        // 5. Reveal SVG illustration
        tl.from(".avatar-frame", {
            scale: 0.92,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        }, "-=0.8");
    }

    /* ==========================================================================
       SCROLL REVEALS
       ========================================================================== */
    // Generic scroll reveal
    const reveals = document.querySelectorAll(".scroll-trigger");
    reveals.forEach((elem) => {
        gsap.from(elem, {
            scrollTrigger: {
                trigger: elem,
                start: "top 88%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 40,
            duration: 0.9,
            ease: "power3.out"
        });
    });

    // Staggered reveal for skills column chips
    const skillsColumns = document.querySelectorAll(".skills-column");
    skillsColumns.forEach((col) => {
        const chips = col.querySelectorAll(".skill-chip");
        // Dynamically set initial state
        gsap.set(chips, { opacity: 0, scale: 0.7 });

        gsap.to(chips, {
            scrollTrigger: {
                trigger: col,
                start: "top 80%"
            },
            opacity: 1,
            scale: 1,
            stagger: 0.04,
            duration: 0.6,
            ease: "back.out(1.5)"
        });
    });

    /* ==========================================================================
       STAT CARDS COUNT-UP
       ========================================================================== */
    const statCards = document.querySelectorAll(".stat-card");
    if (statCards.length > 0) {
        statCards.forEach((card) => {
            const numEl = card.querySelector(".stat-number");
            if (numEl) {
                const target = parseFloat(numEl.getAttribute("data-target"));
                const decimals = parseInt(numEl.getAttribute("data-decimals")) || 0;
                const animObj = { value: 0 };

                gsap.to(animObj, {
                    scrollTrigger: {
                        trigger: card,
                        start: "top 88%"
                    },
                    value: target,
                    duration: 2.2,
                    ease: "power3.out",
                    onUpdate: () => {
                        numEl.textContent = animObj.value.toFixed(decimals);
                    }
                });
            }
        });
    }

    /* ==========================================================================
       TIMELINE ANIMATION (DrawSVG alternative)
       ========================================================================== */
    const drawPath = document.getElementById("timeline-draw-path");
    if (drawPath) {
        const pathLength = drawPath.getTotalLength();
        
        // Initial SVG stroke configurations
        drawPath.style.strokeDasharray = pathLength;
        drawPath.style.strokeDashoffset = pathLength;

        // Animate stroke offset based on scroll progress
        gsap.to(drawPath, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
                trigger: ".timeline-container",
                start: "top 25%",
                end: "bottom 75%",
                scrub: true
            }
        });
    }

    /* ==========================================================================
       3D TILT EFFECT
       ========================================================================== */
    if (typeof VanillaTilt !== "undefined") {
        VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
            max: 8,
            speed: 500,
            glare: true,
            "max-glare": 0.1,
            scale: 1.01
        });
    }

    /* ==========================================================================
       INTERACTIVE DROPDOWN & MENU
       ========================================================================== */
    // Resume Dropdown
    const dropdownBtn = document.getElementById("resume-dropdown-btn");
    const dropdownMenu = document.getElementById("resume-dropdown-menu");

    if (dropdownBtn && dropdownMenu) {
        const closeResumeDropdown = () => {
            dropdownMenu.classList.remove("active");
            dropdownBtn.setAttribute("aria-expanded", "false");
        };

        dropdownBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpening = !dropdownMenu.classList.contains("active");
            dropdownMenu.classList.toggle("active", isOpening);
            dropdownBtn.setAttribute("aria-expanded", String(isOpening));
        });

        dropdownMenu.addEventListener("click", (e) => {
            e.stopPropagation();
            if (e.target.closest("a")) {
                closeResumeDropdown();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", () => {
            closeResumeDropdown();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closeResumeDropdown();
            }
        });
    }

    // Sticky Navbar blur on scroll
    const navbar = document.getElementById("navbar");
    if (navbar) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 40) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        });
    }

    // Responsive Mobile Hamburger
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("nav-menu");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        // Close menu on links click
        document.querySelectorAll(".nav-link").forEach((link) => {
            link.addEventListener("click", () => {
                hamburger.classList.remove("active");
                navMenu.classList.remove("active");
            });
        });
    }

    // Mock Form Submission
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Thanks! Your message has been sent successfully.");
            contactForm.reset();
        });
    }

    /* ==========================================================================
       n8n & VOICEFLOW WORKFLOW LIGHTBOX GALLERY
       ========================================================================== */
    const n8nLightbox = document.getElementById("workflow-lightbox");
    const n8nBtn = document.getElementById("n8n-workflow-btn");
    const vfLightbox = document.getElementById("voiceflow-lightbox");
    const vfBtn = document.getElementById("voiceflow-workflow-btn");

    // n8n Slideshow logic
    const lightboxSlides = document.querySelectorAll(".lightbox-slide");
    const lightboxDots = document.querySelectorAll(".lightbox-dot");
    let currentSlide = 0;

    const showSlide = (n) => {
        if (lightboxSlides.length === 0) return;
        lightboxSlides.forEach((slide) => slide.classList.remove("active"));
        lightboxDots.forEach((dot) => dot.classList.remove("active"));
        
        currentSlide = (n + lightboxSlides.length) % lightboxSlides.length;
        
        lightboxSlides[currentSlide].classList.add("active");
        lightboxDots[currentSlide].classList.add("active");
    };

    // n8n Open
    if (n8nBtn && n8nLightbox) {
        n8nBtn.addEventListener("click", (e) => {
            e.preventDefault();
            n8nLightbox.classList.add("active");
            showSlide(0);
            if (typeof lenis !== "undefined" && lenis) lenis.stop();
        });
    }

    // Voiceflow Open
    if (vfBtn && vfLightbox) {
        vfBtn.addEventListener("click", (e) => {
            e.preventDefault();
            vfLightbox.classList.add("active");
            if (typeof lenis !== "undefined" && lenis) lenis.stop();
        });
    }

    // n8n Navigation
    const lightboxPrev = document.querySelector(".lightbox-prev");
    const lightboxNext = document.querySelector(".lightbox-next");

    if (lightboxPrev) {
        lightboxPrev.addEventListener("click", () => showSlide(currentSlide - 1));
    }
    if (lightboxNext) {
        lightboxNext.addEventListener("click", () => showSlide(currentSlide + 1));
    }
    lightboxDots.forEach((dot, index) => {
        dot.addEventListener("click", () => showSlide(index));
    });

    // Reusable Close Event handlers for all Lightboxes
    document.querySelectorAll(".lightbox-close").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const lb = e.target.closest(".lightbox");
            if (lb) lb.classList.remove("active");
            if (typeof lenis !== "undefined" && lenis) lenis.start();
        });
    });

    document.querySelectorAll(".lightbox-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            const lb = e.target.closest(".lightbox");
            if (lb) lb.classList.remove("active");
            if (typeof lenis !== "undefined" && lenis) lenis.start();
        });
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const activeLightbox = document.querySelector(".lightbox.active");
            if (activeLightbox) {
                activeLightbox.classList.remove("active");
                if (typeof lenis !== "undefined" && lenis) lenis.start();
            }
        }
    });
});
