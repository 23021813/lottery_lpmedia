module.exports = {
  apps: [
    {
      name: "LamPhuong Media - Development",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development"
      },
      watch: false,
      cwd: "./", // thư mục gốc project
    },
    {
      name: "LamPhuong Media - Production",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production"
      },
      watch: false,
      cwd: "./", // thư mục gốc project
    }
  ]
};

