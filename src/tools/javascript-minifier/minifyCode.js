import { minify } from 'terser';

export async function minifyCode({ code, compress, mangle }) {
  try {
    const result = await minify(code, { compress: compress ? {} : false, mangle, format: { comments: 'some' } });
    return { output: result.code ?? '' };
  } catch (error) {
    const where = error.line ? `Line ${error.line}, column ${error.col + 1}: ` : '';
    return { error: `${where}${error.message}` };
  }
}
