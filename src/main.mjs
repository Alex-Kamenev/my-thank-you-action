import * as core from '@actions/core';
import { run } from './action.mjs';
run().catch(() => core.setFailed('Unable to post the thank-you comment. Check token permissions.'));
