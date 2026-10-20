(() => {
  /* Contatos da Spyhop */
  const contacts = {
    joao: {
      name: "João Victor",
      phone: "5561999988403"
    },
    karlos: {
      name: "Karlos Eduardo",
      phone: "5561998813560"
    }
  };

  document.documentElement.classList.add("js-ready");
  document.querySelector("#year").textContent = new Date().getFullYear();

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* Aparição das seções durante a rolagem */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".reveal").forEach(element => {
    revealObserver.observe(element);
  });

  /* Indicador de leitura */
  let scrollPending = false;
  const progress = document.querySelector(".reading-progress");

  function updateProgress() {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${available > 0 ? window.scrollY / available * 100 : 0}%`;
    scrollPending = false;
  }

  window.addEventListener("scroll", () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });

  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* Menu do celular */
  const menuButton = document.querySelector(".menu-button");
  const mobileNav = document.querySelector("#mobile-nav");

  function closeMenu() {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
    mobileNav.hidden = true;
  }

  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";

    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    mobileNav.hidden = !open;
  });

  mobileNav.querySelectorAll("a,button").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !mobileNav.hidden) {
      closeMenu();
      menuButton.focus();
    }
  });

  window.matchMedia("(min-width: 801px)").addEventListener("change", event => {
    if (event.matches) closeMenu();
  });

  /* Fundo de ondas interativas */
  const hero = document.querySelector(".hero");
  const waveCanvas = document.querySelector(".hero-waves");
  const waveContext = waveCanvas.getContext("2d");
  const waveButton = document.querySelector(".hero-play");
  const waveLabel = waveButton.querySelector("[data-wave-label]");
  const waveStatus = document.querySelector("#hero-wave-status");
  const defaultWaveLabel = waveLabel.textContent;

  let waveWidth = 0;
  let waveHeight = 0;
  let wavePixelRatio = 1;
  let waveFrame = 0;
  let lastWaveFrame = 0;
  let waveClock = 0;
  let waveVisible = true;
  let waveResetTimer;
  let waveRings = [];

  const wavePointer = {
    x: 0.5,
    y: 0.45,
    targetX: 0.5,
    targetY: 0.45,
    active: false
  };

  function drawHeroWaves(now) {
    if (!waveContext || !waveWidth || !waveHeight) return;

    waveContext.setTransform(wavePixelRatio, 0, 0, wavePixelRatio, 0, 0);
    waveContext.clearRect(0, 0, waveWidth, waveHeight);

    const rows = waveWidth < 600 ? 12 : 20;
    const spacing = waveWidth < 600 ? 15 : 14;
    const phase = reducedMotion.matches ? 0 : waveClock;

    waveRings = waveRings.filter(ring => now - ring.time < 1650);

    for (let row = 0; row < rows; row++) {
      const baseline = waveHeight * 0.75 + (row - rows / 2) * spacing;

      waveContext.beginPath();

      for (let x = -14; x <= waveWidth + 14; x += 14) {
        let y = baseline
          + Math.sin(x * 0.006 + phase * 0.5 + row * 0.12) * (24 + row * 0.8)
          + Math.cos(x * 0.0025 - phase * 0.24) * 30;

        if (wavePointer.active && !reducedMotion.matches) {
          const dx = (x - wavePointer.x * waveWidth) / 165;
          const dy = (baseline - wavePointer.y * waveHeight) / 150;

          y -= Math.exp(-(dx * dx + dy * dy) / 2) * 50;
        }

        for (const ring of waveRings) {
          const distance = Math.hypot(x - ring.x, baseline - ring.y);
          const radius = (now - ring.time) * 0.48;
          const envelope = Math.exp(-Math.pow((distance - radius) / 70, 2));

          y += Math.sin((distance - radius) / 25)
            * envelope
            * 20
            * (1 - (now - ring.time) / 1650);
        }

        if (x === -14) waveContext.moveTo(x, y);
        else waveContext.lineTo(x, y);
      }

      const alpha = 0.07 + Math.sin(row / rows * Math.PI) * 0.12;

      waveContext.strokeStyle = `rgba(79,195,232,${alpha})`;
      waveContext.lineWidth = 0.75;
      waveContext.stroke();
    }

    for (const ring of waveRings) {
      const amount = (now - ring.time) / 1650;

      waveContext.beginPath();
      waveContext.ellipse(
        ring.x,
        ring.y,
        20 + amount * waveWidth * 0.55,
        12 + amount * waveHeight * 0.38,
        -0.15,
        0,
        Math.PI * 2
      );

      waveContext.strokeStyle = `rgba(79,195,232,${(1 - amount) * 0.34})`;
      waveContext.lineWidth = 1;
      waveContext.stroke();
    }
  }

  function animateHeroWaves(now) {
    waveFrame = 0;

    if (!waveVisible || document.hidden || reducedMotion.matches) return;

    if (!lastWaveFrame || now - lastWaveFrame >= 32) {
      const elapsed = lastWaveFrame
        ? Math.min(now - lastWaveFrame, 60)
        : 32;

      waveClock += elapsed / 1000;
      lastWaveFrame = now;

      wavePointer.x += (wavePointer.targetX - wavePointer.x) * 0.13;
      wavePointer.y += (wavePointer.targetY - wavePointer.y) * 0.13;

      drawHeroWaves(now);
    }

    waveFrame = requestAnimationFrame(animateHeroWaves);
  }

  function resumeHeroWaves() {
    if (
      !waveContext ||
      waveFrame ||
      !waveVisible ||
      document.hidden ||
      reducedMotion.matches
    ) return;

    lastWaveFrame = 0;
    waveFrame = requestAnimationFrame(animateHeroWaves);
  }

  function pauseHeroWaves() {
    cancelAnimationFrame(waveFrame);
    waveFrame = 0;
    lastWaveFrame = 0;
  }

  function sizeHeroWaves() {
    const rect = hero.getBoundingClientRect();

    waveWidth = rect.width;
    waveHeight = rect.height;
    wavePixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

    waveCanvas.width = Math.round(waveWidth * wavePixelRatio);
    waveCanvas.height = Math.round(waveHeight * wavePixelRatio);

    drawHeroWaves(performance.now());
    resumeHeroWaves();
  }

  function resetHeroPointer() {
    wavePointer.active = false;
    wavePointer.targetX = 0.5;
    wavePointer.targetY = 0.45;

    hero.style.setProperty("--pointer-x", "50%");
    hero.style.setProperty("--pointer-y", "45%");
  }

  hero.addEventListener("pointermove", event => {
    if (reducedMotion.matches || event.pointerType === "touch") return;

    const rect = hero.getBoundingClientRect();

    wavePointer.targetX = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left) / rect.width)
    );

    wavePointer.targetY = Math.max(
      0,
      Math.min(1, (event.clientY - rect.top) / rect.height)
    );

    wavePointer.active = true;

    hero.style.setProperty("--pointer-x", `${wavePointer.targetX * 100}%`);
    hero.style.setProperty("--pointer-y", `${wavePointer.targetY * 100}%`);
  });

  hero.addEventListener("pointerleave", resetHeroPointer);

  function makeHeroWave(x = waveWidth / 2, y = waveHeight * 0.68) {
    clearTimeout(waveResetTimer);

    hero.classList.add("is-making-waves");
    waveLabel.textContent = "É assim que um movimento começa.";
    waveStatus.textContent =
      "Sua onda começou. Qual será o próximo movimento da sua marca?";

    if (!reducedMotion.matches && waveContext) {
      waveRings.push({
        x,
        y,
        time: performance.now()
      });

      waveRings = waveRings.slice(-3);
      resumeHeroWaves();
    }

    waveResetTimer = window.setTimeout(() => {
      hero.classList.remove("is-making-waves");
      waveLabel.textContent = defaultWaveLabel;
    }, 1800);
  }

  waveButton.addEventListener("click", () => makeHeroWave());

  hero.addEventListener("click", event => {
    if (
      event.target.closest("a,button,input,select,textarea") ||
      window.getSelection()?.toString()
    ) return;

    const rect = hero.getBoundingClientRect();
    makeHeroWave(event.clientX - rect.left, event.clientY - rect.top);
  });

  /* Movimento sutil no botão principal */
  const heroMagnet = document.querySelector(".hero-actions .button");

  function resetHeroMagnet() {
    heroMagnet.style.setProperty("--magnet-x", "0px");
    heroMagnet.style.setProperty("--magnet-y", "0px");
  }

  heroMagnet.addEventListener("pointermove", event => {
    if (reducedMotion.matches || event.pointerType === "touch") return;

    const rect = heroMagnet.getBoundingClientRect();

    heroMagnet.style.setProperty(
      "--magnet-x",
      `${((event.clientX - rect.left) / rect.width - 0.5) * 8}px`
    );

    heroMagnet.style.setProperty(
      "--magnet-y",
      `${((event.clientY - rect.top) / rect.height - 0.5) * 6}px`
    );
  });

  heroMagnet.addEventListener("pointerleave", resetHeroMagnet);

  reducedMotion.addEventListener("change", () => {
    waveRings = [];
    resetHeroPointer();
    resetHeroMagnet();

    if (reducedMotion.matches) pauseHeroWaves();
    else resumeHeroWaves();

    drawHeroWaves(performance.now());
  });

  new ResizeObserver(sizeHeroWaves).observe(hero);

  new IntersectionObserver(([entry]) => {
    waveVisible = entry.isIntersecting;

    if (waveVisible) resumeHeroWaves();
    else pauseHeroWaves();
  }).observe(hero);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseHeroWaves();
    else resumeHeroWaves();
  });

  sizeHeroWaves();

  /* Iluminação dos cartões */
  document.querySelectorAll(".process-card").forEach(card => {
    card.addEventListener("pointermove", event => {
      if (reducedMotion.matches) return;

      const rect = card.getBoundingClientRect();

      card.style.setProperty("--px", `${event.clientX - rect.left}px`);
      card.style.setProperty("--py", `${event.clientY - rect.top}px`);
    });
  });

  /* Abas de serviços */
  const tabs = [...document.querySelectorAll('[role="tab"]')];

  function activateTab(tab, focus = false) {
    tabs.forEach(item => {
      const active = item === tab;

      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;

      document.getElementById(
        item.getAttribute("aria-controls")
      ).hidden = !active;
    });

    if (focus) tab.focus();
  }

  const tablist = document.querySelector(".service-tabs");

  function updateTabOrientation() {
    tablist.setAttribute(
      "aria-orientation",
      window.innerWidth <= 800 ? "horizontal" : "vertical"
    );
  }

  updateTabOrientation();
  window.addEventListener("resize", updateTabOrientation);

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));

    tab.addEventListener("keydown", event => {
      const direction = ["ArrowDown", "ArrowRight"].includes(event.key)
        ? 1
        : ["ArrowUp", "ArrowLeft"].includes(event.key)
          ? -1
          : 0;

      if (direction) {
        event.preventDefault();

        activateTab(
          tabs[(index + direction + tabs.length) % tabs.length],
          true
        );
      }

      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();

        activateTab(
          tabs[event.key === "Home" ? 0 : tabs.length - 1],
          true
        );
      }
    });
  });

  /* Comparador arrastável */
  const slider = document.querySelector("#comparison-slider");
  const comparison = document.querySelector(".comparison");

  slider.addEventListener("input", () => {
    comparison.style.setProperty("--split", `${slider.value}%`);

    slider.setAttribute(
      "aria-valuetext",
      `${slider.value}% sem direção, ${100 - Number(slider.value)}% com estratégia`
    );
  });

  /* Modal de contato */
  const dialog = document.querySelector("#contact-dialog");
  const form = document.querySelector("#contact-form");
  const feedback = document.querySelector("#contact-feedback");

  let lastContactTrigger;

  document.querySelectorAll("[data-contact]").forEach(button => {
    button.addEventListener("click", () => {
      lastContactTrigger = button;
      feedback.replaceChildren();

      const intent = button.dataset.contact === "conversa"
        ? "duvida"
        : button.dataset.contact;

      const radio = form.querySelector(`input[value="${intent}"]`);

      if (radio) radio.checked = true;

      if (button.dataset.topic) {
        form.elements.topic.value = button.dataset.topic;
      }

      dialog.showModal();
      document.body.classList.add("modal-open");
    });
  });

  document.querySelector(".dialog-close").addEventListener("click", () => {
    dialog.close();
  });

  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;

    const rect = dialog.getBoundingClientRect();

    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    lastContactTrigger?.focus();
  });

  form.elements.name.addEventListener("input", () => {
    form.elements.name.setCustomValidity("");
  });

  /* Mensagem personalizada para WhatsApp */
  function createWhatsAppUrl({ name, topic, intent, message, person }) {
    const contact = contacts[person] || contacts.joao;

    const intentions = {
      orcamento: "Gostaria de pedir um orçamento.",
      agendamento: "Gostaria de agendar uma conversa. Podemos combinar um dia e horário?",
      duvida: "Gostaria de tirar algumas dúvidas.",
      conversa: "Gostaria de conversar sobre a minha marca."
    };

    const text = [
      `Olá, ${contact.name}! Vim pelo site da Spyhop.`,
      `Meu nome é ${name.trim()}. ${intentions[intent] || intentions.conversa}`,
      `Meu interesse: ${topic}.`,
      message.trim() ? `\n${message.trim()}` : ""
    ].filter(Boolean).join("\n");

    return `https://wa.me/${contact.phone}?text=${encodeURIComponent(text)}`;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    if (!form.elements.name.value.trim()) {
      form.elements.name.setCustomValidity(
        "Digite seu nome para começar a conversa."
      );

      form.elements.name.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    const url = createWhatsAppUrl(data);

    window.open(url, "_blank", "noopener,noreferrer");

    feedback.replaceChildren();

    const link = document.createElement("a");

    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Abrir conversa no WhatsApp ↗";
    link.style.textDecoration = "underline";

    feedback.append("Se a conversa não abriu, ", link, ".");
  });
})();