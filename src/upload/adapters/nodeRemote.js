import local from './nodeLocal';
import downloadLocally from '../../utils/downloadLocally';

export default function uploadFromUrl(client, fileUrl, options) {
  let isCancelled = false;
  let cancelFn = null;

  const start = async () => {
    const downloadRequest = downloadLocally(fileUrl, options);
    cancelFn = downloadRequest.cancel;
    const { filePath, deleteTmpFile } = await downloadRequest.promise;
    const uploadRequest = local(client, filePath, options);
    cancelFn = uploadRequest.cancel;

    try {
      if (isCancelled) {
        throw new Error('upload aborted');
      }

      return await uploadRequest.promise;
    } finally {
      deleteTmpFile();
    }
  };

  return {
    promise: start(),
    cancel: () => {
      isCancelled = true;
      if (cancelFn) {
        cancelFn();
      }
    },
  };
}
