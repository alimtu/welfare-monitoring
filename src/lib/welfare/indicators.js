/**
 * Definitions for the 13 university welfare KPIs (شاخص‌های رفاهی).
 *
 * These are the single source of truth and live in code (not localStorage),
 * because each indicator carries a `compute` function / option scores that
 * cannot be serialized. Submissions (user data) ARE persisted to localStorage.
 *
 * Each indicator has:
 *  - type: 'direct'    -> numeric inputs + compute(input) => value, matched to bands
 *  - type: 'checklist' -> criteria with scored options, percentage matched to bands
 *
 * `resultUnit` drives how the computed value is formatted for display.
 * `scoringBands` are matched with [min, max) semantics (see calculations.js):
 *   value >= min (when min != null)  AND  value < max (when max != null).
 *
 * NOTE: A few indicators in the source document leave scoring bands "to be
 * confirmed/defined" (6 & 8). Those bands are marked with `assumed: true` and
 * follow the same 10/7/4/1 pattern as their siblings.
 */

export const SCORE_LEVELS = [10, 7, 4, 1];

// Reusable band builders -------------------------------------------------------
const band = (min, max, score, description, extra = {}) => ({
  min,
  max,
  score,
  description,
  ...extra,
});

// Percentage bands used by several checklist indicators (points == percentage
// because every checklist below is designed with a max total of 100).
const percentBands = (b10, b7, b4) => [
  band(b10, null, 10, `بالای ${b10}`),
  band(b7, b10, 7, `${b7} تا ${b10}`),
  band(b4, b7, 4, `${b4} تا ${b7}`),
  band(null, b4, 1, `زیر ${b4}`),
];

