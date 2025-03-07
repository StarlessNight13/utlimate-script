function openCeneleSettings() {
  document.body.classList.add("modal-open");

  const backdrop = document.querySelector(
    ".modal-backdrop"
  ) as HTMLDivElement | null;
  if (backdrop) {
    backdrop.style.backgroundColor = "rgba(29, 29, 29, 0.39)";
  }
  const modal = document.querySelector(
    "#alayahya-reader-settings"
  ) as HTMLDivElement | null;
  if (modal) {
    modal.style.display = "block";
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    modal.role = "dialog";
    const closeButton = document.querySelector(
      "#alayahya-reader-settings .modal-header .close"
    ) as HTMLButtonElement | null;
    if (closeButton) {
      closeButton.addEventListener("click", () => closeCeneleSettings());
    }
  }
}

function closeCeneleSettings() {
  document.body.classList.remove("modal-open");

  const backdrop = document.querySelector(
    ".modal-backdrop"
  ) as HTMLDivElement | null;
  if (backdrop) {
    backdrop.style.backgroundColor = ""; // Reset background color or set to original
  }

  const modal = document.querySelector(
    "#alayahya-reader-settings"
  ) as HTMLDivElement | null;
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("role"); // Or reset to original role if applicable.
  }
}

function openKolnovelSettings() {
  const optxshdElement = document.querySelector(".optxshd");
  if (optxshdElement) {
    optxshdElement.classList.toggle("optxshds");
  }
}

function openRewayatSettings() {
  document.querySelector(".optx-content")?.classList.toggle("optx-content-s");
}

export { openCeneleSettings, openKolnovelSettings, openRewayatSettings };
