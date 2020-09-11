function captureStream(stream) {
  const oldWrite = stream.write;
  let buf = '';
  const writeStream = stream;

  writeStream.write = (chunk, ...args) => {
    buf += chunk.toString(); // chunk is a String or Buffer
    oldWrite.apply(stream, [chunk, ...args]);
  };

  return {
    detach: () => {
      writeStream.write = oldWrite;
    },
    getCaptured: () => buf,
  };
}

module.exports = captureStream;
