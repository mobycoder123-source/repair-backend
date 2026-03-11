const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ active: true }).sort({ order: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const service = new Service(req.body);
    const newService = await service.save();
    res.status(201).json(newService);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(service);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    await Service.deleteMany({});
    res.json({ message: 'All services deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/seed', async (req, res) => {
  try {
    await Service.deleteMany({});
    
    const services = [
      { 
        name: 'AC Repair', 
        nameArabic: 'إصلاح التكييف', 
        description: 'Expert AC repair services for all brands including Samsung, LG, Carrier, Toshiba, and more. We fix cooling issues, gas refilling, motor repair, wiring problems, and complete AC servicing.', 
        descriptionArabic: 'خدمات إصلاح التكييف لجميع العلامات التجارية. نحن نصلح مشاكل التبريد وتعبئة الغاز وإصلاح المحرك والأسلاك وخدمة التكييف الكاملة.',
        icon: '❄️', 
        image: 'https://tse2.mm.bing.net/th/id/OIP.ewVnCEifcfyP8zs-1MFClQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
        issues: ['Not cooling', 'Water leakage', 'Strange noise', 'Gas refilling', 'Motor repair', 'Not turning on'],
        issuesArabic: ['لا يبرد', 'تسرب الماء', 'صوت غريب', 'تعبئة الغاز', 'إصلاح المحرك', 'لا يعمل'],
        order: 1 
      },
      { 
        name: 'AC Installation', 
        nameArabic: 'تركيب التكييف', 
        description: 'Professional AC installation services for split AC, window AC, and central AC. Our experts handle proper wiring, gas charging, stand installation, and complete setup.', 
        descriptionArabic: 'خدمات تركيب التكييف المهنية للتكييف الشباكي والمركزي. يتعامل خبراؤنا مع التمديدات الكهربائية وتعبئة الغاز وتركيب الساند والإعداد الكامل.',
        icon: '🔧', 
        image: 'https://images.ctfassets.net/jarihqritqht/4knOOisMqWwK8mfzzrRWPK/a3770b5cddf13b155b65696c716a0386/technician-repairing-air-conditioner.jpg',
        issues: ['New AC installation', 'AC relocation', 'Gas charging after install', 'Wiring setup', 'Stand installation', 'AC removal'],
        issuesArabic: ['تركيب تكييف جديد', 'نقل التكييف', 'تعبئة الغاز بعد التركيب', 'تمديد الأسلاك', 'تركيب ستاند', 'إزالة التكييف'],
        order: 2 
      },
      { 
        name: 'AC Service', 
        nameArabic: 'صيانة التكييف', 
        description: 'Regular AC maintenance and servicing to keep your AC running efficiently. Includes professional cleaning, filter replacement, gas check, coil cleaning, and performance check.', 
        descriptionArabic: 'صيانة التكييف الدورية للحفاظ على تشغيل التكييف بكفاءة. يشمل التنظيف الاحترافي واستبدال الفلاتر وفحص الغاز وتنظيف الملفات وفحص الأداء.',
        icon: '🛠️', 
        image: 'https://tse2.mm.bing.net/th/id/OIP.Kq3OrTMOI6f9u7N2WtL1fQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
        issues: ['Annual service', 'Filter cleaning', 'Gas check', 'Coil cleaning', 'Performance check', 'Drain pipe cleaning'],
        issuesArabic: ['صيانة سنوية', 'تنظيف الفلاتر', 'فحص الغاز', 'تنظيف الملفات', 'فحص الأداء', 'تنظيف مصرف المياه'],
        order: 3 
      },
      { 
        name: 'Refrigerator', 
        nameArabic: 'الثلاجات', 
        description: 'Expert refrigerator repair services for all brands. We fix cooling problems, ice maker issues, compressor replacement, gas charging, and door seal replacement.', 
        descriptionArabic: 'خدمات إصلاح الثلاجات لجميع العلامات التجارية. نصلح مشاكل التبريد وإصلاح صانع الثلج واستبدال الضاغط وشحن الغاز واستبدال مانعة التسرب.',
        icon: '🧊', 
        image: 'https://thermadorrepairgroup.com/wp-content/uploads/2019/11/Refrigeratorrepair.jpg',
        issues: ['Not cooling', 'Ice buildup', 'Water leakage', 'Compressor issue', 'Door seal replacement', 'Strange sounds'],
        issuesArabic: ['لا يبرد', 'تراكم الجليد', 'تسرب الماء', 'مشكلة الضاغط', 'استبدال مانعة التسرب', 'أصوات غريبة'],
        order: 4 
      },
      { 
        name: 'Washing Machine', 
        nameArabic: 'غسالات', 
        description: 'Professional washing machine repair services for all front load and top load machines. We handle motor repair, drainage issues, door lock problems, and all major brands.', 
        descriptionArabic: 'خدمات إصلاح الغسالات المهنية لجميع الغسالات الأمامية والعلوية. نتعامل مع إصلاح المحرك ومشاكل التصريف ومشاكل قفل الباب.',
        icon: '🧺', 
        image: 'https://www.samatechnicalservices.com/wp-content/uploads/2022/09/Washing-Machine-Repair-Saadiyat-Beach-residence.jpg',
        issues: ['Not spinning', 'Water not draining', 'Noise during operation', 'Door lock issue', 'Motor repair', 'Water filling problem'],
        issuesArabic: ['لا يدور', 'لا يصرف الماء', 'ضوضاء أثناء التشغيل', 'مشكلة قفل الباب', 'إصلاح المحرك', 'مشكلة ملء الماء'],
        order: 5 
      },
      { 
        name: 'Oven & Kitchen', 
        nameArabic: 'الأفران والمطبخ', 
        description: 'Expert oven and kitchen appliance repair services. We service built-in ovens, free-standing ovens, microwave ovens, and all kitchen appliances.', 
        descriptionArabic: 'خدمات إصلاح الأفران ومعدات المطبخ المهنية. نخدم الأفران المدمجة والميكرويف وجميع أجهزة المطبخ.',
        icon: '🍳', 
        image: 'https://tse1.mm.bing.net/th/id/OIP.lflzUkoOu9lKqCJ8oWofWAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
        issues: ['Not heating', 'Temperature inconsistency', 'Sparking', 'Door glass replacement', 'Timer issues', 'Not turning on'],
        issuesArabic: ['لا يسخن', 'عدم انتظام الحرارة', 'الشرر', 'استبدال زجاج الباب', 'مشاكل المؤقت', 'لا يعمل'],
        order: 6 
      }
    ];

    await Service.insertMany(services);
    res.json({ message: 'Services seeded successfully', count: services.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
