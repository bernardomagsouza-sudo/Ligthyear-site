
// =========================================================
// SCRIPT.JS - COMPORTAMENTO (INTERATIVIDADE) DO SITE LIGHTYEAR
// =========================================================
// Indice:
//   1. Atalhos e elementos da pagina
//   2. Configuracoes (tema e formulario)
//   3. Tema claro / escuro
//   4. Cabecalho que encolhe ao rolar
//   5. Animacao de entrada dos blocos (.reveal)
//   6. Formulario de contato (abrir/fechar e enviar por e-mail)
//   7. Carrossel de servicos (arrastar com o mouse e dica)
//   8. Particulas animadas do hero
//   9. Rolagem automatica do carrossel
// =========================================================
//
// ---------- 1. ATALHOS ----------
// $  = pega UM elemento pelo seletor CSS (document.querySelector)
// $$ = pega VARIOS elementos e devolve uma lista (querySelectorAll)
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

// ---------- 1b. ELEMENTOS DA PAGINA ----------
// Cada constante guarda um elemento do index.html para ser usado mais abaixo.
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
// ---------- 2. CONFIGURACOES ----------
// THEME_KEY: nome com que o tema escolhido fica salvo no navegador (localStorage).
const THEME_KEY = "lightyear-theme";
// FORM_EMAIL: e-mail da Lightyear que RECEBE as mensagens do formulario.
const FORM_EMAIL = "lightyearsystemscontato@gmail.com";
// FORM_ENDPOINT: endereco do servico FormSubmit que repassa a mensagem para o e-mail acima.
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${FORM_EMAIL}`;
// FORM_DEBUG: true = mostra na tela o MOTIVO tecnico quando o envio falha (bom para testar).
// Quando o formulario estiver funcionando, troque para false para o visitante ver so a mensagem simples.
const FORM_DEBUG = true;


// ---------- 3. TEMA CLARO / ESCURO ----------
// setTheme: aplica o tema no <body> (data-theme="light" ou "dark"), que o CSS usa para trocar as cores,
// e atualiza o estado/rotulo acessivel do botao.
const setTheme = (theme) => {
    const isLight = theme === "light";

    document.body.dataset.theme = theme;

    if (!themeToggle || !themeToggleText) {
        return;
    }

    themeToggle.setAttribute("aria-pressed", String(isLight));
    themeToggleText.textContent = isLight ? "Ativar modo escuro" : "Ativar modo claro";
};

// Ao abrir o site: usa o tema salvo da ultima visita; se nao houver, comeca no escuro.
setTheme(localStorage.getItem(THEME_KEY) || "dark");

// Clique no botao: alterna entre claro/escuro e salva a escolha no navegador.
themeToggle?.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
});


// ---------- 4. CABECALHO COMPACTO ----------
// Depois de rolar 60px, adiciona a classe .nav-compact no cabecalho (fica menor e mais escuro).
window.addEventListener("scroll", () => {
    header?.classList.toggle("nav-compact", window.pageYOffset > 60);
});


// ---------- 5. ANIMACAO DE ENTRADA (.reveal) ----------
// O IntersectionObserver avisa quando um bloco aparece na tela (18% visivel).
// Nesse momento ele ganha a classe .visible (o CSS faz o fade/slide) e deixa de ser observado.
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) {
            return;
        }

        target.classList.add("visible");
        observer.unobserve(target);
    });
}, { threshold: 0.18 });

// Liga o observador em todos os elementos que tem a classe .reveal.
revealItems.forEach((item) => revealObserver.observe(item));


// ---------- 6. FORMULARIO DE CONTATO ----------
// So roda se os tres elementos existirem na pagina (evita erro em outras paginas).
if (contactToggle && contactFormWrap && contactForm) {
    // setContactFormOpen(true/false): abre ou fecha o formulario com animacao
    // (classe .is-open), atualiza o texto do botao e o atributo aria-expanded.
    // Ao fechar, espera 450ms (tempo da animacao do CSS) para esconder de vez com hidden.
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

    // Estado inicial: formulario fechado.
    setContactFormOpen(false);

    // Clique em "Abrir/Fechar formulario": inverte o estado e, ao abrir, foca no primeiro campo.
    contactToggle.addEventListener("click", () => {
        const open = contactToggle.getAttribute("aria-expanded") !== "true";
        setContactFormOpen(open);

        if (open) {
            contactForm.querySelector("input, textarea")?.focus();
        }
    });

    // ENVIO DO FORMULARIO
    // Passos: (1) impede o recarregamento da pagina, (2) valida os campos, (3) monta os dados,
    // (4) envia ao FormSubmit, (5) mostra sucesso ou erro.
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // (2) Validacao: se faltar campo obrigatorio, mostra o aviso do navegador e para aqui.
        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();

            if (contactFormNote) {
                contactFormNote.textContent = "Preencha todos os campos obrigatorios antes de enviar.";
                contactFormNote.classList.remove("is-success");
            }

            return;
        }

        // (3) Coleta todos os campos (nome, email, empresa, telefone, mensagem e os campos ocultos _subject, _template...).
        // Tambem guarda o botao de envio para bloquear enquanto envia.
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

        // Responder direto ao cliente ao clicar em "Responder" no Gmail
        data.set("_replyto", String(data.get("email") || ""));

        // Transforma os dados em um objeto simples para enviar como JSON.
        const payload = Object.fromEntries(data.entries());

        try {
            // CAUSA COMUM DE FALHA: o FormSubmit NAO aceita envio de pagina aberta direto do arquivo (file://).
            // Teste pelo Live Server ou pelo site publicado (https://).
            if (window.location.protocol === "file:") {
                throw new Error("FILE_PROTOCOL");
            }

            // (4) Envia os dados (POST em JSON) para o FormSubmit e espera a resposta.
            const response = await fetch(FORM_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            // Le a resposta JSON do FormSubmit (se nao vier JSON valido, fica null).
            let result = null;

            try {
                result = await response.json();
            } catch (parseError) {
                result = null;
            }

            // O FormSubmit pode responder 200 com success "false" (ex.: e-mail ainda nao ativado)
            const accepted = response.ok && result && String(result.success) === "true";

            if (!accepted) {
                console.error("FormSubmit recusou o envio:", response.status, result);
                throw new Error((result && result.message) || "Falha no envio");
            }

            if (contactFormNote) {
                contactFormNote.textContent = "Mensagem enviada com sucesso. Vamos entrar em contato em breve.";
                contactFormNote.classList.add("is-success");
            }

            // (5) Sucesso: limpa os campos do formulario.
            contactForm.reset();
        } catch (error) {
            if (contactFormNote) {
                const subject = encodeURIComponent("Novo contato pelo site Lightyear Systems");
                const body = encodeURIComponent(
                    `Nome: ${payload.nome || ""}\nE-mail: ${payload.email || ""}\nEmpresa: ${payload.empresa || ""}\nTelefone: ${payload.telefone || ""}\n\n${payload.mensagem || ""}`
                );

                // (5) Erro: descobre o motivo (file://, sem internet, e-mail nao ativado ou resposta do FormSubmit),
                // registra no console (F12) e, se FORM_DEBUG for true, mostra na tela.
                // Em seguida oferece um link mailto: como plano B, ja com a mensagem preenchida.
                const rawMessage = String((error && error.message) || "");
                let reason = "";

                if (rawMessage === "FILE_PROTOCOL") {
                    reason = "O formulario nao funciona com o site aberto direto do arquivo (file://). Abra pelo Live Server ou pelo site publicado.";
                } else if (error instanceof TypeError) {
                    reason = "Sem conexao com o servico de envio (internet, bloqueio do navegador ou extensao).";
                } else if (/activat/i.test(rawMessage)) {
                    reason = "O e-mail de destino ainda nao foi ativado no FormSubmit. Abra o e-mail de ativacao na caixa da Lightyear e clique em Activate.";
                } else if (rawMessage) {
                    reason = `Resposta do FormSubmit: ${rawMessage}`;
                }

                console.error("Falha no envio do formulario:", reason || error);

                contactFormNote.classList.remove("is-success");
                contactFormNote.textContent = `${FORM_DEBUG && reason ? `${reason} ` : ""}Nao foi possivel enviar agora. Tente novamente em instantes ou `;

                const fallback = document.createElement("a");
                fallback.href = `mailto:${FORM_EMAIL}?subject=${subject}&body=${body}`;
                fallback.textContent = "envie pelo seu aplicativo de e-mail";
                contactFormNote.appendChild(fallback);
                contactFormNote.append(".");
            }
        } finally {
            if (submitButton) {
                // Sempre ao terminar (com sucesso ou erro): libera o botao novamente.
                submitButton.disabled = false;
                submitButton.textContent = "Enviar contato";
            }
        }
    });
}


// ---------- 7. CARROSSEL DE SERVICOS: ARRASTAR + DICA ----------
// Permite arrastar os cards para o lado com o mouse e mostra a dica "Arraste para o lado".
if (servicesTrack && servicesSection) {
    // Variaveis de controle:
    // dragging = esta arrastando agora? | moved = o mouse realmente se moveu? (evita clique acidental)
    // startX / startScroll = posicao inicial do mouse e da rolagem | interacted = usuario ja interagiu?
    let dragging = false;
    let moved = false;
    let pointerId = null;
    let startX = 0;
    let startScroll = 0;
    let interacted = false;
    let hintTimer = null;

    // Mostra/esconde a dica "Arraste para o lado".
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

    // Quando o usuario interage, a dica some para sempre.
    const markInteraction = () => {
        interacted = true;
        toggleHint(false);
        clearHintTimer();
    };

    // Agenda a dica para aparecer 3s depois de a secao ficar visivel (so se houver o que rolar).
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

    // Inicio do arraste: guarda onde o mouse e a rolagem estavam e "prende" o ponteiro ao carrossel.
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

    // Durante o arraste: rola o carrossel na mesma distancia que o mouse andou.
    const moveDrag = ({ clientX, pointerId: currentPointerId }) => {
        if (!dragging || currentPointerId !== pointerId) {
            return;
        }

        const distance = clientX - startX;
        moved = moved || Math.abs(distance) > 4;
        servicesTrack.scrollLeft = startScroll - distance;
    };

    // Fim do arraste: solta o carrossel.
    const endDrag = () => {
        if (!dragging) {
            return;
        }

        dragging = false;
        pointerId = null;
        servicesTrack.classList.remove("dragging");
    };

    // Observa a secao de servicos: quando ela entra na tela, agenda a dica; quando sai, esconde.
    new IntersectionObserver((entries) => {
        entries.forEach(({ isIntersecting }) => {
            toggleHint(false);
            clearHintTimer();

            if (isIntersecting) {
                scheduleHint();
            }
        });
    }, { threshold: 0.45 }).observe(servicesSection);

    // Garante que o carrossel comece sempre no primeiro card.
    const resetTrack = () => {
        servicesTrack.scrollLeft = 0;
    };

    window.addEventListener("load", resetTrack);
    requestAnimationFrame(resetTrack);

    // Liga os eventos do ponteiro (mouse/toque) as funcoes de arraste acima.
    servicesTrack.addEventListener("pointerdown", startDrag);
    servicesTrack.addEventListener("pointermove", moveDrag);
    servicesTrack.addEventListener("pointerup", endDrag);
    servicesTrack.addEventListener("pointercancel", endDrag);
    servicesTrack.addEventListener("lostpointercapture", endDrag);

    // Se o usuario rolar o carrossel de outra forma (ex.: trackpad), tambem conta como interacao.
    servicesTrack.addEventListener("scroll", () => {
        if (servicesTrack.scrollLeft > 12) {
            markInteraction();
        }
    });

    // Se houve arraste, cancela o clique que o navegador dispararia ao soltar o mouse.
    servicesTrack.addEventListener("click", (event) => {
        if (!moved) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        moved = false;
    }, true);
}


// ---------- 8. PARTICULAS DO HERO ----------
// Desenha tracos de luz no <canvas> do topo. Eles reagem ao mouse: se aproximam e brilham.
if (hero && particleCanvas) {
    const context = particleCanvas.getContext("2d");
    const pointer = { x: 0, y: 0, active: false };
    const particles = [];
    const pointerRadius = 190;
    const dpr = window.devicePixelRatio || 1;

    // Cria uma particula em posicao aleatoria, com tamanho, comprimento e transparencia aleatorios.
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

    // Ajusta o canvas ao tamanho da secao hero (e a telas de alta resolucao) e recria as particulas (entre 90 e 180).
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

    // Guarda a posicao do mouse relativa a secao hero.
    const setPointer = ({ clientX, clientY }) => {
        const rect = hero.getBoundingClientRect();
        pointer.x = clientX - rect.left;
        pointer.y = clientY - rect.top;
        pointer.active = true;
    };

    // Loop de animacao (roda a cada quadro): move as particulas perto do mouse, aplica atrito para voltarem
    // ao lugar e desenha cada uma. A cor muda conforme o tema (preto no claro, branco no escuro).
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

    // Eventos do mouse: atualiza a posicao ao mover/entrar e desativa o efeito ao sair do hero.
    hero.addEventListener("mousemove", setPointer);
    hero.addEventListener("mouseenter", setPointer);
    hero.addEventListener("mouseleave", () => {
        pointer.active = false;
    });

    // Ao redimensionar a janela recalcula o canvas; depois liga a primeira vez e inicia a animacao.
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    animate();
}




// === Services autoplay scroll ===
if (servicesTrack) {

    // ---------- 9. ROLAGEM AUTOMATICA DO CARROSSEL ----------
    // autoScrollSpeed = pixels por quadro | userPaused = pausado pelo usuario?
    // rewinding / rewindStart / rewindFrom / rewindDuration = controle da volta suave ao inicio (1,2s).
    let autoScrollSpeed = 0.6;
    let userPaused = false;
    let resumeTimer = null;
    let rewinding = false;
    let rewindStart = null;
    let rewindFrom = 0;
    const rewindDuration = 1200; // ms

    // Curva de aceleracao suave (comeca devagar, acelera e termina devagar) usada na volta ao inicio.
    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // A cada quadro: se nao estiver pausado, avanca o carrossel; ao chegar no fim, volta suavemente ao inicio.
    const autoScroll = (timestamp) => {
        if (!userPaused) {
            const maxScroll = servicesTrack.scrollWidth - servicesTrack.clientWidth;

            if (rewinding) {
                if (!rewindStart) rewindStart = timestamp;
                const elapsed = timestamp - rewindStart;
                const progress = Math.min(elapsed / rewindDuration, 1);
                servicesTrack.scrollLeft = rewindFrom * (1 - easeInOutCubic(progress));
                if (progress >= 1) {
                    rewinding = false;
                    rewindStart = null;
                }
            } else if (servicesTrack.scrollLeft >= maxScroll) {
                rewinding = true;
                rewindFrom = servicesTrack.scrollLeft;
                rewindStart = null;
            } else {
                servicesTrack.scrollLeft += autoScrollSpeed;
            }
        }
        // Inicia o loop da rolagem automatica.
        requestAnimationFrame(autoScroll);
    };

    // Pausa a rolagem automatica ao passar o mouse, clicar ou usar a roda; volta sozinha apos 3s sem interacao.
    const pauseAutoScroll = () => {
        userPaused = true;
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(() => { userPaused = false; }, 3000);
    };

    // Eventos que pausam a rolagem automatica.
    servicesTrack.addEventListener("pointerenter", pauseAutoScroll);
    servicesTrack.addEventListener("pointerdown", pauseAutoScroll);
    servicesTrack.addEventListener("wheel", pauseAutoScroll, { passive: true });

    requestAnimationFrame(autoScroll);
}