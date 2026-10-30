import type { Decorator, Preview } from "@storybook/nextjs-vite";

import "../src/app/globals.css";

const withFoundationTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme === "dark" ? "dark" : "foundation-theme-light";

  return (
    <div className={theme}>
      <div className="min-h-screen bg-foundation-bg text-foundation-ink">
        <div className="mx-auto w-full max-w-[960px] p-6 sm:p-10">
          <Story />
        </div>
      </div>
    </div>
  );
};

const preview: Preview = {
  decorators: [withFoundationTheme],
  initialGlobals: {
    theme: "light",
  },
  globalTypes: {
    theme: {
      description: "Foundation theme",
      toolbar: {
        title: "Theme",
        icon: "contrast",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
};

export default preview;
