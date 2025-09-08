module.exports = {
  async constraints({ Yarn }) {
    // These dependencies need to be kept in sync between the root and the server workspace
    const syncDeps = ["@prisma/client", "next", "@sentry/nextjs"];

    for (const ident of syncDeps) {
      // Find the root version
      const rootDeps = Yarn.dependencies({ ident, workspaceCwd: Yarn.cwd });
      if (!rootDeps.length) continue;
      const rootDep = rootDeps[0];

      // Find all "server" workspace deps
      for (const dep of Yarn.dependencies({ ident })) {
        if (dep.workspace && dep.workspace.manifest.name === "server") {
          dep.update(rootDep.range);
        }
      }
    }
  },
};
