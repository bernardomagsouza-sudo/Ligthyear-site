const header = document.querySelector(".site-header");
const revealElements = document.querySelectorAll(".reveal");
const hero = document.querySelector(".hero");
const particleCanvas = document.querySelector(".hero-particles");

window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 60) {
        header.classList.add("nav-compact");
    } else {
        header.classList.remove("nav-compact");
    }
});

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.18,
    }
);

revealElements.forEach((element) => observer.observe(element));

if (hero && particleCanvas) {
    const context = particleCanvas.getContext("2d");
    const particles = [];
    const pointer = {
        x: 0,
        y: 0,
        active: false,
    };
    const pointerRadius = 190;

    const resizeCanvas = () => {
        const rect = hero.getBoundingClientRect();
        particleCanvas.width = rect.width * window.devicePixelRatio;
        particleCanvas.height = rect.height * window.devicePixelRatio;
        particleCanvas.style.width = `${rect.width}px`;
        particleCanvas.style.height = `${rect.height}px`;
        context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

        const area = rect.width * rect.height;
        const nextCount = Math.max(90, Math.min(180, Math.floor(area / 10000)));

        particles.length = 0;
        for (let index = 0; index < nextCount; index += 1) {
            particles.push(createParticle(rect.width, rect.height));
        }
    };

    const createParticle = (width, height) => {
        const x = Math.random() * width;
        const y = Math.random() * height;

        return {
            x,
            y,
            originX: x,
            originY: y,
            offsetX: 0,
            offsetY: 0,
            vx: 0,
            vy: 0,
            size: Math.random() * 1.4 + 0.5,
            length: Math.random() * 6 + 2.5,
            alpha: Math.random() * 0.18 + 0.05,
            glow: 0,
        };
    };

    const updatePointer = (event) => {
        const rect = hero.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.active = true;
    };

    hero.addEventListener("mousemove", updatePointer);
    hero.addEventListener("mouseenter", updatePointer);
    hero.addEventListener("mouseleave", () => {
        pointer.active = false;
    });

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const animateParticles = () => {
        const width = particleCanvas.width / window.devicePixelRatio;
        const height = particleCanvas.height / window.devicePixelRatio;

        context.clearRect(0, 0, width, height);

        for (let index = 0; index < particles.length; index += 1) {
            const particle = particles[index];
            if (pointer.active) {
                const dx = pointer.x - particle.originX;
                const dy = pointer.y - particle.originY;
                const distance = Math.hypot(dx, dy);

                if (distance < pointerRadius) {
                    const influence = 1 - distance / pointerRadius;
                    particle.vx += dx * 0.0025 * influence;
                    particle.vy += dy * 0.0025 * influence;
                    particle.glow += influence * 0.08;
                }
            }

            particle.offsetX += particle.vx;
            particle.offsetY += particle.vy;
            particle.vx *= 0.9;
            particle.vy *= 0.9;
            particle.offsetX *= 0.92;
            particle.offsetY *= 0.92;
            particle.glow *= 0.94;

            particle.x = particle.originX + particle.offsetX;
            particle.y = particle.originY + particle.offsetY;

            context.save();
            context.translate(particle.x, particle.y);
            context.rotate(-0.22);

            const activeAlpha = Math.min(0.95, particle.alpha + particle.glow);
            context.fillStyle = `rgba(255, 255, 255, ${activeAlpha})`;
            context.fillRect(
                -particle.size / 2,
                -particle.length / 2,
                particle.size,
                particle.length
            );

            if (particle.glow > 0.02) {
                context.fillStyle = `rgba(255, 255, 255, ${particle.glow * 0.4})`;
                context.fillRect(
                    -particle.size,
                    -particle.length / 2 - 0.5,
                    particle.size * 2,
                    particle.length + 1
                );
            }

            context.restore();
        }

        requestAnimationFrame(animateParticles);
    };

    animateParticles();
}
