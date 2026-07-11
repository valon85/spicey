export async function readMultipartFile(req) {
  const contentType = req.headers['content-type'] || req.headers['Content-Type'] || '';
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundaryMatch) throw new Error('Missing multipart boundary');

  const boundary = `--${boundaryMatch[1] || boundaryMatch[2]}`;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);
  const body = buffer.toString('binary');
  const parts = body.split(boundary).filter((part) => part.includes('Content-Disposition'));

  const fields = {};
  let file = null;

  for (const part of parts) {
    const [rawHeaders, ...rest] = part.split('\r\n\r\n');
    if (!rest.length) continue;
    const headers = rawHeaders;
    let content = rest.join('\r\n\r\n');
    content = content.replace(/\r\n--$/, '').replace(/\r\n$/, '');

    const name = headers.match(/name="([^"]+)"/)?.[1];
    const filename = headers.match(/filename="([^"]*)"/)?.[1];
    const mimeType = headers.match(/Content-Type:\s*([^\r\n]+)/i)?.[1] || 'application/octet-stream';
    if (!name) continue;

    if (filename) {
      file = {
        field: name,
        filename,
        mimeType,
        buffer: Buffer.from(content, 'binary'),
      };
    } else {
      fields[name] = content;
    }
  }

  if (!file) throw new Error('No file provided');
  return { file, fields };
}
