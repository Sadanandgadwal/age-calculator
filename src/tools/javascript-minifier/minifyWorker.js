import { minifyCode } from './minifyCode.js';

self.onmessage = async ({ data }) => self.postMessage(await minifyCode(data));
