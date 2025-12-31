const urlhausService = require('../services/urlhausService');
const { IOC } = require('../models');

const extractIOCType = (value) => {
  if (!value) return 'unknown';
  
  const urlPattern = /^https?:\/\//i;
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  
  if (urlPattern.test(value)) return 'url';
  if (ipPattern.test(value)) return 'ip';
  return 'domain';
};

const saveIOCFromURLhaus = async (urlData) => {
  try {
    const type = extractIOCType(urlData.url || urlData.host);
    
    const existingIOC = await IOC.findOne({
      where: {
        urlhaus_id: urlData.id || urlData.url_id,
      },
    });

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

exports.syncRecentURLs = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const data = await urlhausService.getRecentURLs(parseInt(limit));

    if (data.query_status !== 'ok') {
      return res.status(400).json({
        success: false,
        message: 'URLhaus API returned error',
        data,
      });
    }

    const savedIOCs = [];
    for (const url of data.urls || []) {
      try {
        const ioc = await saveIOCFromURLhaus(url);
        savedIOCs.push(ioc);
      } catch (error) {
        console.error('Error saving URL:', error);
      }
    }

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

exports.queryURL = async (req, res) => {
  try {
    const { url } = req.body;
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

exports.queryHost = async (req, res) => {
  try {
    const { host } = req.body;
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

exports.queryPayload = async (req, res) => {
  try {
    const { hash, hashType = 'sha256' } = req.body;
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

exports.queryTag = async (req, res) => {
  try {
    const { tag } = req.body;
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