import uploadFile from '../upload/uploadFile';
import generateClient from '../utils/generateClient';
import cache from './cache';

export default generateClient(
  'site-api',
  cache,
  {
    uploadFile,
    uploadImage: uploadFile,
  },
);
