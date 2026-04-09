const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const header = $(".site-header");
const revealItems = $$(".reveal");
const hero = $(".hero");
const particleCanvas = $(".hero-particles");
const themeToggle = $("#themeToggle");
const themeToggleText = $(".theme-toggle-text");
const servicesSection = $(".services-section");
const servicesTrack = $(".services-track");
const servicesHint = $("#servicesHint");
const contactToggle = $("#contactToggle");
const contactFormWrap = $("#contactFormWrap");
const contactForm = $("#contactForm");
const contactFormNote = $("#contactFormNote");
const THEME_KEY = "lightyear-theme";

const setTheme = (theme) => {
    const isLight = theme === "light";

    document.body.dataset.theme = theme;

    if (!themeToggle || !themeToggleText) {
        return;
    }

    themeToggle.setAttribute("aria-pressed", String(isLight));
    themeToggleText.textContent = isLight ? "Ativar modo escuro" : "Ativar modo claro";
};

setTheme(localStorage.getItem(THEME_KEY) || "dark");

themeToggle?.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
});

window.addEventListener("scroll", () => {
    header?.classList.toggle("nav-compact", window.pageYOffset > 60);
});

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) {
            return;
        }

        target.classList.add("visible");
        observer.unobserve(target);
    });
}, { threshold: 0.18 });

revealItems.forEach((item) => revealObserver.observe(item));

if (contactToggle && contactFormWrap && contactForm) {
    const setContactFormOpen = (open) => {
        contactFormWrap.hidden = false;
        contactFormWrap.classList.toggle("is-open", open);
        contactToggle.setAttribute("aria-expanded", String(open));
        contactToggle.innerHTML = open ? "Fechar formul&aacute;rio" : "Abrir formul&aacute;rio";

        if (!open) {
            window.setTimeout(() => {
                if (!contactFormWrap.classList.contains("is-open")) {
                    contactFormWrap.hidden = true;
                }
            }, 450);
        }
    };

    setContactFormOpen(false);

    contactToggle.addEventListener("click", () => {
        const open = contactToggle.getAttribute("aria-expanded") !== "true";
        setContactFormOpen(open);

        if (open) {
            contactForm.querySelector("input, textarea")?.focus();
        }
    });

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = new FormData(contactForm);
        const submitButton = contactForm.querySelector(".contact-submit");

        if (contactFormNote) {
            contactFormNote.textContent = "Enviando mensagem...";
            contactFormNote.classList.remove("is-success");
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Enviando...";
        }

        try {
            const response = await fetch("https://formsubmit.co/ajax/lightyearsystemscontato@gmail.com", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                },
                body: data,
            });

            if (!response.ok) {
                throw new Error("Falha no envio");
            }

            if (contactFormNote) {
                contactFormNote.textContent = "Mensagem enviada com sucesso. Vamos entrar em contato em breve.";
                contactFormNote.classList.add("is-success");
            }

            contactForm.reset();
        } catch (error) {
            if (contactFormNote) {
                contactFormNote.textContent = "Nao foi possivel enviar agora. Tente novamente em instantes ou use o e-mail abaixo.";
                contactFormNote.classList.remove("is-success");
            }
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Enviar contato";
            }
        }
    });
}

