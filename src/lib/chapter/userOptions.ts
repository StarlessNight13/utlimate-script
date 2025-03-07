import { Create } from "@/components/creat-element";

export const options = {
  backgroundOptions: {
    dark: [
      {
        backgroundColor: "#1e1e1e",
        color: "#fff",
        name: "Dark Gray",
      },
      {
        backgroundColor: "#000",
        color: "#f0f0f0",
        name: "Pure Black",
      },
      {
        backgroundColor: "#292a2d",
        color: "#d4d4d4",
        name: "Dark Blue Gray",
      },
      {
        backgroundColor: "#333333",
        color: "#ffffff",
        name: "Charcoal Gray",
      },
    ],
    light: [
      {
        backgroundColor: "#f9f9f9",
        color: "#333",
        name: "Light Gray",
      },
      {
        backgroundColor: "#fff",
        color: "#212121",
        name: "Pure White",
      },
      {
        backgroundColor: "#f0f8ff",
        color: "#444",
        name: "Alice Blue",
      },
      {
        backgroundColor: "#faf0e6",
        color: "#555",
        name: "Linen",
      },
      {
        backgroundColor: "#f5f5f5",
        color: "#3a3a3a",
        name: "Lightest Gray",
      },
    ],
  },
} as const;

export function cenelUserOption() {
  return Create.div({
    className: "tw:flex tw:flex-row tw:flex-wrap tw:gap-4",
    children: [
      ...options.backgroundOptions.dark.map((option) => {
        return Create.div({
          className: "background-option tw:cursor-pointer",
          textContent: option.name,
          attributes: {
            // "data-background-color": option.backgroundColor,
            // "data-color": option.color,
            // "data-name": option.name,
            // "data-theme": "dark",
            // title: option.name,
            style: `background-color: ${option.backgroundColor}; border-color: ${option.color}; color: ${option.color};`,
          },
        });
      }),
      ...options.backgroundOptions.light.map((option) => {
        return Create.div({
          className: `background-option tw:cursor-pointer`,
          textContent: option.name,
          attributes: {
            // "data-background-color": option.backgroundColor,
            // "data-color": option.color,
            // "data-name": option.name,
            // "data-theme": "light",
            style: `background-color: ${option.backgroundColor}; border-color: ${option.color};`,
            // title: option.name,
          },
        });
      }),
    ],
  });
}
