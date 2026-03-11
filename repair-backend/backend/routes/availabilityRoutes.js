require('dotenv').config();
const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/email');
const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');

router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const availability = await Availability.find(query).sort({ date: 1 });
    
    const appointments = await Appointment.find({ 
      status: { $in: ['pending', 'confirmed'] },
      preferredDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });
    
    const bookedSlots = {};
    appointments.forEach(apt => {
      const dateKey = apt.preferredDate.toISOString().split('T')[0];
      if (!bookedSlots[dateKey]) bookedSlots[dateKey] = [];
      bookedSlots[dateKey].push(apt.preferredTime);
    });
    
    res.json({ availability, bookedSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { date, timeSlots, isBlocked } = req.body;
    const dateStr = new Date(date).toISOString().split('T')[0];
    
    let availability = await Availability.findOne({ date: dateStr });
    if (availability) {
      availability.timeSlots = timeSlots;
      availability.isBlocked = isBlocked || false;
      availability = await availability.save();
    } else {
      availability = new Availability({ date: dateStr, timeSlots, isBlocked });
      availability = await availability.save();
    }
    res.json(availability);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Availability.findByIdAndDelete(req.params.id);
    res.json({ message: 'Availability deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const { dates } = req.body;
    const defaultSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
    
    for (const date of dates) {
      const dateStr = new Date(date).toISOString().split('T')[0];
      await Availability.findOneAndUpdate(
        { date: dateStr },
        { date: dateStr, timeSlots: defaultSlots, isBlocked: false },
        { upsert: true }
      );
    }
    res.json({ message: 'Bulk availability created' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/range', async (req, res) => {
  try {
    const { startDate, endDate, availableDays, timeSlots, excludeWeekends } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const defaultSlots = timeSlots || ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
    
    let daysToInclude = availableDays;
    if (excludeWeekends === true || !availableDays) {
      daysToInclude = [1, 2, 3, 4, 5];
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const createdDates = [];
    const skippedDates = [];
    
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      const dateStr = current.toISOString().split('T')[0];
      
      if (daysToInclude.includes(dayOfWeek)) {
        await Availability.findOneAndUpdate(
          { date: dateStr },
          { date: dateStr, timeSlots: defaultSlots, isBlocked: false },
          { upsert: true }
        );
        createdDates.push(dateStr);
      } else {
        skippedDates.push(dateStr);
      }
      
      current.setDate(current.getDate() + 1);
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const availableDayNames = daysToInclude.map(d => dayNames[d]).join(', ');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0891b2;">📅 Date Range Availability Set</h2>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>From:</strong> ${new Date(startDate).toLocaleDateString()}</p>
          <p><strong>To:</strong> ${new Date(endDate).toLocaleDateString()}</p>
          <p><strong>Available Days:</strong> ${availableDayNames}</p>
          <p><strong>Time Slots:</strong> ${defaultSlots.join(', ')}</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <p><strong>✅ Dates Added:</strong> ${createdDates.length}</p>
          <p style="color: #166534; font-size: 12px;">${createdDates.join(', ')}</p>
        </div>
        
        ${skippedDates.length > 0 ? `
        <div style="background: #fef2f2; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <p><strong>⏭️ Dates Skipped:</strong> ${skippedDates.length}</p>
          <p style="color: #991b1b; font-size: 12px;">${skippedDates.join(', ')}</p>
        </div>
        ` : ''}
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          A/C Workshop - Al Jubail<br>
          📞 ${process.env.ADMIN_PHONE || '54 730 5234'}
        </p>
      </div>
    `;

    try {
      await sendEmail(
        'repaircenter896@gmail.com',
        `📅 Availability Set - ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
        emailHtml
      );
      console.log('Date range availability email sent to admin');
    } catch (emailErr) {
      console.log('Email sending failed:', emailErr.message);
    }

    res.json({ 
      message: 'Date range availability created',
      created: createdDates.length,
      skipped: skippedDates.length,
      dates: createdDates
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/single', async (req, res) => {
  try {
    const { date, timeSlots, isBlocked } = req.body;
    
    if (!date) {
      return res.status(400).json({ message: 'date is required' });
    }

    const dateStr = new Date(date).toISOString().split('T')[0];
    const defaultSlots = timeSlots || ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
    
    let availability = await Availability.findOne({ date: dateStr });
    if (availability) {
      availability.timeSlots = timeSlots || availability.timeSlots;
      availability.isBlocked = isBlocked || false;
      availability = await availability.save();
    } else {
      availability = new Availability({ date: dateStr, timeSlots: defaultSlots, isBlocked: isBlocked || false });
      availability = await availability.save();
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = new Date(date).getDay();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0891b2;">📅 Single Date Availability ${availability.isBlocked ? 'Blocked' : 'Set'}</h2>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()} (${dayNames[dayOfWeek]})</p>
          <p><strong>Time Slots:</strong> ${availability.timeSlots.join(', ')}</p>
          <p><strong>Status:</strong> ${availability.isBlocked ? '❌ Blocked' : '✅ Available'}</p>
        </div>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          A/C Workshop - Al Jubail<br>
          📞 ${process.env.ADMIN_PHONE || '54 730 5234'}
        </p>
      </div>
    `;

    try {
    await sendEmail(
      'repaircenter896@gmail.com',
      `📅 Single Date Availability ${availability.isBlocked ? 'Blocked' : 'Set'} - ${new Date(date).toLocaleDateString()}`,
      emailHtml
    );
      console.log('Single date availability email sent to admin');
    } catch (emailErr) {
      console.log('Email sending failed:', emailErr.message);
    }

    res.json(availability);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/month', async (req, res) => {
  try {
    const { year, month, availableDays, timeSlots } = req.body;
    
    if (!year || !month) {
      return res.status(400).json({ message: 'year and month are required' });
    }

    let daysToInclude = availableDays;
    if (!availableDays) {
      daysToInclude = [1, 2, 3, 4, 5];
    }

    const defaultSlots = timeSlots || ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
    const daysInMonth = new Date(year, month, 0).getDate();
    const createdDates = [];
    const skippedDates = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      
      if (daysToInclude.includes(dayOfWeek)) {
        const dateStr = date.toISOString().split('T')[0];
        await Availability.findOneAndUpdate(
          { date: dateStr },
          { date: dateStr, timeSlots: defaultSlots, isBlocked: false },
          { upsert: true }
        );
        createdDates.push(dateStr);
      } else {
        const dateStr = date.toISOString().split('T')[0];
        skippedDates.push(dateStr);
      }
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const availableDayNames = daysToInclude.map(d => dayNames[d]).join(', ');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0891b2;">📅 Monthly Availability Updated</h2>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Month:</strong> ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          <p><strong>Available Days:</strong> ${availableDayNames}</p>
          <p><strong>Time Slots:</strong> ${defaultSlots.join(', ')}</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <p><strong>✅ Dates Added:</strong> ${createdDates.length}</p>
          <p style="color: #166534; font-size: 12px;">${createdDates.join(', ')}</p>
        </div>
        
        ${skippedDates.length > 0 ? `
        <div style="background: #fef2f2; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <p><strong>⏭️ Dates Skipped (not in available days):</strong> ${skippedDates.length}</p>
          <p style="color: #991b1b; font-size: 12px;">${skippedDates.join(', ')}</p>
        </div>
        ` : ''}
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          A/C Workshop - Al Jubail<br>
          📞 ${process.env.ADMIN_PHONE || '54 730 5234'}
        </p>
      </div>
    `;

    try {
    await sendEmail(
      'repaircenter896@gmail.com',
      `📅 Monthly Availability Set - ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      emailHtml
    );
      console.log('Monthly availability email sent to admin');
    } catch (emailErr) {
      console.log('Email sending failed:', emailErr.message);
    }

    res.json({ 
      message: 'Monthly availability created',
      created: createdDates.length,
      skipped: skippedDates.length,
      dates: createdDates
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/clear-month', async (req, res) => {
  try {
    const { year, month } = req.body;
    
    if (!year || !month) {
      return res.status(400).json({ message: 'year and month are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const result = await Availability.deleteMany({
      date: { $gte: startDate, $lte: endDate }
    });

    res.json({ message: 'Month availability cleared', deleted: result.deletedCount });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
