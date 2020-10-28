function uploadToS3(id, url, file, { onProgress }) {
  const xhr = new XMLHttpRequest();

  const promise = new Promise((resolve, reject) => {
    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
          const done = typeof e.loaded !== 'undefined' ? e.loaded : e.position;
          const total = typeof e.total !== 'undefined' ? e.total : e.totalSize;
          const percent = parseInt((done / total) * 100, 10);
          onProgress({ type: 'uploadProgress', payload: { percent } });
        }
      };
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(id);
        } else {
          reject();
        }
      }
    };

    xhr.addEventListener('error', reject, false);
    xhr.onabort = () => {
      reject(new Error('upload aborted'));
    };
    xhr.open('PUT', url, true);
    if (file instanceof File) {
      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    } else {
      xhr.send(file);
    }
  });

  const cancel = () => {
    xhr.onreadystatechange = null;
    xhr.abort();
  };

  return { promise, cancel };
}

export default function browser(client, file, { onProgress }) {
  let isCancelled = false;
  let cancel = () => {
    isCancelled = true;
  };
  const promise = client.uploadRequest
    .create({ filename: file.name })
    .then(({ id, url }) => {
      if (isCancelled) {
        return Promise.reject(new Error('upload aborted'));
      }
      if (onProgress) {
        onProgress({
          type: 'uploadRequestComplete',
          payload: {
            id,
            url,
          },
        });
      }
      const { promise: uploadPromise, cancel: cancelUpload } = uploadToS3(
        id,
        url,
        file,
        {
          onProgress,
        },
      );
      cancel = cancelUpload;
      return uploadPromise.then(() => id);
    });
  return { promise, cancel };
}
