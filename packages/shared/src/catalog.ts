/**
 * FIXnGO Unified Service Catalogue
 * Single Source of Truth for on-demand booking, skill matching, and operations.
 */

export type ServiceCategoryKey = 'AC' | 'ELECTRICAL' | 'PLUMBING' | 'LABOUR' | 'RENTAL' | 'MATERIALS';

export type RequiredSkill = 'HVAC' | 'ELECTRICAL' | 'PLUMBING' | 'GENERAL' | 'MASONRY' | 'CARPENTRY' | 'PAINTING' | 'EQUIPMENT_OPERATOR';

export interface ServiceTask {
  id: string;
  category: ServiceCategoryKey;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  startingPriceAed: number;
  durationMinutes: number;
  requiredSkill: RequiredSkill;
  pricingType: 'FIXED' | 'QUOTE';
  unitEn: string;
  unitAr: string;
}

export interface ServiceCategoryDefinition {
  id: ServiceCategoryKey;
  icon: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  startingPriceAed: number;
  priceDisplayEn: string;
  priceDisplayAr: string;
  isShopRedirect?: boolean;
}

export const SERVICE_CATEGORIES: ServiceCategoryDefinition[] = [
  {
    id: 'AC',
    icon: '❄️',
    titleEn: 'AC Service',
    titleAr: 'صيانة التكييف',
    descriptionEn: 'Cooling issues, filter cleaning, gas charge, and installations',
    descriptionAr: 'معالجة مشاكل التبريد، تنظيف الفلاتر، شحن الغاز والتركيب',
    startingPriceAed: 129,
    priceDisplayEn: 'from AED 129',
    priceDisplayAr: 'من ١٢٩ د.إ',
  },
  {
    id: 'ELECTRICAL',
    icon: '⚡',
    titleEn: 'Electrical',
    titleAr: 'أعمال الكهرباء',
    descriptionEn: 'Power tripping, DB panels, switches, fixtures, and rewiring',
    descriptionAr: 'انقطاع التيار، لوحات التوزيع، القواطع والإنارة والتمديدات',
    startingPriceAed: 99,
    priceDisplayEn: 'from AED 99',
    priceDisplayAr: 'من ٩٩ د.إ',
  },
  {
    id: 'PLUMBING',
    icon: '💧',
    titleEn: 'Plumbing',
    titleAr: 'أعمال السباكة',
    descriptionEn: 'Pipe leaks, blocked drains, water heaters, pumps, and mixers',
    descriptionAr: 'تسريب الأنابيب، انسداد المصارف، السخانات والمضخات والخلاطات',
    startingPriceAed: 99,
    priceDisplayEn: 'from AED 99',
    priceDisplayAr: 'من ٩٩ د.إ',
  },
  {
    id: 'LABOUR',
    icon: '👥',
    titleEn: 'Labour Supply',
    titleAr: 'توريد العمالة',
    descriptionEn: 'Certified helpers, masons, electricians, plumbers & painters',
    descriptionAr: 'عمال مساعدون، بناؤون، كهربائيون، سباكون ونجارون معتمدون',
    startingPriceAed: 0,
    priceDisplayEn: 'Quote requested',
    priceDisplayAr: 'طلب عرض سعر',
  },
  {
    id: 'RENTAL',
    icon: '🚜',
    titleEn: 'Equipment Rental',
    titleAr: 'تأجير المعدات',
    descriptionEn: 'Scaffolding, scissor lifts, generators, and heavy machinery',
    descriptionAr: 'سقالات معتمدة، رافعات مقصية، مولدات ومعدات هندسية',
    startingPriceAed: 90,
    priceDisplayEn: 'from AED 90 / day',
    priceDisplayAr: 'من ٩٠ د.إ / يوم',
  },
  {
    id: 'MATERIALS',
    icon: '📦',
    titleEn: 'Materials & Parts',
    titleAr: 'قطع الغيار والمواد',
    descriptionEn: 'Genuine refrigerants, capacitors, breakers, pipes, and fittings',
    descriptionAr: 'غازات التبريد، المكثفات، القواطع، الأنابيب ولوازم التركيب',
    startingPriceAed: 28,
    priceDisplayEn: 'Shop catalog',
    priceDisplayAr: 'كتالوج المتجر',
    isShopRedirect: true,
  },
];