if (servicesTrack && servicesSection) {
    let dragging = false;
    let moved = false;
    let pointerId = null;
    let startX = 0;
    let startScroll = 0;
    let interacted = false;
    let hintTimer = null;

    const toggleHint = (show) => {
        if (!servicesHint) {
            return;
        }

        servicesHint.classList.toggle("is-visible", show);
    };

    const clearHintTimer = () => {
        clearTimeout(hintTimer);
        hintTimer = null;
    };

    const markInteraction = () => {
        interacted = true;
        toggleHint(false);
        clearHintTimer();
    };

    const scheduleHint = () => {
        clearHintTimer();

        if (interacted) {
            return;
        }

        hintTimer = setTimeout(() => {
            const canScroll = servicesTrack.scrollWidth > servicesTrack.clientWidth;
            toggleHint(canScroll);
        }, 3000);
    };

    const startDrag = ({ clientX, pointerId: currentPointerId }) => {
        dragging = true;
        moved = false;
        pointerId = currentPointerId;
        startX = clientX;
        startScroll = servicesTrack.scrollLeft;
        servicesTrack.classList.add("dragging");
        servicesTrack.setPointerCapture(currentPointerId);
        markInteraction();
    };

    const moveDrag = ({ clientX, pointerId: currentPointerId }) => {
        if (!dragging || currentPointerId !== pointerId) {
            return;
        }

        const distance = clientX - startX;
        moved = moved || Math.abs(distance) > 4;
        servicesTrack.scrollLeft = startScroll - distance;
    };

    const endDrag = () => {
        if (!dragging) {
            return;
        }

        dragging = false;
        pointerId = null;
        servicesTrack.classList.remove("dragging");
    };

    new IntersectionObserver((entries) => {
        entries.forEach(({ isIntersecting }) => {
            toggleHint(false);
            clearHintTimer();

            if (isIntersecting) {
                scheduleHint();
            }
        });
    }, { threshold: 0.45 }).observe(servicesSection);

    const resetTrack = () => {
        servicesTrack.scrollLeft = 0;
    };

    window.addEventListener("load", resetTrack);
    requestAnimationFrame(resetTrack);

    servicesTrack.addEventListener("pointerdown", startDrag);
    servicesTrack.addEventListener("pointermove", moveDrag);
    servicesTrack.addEventListener("pointerup", endDrag);
    servicesTrack.addEventListener("pointercancel", endDrag);
    servicesTrack.addEventListener("lostpointercapture", endDrag);

    servicesTrack.addEventListener("scroll", () => {
        if (servicesTrack.scrollLeft > 12) {
            markInteraction();
        }
    });

    servicesTrack.addEventListener("click", (event) => {
        if (!moved) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        moved = false;
    }, true);
}

if (hero && particleCanvas) {
    const context = particleCanvas.getContext("2d");
    const pointer = { x: 0, y: 0, active: false };
    const particles = [];
    const pointerRadius = 190;
    const dpr = window.devicePixelRatio || 1;

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

    const resizeCanvas = () => {
        const { width, height } = hero.getBoundingClientRect();
        const count = Math.max(90, Math.min(180, Math.floor((width * height) / 10000)));

        particleCanvas.width = width * dpr;
        particleCanvas.height = height * dpr;
        particleCanvas.style.width = `${width}px`;
        particleCanvas.style.height = `${height}px`;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);

        particles.length = 0;
        Array.from({ length: count }, () => createParticle(width, height)).forEach((particle) => {
            particles.push(particle);
        });
    };

    const setPointer = ({ clientX, clientY }) => {
        const rect = hero.getBoundingClientRect();
        pointer.x = clientX - rect.left;
        pointer.y = clientY - rect.top;
        pointer.active = true;
    };

    const animate = () => {
        const width = particleCanvas.width / dpr;
        const height = particleCanvas.height / dpr;
        const color = document.body.dataset.theme === "light" ? "0, 0, 0" : "255, 255, 255";

        context.clearRect(0, 0, width, height);

        particles.forEach((particle) => {
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

            particle.offsetX = (particle.offsetX + particle.vx) * 0.92;
            particle.offsetY = (particle.offsetY + particle.vy) * 0.92;
            particle.vx *= 0.9;
            particle.vy *= 0.9;
            particle.glow *= 0.94;
            particle.x = particle.originX + particle.offsetX;
            particle.y = particle.originY + particle.offsetY;

            context.save();
            context.translate(particle.x, particle.y);
            context.rotate(-0.22);

            const alpha = Math.min(0.95, particle.alpha + particle.glow);
            context.fillStyle = `rgba(${color}, ${alpha})`;
            context.fillRect(-particle.size / 2, -particle.length / 2, particle.size, particle.length);

            if (particle.glow > 0.02) {
                context.fillStyle = `rgba(${color}, ${particle.glow * 0.4})`;
                context.fillRect(-particle.size, -particle.length / 2 - 0.5, particle.size * 2, particle.length + 1);
            }

            context.restore();
        });

        requestAnimationFrame(animate);
    };

    hero.addEventListener("mousemove", setPointer);
    hero.addEventListener("mouseenter", setPointer);
    hero.addEventListener("mouseleave", () => {
        pointer.active = false;
    });

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    animate();
}




