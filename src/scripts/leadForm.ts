import { track, getAttribution } from "./site";

const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

const ERROR_TEXT: Record<string, string> = {
  valueMissing: "This field is required.",
  typeMismatch: "Please enter a valid value.",
  patternMismatch: "Please enter a valid phone number.",
  tooLong: "This is too long.",
  rangeUnderflow: "Please enter a larger number.",
  rangeOverflow: "Please enter a smaller number.",
};

function fieldError(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
  for (const key of Object.keys(ERROR_TEXT)) {
    if ((el.validity as unknown as Record<string, boolean>)[key]) {
      if (key === "typeMismatch" && el.type === "email") return "Please enter a valid email address.";
      return ERROR_TEXT[key];
    }
  }
  return el.validationMessage;
}

function setError(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, msg: string | null) {
  const container = (el.closest("fieldset:not(.step)") as HTMLElement) || el.parentElement!;
  const id = `${el.id || el.name}-error`;
  let node = container.querySelector<HTMLElement>(`[data-error-for="${el.name}"]`);
  const targets = el.type === "radio" || el.type === "checkbox"
    ? Array.from(container.querySelectorAll<HTMLInputElement>(`input[name="${el.name}"]`))
    : [el];
  if (!msg) {
    node?.remove();
    targets.forEach((t) => { t.removeAttribute("aria-invalid"); t.removeAttribute("aria-describedby"); });
    return;
  }
  if (!node) {
    node = document.createElement("p");
    node.id = id;
    node.dataset.errorFor = el.name;
    node.className = "mt-1.5 text-sm font-medium text-danger";
    (el.type === "checkbox" ? el.closest("label")! : container).insertAdjacentElement(el.type === "checkbox" ? "afterend" : "beforeend", node);
  }
  node.textContent = msg;
  targets.forEach((t) => { t.setAttribute("aria-invalid", "true"); t.setAttribute("aria-describedby", id); });
}

function validateWithin(root: HTMLElement): boolean {
  const fields = Array.from(root.querySelectorAll<HTMLInputElement>("input, select, textarea")).filter(
    (f) => f.type !== "hidden" && !f.disabled && f.name && f.name !== "company_website",
  );
  const seen = new Set<string>();
  let first: HTMLElement | null = null;
  for (const f of fields) {
    if (f.type === "radio") {
      if (seen.has(f.name)) continue;
      seen.add(f.name);
    }
    if (f.type === "file") continue;
    const ok = f.checkValidity();
    setError(f, ok ? null : fieldError(f));
    if (!ok && !first) first = f;
  }
  if (first) first.focus();
  return !first;
}