export const SERVICE_TASKS: ServiceTask[] = [
  // ==========================================
  // AC / HVAC TASKS
  // ==========================================
  {
    id: 'ac-not-cooling',
    category: 'AC',
    titleEn: 'AC not cooling',
    titleAr: 'المكيف لا يبرد',
    descriptionEn: 'Comprehensive diagnostics for warm airflow, refrigerant check, and compressor evaluation.',
    descriptionAr: 'فحص شامل لسبب ضعف أو انعدام التبريد، قياس مستوى الغاز وفحص الكمبروسر.',
    startingPriceAed: 149,
    durationMinutes: 60,
    requiredSkill: 'HVAC',
    pricingType: 'FIXED',
    unitEn: 'unit',
    unitAr: 'وحدة',
  },
  {
    id: 'ac-service-filter-cleaning',
    category: 'AC',
    titleEn: 'AC service & filter cleaning',
    titleAr: 'صيانة المكيف وتنظيف الفلاتر',
    descriptionEn: 'Full indoor and outdoor unit chemical wash, filter sanitization, and drain flush.',
    descriptionAr: 'غسيل كيماوي للوحدات الداخلية والخارجية، تنظيف الفلاتر وتسليك مجرى التصريف.',
    startingPriceAed: 129,
    durationMinutes: 45,
    requiredSkill: 'HVAC',
    pricingType: 'FIXED',
    unitEn: 'unit',
    unitAr: 'وحدة',
  },
  {
    id: 'ac-gas-topup',
    category: 'AC',
    titleEn: 'Gas top-up',
    titleAr: 'شحن غاز التبريد',
    descriptionEn: 'Precision R410A / R22 refrigerant pressure testing, leak search, and recharge.',
    descriptionAr: 'فحص الضغط وتعبئة غاز التبريد الأصلي R410A / R22 مع فحص التسريب.',
    startingPriceAed: 180,
    durationMinutes: 60,
    requiredSkill: 'HVAC',
    pricingType: 'FIXED',
    unitEn: 'unit',
    unitAr: 'وحدة',
  },
  {
    id: 'ac-water-leaking',
    category: 'AC',
    titleEn: 'Water leaking from AC',
    titleAr: 'تسريب مياه من المكيف',
    descriptionEn: 'Clear clogged condensate drain line, level adjustment, and drain tray sealing.',
    descriptionAr: 'تسليك خط تصريف مياه التكثيف المسدود، تعديل الميلان ومعالجة صينية التصريف.',
    startingPriceAed: 149,
    durationMinutes: 60,
    requiredSkill: 'HVAC',
    pricingType: 'FIXED',
    unitEn: 'unit',
    unitAr: 'وحدة',
  },
  {
    id: 'ac-noisy',
    category: 'AC',
    titleEn: 'Noisy AC',
    titleAr: 'صوت مزعج أو اهتزاز في المكيف',
    descriptionEn: 'Inspect blower motor bearings, fan blade alignment, and compressor mount dampening.',
    descriptionAr: 'فحص رولمان بلي محرك المروحة، موازنة الريش وتثبيت قواعد الكمبروسر لتقليل الضوضاء.',
    startingPriceAed: 139,
    durationMinutes: 45,
    requiredSkill: 'HVAC',
    pricingType: 'FIXED',
    unitEn: 'unit',
    unitAr: 'وحدة',
  },
  {
    id: 'ac-new-installation',
    category: 'AC',
    titleEn: 'New AC installation',
    titleAr: 'تركيب مكيف جديد',
    descriptionEn: 'Professional mounting of indoor/outdoor units, copper piping, vacuuming, and testing.',
    descriptionAr: 'تركيب وتثبيت الوحدات الداخلية والخارجية، تمديد وتوصيل النحاس وتفريغ الهواء والاختبار.',
    startingPriceAed: 350,
    durationMinutes: 120,
    requiredSkill: 'HVAC',
    pricingType: 'FIXED',
    unitEn: 'unit',
    unitAr: 'وحدة',
  },
  {
    id: 'ac-duct-cleaning',
    category: 'AC',
    titleEn: 'Duct cleaning',
    titleAr: 'تنظيف وتطهير مجاري الهواء',
    descriptionEn: 'Rotary brush vacuuming of supply & return ducts, mold treatment, and sanitization.',
    descriptionAr: 'تنظيف آلي بفرش دوارة لمجاري الهواء وموزعات الهواء مع التعقيم وإزالة البكتيريا.',
    startingPriceAed: 450,
    durationMinutes: 120,
    requiredSkill: 'HVAC',
    pricingType: 'FIXED',
    unitEn: 'system',
    unitAr: 'نظام',
  },

  // ==========================================
  // ELECTRICAL TASKS
  // ==========================================
  {
    id: 'ele-power-trip',
    category: 'ELECTRICAL',
    titleEn: 'Power trip / no power',
    titleAr: 'انقطاع تام للتيار / قاطع مفصول',
    descriptionEn: 'Emergency insulation resistance megger testing and fault isolation to restore power.',
    descriptionAr: 'فحص عزل فوري وتحديد مسار الالتماس الكهربائي لإعادة تشغيل التيار بأمان.',
    startingPriceAed: 129,
    durationMinutes: 45,
    requiredSkill: 'ELECTRICAL',
    pricingType: 'FIXED',
    unitEn: 'visit',
    unitAr: 'زيارة',
  },
  {
    id: 'ele-socket-switch-repair',
    category: 'ELECTRICAL',
    titleEn: 'Socket or switch repair',
    titleAr: 'إصلاح مفتاح أو مقبس كهرباء',
    descriptionEn: 'Replace burned out socket outlets, dimmer switches, and loose junction terminals.',
    descriptionAr: 'استبدال المقابس المحترقة أو التالفة ومفاتيح الإضاءة وشد التوصيلات الرخوة.',
    startingPriceAed: 99,
    durationMinutes: 30,
    requiredSkill: 'ELECTRICAL',
    pricingType: 'FIXED',
    unitEn: 'point',
    unitAr: 'نقطة',
  },
  {
    id: 'ele-light-fitting-install',
    category: 'ELECTRICAL',
    titleEn: 'Light fitting install',
    titleAr: 'تركيب وتوصيل وحدات الإنارة',
    descriptionEn: 'Install chandeliers, spotlights, LED strips, panel lights, and outdoor fixtures.',
    descriptionAr: 'تركيب الثريات، كشافات السبوت لايت، أشرطة الليد والإنارة الجدارية والخارجية.',
    startingPriceAed: 99,
    durationMinutes: 30,
    requiredSkill: 'ELECTRICAL',
    pricingType: 'FIXED',
    unitEn: 'fixture',
    unitAr: 'وحدة',
  },
  {
    id: 'ele-db-panel-issue',
    category: 'ELECTRICAL',
    titleEn: 'DB panel issue',
    titleAr: 'فحص وإصلاح لوحة التوزيع الرئيسية',
    descriptionEn: 'Main breaker ELCB/RCCB testing, phase balancing, busbar tightening, and labeling.',
    descriptionAr: 'فحص القواطع الرئيسية والحساسات، موازنة الأحمال الكهربائية وترتيب أسلاك التوزيع.',
    startingPriceAed: 199,
    durationMinutes: 60,
    requiredSkill: 'ELECTRICAL',
    pricingType: 'FIXED',
    unitEn: 'panel',
    unitAr: 'لوحة',
  },
  {
    id: 'ele-ceiling-fan-install',
    category: 'ELECTRICAL',
    titleEn: 'Ceiling fan install',
    titleAr: 'تركيب مروحة سقفية',
    descriptionEn: 'Secure ceiling anchor installation, motor balancing, and regulator speed control hookup.',
    descriptionAr: 'تثبيت المروحة في السقف بأمان مع موازنة الشفرات وتوصيل منظم السرعة.',
    startingPriceAed: 120,
    durationMinutes: 45,
    requiredSkill: 'ELECTRICAL',
    pricingType: 'FIXED',
    unitEn: 'fan',
    unitAr: 'مروحة',
  },
  {
    id: 'ele-new-wiring-point',
    category: 'ELECTRICAL',
    titleEn: 'New wiring point',
    titleAr: 'تمديد نقطة كهرباء جديدة',
    descriptionEn: 'Conduit laying, copper wire pulling, and socket installation for appliances or TV.',
    descriptionAr: 'تمديد مواسير وأسلاك نحاسية جديدة مع تركيب مقبس للأجهزة الكهربائية أو التلفاز.',
    startingPriceAed: 150,
    durationMinutes: 60,
    requiredSkill: 'ELECTRICAL',
    pricingType: 'FIXED',
    unitEn: 'point',
    unitAr: 'نقطة',
  },

  // ==========================================
  // PLUMBING TASKS
  // ==========================================
  {
    id: 'plu-leak-repair',
    category: 'PLUMBING',
    titleEn: 'Leak repair',
    titleAr: 'إصلاح تسريب مياه بالأنابيب',
    descriptionEn: 'Locate hidden or visible leaks on PPR, PEX, and copper water supply lines.',
    descriptionAr: 'تحديد وإصلاح التسريبات الظاهرة والمخفية في خطوط المياه PPR و PEX والنحاس.',
    startingPriceAed: 129,
    durationMinutes: 45,
    requiredSkill: 'PLUMBING',
    pricingType: 'FIXED',
    unitEn: 'leak',
    unitAr: 'تسريب',
  },
  {
    id: 'plu-blocked-drain',
    category: 'PLUMBING',
    titleEn: 'Blocked drain',
    titleAr: 'تسليك وفتح مصارف مسدودة',
    descriptionEn: 'Electromechanical drain snake and pressure jetting to unblock sinks, showers, and main drains.',
    descriptionAr: 'تسليك المصارف المغلقة في المطابخ والحمامات باستخدام زنبرك كهربائي وضغط عالي.',
    startingPriceAed: 149,
    durationMinutes: 45,
    requiredSkill: 'PLUMBING',
    pricingType: 'FIXED',
    unitEn: 'drain',
    unitAr: 'مصرف',
  },
  {
    id: 'plu-water-heater',
    category: 'PLUMBING',
    titleEn: 'Water heater repair/replace',
    titleAr: 'إصلاح أو استبدال سخان المياه',
    descriptionEn: 'Heating element replacement, thermostat calibration, safety valve test, or full heater renewal.',
    descriptionAr: 'استبدال شمعة السخان، معايرة الترموستات، فحص صمام الأمان أو استبدال السخان بالكامل.',
    startingPriceAed: 180,
    durationMinutes: 60,
    requiredSkill: 'PLUMBING',
    pricingType: 'FIXED',
    unitEn: 'heater',
    unitAr: 'سخان',
  },
  {
    id: 'plu-tap-mixer-replace',
    category: 'PLUMBING',
    titleEn: 'Tap or mixer replace',
    titleAr: 'استبدال خلاط مياه أو صنبور',
    descriptionEn: 'Replace dripping kitchen mixer, washbasin faucet, angle valves, and flexible braided connectors.',
    descriptionAr: 'استبدال خلاطات المطابخ والمغاسل ومحابس الزاوية والخراطيم المرنة المانعة للتسريب.',
    startingPriceAed: 99,
    durationMinutes: 30,
    requiredSkill: 'PLUMBING',
    pricingType: 'FIXED',
    unitEn: 'fixture',
    unitAr: 'خلاط',
  },
  {
    id: 'plu-toilet-repair',
    category: 'PLUMBING',
    titleEn: 'Toilet repair',
    titleAr: 'إصلاح وتصليح كرسي الحمام',
    descriptionEn: 'Flush valve mechanism overhaul, float adjustment, leak arrest, and wax ring replacement.',
    descriptionAr: 'إصلاح ماكينة السيفون، ضبط العوامة، إيقاف التسريب المستمر واستبدال حلقة العزل.',
    startingPriceAed: 120,
    durationMinutes: 45,
    requiredSkill: 'PLUMBING',
    pricingType: 'FIXED',
    unitEn: 'toilet',
    unitAr: 'كرسي',
  },
  {
    id: 'plu-pipe-burst-emergency',
    category: 'PLUMBING',
    titleEn: 'Pipe burst (emergency)',
    titleAr: 'انفجار خط مياه (حالة طوارئ)',
    descriptionEn: 'Immediate response to isolate main supply, cut ruptured section, and execute high-pressure coupling.',
    descriptionAr: 'استجابة طارئة لإغلاق المحبس الرئيسي، قص الأنبوب المتضرر وتوصيل وصلة ضغط جديدة.',
    startingPriceAed: 199,
    durationMinutes: 60,
    requiredSkill: 'PLUMBING',
    pricingType: 'FIXED',
    unitEn: 'emergency',
    unitAr: 'حالة',
  },
  {
    id: 'plu-water-pump-repair',
    category: 'PLUMBING',
    titleEn: 'Water pump repair',
    titleAr: 'إصلاح مضخة المياه المعززة',
    descriptionEn: 'Booster pump pressure switch calibration, capacitor replacement, and non-return valve check.',
    descriptionAr: 'معايرة منظم ضغط المضخة، تبديل المكثف وفحص صمام عدم الرجوع لضمان قوة المياه.',
    startingPriceAed: 199,
    durationMinutes: 60,
    requiredSkill: 'PLUMBING',
    pricingType: 'FIXED',
    unitEn: 'pump',
    unitAr: 'مضخة',
  },
  {
    id: 'plu-water-tank-cleaning',
    category: 'PLUMBING',
    titleEn: 'Water tank cleaning',
    titleAr: 'غسيل وتعقيم خزان المياه',
    descriptionEn: 'Dewatering, high-pressure scrubbing of sediment and algae, and DM-approved chlorine disinfection.',
    descriptionAr: 'تفريغ المياه، فرك الرواسب بضغط عالي وتعقيم الخزان بمواد معتمدة من بلدية دبي.',
    startingPriceAed: 350,
    durationMinutes: 90,
    requiredSkill: 'PLUMBING',
    pricingType: 'FIXED',
    unitEn: 'tank',
    unitAr: 'خزان',
  },

  // ==========================================
  // LABOUR SUPPLY TASKS (Quote Requested)
  // ==========================================
  {
    id: 'labour-helper',
    category: 'LABOUR',
    titleEn: 'Helper',
    titleAr: 'عامل مساعد',
    descriptionEn: 'General site helper for loading, unloading, clean-up, and material moving.',
    descriptionAr: 'عامل موقع عام للتحميل والتنزيل والتنظيف ونقل المواد.',
    startingPriceAed: 120,
    durationMinutes: 480,
    requiredSkill: 'GENERAL',
    pricingType: 'QUOTE',
    unitEn: 'worker/day',
    unitAr: 'عامل/يوم',
  },
  {
    id: 'labour-mason',
    category: 'LABOUR',
    titleEn: 'Mason',
    titleAr: 'بنّاء محترف',
    descriptionEn: 'Skilled block work, plastering, ceramic tile repair, and concrete patch work.',
    descriptionAr: 'بناء طابوق وبلاستر وتركيب سيراميك وترميمات الخرسانة.',
    startingPriceAed: 180,
    durationMinutes: 480,
    requiredSkill: 'MASONRY',
    pricingType: 'QUOTE',
    unitEn: 'worker/day',
    unitAr: 'عامل/يوم',
  },
  {
    id: 'labour-electrician',
    category: 'LABOUR',
    titleEn: 'Electrician',
    titleAr: 'كهربائي مشاريع',
    descriptionEn: 'Certified industrial and commercial wiring, cable trays, terminations, and testing.',
    descriptionAr: 'فني كهرباء معتمد لتمديد الكابلات وحوامل الكابلات والتوصيلات الصناعية.',
    startingPriceAed: 200,
    durationMinutes: 480,
    requiredSkill: 'ELECTRICAL',
    pricingType: 'QUOTE',
    unitEn: 'worker/day',
    unitAr: 'عامل/يوم',
  },
  {
    id: 'labour-plumber',
    category: 'LABOUR',
    titleEn: 'Plumber',
    titleAr: 'سباك مشاريع',
    descriptionEn: 'Commercial pipe fitting, drainage installation, sanitary fixing, and pressure testing.',
    descriptionAr: 'فني سباكة للمشاريع وتمديدات الصرف الصحي وتركيب الأدوات الصحية.',
    startingPriceAed: 200,
    durationMinutes: 480,
    requiredSkill: 'PLUMBING',
    pricingType: 'QUOTE',
    unitEn: 'worker/day',
    unitAr: 'عامل/يوم',
  },
  {
    id: 'labour-painter',
    category: 'LABOUR',
    titleEn: 'Painter',
    titleAr: 'صباغ ودهان',
    descriptionEn: 'Surface preparation, primer coating, putty smoothing, and precision emulsion painting.',
    descriptionAr: 'صنفرة ومعجون ودهان داخلي وخارجي بأعلى مستويات التشطيب.',
    startingPriceAed: 160,
    durationMinutes: 480,
    requiredSkill: 'PAINTING',
    pricingType: 'QUOTE',
    unitEn: 'worker/day',
    unitAr: 'عامل/يوم',
  },
  {
    id: 'labour-carpenter',
    category: 'LABOUR',
    titleEn: 'Carpenter',
    titleAr: 'نجار أبواب وديكور',
    descriptionEn: 'Door hanging, lock fitting, cabinet repair, partition assembly, and shuttering.',
    descriptionAr: 'تركيب الأبواب والأقفال والخزائن والقواطع الخشبية وأعمال النجارة العامة.',
    startingPriceAed: 180,
    durationMinutes: 480,
    requiredSkill: 'CARPENTRY',
    pricingType: 'QUOTE',
    unitEn: 'worker/day',
    unitAr: 'عامل/يوم',
  },

  // ==========================================
  // EQUIPMENT RENTAL TASKS (Quote Requested)
  // ==========================================
  {
    id: 'rental-scaffolding',
    category: 'RENTAL',
    titleEn: 'Scaffolding',
    titleAr: 'سقالات ألمنيوم معتمدة',
    descriptionEn: 'Mobile aluminum tower scaffolding with safety guardrails, outriggers, and lockable castors.',
    descriptionAr: 'سقالات ألمنيوم متحركة مع حواجز أمان ودعامات عريضة وعجلات قابلة للقفل.',
    startingPriceAed: 90,
    durationMinutes: 1440,
    requiredSkill: 'EQUIPMENT_OPERATOR',
    pricingType: 'QUOTE',
    unitEn: 'day',
    unitAr: 'يوم',
  },
  {
    id: 'rental-scissor-lift',
    category: 'RENTAL',
    titleEn: 'Scissor lift',
    titleAr: 'رافعة مقصية هيدروليكية',
    descriptionEn: 'Electric self-propelled scissor lift (8m to 14m working height) with non-marking tires.',
    descriptionAr: 'رافعة مقصية كهربائية ذاتية الدفع بارتفاع عمل 8 إلى 14 متراً مع عجلات غير معلّمة.',
    startingPriceAed: 250,
    durationMinutes: 1440,
    requiredSkill: 'EQUIPMENT_OPERATOR',
    pricingType: 'QUOTE',
    unitEn: 'day',
    unitAr: 'يوم',
  },
  {
    id: 'rental-generator',
    category: 'RENTAL',
    titleEn: 'Generator',
    titleAr: 'مولد ديزل كاتم للصوت',
    descriptionEn: 'Silenced diesel sound-attenuated generator (20 kVA to 150 kVA) with distribution board.',
    descriptionAr: 'مولد ديزل فائق الهدوء كاتم للصوت من 20 إلى 150 ك.ف.أ مع لوحة توزيع.',
    startingPriceAed: 180,
    durationMinutes: 1440,
    requiredSkill: 'EQUIPMENT_OPERATOR',
    pricingType: 'QUOTE',
    unitEn: 'day',
    unitAr: 'يوم',
  },
  {
    id: 'rental-concrete-mixer',
    category: 'RENTAL',
    titleEn: 'Concrete mixer',
    titleAr: 'خلاطة خرسانة ميكانيكية',
    descriptionEn: 'Heavy-duty site concrete / mortar mixer (350L drum) with diesel engine.',
    descriptionAr: 'خلاطة خرسانة ومونة متينة للموقع بسعة 350 لتراً ومحرك ديزل اقتصادي.',
    startingPriceAed: 120,
    durationMinutes: 1440,
    requiredSkill: 'EQUIPMENT_OPERATOR',
    pricingType: 'QUOTE',
    unitEn: 'day',
    unitAr: 'يوم',
  },
  {
    id: 'rental-welding-machine',
    category: 'RENTAL',
    titleEn: 'Welding machine',
    titleAr: 'ماكينة لحام ديزل / كهرباء',
    descriptionEn: 'Portable multi-process ARC/MIG/TIG inverter welding machine with leads and mask.',
    descriptionAr: 'ماكينة لحام متعددة الاستخدامات محمولة مع كابلات اللحام وقناع الحماية.',
    startingPriceAed: 110,
    durationMinutes: 1440,
    requiredSkill: 'EQUIPMENT_OPERATOR',
    pricingType: 'QUOTE',
    unitEn: 'day',
    unitAr: 'يوم',
  },
];

