require('dotenv').config();
const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/email');
const Contact = require('../models/Contact');

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;
    
    const contacts = await Contact.find(query).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();

    const adminMailOptions = {
      from: 'A/C Workshop <repaircenter896@gmail.com>',
      to: 'repaircenter896@gmail.com',
      subject: `📩 New Contact Inquiry from ${contact.name} - A/C Workshop`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
          <h2 style="color: #0891b2;">📩 New Contact Inquiry</h2>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong style="color: #0891b2;">Name:</strong> ${contact.name}</p>
            <p><strong style="color: #0891b2;">Phone:</strong> ${contact.phone}</p>
            <p><strong style="color: #0891b2;">Email:</strong> ${contact.email || 'N/A'}</p>
            <p><strong style="color: #0891b2;">Service:</strong> ${contact.service || 'N/A'}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 10px;">
            <p><strong style="color: #0891b2;">Message:</strong></p>
            <p style="line-height: 1.6;">${contact.message || 'No message provided'}</p>
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
      await transporter.sendMail(adminMailOptions);
      console.log('Contact notification email sent to admin');
    } catch (emailErr) {
      console.log('Email sending failed:', emailErr.message);
    }

    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(contact);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