function initForm(form: HTMLFormElement) {
  const steps = Array.from(form.querySelectorAll<HTMLFieldSetElement>("fieldset.step"));
  const progress = form.querySelector<HTMLElement>("[data-progress]")!;
  const prevBtn = form.querySelector<HTMLButtonElement>("[data-prev]")!;
  const nextBtn = form.querySelector<HTMLButtonElement>("[data-next]")!;
  const submitBtn = form.querySelector<HTMLButtonElement>("[data-submit]")!;
  const errorBox = form.querySelector<HTMLElement>("[data-form-error]")!;
  const upload = form.querySelector<HTMLElement>("[data-upload]")!;
  const final = form.querySelector<HTMLElement>("[data-final]")!;
  const fileInput = form.querySelector<HTMLInputElement>("[data-file-input]")!;
  const fileList = form.querySelector<HTMLElement>("[data-file-list]")!;
  const formId = form.dataset.formId!;
  const formType = form.dataset.formType!;
  let current = 0;
  let started = false;

  // Move upload control into its designated step slot, and consent into the last step.
  const slot = form.querySelector<HTMLElement>("[data-upload-slot]");
  if (slot) {
    if (slot.dataset.uploadLabel) {
      form.querySelector<HTMLElement>("[data-upload-text]")!.innerHTML =
        `${slot.dataset.uploadLabel.replace(/\((.+)\)/, '<span class="font-normal text-muted">($1)</span>')}`;
    }
    upload.classList.remove("mt-5");
    slot.replaceWith(upload);
  }
  steps[steps.length - 1].appendChild(final);

  // Preselect service from query string (?service=...)
  const qsService = new URLSearchParams(location.search).get("service");
  const svcSelect = form.querySelector<HTMLSelectElement>('select[name="service_type"]');
  if (qsService && svcSelect && Array.from(svcSelect.options).some((o) => o.value === qsService)) svcSelect.value = qsService;

  progress.classList.remove("hidden");
  nextBtn.classList.remove("hidden");

  const show = (i: number, focus = true) => {
    current = i;
    steps.forEach((s, idx) => (s.hidden = idx !== i));
    form.querySelectorAll<HTMLElement>("[data-step-indicator]").forEach((el, idx) => {
      el.querySelector<HTMLElement>("[data-bar]")!.style.background =
        idx <= i ? "linear-gradient(90deg,#7fe3ff,#1677ff)" : "";
      el.querySelector<HTMLElement>("[data-label]")!.classList.toggle("text-white", idx === i);
      if (idx === i) el.setAttribute("aria-current", "step"); else el.removeAttribute("aria-current");
    });
    const last = i === steps.length - 1;
    prevBtn.classList.toggle("hidden", i === 0);
    nextBtn.classList.toggle("hidden", last);
    submitBtn.classList.toggle("hidden", !last);
    if (focus) {
      const legend = steps[i].querySelector("legend");
      if (legend) { legend.setAttribute("tabindex", "-1"); (legend as HTMLElement).focus({ preventScroll: true }); }
      const top = form.getBoundingClientRect().top + scrollY - 100;
      if (top < scrollY) scrollTo({ top, behavior: "smooth" });
    }
  };
  show(0, false);

  form.addEventListener("input", (e) => {
    if (!started) { started = true; track("form_start", { form_id: formId, lead_type: formType }); }
    const t = e.target as HTMLInputElement;
    if (t.getAttribute("aria-invalid") === "true" && t.checkValidity()) setError(t, null);
  });
  form.addEventListener("change", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === "service_type") track("select_service_type", { service_type: t.value, form_id: formId });
    if (t.type === "radio" && t.checkValidity()) setError(t, null);
  });

  // Keyboard "Next"/Enter moves through fields instead of submitting early.
  form.addEventListener("keydown", (e) => {
    const t = e.target as HTMLElement;
    if (e.key !== "Enter" || t.tagName !== "INPUT" || (t as HTMLInputElement).type === "checkbox") return;
    e.preventDefault();
    const fields = Array.from(steps[current].querySelectorAll<HTMLElement>("input:not([type=hidden]):not([type=radio]):not([type=file]), select, textarea"));
    const next = fields[fields.indexOf(t) + 1];
    if (next) next.focus();
    else if (current < steps.length - 1) nextBtn.click();
    else (t as HTMLInputElement).blur();
  });

  nextBtn.addEventListener("click", () => {
    if (!validateWithin(steps[current])) { track("form_error", { form_id: formId, step: current + 1, reason: "validation" }); return; }
    track("form_step_complete", { form_id: formId, step: current + 1 });
    show(current + 1);
  });
  prevBtn.addEventListener("click", () => show(current - 1));

  // Files
  fileInput.addEventListener("change", () => {
    const files = Array.from(fileInput.files || []);
    fileList.innerHTML = "";
    let problem = "";
    if (files.length > MAX_FILES) problem = `Please choose up to ${MAX_FILES} files.`;
    const big = files.find((f) => f.size > MAX_FILE_BYTES);
    if (big) problem = `"${big.name}" is larger than 10 MB.`;
    if (problem) {
      fileInput.value = "";
      const li = document.createElement("li");
      li.className = "text-danger";
      li.textContent = problem;
      fileList.appendChild(li);
      return;
    }
    files.forEach((f) => {
      const li = document.createElement("li");
      li.className = "flex items-center gap-2";
      li.textContent = `✓ ${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)`;
      fileList.appendChild(li);
    });
    if (files.length) track("upload_file", { form_id: formId, file_count: files.length });
  });

  // Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.classList.add("hidden");
    // Validate every step; jump to the first one with a problem.
    for (let i = 0; i < steps.length; i++) {
      steps[i].hidden = false;
      const ok = validateWithin(steps[i]);
      steps[i].hidden = i !== current;
      if (!ok) { show(i); validateWithin(steps[i]); track("form_error", { form_id: formId, step: i + 1, reason: "validation" }); return; }
    }

    const eventId = crypto.randomUUID?.() || String(Date.now());
    form.querySelector<HTMLInputElement>("[data-event-id]")!.value = eventId;
    form.querySelector<HTMLInputElement>("[data-attribution]")!.value = JSON.stringify(getAttribution());
    form.querySelector<HTMLInputElement>("[data-page-url]")!.value = location.pathname + location.search;

    submitBtn.disabled = true;
    submitBtn.querySelector("[data-spinner]")!.classList.remove("hidden");
    submitBtn.querySelector("[data-submit-label]")!.textContent = "Sending…";

    try {
      const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      const attr = getAttribution().last as Record<string, string>;
      track("form_submit", { form_id: formId, lead_type: formType });
      track("generate_lead", {
        event_id: eventId,
        lead_type: formType,
        service_type: (new FormData(form).get("service_type") as string) || "",
        form_id: formId,
        landing_page: attr.landing_page || "",
        utm_source: attr.utm_source || "",
        utm_medium: attr.utm_medium || "",
        utm_campaign: attr.utm_campaign || "",
      });
      try { sessionStorage.setItem("coe-last-lead", JSON.stringify({ type: formType, name: new FormData(form).get("first_name") })); } catch {}
      location.href = data.redirect || `/thank-you?type=${formType}`;
    } catch (err) {
      errorBox.textContent = (err as Error).message;
      errorBox.classList.remove("hidden");
      errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
      track("form_error", { form_id: formId, reason: "submit" });
      submitBtn.disabled = false;
      submitBtn.querySelector("[data-spinner]")!.classList.add("hidden");
      submitBtn.querySelector("[data-submit-label]")!.textContent = "Try Again";
    }
  });
}

document.querySelectorAll<HTMLFormElement>("[data-lead-form]").forEach(initForm);
