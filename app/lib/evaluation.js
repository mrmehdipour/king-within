// First-time archetype evaluation — a short, informational quiz. Each option
// leans toward one archetype; the highest count is the user's dominant tendency.
// Purely informational: everyone still starts on the Initiate path.

export const EVAL_QUESTIONS = [
  {
    q: { en: 'When you face a hard problem, your first instinct is to…', fa: 'وقتی با مشکلی سخت روبه‌رو می‌شوی، اولین واکنشت چیست؟' },
    options: [
      { a: 'Initiate', en: 'Pause and understand it clearly before moving.', fa: 'مکث می‌کنم و قبل از هر حرکتی آن را شفاف می‌فهمم.' },
      { a: 'Warrior', en: 'Take action immediately and push through.', fa: 'فوراً دست به کار می‌شوم و با تمام توان جلو می‌روم.' },
      { a: 'Magician', en: 'Look for a clever angle others miss.', fa: 'دنبال زاویه‌ای هوشمندانه می‌گردم که دیگران نمی‌بینند.' },
      { a: 'King', en: 'Think about who is affected and own the outcome.', fa: 'به این فکر می‌کنم چه کسانی درگیرند و مسئولیت نتیجه را می‌پذیرم.' },
    ],
  },
  {
    q: { en: 'What do you most want to build this year?', fa: 'امسال بیش از همه می‌خواهی چه چیزی بسازی؟' },
    options: [
      { a: 'Initiate', en: 'Self-awareness and honest clarity about my life.', fa: 'خودآگاهی و شفافیتِ صادقانه دربارهٔ زندگی‌ام.' },
      { a: 'Warrior', en: 'Discipline and real strength.', fa: 'انضباط و قدرتِ واقعی.' },
      { a: 'Magician', en: 'Mastery of a skill or deep knowledge.', fa: 'تسلط بر یک مهارت یا دانشی عمیق.' },
      { a: 'King', en: 'Something bigger than me — a team, family, or vision.', fa: 'چیزی بزرگ‌تر از خودم — یک تیم، خانواده یا چشم‌انداز.' },
    ],
  },
  {
    q: { en: 'Which compliment means the most to you?', fa: 'کدام تعریف برایت بیشترین ارزش را دارد؟' },
    options: [
      { a: 'Initiate', en: '“You really know yourself.”', fa: '«تو واقعاً خودت را می‌شناسی.»' },
      { a: 'Warrior', en: '“You never give up.”', fa: '«تو هیچ‌وقت تسلیم نمی‌شوی.»' },
      { a: 'Magician', en: '“You see what others don’t.”', fa: '«تو چیزی را می‌بینی که دیگران نمی‌بینند.»' },
      { a: 'King', en: '“People are better off because of you.”', fa: '«آدم‌ها به‌خاطر تو حالشان بهتر است.»' },
    ],
  },
  {
    q: { en: 'Your biggest current struggle is…', fa: 'بزرگ‌ترین چالشِ این روزهایت چیست؟' },
    options: [
      { a: 'Initiate', en: 'I drift and lose direction.', fa: 'رها می‌شوم و جهتم را گم می‌کنم.' },
      { a: 'Warrior', en: 'I lack consistency and discipline.', fa: 'ثبات و انضباط ندارم.' },
      { a: 'Magician', en: 'I overthink and rarely act on my ideas.', fa: 'زیادی فکر می‌کنم و کمتر ایده‌هایم را عملی می‌کنم.' },
      { a: 'King', en: 'I carry too much and lead with resentment.', fa: 'بار زیادی به دوش می‌کشم و با دلخوری رهبری می‌کنم.' },
    ],
  },
  {
    q: { en: 'How do you prefer to grow?', fa: 'ترجیح می‌دهی چگونه رشد کنی؟' },
    options: [
      { a: 'Initiate', en: 'Reflection and honest self-examination.', fa: 'تأمل و خودکاویِ صادقانه.' },
      { a: 'Warrior', en: 'Hard training and repetition.', fa: 'تمرینِ سخت و تکرار.' },
      { a: 'Magician', en: 'Study, ideas, and understanding systems.', fa: 'مطالعه، ایده‌ها و درکِ سیستم‌ها.' },
      { a: 'King', en: 'Taking responsibility for people and outcomes.', fa: 'پذیرفتن مسئولیتِ آدم‌ها و نتیجه‌ها.' },
    ],
  },
  {
    q: { en: 'In a group, you naturally tend to…', fa: 'در یک جمع، به‌طور طبیعی تمایل داری که…' },
    options: [
      { a: 'Initiate', en: 'Observe and understand before speaking.', fa: 'قبل از حرف زدن، مشاهده و درک کنی.' },
      { a: 'Warrior', en: 'Be the one who acts and sets the pace.', fa: 'کسی باشی که دست به کار می‌شود و ریتم را تعیین می‌کند.' },
      { a: 'Magician', en: 'Offer the idea or the plan.', fa: 'ایده یا نقشه را ارائه دهی.' },
      { a: 'King', en: 'Hold the group together and make the call.', fa: 'جمع را منسجم نگه داری و تصمیم نهایی را بگیری.' },
    ],
  },
  {
    q: { en: 'What pulls you off course most?', fa: 'چه چیزی بیشتر از همه از مسیر خارجت می‌کند؟' },
    options: [
      { a: 'Initiate', en: 'Not seeing clearly what I actually want.', fa: 'اینکه شفاف نمی‌بینم واقعاً چه می‌خواهم.' },
      { a: 'Warrior', en: 'Comfort and giving in to my mood.', fa: 'آسایش و تسلیم شدن به حال‌و‌هوایم.' },
      { a: 'Magician', en: 'Distraction and scattered focus.', fa: 'حواس‌پرتی و تمرکزِ پراکنده.' },
      { a: 'King', en: 'Avoiding hard decisions and responsibility.', fa: 'فرار از تصمیم‌های سخت و مسئولیت.' },
    ],
  },
  {
    q: { en: 'Deep down, the man you most want to become is…', fa: 'در عمق وجود، مردی که بیش از همه می‌خواهی بشوی چگونه است؟' },
    options: [
      { a: 'Initiate', en: 'Awake, clear, and honest with himself.', fa: 'بیدار، شفاف و صادق با خودش.' },
      { a: 'Warrior', en: 'Disciplined, strong, and unshakeable.', fa: 'منضبط، قوی و تزلزل‌ناپذیر.' },
      { a: 'Magician', en: 'Wise, insightful, and creative.', fa: 'خردمند، ژرف‌بین و خلاق.' },
      { a: 'King', en: 'A leader others can rely on.', fa: 'رهبری که دیگران می‌توانند به او تکیه کنند.' },
    ],
  },
]