/** @type {Array<Object>} */
export const INDICATORS = [
  // 1 ---------------------------------------------------------------------------
  {
    id: 'IND01',
    code: '1',
    title: 'عملکرد سرانه رفاهی',
    page: 15,
    weight: 2,
    type: 'direct',
    resultUnit: 'rial',
    definition: 'میزان سرانه رفاهی پرداخت‌شده به ازای هر کارمند در طول سال را اندازه‌گیری می‌کند.',
    objective: 'ارتقای سطح رفاه عمومی کارکنان از طریق افزایش اعتبارات رفاهی سرانه.',
    formulaDisplay: 'مجموع بودجه رفاهی ÷ تعداد کارکنان واجد شرایط',
    optimalStandard: 'بالای ۴۰۰ میلیون ریال',
    requiredDocuments: ['گزارش مرکز بودجه', 'لیست حقوق و دستمزد'],
    inputFields: [
      { key: 'transportation', label: 'حمل‌ونقل', unit: 'ریال', group: 'بودجه رفاهی' },
      { key: 'food', label: 'بن خواروبار', unit: 'ریال', group: 'بودجه رفاهی' },
      { key: 'housing', label: 'کمک‌هزینه مسکن', unit: 'ریال', group: 'بودجه رفاهی' },
      { key: 'accommodation', label: 'تسهیلات اقامتی سالانه', unit: 'ریال', group: 'بودجه رفاهی' },
      { key: 'insurance', label: 'سهم بیمه تکمیلی', unit: 'ریال', group: 'بودجه رفاهی' },
      { key: 'other', label: 'سایر پرداخت‌های نقدی و غیرنقدی', unit: 'ریال', group: 'بودجه رفاهی' },
      { key: 'employees', label: 'تعداد کارکنان واجد شرایط', unit: 'نفر' },
    ],
    compute: v =>
      v.employees > 0
        ? (num(v.transportation) +
            num(v.food) +
            num(v.housing) +
            num(v.accommodation) +
            num(v.insurance) +
            num(v.other)) /
          v.employees
        : 0,
    scoringBands: [
      band(400_000_000, null, 10, 'بالای ۴۰۰ میلیون ریال'),
      band(300_000_000, 400_000_000, 7, '۳۰۰ تا ۴۰۰ میلیون ریال'),
      band(200_000_000, 300_000_000, 4, '۲۰۰ تا ۳۰۰ میلیون ریال'),
      band(null, 200_000_000, 1, 'زیر ۲۰۰ میلیون ریال'),
    ],
  },

  // 2 ---------------------------------------------------------------------------
  {
    id: 'IND02',
    code: '2',
    title: 'وضعیت سرانه تسهیلات بانکی',
    page: 16,
    weight: 2,
    type: 'direct',
    resultUnit: 'percent',
    definition: 'نسبت تسهیلات اعتباری دریافتی به گردش مالی کل در طول یک سال را بررسی می‌کند.',
    objective: 'افزایش دسترسی کارکنان به تسهیلات اعتباری بانکی.',
    formulaDisplay: '(مجموع تسهیلات اعتباری بانک‌ها ÷ گردش مالی کل) × ۱۰۰',
    optimalStandard: 'بالای ۲۰٪',
    requiredDocuments: ['قراردادهای بانکی', 'گزارش‌های مالی'],
    inputFields: [
      { key: 'facilities', label: 'مجموع تسهیلات اعتباری بانک‌ها', unit: 'ریال' },
      { key: 'turnover', label: 'گردش مالی کل (حقوق، مزایا، تنخواه)', unit: 'ریال' },
    ],
    compute: v => (v.turnover > 0 ? (num(v.facilities) / v.turnover) * 100 : 0),
    scoringBands: percentBands(20, 15, 10),
  },

  // 3 ---------------------------------------------------------------------------
  {
    id: 'IND03',
    code: '3',
    title: 'سرانه اسکان مراکز گردشگری',
    page: 17,
    weight: 2,
    type: 'direct',
    resultUnit: 'number',
    definition: 'سرانه اسکان در مراکز گردشگری بر اساس تعداد تخت را اندازه‌گیری می‌کند.',
    objective: 'گسترش ظرفیت اقامتی و گردشگری برای کارکنان.',
    formulaDisplay: '(مجموع تخت‌های مراکز اقامتی × ۱۰۰۰) ÷ تعداد کارکنان',
    optimalStandard: 'بالای ۴۰',
    requiredDocuments: ['قراردادهای مراکز اقامتی'],
    inputFields: [
      { key: 'beds', label: 'تعداد کل تخت (ملکی + استیجاری)', unit: 'تخت' },
      { key: 'employees', label: 'تعداد کل کارکنان', unit: 'نفر' },
    ],
    compute: v => (v.employees > 0 ? (num(v.beds) * 1000) / v.employees : 0),
    scoringBands: percentBands(40, 30, 20),
  },

  // 4 ---------------------------------------------------------------------------
  {
    id: 'IND04',
    code: '4',
    title: 'وضعیت مراکز اقامتی و گردشگری',
    page: '18-19',
    weight: 2,
    type: 'checklist',
    definition: 'ارزیابی کیفیت و میزان خدمات اقامتی و گردشگری ارائه‌شده به کارکنان.',
    objective: 'بهبود کیفیت و کمیت خدمات اقامتی و گردشگری.',
    optimalStandard: 'بالای ۷۰ امتیاز',
    requiredDocuments: ['سوابق مشارکت در سامانه میهمانسرا', 'قراردادها'],
    criteria: [
      cItem(
        'C1',
        'میزان مشارکت در سامانه میهمانسرای وزارت بهداشت',
        mCount('beds', 'تعداد تخت فعال در سامانه میهمانسرا', 'تخت', [
          band(11, null, 15, 'بالاتر از ۱۰ تخت'),
          band(5, 11, 10, '۵ تا ۱۰ تخت'),
          band(null, 5, 5, 'کمتر از ۵ تخت'),
        ])
      ),
      cItem(
        'C2',
        'تعداد مراکز اقامتی طرف قرارداد',
        mCount('contracts', 'تعداد قرارداد با هتل و مراکز گردشگری در سال جاری', 'قرارداد', [
          band(4, null, 15, 'بیش از ۴ قرارداد'),
          band(2, 4, 10, '۲ تا ۳ قرارداد'),
          band(null, 2, 5, '۱ قرارداد'),
        ]),
        'قرارداد مستقیم بین دانشگاه و مراکز اقامتی'
      ),
      cItem(
        'C3',
        'سهم پرداختی کارمند',
        mRatio('paid', 'مبلغ پرداختی کارمند برای استفاده', 'total', 'کل مبلغ مرکز اقامتی', [
          band(null, 30, 5, 'کمتر از ۳۰٪'),
          band(30, 60, 15, '۳۰٪ تا ۶۰٪'),
          band(60, null, 25, 'بالاتر از ۶۰٪'),
        ]),
        'درصد سهم پرداختی کارمند = مبلغ پرداختی کارمند ÷ کل مبلغ مرکز (سهم کمتر، امتیاز بیشتر)'
      ),
      cItem(
        'C4',
        'امکانات مراکز طرف اقامتی',
        mQualityAvg([
          opt('weak', 'ضعیف: فقط اسکان', 10),
          opt('medium', 'متوسط: اسکان + صبحانه + ناهار', 15),
          opt('good', 'خوب: اسکان + ۳ وعده غذا + خدمات گردشگری با تخفیف', 20),
        ]),
        'تعداد مراکز در هر سطح را وارد کنید؛ امتیاز = میانگین وزنی مراکز'
      ),
      cItem(
        'C5',
        'عقد قرارداد با موسسات گردشگری',
        mSelect([
          opt('weak', 'ضعیف: کسر از حقوق و اقساط زیر ۱ سال', 5),
          opt('medium', 'متوسط: اقساط ۱ تا ۲ سال', 10),
          opt('good', 'خوب: اقساط بلندمدت ۳ ساله', 15),
        ])
      ),
      cItem(
        'C6',
        'برگزاری تورهای تفریحی زیارتی کوتاه‌مدت',
        mRatio(
          'participants',
          'تعداد کارکنان شرکت‌کننده در تورها',
          'staff',
          'تعداد کل کارکنان',
          [
            band(20, null, 10, 'بالاتر از ۲۰٪'),
            band(10, 20, 6, '۱۰٪ تا ۲۰٪'),
            band(null, 10, 3, 'کمتر از ۱۰٪'),
          ],
          'نفر'
        ),
        'درصد کارکنان شرکت‌کننده در تورها'
      ),
    ],
    scoringBands: percentBands(70, 50, 30),
  },

  // 5 ---------------------------------------------------------------------------
  {
    id: 'IND05',
    code: '5',
    title: 'وضعیت خدمات بیمه تکمیلی',
    page: '20-21',
    weight: 2,
    type: 'checklist',
    definition: 'کیفیت خدمات بیمه تکمیلی درمان را ارزیابی می‌کند.',
    objective: 'ارتقای پوشش و کیفیت بیمه تکمیلی درمان کارکنان.',
    optimalStandard: 'بالای ۶۰ امتیاز',
    requiredDocuments: ['قراردادهای بیمه'],
    criteria: [
      cItem(
        'C1',
        'نسبت بهره‌مندی کارکنان از خدمات بیمه تکمیلی',
        mRatio(
          'covered',
          'کارکنان بهره‌مند از بیمه تکمیلی',
          'total',
          'کل کارکنان',
          [
            band(80, null, 20, 'بالای ۸۰٪'),
            band(40, 80, 15, '۴۰٪ تا ۸۰٪'),
            band(null, 40, 5, 'زیر ۴۰٪'),
          ],
          'نفر'
        ),
        'افراد تحت پوشش هر کارمند لحاظ نمی‌شود'
      ),
      cItem(
        'C2',
        'سهم سازمان از پرداخت حق بیمه تکمیلی',
        mRatio('orgShare', 'حق بیمه پرداختی توسط سازمان', 'totalPremium', 'کل حق بیمه پرداختی', [
          band(70, null, 40, 'بالای ۷۰٪'),
          band(35, 70, 25, '۳۵٪ تا ۷۰٪'),
          band(null, 35, 10, 'زیر ۳۵٪'),
        ])
      ),
      cItem(
        'C3',
        'فرانشیز هزینه‌های بستری',
        mPercent('franchise', 'درصد فرانشیز هزینه‌های بستری', [
          band(20, null, 1, 'بیشتر از ۲۰٪'),
          band(10, 20, 3, '۱۰٪ تا ۲۰٪'),
          band(null, 10, 5, 'کمتر از ۱۰٪'),
        ])
      ),
      cItem(
        'C4',
        'فرانشیز هزینه‌های پاراکلینیکی',
        mPercent('franchise', 'درصد فرانشیز هزینه‌های پاراکلینیکی', [
          band(30, null, 1, 'بیشتر از ۳۰٪'),
          band(10, 30, 3, '۱۰٪ تا ۳۰٪'),
          band(null, 10, 5, 'کمتر از ۱۰٪'),
        ])
      ),
      cItem(
        'C5',
        'میزان پوشش تعهدات بیمه‌ای - دارو',
        mSelect([
          opt('weak', 'ضعیف: تا سقف ۲ میلیون تومان', 1),
          opt('medium', 'متوسط: تا سقف ۴ میلیون تومان', 3),
          opt('good', 'خوب: تا سقف ۵ میلیون تومان', 5),
        ])
      ),
      cItem(
        'C6',
        'میزان پوشش تعهدات بیمه‌ای - ویزیت',
        mSelect([
          opt('weak', 'ضعیف: تا سقف ۲ میلیون تومان', 1),
          opt('medium', 'متوسط: تا سقف ۴ میلیون تومان', 3),
          opt('good', 'خوب: تا سقف ۵ میلیون تومان', 5),
        ])
      ),
      cItem(
        'C7',
        'میزان پوشش تعهدات بیمه‌ای - دندانپزشکی',
        mSelect([
          opt('weak', 'ضعیف: تا سقف ۳ میلیون تومان', 1),
          opt('medium', 'متوسط: تا سقف ۵ میلیون تومان', 3),
          opt('good', 'خوب: تا سقف ۸ میلیون تومان', 5),
        ])
      ),
      cItem(
        'C8',
        'مدت‌زمان پرداخت خسارت',
        mCount('days', 'میانگین مدت پرداخت خسارت', 'روز', [
          band(30, null, 5, 'بیشتر از یک ماه'),
          band(7, 30, 10, 'یک تا چهار هفته'),
          band(null, 7, 15, 'کمتر از یک هفته'),
        ]),
        'میانگین حداقل ۱۰ پرونده'
      ),
    ],
    scoringBands: percentBands(60, 40, 20),
  },

  // 6 ---------------------------------------------------------------------------
  {
    id: 'IND06',
    code: '6',
    title: 'مشارکت کارکنان در برنامه‌های ورزشی',
    page: 22,
    weight: 2,
    type: 'direct',
    resultUnit: 'percent',
    definition: 'میزان حضور کارکنان در فعالیت‌های ورزشی را اندازه‌گیری می‌کند.',
    objective: 'افزایش مشارکت کارکنان در فعالیت‌های ورزشی همگانی.',
    formulaDisplay: '(تعداد کارکنان استفاده‌کننده از خدمات ورزشی ÷ کل کارکنان) × ۱۰۰',
    optimalStandard: 'بالای ۳۰٪',
    requiredDocuments: ['کارت‌های ورزشی کارکنان'],
    inputFields: [
      {
        key: 'users',
        label: 'کارکنان استفاده‌کننده از خدمات ورزشی (حداقل ۵۰ ساعت در سال)',
        unit: 'نفر',
      },
      { key: 'employees', label: 'تعداد کل کارکنان', unit: 'نفر' },
    ],
    compute: v => (v.employees > 0 ? (num(v.users) / v.employees) * 100 : 0),
    scoringBands: [
      band(30, null, 10, 'بالای ۳۰٪'),
      band(20, 30, 7, '۲۰ تا ۳۰٪', { assumed: true }),
      band(10, 20, 4, '۱۰ تا ۲۰٪', { assumed: true }),
      band(null, 10, 1, 'زیر ۱۰٪', { assumed: true }),
    ],
  },

  // 7 ---------------------------------------------------------------------------
  {
    id: 'IND07',
    code: '7',
    title: 'وضعیت فعالیت‌های ورزشی',
    page: '23-24',
    weight: 2,
    type: 'checklist',
    definition: 'سیاست‌گذاری و برنامه‌ریزی امور ورزشی را ارزیابی می‌کند.',
    objective: 'توسعه رشته‌های ورزشی و ارتقای ورزش همگانی و قهرمانی.',
    optimalStandard: 'بالای ۷۰ امتیاز',
    requiredDocuments: ['کارت‌های ورزشی', 'احکام قهرمانی'],
    criteria: [
      cItem(
        'C1',
        'رشته‌های ورزشی فعال',
        mCount('disciplines', 'تعداد رشته‌های ورزشی فعال', 'رشته', [
          band(6, null, 10, 'بالاتر از ۵ رشته'),
          band(3, 6, 7, '۳ تا ۵ رشته'),
          band(null, 3, 4, '۲ رشته یا کمتر'),
        ])
      ),
      cItem(
        'C2',
        'وضعیت ورزش همگانی',
        mRatio(
          'participants',
          'کارکنان شرکت‌کننده در فعالیت‌های ورزشی',
          'total',
          'کل کارکنان',
          [
            band(50, null, 20, 'بالای ۵۰٪'),
            band(30, 50, 10, '۳۰٪ تا ۵۰٪'),
            band(null, 30, 5, 'زیر ۳۰٪'),
          ],
          'نفر'
        ),
        'کارکنان شرکت‌کننده در برنامه‌های آموزشی، مناسبتی و مسابقات همگانی'
      ),
      cItem(
        'C3',
        'ورزش قهرمانی - جایگاه المپیاد',
        mCount('rank', 'جایگاه در رده‌بندی نهایی المپیاد ورزشی کارکنان', 'رتبه', [
          band(null, 10, 35, 'زیر ۱۰'),
          band(10, 21, 20, '۱۰ تا ۲۰'),
          band(21, null, 10, 'بالاتر از ۲۰'),
        ]),
        'رتبه پایین‌تر (بهتر) امتیاز بیشتری دارد'
      ),
      cItem(
        'C4',
        'ورزش قهرمانی - امتیاز مدال‌ها',
        mCount('medalPoints', 'مجموع امتیاز مدال‌های کسب‌شده', 'امتیاز', [
          band(10, null, 35, 'امتیاز ۱۰ و بالاتر'),
          band(8, 10, 20, '۸ تا ۱۰ امتیاز'),
          band(null, 8, 10, 'کمتر از ۸ امتیاز'),
        ]),
        'هر مدال جهانی ۱۰، کشوری ۸ و استانی ۵ امتیاز'
      ),
    ],
    scoringBands: percentBands(70, 50, 30),
  },

  // 8 ---------------------------------------------------------------------------
  {
    id: 'IND08',
    code: '8',
    title: 'سرانه عملکرد ورزشی',
    page: 25,
    weight: 2,
    type: 'direct',
    resultUnit: 'rial',
    definition: 'میزان بودجه ورزشی هزینه‌شده به ازای هر کارمند در طول سال را اندازه‌گیری می‌کند.',
    objective: 'افزایش اعتبارات ورزشی سرانه کارکنان.',
    formulaDisplay: 'مجموع بودجه ورزشی هزینه‌شده ÷ تعداد کل کارکنان',
    optimalStandard: 'بالای ۵ میلیون ریال (فرضی)',
    requiredDocuments: ['گزارش هزینه‌کرد ورزشی'],
    inputFields: [
      { key: 'sportsBudget', label: 'مجموع بودجه ورزشی هزینه‌شده', unit: 'ریال' },
      { key: 'employees', label: 'تعداد کل کارکنان', unit: 'نفر' },
    ],
    compute: v => (v.employees > 0 ? num(v.sportsBudget) / v.employees : 0),
    scoringBands: [
      band(70_000_000, null, 10, 'بالای ۷۰ میلیون ریال', { assumed: true }),
      band(40_000_000, 70_000_000, 7, 'بین ۴۰ تا ۷۰ میلیون ریال', { assumed: true }),
      band(20_000_000, 40_000_000, 4, 'بین ۲۰ تا ۴۰ میلیون ریال', { assumed: true }),
      band(null, 20_000_000, 1, 'زیر ۲۰ میلیون ریال', { assumed: true }),
    ],
  },

  // 9 ---------------------------------------------------------------------------
  {
    id: 'IND09',
    code: '9',
    title: 'سرانه فضای ورزشی',
    page: 26,
    weight: 2,
    type: 'direct',
    resultUnit: 'area',
    definition: 'استانداردهای لازم برای مساحت فضای ورزشی را اندازه‌گیری می‌کند.',
    objective: 'تأمین فضای ورزشی استاندارد به ازای هر کارمند.',
    formulaDisplay: 'مساحت کل فضای ورزشی (مترمربع) ÷ تعداد کل کارکنان',
    optimalStandard: 'بالای ۱ مترمربع',
    requiredDocuments: ['اسناد مالکیت/اجاره اماکن'],
    inputFields: [
      { key: 'area', label: 'مساحت کل فضای ورزشی (ملکی + استیجاری)', unit: 'مترمربع' },
      { key: 'employees', label: 'تعداد کل کارکنان', unit: 'نفر' },
    ],
    compute: v => (v.employees > 0 ? num(v.area) / v.employees : 0),
    scoringBands: [
      band(1, null, 10, 'بالای ۱ مترمربع'),
      band(0.7, 1, 7, '۰.۷ تا ۱ مترمربع'),
      band(0.4, 0.7, 4, '۰.۴ تا ۰.۷ مترمربع'),
      band(null, 0.4, 1, 'زیر ۰.۴ مترمربع'),
    ],
  },

  // 10 --------------------------------------------------------------------------
  {
    id: 'IND10',
    code: '10',
    title: 'بهره‌مندی کارکنان از خدمات مهدکودک',
    page: 27,
    weight: 0,
    type: 'direct',
    resultUnit: 'percent',
    definition: 'میزان استفاده کارکنان زن از خدمات مهدکودک را ارزیابی می‌کند.',
    objective: 'حمایت از مادران شاغل از طریق خدمات مهدکودک.',
    formulaDisplay:
      '(مادران استفاده‌کننده از مهدکودک ÷ کل مادران شاغل دارای فرزند زیر ۶ سال) × ۱۰۰',
    optimalStandard: 'بالای ۷۰٪',
    requiredDocuments: ['لیست مادران واجد شرایط', 'پرونده‌های پرسنلی'],
    inputFields: [
      { key: 'usingMothers', label: 'تعداد مادران استفاده‌کننده از خدمات مهدکودک', unit: 'نفر' },
      { key: 'totalMothers', label: 'کل مادران شاغل دارای فرزند زیر ۶ سال', unit: 'نفر' },
    ],
    compute: v => (v.totalMothers > 0 ? (num(v.usingMothers) / v.totalMothers) * 100 : 0),
    scoringBands: percentBands(70, 50, 30),
  },

  // 11 --------------------------------------------------------------------------
  {
    id: 'IND11',
    code: '11',
    title: 'درصد مراکز دارای مهدکودک',
    page: 28,
    weight: 2,
    type: 'direct',
    resultUnit: 'percent',
    definition: 'میزان تأمین مهدکودک بر اساس استانداردهای تعریف‌شده را اندازه‌گیری می‌کند.',
    objective: 'گسترش پوشش مهدکودک در مراکز نیازمند.',
    formulaDisplay: '(تعداد مهدکودک‌های موجود ÷ تعداد مراکز نیازمند مهدکودک) × ۱۰۰',
    optimalStandard: 'بالای ۷۰٪',
    requiredDocuments: ['آمار جمعیتی کارکنان مراکز'],
    inputFields: [
      { key: 'existing', label: 'تعداد مهدکودک‌های موجود', unit: 'مرکز' },
      {
        key: 'required',
        label: 'تعداد مراکز نیازمند مهدکودک (بیش از ۱۰ مادر دارای فرزند زیر ۶ سال)',
        unit: 'مرکز',
      },
    ],
    compute: v => (v.required > 0 ? (num(v.existing) / v.required) * 100 : 0),
    scoringBands: percentBands(70, 50, 30),
  },

  // 12 --------------------------------------------------------------------------
  {
    id: 'IND12',
    code: '12',
    title: 'وضعیت پایش سلامت کارکنان',
    page: '29-30',
    weight: 2,
    type: 'checklist',
    definition: 'اقدامات انجام‌شده توسط کمیته سلامت کارکنان را ارزیابی می‌کند.',
    objective: 'ارتقای سلامت کارکنان از طریق پایش و برنامه‌های سلامت.',
    optimalStandard: 'بالای ۷۵٪',
    requiredDocuments: ['حکم انتصاب کمیته', 'بررسی پرونده‌های سلامت (حداقل ۱۰ پرونده)'],
    criteria: [
      cItem(
        'C1',
        'تشکیل کمیته سلامت کارکنان',
        mSelect([opt('established', 'تشکیل شده', 20), opt('not', 'تشکیل نشده', 0)])
      ),
      cItem(
        'C2',
        'تشکیل پرونده سلامت کارکنان',
        mRatio(
          'records',
          'تعداد پرونده سلامت تشکیل‌شده',
          'total',
          'کل کارکنان',
          [
            band(50, null, 50, 'بالای ۵۰٪'),
            band(30, 50, 30, '۳۰٪ تا ۵۰٪'),
            band(null, 30, 10, 'زیر ۳۰٪'),
          ],
          'نفر'
        ),
        'نسبت پرونده‌های سلامت تشکیل‌شده به کل کارکنان'
      ),
      cItem(
        'C3',
        'تعداد سنجش‌های سلامت',
        mCount('programs', 'تعداد برنامه‌های سنجش سلامت', 'برنامه', [
          band(5, null, 30, 'بالاتر از ۴ برنامه'),
          band(2, 5, 20, '۲ تا ۴ برنامه'),
          band(null, 2, 10, 'کمتر از ۲ برنامه'),
        ]),
        'مانند: فیت‌تست، ماموگرافی، سلامت دهان، سلامت روان، چکاپ سالانه، بینایی/شنوایی‌سنجی، نوار قلب'
      ),
    ],
    scoringBands: percentBands(75, 50, 25),
  },

  // 13 --------------------------------------------------------------------------
  {
    id: 'IND13',
    code: '13',
    title: 'وضعیت تخصیص تسهیلات مسکن',
    page: 31,
    weight: 2,
    type: 'direct',
    resultUnit: 'percent',
    definition: 'اقدامات انجام‌شده در خصوص تخصیص مسکن به کارکنان را اندازه‌گیری می‌کند.',
    objective: 'تسهیل دسترسی کارکنان به مسکن.',
    formulaDisplay:
      '(واحدهای مسکونی ساخته‌شده یا زمین واگذارشده در ۱۰ سال اخیر ÷ کل کارکنان) × ۱۰۰',
    optimalStandard: 'بالای ۵۰٪',
    requiredDocuments: ['مستندات تخصیص مسکن'],
    inputFields: [
      {
        key: 'units',
        label: 'واحدهای مسکونی ساخته‌شده یا زمین واگذارشده (۱۰ سال اخیر)',
        unit: 'واحد',
      },
      { key: 'employees', label: 'تعداد کل کارکنان', unit: 'نفر' },
    ],
    compute: v => (v.employees > 0 ? (num(v.units) / v.employees) * 100 : 0),
    scoringBands: [
      band(50, null, 10, 'بالای ۵۰٪'),
      band(20, 50, 7, '۲۰ تا ۵۰٪'),
      band(10, 20, 4, '۱۰ تا ۲۰٪'),
      band(null, 10, 1, 'زیر ۱۰٪'),
    ],
  },
];

