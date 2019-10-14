import uploadFile from '../upload/uploadFile';
import createUploadPath from '../upload/createUploadPath';
import generateClient from '../utils/generateClient';
import cache from './cache';
import subscribeToChannel from '../utils/subscribeToChannel';

export default generateClient('site-api', cache, {
  uploadFile,
  uploadImage: uploadFile,
  createUploadPath,
  subscribeToChannel,
});
