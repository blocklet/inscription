import axios from 'axios';

const getComponentMountPoint = (did) => {
  return window.blocklet?.componentMountPoints?.find((x) => x.did === did)?.mountPoint;
};

const api = axios.create({});

// maker api
api.interceptors.request.use(
  (config) => {
    const prefix = window.blocklet ? window.blocklet.prefix : '/';
    config.baseURL = config.prefix || prefix || '/';
    config.timeout = 200000;

    return config;
  },
  (error) => Promise.reject(error)
);

// blender api
const blenderApi = axios.create({});

blenderApi.interceptors.request.use(
  (config) => {
    config.baseURL = getComponentMountPoint('z8ia1ieY5KhEC4LMRETzS5nUwD7PvAND8qkfX') || '/blender';
    config.timeout = 200000;

    return config;
  },
  (error) => Promise.reject(error)
);

// store api
const storeApi = axios.create({});

storeApi.interceptors.request.use(
  (config) => {
    config.baseURL = getComponentMountPoint('z8iZqkCjLP6TZpR12tT3jESWxB8SGzNsx8nZa') || '/store';
    config.timeout = 200000;

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

export { blenderApi, storeApi };
