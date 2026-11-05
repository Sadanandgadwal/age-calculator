import { runRegex } from './logic.js';

self.onmessage = ({ data }) => self.postMessage(runRegex(data));
