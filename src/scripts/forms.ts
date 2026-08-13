function injectTrackingFields(form: HTMLFormElement) {
  const urlParams = new URLSearchParams(window.location.search);
  const fullUrl = window.location.href;
  const pathName = window.location.pathname;
  const searchParams = window.location.search;

  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
  const capturedData: Record<string, string> = {};

  utmKeys.forEach((key) => {
    const val = urlParams.get(key);
    if (val) {
      capturedData[key] = val;
      try { sessionStorage.setItem(`track_${key}`, val); } catch {}
    } else {
      try { capturedData[key] = sessionStorage.getItem(`track_${key}`) || ''; } catch { capturedData[key] = ''; }
    }
  });

  const dataToInject: Record<string, string> = {
    ...capturedData,
    landing_page: pathName,
    landing_url: fullUrl,
    'URL da página': fullUrl,
    Fonte: `Landing page${pathName}${searchParams}`,
  };

  Object.keys(dataToInject).forEach((key) => {
    let input = form.querySelector<HTMLInputElement>(`input[name="${key}"], input[name="form_fields[${key}]"]`);
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      form.appendChild(input);
    }
    input.value = dataToInject[key];
  });
}

export function initForms() {
  const forms = document.querySelectorAll<HTMLFormElement>('form[data-form-id]');
  forms.forEach((form) => {
    if ((form as any).__formsInitialized) return;
    (form as any).__formsInitialized = true;

    let started = false;
    const formId  = form.dataset.formId!;
    const project = form.dataset.project || window.location.hostname;

    const submitUrl   = form.dataset.submitUrl;
    const redirectUrl = form.dataset.redirect;
    const gridId      = form.dataset.gridId;
    const successId   = form.dataset.successId;

    if (!submitUrl) {
      console.warn(`[Forms] Formulário ${formId} sem URL de webhook (data-submit-url).`);
      return;
    }

    // Injeção imediata dos campos de UTM e Rastreamento na inicialização
    injectTrackingFields(form);

    form.addEventListener('focusin', () => {
      if (!started) {
        started = true;
        (window as any).dataLayer?.push({ event: 'form_start', form_id: formId, project });
      }
    });

    // O botão é type="button" (não type="submit") de propósito: sem evento submit nativo,
    // o listener de captura do GTM ("Form Submission" automático) não tem o que interceptar,
    // então não dispara gtm.formSubmit em cliques que falham na validação.
    const submitBtn = form.querySelector<HTMLButtonElement>('.form-submit, button');

    let isSubmitting = false;

    async function handleSubmit() {
      if (isSubmitting) return;

      const hp = form.querySelector<HTMLInputElement>('[name="website"]');
      if (hp && hp.value) return;

      // Validação de campos obrigatórios
      let firstInvalid: HTMLElement | null = null;
      let isValid = true;

      form.querySelectorAll<HTMLElement>('[required]').forEach((field) => {
        const isEmpty =
          !(field as HTMLInputElement).value ||
          (field.tagName === 'SELECT' && (field as HTMLSelectElement).value === '');

        if (isEmpty) {
          isValid = false;
          (field as HTMLElement).style.borderColor = '#ef4444';
          (field as HTMLElement).style.outline = '2px solid #ef4444';
          if (!firstInvalid) firstInvalid = field;
          const clearError = () => {
            (field as HTMLElement).style.removeProperty('border-color');
            (field as HTMLElement).style.removeProperty('outline');
            field.removeEventListener('input', clearError);
            field.removeEventListener('change', clearError);
          };
          field.addEventListener('input', clearError);
          field.addEventListener('change', clearError);
        }
      });

      // Validação de formato: email
      form.querySelectorAll<HTMLInputElement>('input[type="email"]').forEach((field) => {
        if (!field.value) return; // campo vazio já capturado pelo required acima
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value);
        if (!ok) {
          isValid = false;
          (field as HTMLElement).style.borderColor = '#ef4444';
          (field as HTMLElement).style.outline = '2px solid #ef4444';
          if (!firstInvalid) firstInvalid = field;
          const clear = () => {
            (field as HTMLElement).style.removeProperty('border-color');
            (field as HTMLElement).style.removeProperty('outline');
            field.removeEventListener('input', clear);
          };
          field.addEventListener('input', clear);
        }
      });

      // Validação de formato: telefone (mínimo 10 dígitos — DDD + número)
      form.querySelectorAll<HTMLInputElement>('[name="telefone"], [name="form_fields[telefone]"]').forEach((field) => {
        if (!field.value) return;
        const digits = field.value.replace(/\D/g, '');
        if (digits.length < 10) {
          isValid = false;
          (field as HTMLElement).style.borderColor = '#ef4444';
          (field as HTMLElement).style.outline = '2px solid #ef4444';
          if (!firstInvalid) firstInvalid = field;
          const clear = () => {
            (field as HTMLElement).style.removeProperty('border-color');
            (field as HTMLElement).style.removeProperty('outline');
            field.removeEventListener('input', clear);
          };
          field.addEventListener('input', clear);
        }
      });

      if (!isValid) {
        firstInvalid!.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (firstInvalid as HTMLElement).focus();
        return;
      }

      isSubmitting = true;

      const btnText    = submitBtn?.querySelector<HTMLElement>('.btn-text');
      const btnLoading = submitBtn?.querySelector<HTMLElement>('.btn-loading');

      const msgEl = gridId
        ? document.getElementById(gridId)?.querySelector('[id$="FormMsg"]') as HTMLElement | null
        : form.querySelector('.form-error') as HTMLElement | null;

      if (submitBtn) submitBtn.disabled = true;

      if (btnText && btnLoading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-flex';
      } else if (submitBtn && !submitBtn.querySelector('.btn-loading')) {
        const originalText = submitBtn.innerHTML;
        submitBtn.dataset.originalText = originalText;
        submitBtn.innerHTML = 'Enviando...';
      }

      if (msgEl) msgEl.style.display = 'none';

      // Atualiza/garante os campos ocultos de rastreamento antes de ler os dados
      injectTrackingFields(form);

      // Chave de cada campo = texto do <label> associado (com os ":" originais do Elementor).
      // Campos ocultos sem <label> (ex: "fonte", "url", "utm_source") caem no fallback: nome do campo.
      const labeledFields: Record<string, string> = {};
      form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea').forEach((field) => {
        if (!field.name || field.name === 'website') return;
        const label = field.id ? form.querySelector<HTMLLabelElement>(`label[for="${field.id}"]`) : null;
        let key = label?.textContent?.trim() || '';
        if (!key) {
          const match = field.name.match(/^form_fields\[(.+)\]$/);
          const inner = match ? match[1] : field.name;
          key = inner.startsWith('utm_') || inner === 'fbclid' || inner === 'gclid' || inner === 'landing_page' || inner === 'landing_url'
            ? inner
            : inner.charAt(0).toUpperCase() + inner.slice(1);
        }
        labeledFields[key] = field.value;
      });

      const now = new Date();
      const formIdField = form.querySelector<HTMLInputElement>('[name="form_id"]');

      const payload: Record<string, string> = {
        ...labeledFields,
        Data: now.toLocaleDateString('pt-BR'),
        'Horário': now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        'URL da página': window.location.href,
        'Agente de usuário': navigator.userAgent,
        'IP remoto': '',
        'Desenvolvido por': 'Dmove',
        form_id: formIdField?.value || formId,
        form_name: form.name || formId,
      };

      try {
        const res = await fetch(submitUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('http_' + res.status);

        let json: any = {};
        try { json = await res.json(); } catch {}

        (window as any).dataLayer?.push({ event: 'form_submit', form_id: formId, project, ...labeledFields });

        const redir = redirectUrl || json.redirect;
        if (redir) {
          window.location.href = redir;
          return;
        }

        const gridEl    = gridId    ? document.getElementById(gridId)    : null;
        const successEl = successId ? document.getElementById(successId) : null;

        if (gridEl && successEl) {
          gridEl.style.display = 'none';
          successEl.classList.add('active');
        } else {
          form.innerHTML = `
            <div style="text-align:center;padding:2rem;">
              <div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;background:var(--color-primary,#2563eb);border-radius:50%;color:white;">✓</div>
              <h3 style="font-size:1.15rem;font-weight:600;margin-bottom:4px;">Enviado com sucesso!</h3>
              <p style="color:#666;font-size:0.9rem;">Em breve entraremos em contato.</p>
            </div>`;
        }
      } catch (err: any) {
        (window as any).dataLayer?.push({ event: 'form_error', form_id: formId, error: err.message });

        if (msgEl) {
          msgEl.innerHTML = 'Erro ao enviar. Tente novamente mais tarde.';
          msgEl.style.display = 'block';
        } else {
          alert('Erro ao enviar o formulário. Tente novamente mais tarde.');
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          if (btnText && btnLoading) {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
          } else if (submitBtn.dataset.originalText) {
            submitBtn.innerHTML = submitBtn.dataset.originalText;
          }
        }
      } finally {
        isSubmitting = false;
      }
    }

    submitBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      handleSubmit();
    });

    form.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') return;
      e.preventDefault();
      handleSubmit();
    });
  });
}