/**
 * Filter tasks strictly by service category
 */
export function getTasksByCategory(category: ServiceCategoryKey): ServiceTask[] {
  return SERVICE_TASKS.filter((t) => t.category === category);
}

/**
 * Find single task by ID
 */
export function getTaskById(taskId: string): ServiceTask | undefined {
  return SERVICE_TASKS.find((t) => t.id === taskId);
}

/**
 * Skill matching helper: Checks if a technician with trade/skill can perform this task
 */
export function isSkillMatching(
  technicianTradeOrSkills: string | string[],
  requiredSkill: string
): boolean {
  if (!technicianTradeOrSkills || !requiredSkill) return false;
  const normalizedReq = requiredSkill.trim().toUpperCase();
  if (normalizedReq === 'GENERAL') return true;

  const skillsList = Array.isArray(technicianTradeOrSkills)
    ? technicianTradeOrSkills
    : [technicianTradeOrSkills];

  for (const s of skillsList) {
    if (!s) continue;
    const norm = s.trim().toUpperCase();
    if (norm === normalizedReq) return true;
    if (norm === 'GENERAL') return true;
    if (norm.includes('PLUMB') && normalizedReq.includes('PLUMB')) return true;
    if ((norm.includes('HVAC') || norm.includes('AC')) && (normalizedReq.includes('HVAC') || normalizedReq.includes('AC'))) return true;
    if (norm.includes('ELECT') && normalizedReq.includes('ELECT')) return true;
    if (norm.includes('MEP') && ['HVAC', 'ELECTRICAL', 'PLUMBING'].includes(normalizedReq)) return true;
    if (norm.includes('LABOUR') && normalizedReq.includes('LABOUR')) return true;
    if (norm.includes('EQUIPMENT') && normalizedReq.includes('EQUIPMENT')) return true;
  }
  return false;
}
