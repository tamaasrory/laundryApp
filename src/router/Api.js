import axios from 'axios';
import SInfo from 'react-native-sensitive-info';
import Path from './Path';

const RestApi = axios.create({
  baseURL: `${Path.baseUrl}/api/v1`,
  headers: {'Content-Type': 'application/json'},
});

RestApi.interceptors.request.use(
  async config => {
    let value = await SInfo.getItem('token', {});
    if (value) {
      config.headers.Authorization = `Bearer ${value}`;
      // config.timeout = 60000;
      // config.timeoutErrorMessage = 'time outttt';
      // console.log('token on request = ' + value);
    }
    return config;
  },

  error => {
    console.log(error);
    return Promise.reject(error);
  },
);

export default RestApi;