// Helpers ---------------------------------------------------------------------
function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function opt(value, label, score) {
  return { value, label, score };
}

/**
 * Checklist criteria are MEASUREMENT-DRIVEN: the user enters the real metric
 * from the row's «ملاک سنجش» and the score is derived automatically.
 *
 * measure types:
 *  - count(key,label,unit,bands)                 -> single numeric input, matched to bands
 *  - percent(key,label,bands)                    -> single % input, matched to bands
 *  - ratio(numKey,numLabel,denKey,denLabel,bands)-> value = num/den×100 (%), matched to bands
 *  - select(options)                             -> qualitative choice, option carries the score
 *  - qualityAverage(levels)                      -> count of centers per level; score = weighted average
 *
 * Per-criterion bands use the same [min,max) matching as indicator scoringBands.
 */
function measureMax(m) {
  if (m.type === 'select') return Math.max(...m.options.map(o => o.score));
  if (m.type === 'qualityAverage') return Math.max(...m.levels.map(l => l.score));
  return Math.max(...m.bands.map(b => b.score));
}

function cItem(id, title, measure, description = null) {
  return { id, title, description, measure, maxScore: measureMax(measure) };
}

function mCount(key, label, unit, bands) {
  return { type: 'count', input: { key, label, unit }, bands };
}

function mPercent(key, label, bands) {
  return { type: 'percent', input: { key, label, unit: '٪' }, bands };
}

function mRatio(numKey, numLabel, denKey, denLabel, bands, unit = 'ریال') {
  return {
    type: 'ratio',
    numerator: { key: numKey, label: numLabel, unit },
    denominator: { key: denKey, label: denLabel, unit },
    bands,
  };
}

function mSelect(options) {
  return { type: 'select', options };
}

function mQualityAvg(levels) {
  return { type: 'qualityAverage', levels };
}

export const TOTAL_INDICATORS = INDICATORS.length;

export function getIndicator(id) {
  return INDICATORS.find(i => i.id === id) || null;
}

export function getDirectIndicators() {
  return INDICATORS.filter(i => i.type === 'direct');
}

export function getChecklistIndicators() {
  return INDICATORS.filter(i => i.type === 'checklist');
}
