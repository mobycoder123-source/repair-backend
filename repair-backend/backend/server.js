require('dotenv').config();
require('dns').setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const appointmentRoutes = require('./routes/appointmentRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const contentRoutes = require('./routes/contentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

const Admin = require('./models/Admin');
const Service = require('./models/Service');

const app = express();

app.use(cors());
app.use(express.json());

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      family: 4,
      maxPoolSize: 10,
    });
    console.log('✅ MongoDB Connected');
    
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new Admin({
        username: 'admin',
        password: 'repaircenter123@',
        name: 'Tech. Mohd. Faryad',
        phone: '54 730 5234'
      });
      await admin.save();
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin exists');
    }

    const defaultServices = [
      { 
        name: 'Air Conditioning', 
        nameArabic: 'التكييف', 
        description: 'Professional AC repair and maintenance services for all brands. Our expert technicians provide comprehensive AC solutions including gas refilling, motor repair, wiring, and complete servicing.', 
        descriptionArabic: 'خدمات إصلاح وصيانة التكييف المهنية لجميع العلامات التجارية. يوفر فنيونا الخبراء حلولاً شاملة للتكييف بما في ذلك تعبئة الغاز وإصلاح المحرك والأسلاك والخدمة الكاملة.',
        icon: '❄️', 
        image: 'https://www.ambientedge.com/wp-content/uploads/2021/02/kingman-heating-and-air-conditioning-repair-and-service-experts-what-happens-if-you-dont-service-your-air-conditioner.jpg',
        issues: ['Not cooling', 'Water leakage', 'Strange noise', 'Gas refilling', 'Motor repair'],
        issuesArabic: ['لا يبرد', 'تسرب الماء', 'صوت غريب', 'تعبئة الغاز', 'إصلاح المحرك'],
        order: 1 
      },
      { 
        name: 'Refrigerator', 
        nameArabic: 'الثلاجات', 
        description: 'Expert refrigerator repair services. We handle all types of fridge issues including cooling problems, ice maker repair, compressor replacement, and gas charging.', 
        descriptionArabic: 'خدمات إصلاح الثلاجات المهنية. نتعامل مع جميع أنواع مشاكل الثلاجة بما في ذلك مشاكل التبريد وإصلاح صانع الثلج واستبدال الضاغط وشحن الغاز.',
        icon: '🧊', 
        image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=700&h=500&fit=crop',
        issues: ['Not cooling', 'Ice buildup', 'Water leakage', 'Compressor issue', 'Door seal replacement'],
        issuesArabic: ['لا يبرد', 'تراكم الجليد', 'تسرب الماء', 'مشكلة الضاغط', 'استبدال مانعة التسرب'],
        order: 2 
      },
      { 
        name: 'Washing Machine', 
        nameArabic: 'غسالات', 
        description: 'Professional washing machine repair and installation services. Our technicians handle all major brands and models for both front load and top load machines.', 
        descriptionArabic: 'خدمات إصلاح وتركيب الغسالات المهنية. يتعامل فنيونا مع جميع العلامات التجارية والنماذج الرئيسية للغسالات الأمامية والعلوية.',
        icon: '🧺', 
        image: 'https://www.omsaimaintenance.com/images/services/Washing-Machine-Repair-1.jpg',
        issues: ['Not spinning', 'Water not draining', 'Noise during operation', 'Door lock issue', 'Motor repair'],
        issuesArabic: ['لا يدور', 'لا يصرف الماء', 'ضوضاء أثناء التشغيل', 'مشكلة قفل الباب', 'إصلاح المحرك'],
        order: 3 
      },
      { 
        name: 'Oven & Kitchen', 
        nameArabic: 'الأفران والمطبخ', 
        description: 'Expert oven and cooking range repair services. We service all types of ovens including built-in, free-standing, and microwave ovens.', 
        descriptionArabic: 'خدمات إصلاح الأفران ومعدات الطهي المهنية. نخدم جميع أنواع الأفران بما في ذلك الأفران المدمجة والمStanding والميكرويف.',
        icon: '🍳', 
        image: 'https://parhouston.com/wp-content/uploads/2022/06/built-in-oven-repair-600x646.jpg',
        issues: ['Not heating', 'Temperature inconsistency', 'Sparking', 'Door glass replacement', 'Timer issues'],
        issuesArabic: ['لا يسخن', 'عدم انتظام درجة الحرارة', 'الشرر', 'استبدال زجاج الباب', 'مشاكل المؤقت'],
        order: 4 
      }
    ];

    for (const svc of defaultServices) {
      const exists = await Service.findOne({ name: svc.name });
      if (!exists) {
        await Service.create(svc);
        console.log('✅ Service created:', svc.name);
      }
    }
    console.log('✅ Services ready');
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);
  }
};

connectDB();

app.use('/api/appointments', appointmentRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/services', serviceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});
app.get('/',(req,res)=>{
  res.send('Backend Server is Live and Running!);
           });
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API URL: http://localhost:${PORT}/api`);
});
module.exports=app;
