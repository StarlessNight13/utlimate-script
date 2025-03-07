//*  This is the function that runs on all pages.
//? should this be here?

import { Create } from "@/components/creat-element";

export function cenelInit() {
  const link = "/my-account/#user-library";
  const header = document.querySelector<HTMLUListElement>(
    ".main-menu > ul:nth-child(1)"
  );
  const mobileMenu = document.querySelector<HTMLUListElement>(".off-menu > ul");
  if (mobileMenu) {
    const li = document.createElement("li");
    const classesToAdd = [
      "main-menu-item",
      "main-menu-item-depth-0",
      "main-menu-item-type-post_type",
      "main-menu-item-object-page",
      "menu-item",
      "menu-item-object-page",
    ];

    li.classList.add(...classesToAdd);
    const newLink = Create.a({
      href: link,
      className: "main-menu-link menu-link",
      textContent: "User Library",
    });
    li.appendChild(newLink);
    mobileMenu.appendChild(li);
  }
  if (header) {
    document.querySelector<HTMLDivElement>("#menu-item-67965")?.remove();
    const li = document.createElement("li");
    const classesToAdd = [
      "menu-item",
      "menu-item-type-post_type",
      "menu-item-object-page",
      "menu-item-home",
    ];

    li.classList.add(...classesToAdd);
    const newLink = Create.a({
      href: link,
      textContent: "User Library",
    });
    li.appendChild(newLink);
    header.appendChild(li);
  }
}

export function kolnovelInit() {
  const nav = document.querySelector('[role="navigation"] ul');
  const libraryLink = document.createElement("li");
  libraryLink.innerHTML = `<a href="/my-account/#user-library">مكتبة شخصية</a>`;
  const classesToAdd = [
    "menu-item",
    "menu-item-type-custom",
    "menu-item-object-custom",
  ];
  libraryLink.classList.add(...classesToAdd);
  nav?.appendChild(libraryLink);
  document.querySelector("#menu-item-185962")?.remove();
  document.querySelector("#menu-item-185963")?.remove();
}
