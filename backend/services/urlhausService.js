const axios = require('axios');
require('dotenv').config();

const URLHAUS_API_KEY = process.env.URLHAUS_API_KEY;
const URLHAUS_API_BASE = process.env.URLHAUS_API_BASE;

const axiosInstance = axios.create({
  baseURL: URLHAUS_API_BASE,
  headers: {
    'Auth-Key': URLHAUS_API_KEY,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

class URLhausService {
  async getRecentURLs(limit = 100) {
    try {
      const endpoint = limit ? `/urls/recent/limit/${limit}/` : '/urls/recent/';
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent URLs:', error.message);
      throw error;
    }
  }

  async getRecentPayloads(limit = 100) {
    try {
      const endpoint = limit ? `/payloads/recent/limit/${limit}/` : '/payloads/recent/';
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent payloads:', error.message);
      throw error;
    }
  }

  async queryURL(url) {
    try {
      const params = new URLSearchParams();
      params.append('url', url);
      
      const response = await axiosInstance.post('/url/', params);
      return response.data;
    } catch (error) {
      console.error('Error querying URL:', error.message);
      throw error;
    }
  }

  async queryURLById(urlId) {
    try {
      const params = new URLSearchParams();
      params.append('urlid', urlId);
      
      const response = await axiosInstance.post('/urlid/', params);
      return response.data;
    } catch (error) {
      console.error('Error querying URL by ID:', error.message);
      throw error;
    }
  }

  async queryHost(host) {
    try {
      const params = new URLSearchParams();
      params.append('host', host);
      
      const response = await axiosInstance.post('/host/', params);
      return response.data;
    } catch (error) {
      console.error('Error querying host:', error.message);
      throw error;
    }
  }

  async queryPayload(hash, hashType = 'sha256') {
    try {
      const params = new URLSearchParams();
      params.append(hashType === 'md5' ? 'md5_hash' : 'sha256_hash', hash);
      
      const response = await axiosInstance.post('/payload/', params);
      return response.data;
    } catch (error) {
      console.error('Error querying payload:', error.message);
      throw error;
    }
  }

  async queryTag(tag) {
    try {
      const params = new URLSearchParams();
      params.append('tag', tag);
      
      const response = await axiosInstance.post('/tag/', params);
      return response.data;
    } catch (error) {
      console.error('Error querying tag:', error.message);
      throw error;
    }
  }

  async querySignature(signature) {
    try {
      const params = new URLSearchParams();
      params.append('signature', signature);
      
      const response = await axiosInstance.post('/signature/', params);
      return response.data;
    } catch (error) {
      console.error('Error querying signature:', error.message);
      throw error;
    }
  }

  async downloadPayload(sha256Hash) {
    try {
      const response = await axiosInstance.get(`/download/${sha256Hash}/`, {
        responseType: 'arraybuffer',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading payload:', error.message);
      throw error;
    }
  }
}

module.exports = new URLhausService();