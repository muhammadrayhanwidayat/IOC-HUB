const urlhausService = require('../services/urlhausService');//service untuk berinteraksi dengan API URLhaus
const { IOC } = require('../models');//import model IOC

//fungsi untuk menentukan tipe IOC berdasarkan value
const extractIOCType = (value) => {
  if (!value) return 'unknown';

  //jika value mengandung http/https maka tipe url, jika format IP maka ip, selain itu domain
  const urlPattern = /^https?:\/\//i;
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  
  if (urlPattern.test(value)) return 'url';
  if (ipPattern.test(value)) return 'ip';
  return 'domain';
};

//fungsi untuk menyimpan data IOC dari URLhaus ke database
const saveIOCFromURLhaus = async (urlData) => {
  try {
    //tentukan tipe IOC
    const type = extractIOCType(urlData.url || urlData.host);
    //cek apakah IOC dengan urlhaus_id sudah ada di database
    const existingIOC = await IOC.findOne({
      where: {
        urlhaus_id: urlData.id || urlData.url_id,
      },
    });
    //siapkan data IOC untuk disimpan atau diperbarui(normalisasi data)
    const iocData = {
      type,
      value: urlData.url || urlData.host,
      threat: urlData.threat,
      status: urlData.url_status,
      source: 'urlhaus',
      urlhaus_id: urlData.id || urlData.url_id,
      urlhaus_reference: urlData.urlhaus_reference,
      date_added: urlData.date_added || urlData.dateadded || urlData.firstseen,
      reporter: urlData.reporter,
      tags: urlData.tags || [],
      blacklists: urlData.blacklists || {},
      payloads: urlData.payloads || [],
      metadata: {
        larted: urlData.larted,
        takedown_time_seconds: urlData.takedown_time_seconds,
        last_online: urlData.last_online,
        url_count: urlData.url_count,
      },
    };
    //jika sudah ada, perbarui data, jika belum buat baru
    if (existingIOC) {
      await existingIOC.update(iocData);
      return existingIOC;
    } else {
      return await IOC.create(iocData);
    }
  } catch (error) {
    console.error('Error saving IOC:', error);
    throw error;
  }
};
//controller untuk menyinkronkan URL terbaru dari URLhaus
exports.syncRecentURLs = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    //dapatkan data dari URLhaus
    const data = await urlhausService.getRecentURLs(parseInt(limit));

    if (data.query_status !== 'ok') {
      return res.status(400).json({
        success: false,
        message: 'URLhaus API returned error',
        data,
      });
    }
    //simpan setiap URL ke database
    const savedIOCs = [];
    for (const url of data.urls || []) {
      try {
        const ioc = await saveIOCFromURLhaus(url);
        savedIOCs.push(ioc);
      } catch (error) {
        console.error('Error saving URL:', error);
      }
    }
    //kirim response
    res.json({
      success: true,
      message: `Synced ${savedIOCs.length} URLs from URLhaus`,
      data: {
        synced: savedIOCs.length,
        total: data.urls?.length || 0,
      },
    });
  } catch (error) {
    console.error('Sync recent URLs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync recent URLs',
      error: error.message,
    });
  }
};
//controller untuk menyinkronkan payload terbaru dari URLhaus
exports.syncRecentPayloads = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const data = await urlhausService.getRecentPayloads(parseInt(limit));

    if (data.query_status !== 'ok') {
      return res.status(400).json({
        success: false,
        message: 'URLhaus API returned error',
        data,
      });
    }

    res.json({
      success: true,
      message: 'Recent payloads fetched successfully',
      data: data.payloads || [],
    });
  } catch (error) {
    console.error('Sync recent payloads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync recent payloads',
      error: error.message,
    });
  }
};

//controller untuk query URL dari URLhaus
exports.queryURL = async (req, res) => {
  try {
    const { url } = req.body;
    //dapatkan data dari URLhaus
    const data = await urlhausService.queryURL(url);

    if (data.query_status === 'ok') {
      const ioc = await saveIOCFromURLhaus(data);
      data.savedIOC = ioc;
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Query URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to query URL',
      error: error.message,
    });
  }
};

//controller untuk query host dari URLhaus
exports.queryHost = async (req, res) => {
  try {
    const { host } = req.body;
    //dapatkan data dari URLhaus
    const data = await urlhausService.queryHost(host);

    if (data.query_status === 'ok' && data.urls) {
      const savedIOCs = [];
      for (const url of data.urls.slice(0, 20)) {
        try {
          const ioc = await saveIOCFromURLhaus(url);
          savedIOCs.push(ioc);
        } catch (error) {
          console.error('Error saving URL:', error);
        }
      }
      //tambahkan daftar IOC yang disimpan ke response
      data.savedIOCs = savedIOCs;
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Query host error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to query host',
      error: error.message,
    });
  }
};

//controller untuk query payload dari URLhaus 
exports.queryPayload = async (req, res) => {
  try {
    const { hash, hashType = 'sha256' } = req.body;
    //dapatkan data dari URLhaus berupa payload
    const data = await urlhausService.queryPayload(hash, hashType);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Query payload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to query payload',
      error: error.message,
    });
  }
};

//controller untuk query tag dari URLhaus
exports.queryTag = async (req, res) => {
  try {
    const { tag } = req.body;
    //dapatkan data dari URLhaus berupa tag
    const data = await urlhausService.queryTag(tag);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Query tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to query tag',
      error: error.message,
    });
  }
};