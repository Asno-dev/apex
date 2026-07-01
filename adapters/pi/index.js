module.exports = {
  name: 'apex',
  version: '2.0.0',
  activate: (api) => {
    api.registerAgents(['arch', 'ui', 'debug', 'perf', 'sec', 'infra', 'nova', 'reed', 'review', 'flex']);
    api.registerCommands(['apex', 'apex-docs', 'apex-excel', 'apex-ppt']);
    api.registerMCP('apex-hands', { command: ['node', 'src/hands-server.mjs'] });
    api.registerMCP('mirage-vfs', { command: ['node', 'src/mirage-server.mjs'] });
    api.registerMCP('apex-composio', { command: ['node', 'src/composio-server.mjs'] });
  }
};
