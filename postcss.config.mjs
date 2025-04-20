const config = {
  plugins: {
    '@tailwindcss/postcss': {
      tailwindConfig: './tailwind.config.js'
    },
    autoprefixer: {},
  }
};

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}

export default config;








/*

const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;

*/