import { Create } from "@/components/creat-element";
import { Bot, createElement } from "lucide";

const updateBodyClasses = (isEnabled: boolean): void => {
  if (isEnabled) {
    document.body.classList.add("removeELements");
  } else {
    document.body.classList.remove("removeELements");
  }
};

export function appendCeneleToggle() {
  // Toggle
  const toggle = creatToggle();
  const section = document.createElement("section");
  const header = document.createElement("h4");
  header.textContent = "Auto Loader";
  section.appendChild(header);
  section.appendChild(toggle);

  const modal = document.querySelector(
    ".modal-dialog-centered > div:nth-child(1) > div:nth-child(2)"
  ) as HTMLDivElement | null;

  if (modal) {
    modal.appendChild(section);
  }
}

export function appendKolnovelToggle() {
  const toggle = creatToggle();
  const section = Create.div({
    className: "optx-group",
    children: [
      Create.div({
        className: "optx-label",
        textContent: "Auto Loader",
      }),
      toggle,
    ],
  });

  const modal = document.querySelector(".optx-content") as HTMLDivElement | null;
  if (modal) {
    modal.appendChild(section);
  }
}

function creatToggle() {
  const toggleContainer = Create.div({
    className: "toggle-container",
    id: "toggle-container",
  });

  const userSettingsItemInput = document.createElement("input");
  userSettingsItemInput.type = "checkbox";
  userSettingsItemInput.className = "tw:hidden";
  userSettingsItemInput.id = "auto-loader-toggle";
  toggleContainer.appendChild(userSettingsItemInput);

  const savedSetting = localStorage.getItem("autoLoaderState");
  if (savedSetting) {
    userSettingsItemInput.checked = true;
  } else {
    localStorage.setItem("autoLoaderState", "false");
  }
  userSettingsItemInput.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    const autoLoaderState = target.checked;
    updateBodyClasses(autoLoaderState);
    // Update localStorage
    localStorage.setItem("autoLoaderState", String(autoLoaderState));
  });

  const userSettingsItemLabel = document.createElement("label");
  userSettingsItemLabel.htmlFor = "auto-loader-toggle";
  userSettingsItemLabel.textContent = "Auto Loader";
  userSettingsItemLabel.className = "endless-toggle ";
  const bot = createElement(Bot);
  userSettingsItemLabel.appendChild(bot);
  toggleContainer.appendChild(userSettingsItemLabel);

  // Return the container element, which now holds the toggle
  return toggleContainer;
}
