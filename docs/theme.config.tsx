import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        style={{
          width: "20px",
          height: "20px",
          marginRight: "9px",
        }}
        src="https://cdn-icons-png.flaticon.com/512/2111/2111668.png"
        alt="logo"
      />
      <p>Twapi</p>
    </div>
  ),
  darkMode: true,

  project: {
    link: "https://github.com/fero1xd/twapi",
  },
  chat: {
    link: "https://discord.gg/ktE5bEzQbd",
  },
  docsRepositoryBase: "https://github.com/shuding/nextra-docs-template",
  primaryHue: 190,
  footer: {
    component: () => null,
  },
  feedback: {
    content: () => null,
  },
  editLink: {
    component: () => null,
  },
};

export default config;
