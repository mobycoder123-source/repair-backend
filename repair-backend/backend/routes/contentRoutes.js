const express = require('express');
const router = express.Router();
const Content = require('../models/Content');

router.get('/services', async (req, res) => {
  try {
    const servicesContent = await Content.findOne({ page: 'services', section: 'list', language: 'en' });
    
    if (servicesContent) {
      res.json(servicesContent.content || []);
    } else {
      res.json([]);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/service-list', async (req, res) => {
  try {
    const servicesContent = await Content.findOne({ page: 'services', section: 'list', language: 'en' });
    
    if (servicesContent) {
      res.json(servicesContent.content || []);
    } else {
      res.json([]);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const { lang } = req.query;
    let query = { page };
    if (lang) query.language = lang;
    
    const content = await Content.find(query);
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:page/:section', async (req, res) => {
  try {
    const { page, section } = req.params;
    const { lang } = req.query;
    let query = { page, section };
    if (lang) query.language = lang;
    
    const content = await Content.find(query);
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { page, section, language, content } = req.body;
    
    const existing = await Content.findOne({ page, section, language });
    if (existing) {
      existing.content = content;
      existing.updatedAt = new Date();
      await existing.save();
      return res.json(existing);
    }
    
    const newContent = new Content({ page, section, language, content });
    await newContent.save();
    res.status(201).json(newContent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/service', async (req, res) => {
  try {
    const { name, description, image, price, duration } = req.body;
    
    const servicesContent = await Content.findOne({ page: 'services', section: 'list', language: 'en' });
    
    let services = [];
    if (servicesContent && servicesContent.content && Array.isArray(servicesContent.content)) {
      services = servicesContent.content;
    }
    
    const newService = {
      id: Date.now().toString(),
      name,
      description,
      image,
      price: price || null,
      duration: duration || null,
      createdAt: new Date()
    };
    
    services.push(newService);
    
    if (servicesContent) {
      servicesContent.content = services;
      servicesContent.updatedAt = new Date();
      await servicesContent.save();
    } else {
      const newContent = new Content({
        page: 'services',
        section: 'list',
        language: 'en',
        content: services
      });
      await newContent.save();
    }
    
    res.status(201).json(newService);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/services', async (req, res) => {
  try {
    const servicesContent = await Content.findOne({ page: 'services', section: 'list', language: 'en' });
    
    if (servicesContent) {
      res.json(servicesContent.content || []);
    } else {
      res.json([]);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/service/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const servicesContent = await Content.findOne({ page: 'services', section: 'list', language: 'en' });
    
    if (servicesContent && servicesContent.content && Array.isArray(servicesContent.content)) {
      servicesContent.content = servicesContent.content.filter(s => s.id !== id);
      servicesContent.updatedAt = new Date();
      await servicesContent.save();
    }
    
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    res.json(content);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: 'Content deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
