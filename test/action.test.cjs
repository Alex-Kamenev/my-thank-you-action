const { test } = require('node:test');
const assert = require('node:assert/strict');
const load = import('../src/action.mjs');
const run = async options => (await load).run(options);
const context = { payload: { pull_request: { number: 42 } }, repo: { owner: 'owner', repo: 'repo' } };
const execute = async (options = {}) => {
  let comment;
  await run({ context, getInput: name => name === 'GITHUB_TOKEN' ? 'test' : '',
    getOctokit: () => ({ rest: { issues: { createComment: async value => { comment = value; } } } }), ...options });
  return comment;
};
test('ignores events without a pull request', async () => {
  await run({ context: { payload: {} }, getInput() { throw new Error('unexpected token read'); } });
});
test('posts text without an optional Tenor key', async () => {
  const comment = await execute();
  assert.equal(comment.issue_number, 42);
  assert.match(comment.body, /Thank you/);
  assert.doesNotMatch(comment.body, /!\[/);
});
test('recovers from GIF API failures without exposing a key', async () => {
  let warning;
  const comment = await execute({ getInput: () => 'test-key', fetchGif: async () => { throw new Error('test-key'); }, warning: value => { warning = value; } });
  assert.match(comment.body, /Thank you/);
  assert.doesNotMatch(warning, /test-key/);
});
test('rejects unsafe GIF URL content', async () => {
  const comment = await execute({ getInput: () => 'test', warning() {},
    fetchGif: async () => ({ ok: true, json: async () => ({ results: [{ media_formats: { tinygif: { url: 'https://example.test/<script>' } } }] }) }) });
  assert.doesNotMatch(comment.body, /script/);
});
