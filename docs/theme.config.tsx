import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>My Project</span>,
  darkMode: true,

  project: {
    link: "https://github.com/shuding/nextra-docs-template",
  },
  chat: {
    icon: () => null,
  },
  docsRepositoryBase: "https://github.com/shuding/nextra-docs-template",
  primaryHue: 190,
  footer: {
    component: () => null,
  },
};

export default config;
