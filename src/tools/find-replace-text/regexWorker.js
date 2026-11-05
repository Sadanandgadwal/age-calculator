import { replaceText } from './logic.js';

self.onmessage = ({ data }) => self.postMessage(replaceText(data));
