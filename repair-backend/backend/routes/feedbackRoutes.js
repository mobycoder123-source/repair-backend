require('dotenv').config();
const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/email');
const Feedback = require('../models/Feedback');

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;
    
    const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();

    const adminMailOptions = {
      from: 'A/C Workshop <repaircenter896@gmail.com>',
      to: 'repaircenter896@gmail.com',
      subject: `⭐ New Feedback from ${feedback.customerName} - A/C Workshop`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
          <h2 style="color: #f59e0b;">⭐ New Customer Feedback</h2>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong style="color: #0891b2;">Name:</strong> ${feedback.customerName}</p>
            <p><strong style="color: #0891b2;">Phone:</strong> ${feedback.customerPhone}</p>
            <p><strong style="color: #0891b2;">Email:</strong> ${feedback.customerEmail || 'N/A'}</p>
            <p><strong style="color: #0891b2;">Reference:</strong> ${feedback.referenceNumber || 'N/A'}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong style="color: #0891b2;">Rating:</strong> ${'⭐'.repeat(feedback.rating)} (${feedback.rating}/5)</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 10px;">
            <p><strong style="color: #0891b2;">Feedback:</strong></p>
            <p style="line-height: 1.6;">${feedback.feedback}</p>
          </div>
          
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            A/C Workshop - Al Jubail<br>
            📞 54 730 5234
          </p>
        </div>
      `
    };

    try {
      await sendEmail(
        'repaircenter896@gmail.com',
        `⭐ New Feedback from ${feedback.customerName} - A/C Workshop`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
            <h2 style="color: #f59e0b;">⭐ New Customer Feedback</h2>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p><strong style="color: #0891b2;">Name:</strong> ${feedback.customerName}</p>
              <p><strong style="color: #0891b2;">Phone:</strong> ${feedback.customerPhone}</p>
              <p><strong style="color: #0891b2;">Email:</strong> ${feedback.customerEmail || 'N/A'}</p>
              <p><strong style="color: #0891b2;">Reference:</strong> ${feedback.referenceNumber || 'N/A'}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p><strong style="color: #0891b2;">Rating:</strong> ${'⭐'.repeat(feedback.rating)} (${feedback.rating}/5)</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 10px;">
              <p><strong style="color: #0891b2;">Feedback:</strong></p>
              <p style="line-height: 1.6;">${feedback.feedback}</p>
            </div>
            
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              A/C Workshop - Al Jubail<br>
              📞 54 730 5234
            </p>
          </div>
        `
      );
      console.log('Feedback notification email sent to admin');
    } catch (emailErr) {
      console.log('Email sending failed:', emailErr.message);
    }

    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(feedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
