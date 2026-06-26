-- King Within — Initiate course #7: "The Stories You Tell Yourself"
-- Adds level 7 (chained after level 6) + its blocks, EN + FA.
-- Re-runnable: upserts the level and replaces its blocks WITHOUT deleting any
-- user_progress (we never delete the level; deleting course_blocks is safe —
-- user_answers.block_id is ON DELETE SET NULL). Run in the Supabase SQL editor.

begin;

-- Level (upsert) -------------------------------------------------------------
insert into levels
  (level_id, level_number, archetype_stage, title, title_fa, content_body, content_body_fa, xp_reward, unlock_requirement)
values (
  7, 7, 'Initiate',
  $kw$The Stories You Tell Yourself$kw$,
  $kw$داستان‌هایی که درباره‌ی خودت می‌گویی$kw$,
  $kw$The most powerful voice in your life is the one narrating it.$kw$,
  $kw$قوی‌ترین صدایی که در زندگی‌ات می‌شنوی، همان صدایی است که دارد آن را روایت می‌کند.$kw$,
  50, 6
)
on conflict (level_id) do update set
  level_number       = excluded.level_number,
  archetype_stage    = excluded.archetype_stage,
  title              = excluded.title,
  title_fa           = excluded.title_fa,
  content_body       = excluded.content_body,
  content_body_fa    = excluded.content_body_fa,
  xp_reward          = excluded.xp_reward,
  unlock_requirement = excluded.unlock_requirement;

-- Blocks (reading → writing → 3 quizzes) -------------------------------------
delete from course_blocks where level_id = 7;

insert into course_blocks (level_id, sort_order, type, content, content_fa) values
(7, 1, 'reading',
 jsonb_build_object('body', $kw$Beneath your thoughts runs a quieter layer: the story you tell about who you are. "I'm not a disciplined person." "I always sabotage good things." "I'm just not built for this." You repeat these lines so often that you stop hearing them as opinions. They start to feel like facts. And quietly, they set the ceiling on everything you attempt.

But a story is not a fact. A fact is something that happened: "I quit two businesses." A story is the meaning you bolted onto it: "I'm a quitter." The event is real; the verdict is invented — usually in a moment of pain, then carried for years.

The Initiate learns to catch the story wearing the mask of a fact. When you hear yourself say "I'm the kind of man who…", stop. Ask: is this a thing that happened, or a sentence I've been repeating? Where is the evidence — and where is the fear?

You cannot simply think positive over a deep story; that's paint on rust. But you can rewrite it from the truth: strip the event down to what actually occurred, then choose a more honest, more useful interpretation — built from evidence instead of old fear.

You did not author most of these stories. But you are the only one who can revise them.$kw$),
 jsonb_build_object('body', $kw$زیرِ لایه افکارت، لایه‌ای آرام‌تر جریان دارد: داستانی که درباره خودت و هویتت می‌گویی. جملاتی مثل: «من آدم بااراده‌ای نیستم.»، «من همیشه چیزهای خوب را خراب می‌کنم.» یا «من اصلاً برای این کار ساخته نشده‌ام.» شما این جملات را آن‌قدر تکرار می‌کنید که دیگر به چشم یک «نظر شخصی» به آن‌ها نگاه نمی‌کنید؛ بلکه کم‌کم برایتان شبیه به «واقعیت» می‌شوند. و این جملات در سکوت، سقفِ تمام تلاش‌ها و توانایی‌های شما را تعیین می‌کنند.

اما یک داستان، واقعیت نیست. واقعیت چیزی است که اتفاق افتاده: «من دو تا کسب‌وکار را رها کردم.» اما داستان، معنایی است که خودتان به آن چسبانده‌اید: «من آدم نیمه‌راه‌ام و جا می‌زنم.» آن اتفاقِ اول واقعی است، اما این حکم و قضاوتِ دوم ساختگی است؛ حکمی که معمولاً در لحظه‌ای از جنس درد صادر شده و سال‌ها آن را با خود دوش کشیده‌اید.

یک انسان آگاه یاد می‌گیرد مچِ این داستان‌ها را وقتی که نقابِ واقعیت به صورت زده‌اند، بگیرد. هر وقت شنیدی که با خودت می‌گویی «من از آن آدم‌هایی هستم که...»، دست نگه دار. از خودت بپرس: «آیا این یک اتفاق واقعی است که رخ داده، یا فقط جمله‌ای است که مدام دارم تکرارش می‌کنم؟ مدرک کجاست؟ و پشت این حرف، چه ترسی پنهان شده؟»

شما نمی‌توانید با مثبت‌اندیشیِ صِرف، روی یک داستان عمیق و کهنه سرپوش بگذارید؛ این کار مثل رنگ زدن روی آهنِ زنگ‌زده است. اما می‌توانید آن داستان را بر اساس حقیقت دوباره بنویسید: یعنی اتفاقی که افتاده را تا حدِ همان واقعیتِ محض جلو چشمتان عریان کنید، و بعد یک تفسیر منصفانه‌تر و کاربردی‌تر برایش انتخاب کنید؛ تفسیری که به جای ترس‌های قدیمی، روی شواهد و واقعیت‌ها بنا شده باشد.

بیشتر این داستان‌ها را خودتان ننوشته‌اید، اما شما تنها کسی هستید که می‌توانید آن‌ها را ویرایش و اصلاح کنید.$kw$)),

