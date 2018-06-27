import uploadFile from '../upload/uploadFile';
import generateClient from '../utils/generateClient';

export default generateClient(
  'site-api',
  {
    uploadFile,
    uploadImage: uploadFile,
  }
);
