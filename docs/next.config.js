const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
  staticImage: true,
  latex: true,
  flexsearch: {
    codeblock: false,
  },
});

module.exports = withNextra({
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
});