(7, 2, 'writing',
 jsonb_build_object('prompt', $kw$Write down one limiting story you tell about yourself ("I'm the kind of man who…" / "I always…" / "I'm not…"). Separate the bare fact from the story you added — then write a truer, more useful version.$kw$),
 jsonb_build_object('prompt', $kw$یک نمونه از داستان‌های محدودکننده‌ای که درباره خودتان می‌گویید را بنویسید (مثلاً: «من از آن آدم‌هایی هستم که...» / «من همیشه...» / «من آدمِ... نیستم»). حالا واقعیتِ محض را از داستانی که خودتان به آن اضافه کرده‌اید جدا کنید؛ در نهایت، نسخه‌ای واقعی‌تر، منصفانه‌تر و مفیدتر از آن بنویسید.$kw$)),

(7, 3, 'quiz',
 jsonb_build_object('prompt', $kw$According to the reading, what is the difference between a fact and a story?$kw$,
   'options', jsonb_build_array(
     $kw$There is no difference$kw$,
     $kw$A fact is what happened; a story is the meaning you added to it$kw$,
     $kw$Stories are always true and facts are not$kw$,
     $kw$Facts are about other people; stories are about you$kw$), 'correct_index', 1),
 jsonb_build_object('prompt', $kw$طبق متن، تفاوت بین «واقعیت» و «داستان» چیست؟$kw$,
   'options', jsonb_build_array(
     $kw$هیچ تفاوتی ندارند.$kw$,
     $kw$واقعیت چیزی است که اتفاق افتاده؛ داستان معنایی است که شما به آن اضافه کرده‌اید.$kw$,
     $kw$داستان‌ها همیشه درست هستند و واقعیت‌ها غلط.$kw$,
     $kw$واقعیت‌ها درباره دیگران هستند و داستان‌ها درباره خودتان.$kw$), 'correct_index', 1)),

(7, 4, 'quiz',
 jsonb_build_object('prompt', $kw$Why does the passage say "thinking positive" isn't enough to change a deep story?$kw$,
   'options', jsonb_build_array(
     $kw$Positive thinking always works$kw$,
     $kw$Because it's "paint on rust" — it covers the story without addressing the truth underneath$kw$,
     $kw$Because stories can never change$kw$,
     $kw$Because you should think negatively instead$kw$), 'correct_index', 1),
 jsonb_build_object('prompt', $kw$چرا متن می‌گوید «مثبت‌اندیشی» برای تغییر یک داستان عمیق کافی نیست؟$kw$,
   'options', jsonb_build_array(
     $kw$مثبت‌اندیشی همیشه جواب می‌دهد.$kw$,
     $kw$چون مثل «رنگ زدن روی آهن زنگ‌زده» است؛ یعنی فقط ظاهر را می‌پوشاند بدون اینکه به حقیقتِ زیر آن بپردازد.$kw$,
     $kw$چون داستان‌ها هرگز تغییر نمی‌کنند.$kw$,
     $kw$چون باید به جای آن، منفی‌بافی کنید.$kw$), 'correct_index', 1)),

(7, 5, 'quiz',
 jsonb_build_object('prompt', $kw$What is the Initiate's move when he hears himself say "I'm the kind of man who…"?$kw$,
   'options', jsonb_build_array(
     $kw$Accept it as fact$kw$,
     $kw$Repeat it louder$kw$,
     $kw$Stop and ask whether it's a real event or a sentence he's been repeating$kw$,
     $kw$Ask other people if it's true$kw$), 'correct_index', 2),
 jsonb_build_object('prompt', $kw$یک انسان آگاه وقتی می‌شنود که با خودش می‌گوید «من از آن آدم‌هایی هستم که...»، چه کار می‌کند؟$kw$,
   'options', jsonb_build_array(
     $kw$آن را به عنوان یک واقعیت قبول می‌کند.$kw$,
     $kw$آن را با صدای بلندتر تکرار می‌کند.$kw$,
     $kw$دست نگه می‌دارد و از خود می‌پرسد که آیا این یک اتفاق واقعی است یا صرفاً جمله‌ای است که دارد تکرار می‌کند.$kw$,
     $kw$از دیگران می‌پرسد که آیا این حرف درست است یا نه.$kw$), 'correct_index', 2));

commit;
