import * as core from '@actions/core';
import * as github from '@actions/github';

export async function run({ context = github.context, getInput = core.getInput,
  getOctokit = github.getOctokit, fetchGif = globalThis.fetch, warning = core.warning } = {}) {
  const pullRequest = context.payload.pull_request;
  if (!pullRequest) return;
  const token = getInput('GITHUB_TOKEN', { required: true });
  const tenorToken = getInput('TENOR_TOKEN');
  let body = 'Thank you for submitting a pull request! We will try to review this as soon as we can.';
  if (tenorToken) {
    try {
      const url = new URL('https://tenor.googleapis.com/v2/search');
      url.search = new URLSearchParams({ q: 'thank you', limit: '1',
        media_filter: 'tinygif', contentfilter: 'high', key: tenorToken }).toString();
      const response = await fetchGif(url, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Tenor request failed');
      const json = await response.json();
      const gifUrl = json.results?.[0]?.media_formats?.tinygif?.url;
      if (gifUrl && /^https:\/\/[^\s<>"()]+$/.test(gifUrl)) body += `\n\n![Thank you](${gifUrl})`;
    } catch {
      warning('GIF unavailable; posting the text thank-you message.');
    }
  }
  await getOctokit(token).rest.issues.createComment({
    ...context.repo, issue_number: pullRequest.number, body,
  });
}
