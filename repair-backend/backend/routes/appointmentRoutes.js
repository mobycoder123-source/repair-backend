require('dotenv').config();
const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/email');
const Appointment = require('../models/Appointment');

console.log('Email utility loaded');

router.get('/', async (req, res) => {
  try {
    const { status, date, serviceType } = req.query;
    let query = {};
    if (status) query.status = status;
    if (date) query.preferredDate = new Date(date);
    if (serviceType) query.serviceType = serviceType;
    
    const appointments = await Appointment.find(query).sort({ preferredDate: 1, preferredTime: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { preferredDate, preferredTime } = req.body;
    
    const dateObj = new Date(preferredDate);
    const dayOfWeek = dateObj.getDay();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.status(400).json({ 
        message: 'Appointments are not available on weekends. Please select Monday to Friday.' 
      });
    }
    
    const appointment = new Appointment(req.body);
    const newAppointment = await appointment.save();
    
    const adminMailOptions = {
      subject: `New Appointment Booked - ${newAppointment.referenceNumber}`,
      html: `
        <h2>New Appointment Booked</h2>
        <p><strong>Ref Number:</strong> ${newAppointment.referenceNumber}</p>
        <p><strong>Name:</strong> ${newAppointment.customerName}</p>
        <p><strong>Phone:</strong> ${newAppointment.customerPhone}</p>
        <p><strong>Email:</strong> ${newAppointment.customerEmail || 'N/A'}</p>
        <p><strong>Service:</strong> ${newAppointment.serviceType}</p>
        <p><strong>Date:</strong> ${new Date(newAppointment.preferredDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${newAppointment.preferredTime}</p>
        <p><strong>Status:</strong> ${newAppointment.status}</p>
        <hr>
        <p>A/C Workshop - Al Jubail</p>
      `
    };
    sendEmail('repaircenter896@gmail.com', adminMailOptions.subject, adminMailOptions.html);
    
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    appointment.status = status;
    await appointment.save();
    
    console.log('Status updated to:', status);
    console.log('Customer email:', appointment.customerEmail);
    
    if (appointment.customerEmail && appointment.customerEmail.includes('@')) {
      let subject = '';
      let message = '';
      
      if (status === 'confirmed') {
        subject = `Appointment Confirmed - ${appointment.referenceNumber}`;
        message = `
          <p>Your appointment has been <strong>CONFIRMED</strong>.</p>
          <p><strong>Service:</strong> ${appointment.serviceType}</p>
          <p><strong>Date:</strong> ${new Date(appointment.preferredDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${appointment.preferredTime}</p>
          <p><strong>Reference:</strong> ${appointment.referenceNumber}</p>
        `;
      } else if (status === 'rejected') {
        subject = `Appointment Rejected - ${appointment.referenceNumber}`;
        message = `
          <p>Your appointment has been <strong>REJECTED</strong>.</p>
          <p><strong>Reference:</strong> ${appointment.referenceNumber}</p>
          <p><strong>Service:</strong> ${appointment.serviceType}</p>
          <p><strong>Date:</strong> ${new Date(appointment.preferredDate).toLocaleDateString()}</p>
          <p><strong>Reason:</strong> Please contact us for more information.</p>
        `;
      } else if (status === 'cancelled') {
        subject = `Appointment Cancelled - ${appointment.referenceNumber}`;
        message = `
          <p>Your appointment has been <strong>CANCELLED</strong>.</p>
          <p><strong>Reference:</strong> ${appointment.referenceNumber}</p>
          <p><strong>Service:</strong> ${appointment.serviceType}</p>
          <p><strong>Date:</strong> ${new Date(appointment.preferredDate).toLocaleDateString()}</p>
        `;
      } else if (status === 'completed') {
        subject = `Appointment Completed - ${appointment.referenceNumber}`;
        message = `
          <p>Your appointment has been <strong>COMPLETED</strong>.</p>
          <p><strong>Reference:</strong> ${appointment.referenceNumber}</p>
          <p>Thank you for choosing A/C Workshop!</p>
        `;
      }
      
      if (subject && message) {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #0891b2;">A/C Workshop - Appointment Update</h2>
            <p>Dear ${appointment.customerName},</p>
            ${message}
            <hr>
            <p style="color: #666; font-size: 12px;">
              Contact us: 54 730 5234<br>
              Al Jubail, Prince Metib St, Saudi Arabia
            </p>
          </div>
        `;
        sendEmail(appointment.customerEmail, subject, html).catch(err => {
          console.log('Email error (non-blocking):', err.message);
        });
      }
    }
    
    res.json(appointment);
  } catch (err) {
    console.log('Error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