const ORDER = ['Initiate', 'Warrior', 'Magician', 'King']

// answers: array of archetype keys. Returns the dominant archetype (stable tie-break).
export function scoreEvaluation(answers) {
  const tally = { Initiate: 0, Warrior: 0, Magician: 0, King: 0 }
  answers.forEach((a) => { if (tally[a] != null) tally[a]++ })
  let best = 'Initiate'
  for (const k of ORDER) if (tally[k] > tally[best]) best = k
  return best
}

export const ARCH_RESULT = {
  Initiate: {
    en: { title: 'The Initiate', desc: 'Your strength is clarity. You grow by seeing yourself and your life honestly — and that awareness is the ground everything else is built on.' },
    fa: { title: 'نوآموز', desc: 'قوت تو شفافیت است. با دیدنِ صادقانهٔ خودت و زندگی‌ات رشد می‌کنی — و همین آگاهی، زمینی است که بقیهٔ مسیر بر آن ساخته می‌شود.' },
  },
  Warrior: {
    en: { title: 'The Warrior', desc: 'Your strength is action. You move while others hesitate. Channeled with discipline, that drive becomes unstoppable.' },
    fa: { title: 'جنگجو', desc: 'قوت تو عمل است. وقتی دیگران تردید دارند، تو حرکت می‌کنی. این نیرو اگر با انضباط هدایت شود، توقف‌ناپذیر می‌شود.' },
  },
  Magician: {
    en: { title: 'The Magician', desc: 'Your strength is insight. You see angles and patterns others miss. Paired with action, your vision reshapes what’s possible.' },
    fa: { title: 'جادوگر', desc: 'قوت تو بینش است. زاویه‌ها و الگوهایی را می‌بینی که دیگران نمی‌بینند. این بینش وقتی با عمل همراه شود، مرزِ ممکن را جابه‌جا می‌کند.' },
  },
  King: {
    en: { title: 'The King', desc: 'Your strength is responsibility. You think in terms of others and the whole. Grounded in self-mastery, you lead and lift those around you.' },
    fa: { title: 'پادشاه', desc: 'قوت تو مسئولیت‌پذیری است. به دیگران و به کلِ ماجرا فکر می‌کنی. این ویژگی وقتی بر خویشتن‌داری بنا شود، تو را به رهبری می‌رساند که اطرافیانش را بالا می‌کشد.' },
  },
}
