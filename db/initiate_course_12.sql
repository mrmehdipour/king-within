-- King Within — Initiate course #12: "Fear as a Compass"
-- Level 12 (chained after level 11) + blocks, EN + FA. Re-runnable; never deletes
-- user_progress. Run in the Supabase SQL editor (after course #11).

begin;

insert into levels
  (level_id, level_number, archetype_stage, title, title_fa, content_body, content_body_fa, xp_reward, unlock_requirement)
values (
  12, 12, 'Initiate',
  $kw$Fear as a Compass$kw$,
  $kw$ترس به عنوان یک قطب‌نما$kw$,
  $kw$Most of what you want is hiding on the other side of a fear you keep avoiding.$kw$,
  $kw$بیشتر چیزهایی که می‌خواهید، آن سویِ ترسی پنهان شده‌اند که مدام از آن دوری می‌کنید.$kw$,
  50, 11
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

delete from course_blocks where level_id = 12;

insert into course_blocks (level_id, sort_order, type, content, content_fa) values
(12, 1, 'reading',
 jsonb_build_object('body', $kw$Fear gets a bad reputation. Men treat it as a stop sign — a signal that something is wrong, that they should turn back. But fear is rarely a stop sign. More often it is a compass needle, and it is pointing at exactly the thing that would grow you.

There are two kinds of fear, and the Initiate learns to tell them apart. One is the fear of real danger — the dark alley, the cracking ice. That fear is wisdom; obey it. The other is the fear of exposure — speaking up, starting the thing, asking for what you want, being seen and possibly judged. That fear is not protecting your life. It is protecting your comfort and your image. And it disguises itself as caution so you'll keep listening to it.

Here is the test. Ask: "If I do this, what is the worst that actually happens?" If the honest answer is embarrassment, rejection, or discomfort — not real harm — then the fear is a compass, not a warning. It is showing you the doorway.

The Initiate does not wait to feel unafraid; that day never comes. He feels the fear, names which kind it is, and if it's the growth kind, he steps toward it anyway. Courage was never the absence of fear. It is moving while afraid.

Follow the fear that only threatens your comfort. That is where the man you could be is standing.$kw$),
 jsonb_build_object('body', $kw$بدنامیِ بدی دامن‌گیرِ «ترس» شده است. مردها با آن مثل تابلو ایست رفتار می‌کنند — نشانه‌ای از اینکه چیزی سر جایش نیست و باید دور بزنند و برگردند. اما ترس به‌ندرت یک تابلوی ایست است. در بیشتر مواقع، ترس عقربه یک قطب‌نماست و دارد دقیقاً به همان سمتی اشاره می‌کند که باعث رشد شما می‌شود.

دو نوع ترس وجود دارد و فرد تازه‌کار (رهرو) یاد می‌گیرد که آن‌ها را از هم تشخیص دهد. اولی، ترس از خطرات واقعی است — مثل یک کوچه تاریک و خلوت، یا یخِ ترک‌خورده‌ی زیر پا. این نوع ترس، عینِ حکمت و دانایی است؛ از آن اطاعت کنید. نوع دوم، ترس از آشکار شدن (و به چالش کشیده شدن) است — مثل بلند حرف زدن و ابراز عقیده، شروع کردن یک کار، درخواست کردنِ آنچه می‌خواهید، و دیده شدن و احتمالاً مورد قضاوت قرار گرفتن. این ترس از جان شما محافظت نمی‌کند، بلکه دارد از آسایش و تصویر ذهنیِ شما (پرستیژتان) مراقبت می‌کند. این ترس خودش را پشت نقابِ «احتیاط» پنهان می‌کند تا شما همچنان به حرفش گوش دهید.

آزمونِ تشخیص آن اینجاست؛ از خود بپرسید: «اگر این کار را انجام دهم، بدترین اتفاقی که واقعاً ممکن است بیفتد چیست؟» اگر پاسخ صادقانه شما مواردی مثل خجالت‌زدگی، طرد شدن یا ناآسایشی است — و نه آسیب واقعی — پس این ترس یک قطب‌نماست، نه یک هشدار خطر. این ترس دارد درِ ورودی را به شما نشان می‌دهد.

فرد تازه‌کار (رهرو) منتظر نمی‌ماند تا روزی برسد که دیگر نترسد؛ چرا که آن روز هرگز نخواهد آمد. او ترس را حس می‌کند، نوعِ آن را نام‌گذاری و مشخص می‌کند، و اگر از نوعِ رشددهنده باشد، به هر حال قدمی به سمتش برمی‌دارد. شجاعت هیچ‌وقت به معنایِ نبودِ ترس نبوده است؛ شجاعت یعنی حرکت کردن، درست در همان حالی که ترسیده‌اید.

به دنبال آن ترسی بروید که فقط آسایش شما را تهدید می‌کند. آن مردی که پتانسیلِ تبدیل شدن به او را دارید، دقیقاً همان‌جا ایستاده است.$kw$)),

(12, 2, 'writing',
 jsonb_build_object('prompt', $kw$Name one thing you've been avoiding out of fear. Ask honestly: if you do it, what's the worst that actually happens? If it's only embarrassment or discomfort, write the first step toward it.$kw$),
 jsonb_build_object('prompt', $kw$یک چیز را نام ببرید که از روی ترس از آن دوری کرده‌اید. صادقانه بپرسید: اگر آن را انجام دهید، بدترین اتفاقی که واقعاً می‌افتد چیست؟ اگر پاسخ فقط خجالت‌زدگی یا ناآسایشی است، اولین قدم را به سوی آن بنویسید.$kw$)),

(12, 3, 'quiz',
 jsonb_build_object('prompt', $kw$How does the reading mostly describe fear?$kw$,
   'options', jsonb_build_array(
     $kw$Always a stop sign telling you to turn back$kw$,
     $kw$A compass needle often pointing at the thing that would grow you$kw$,
     $kw$A weakness real men don't feel$kw$,
     $kw$Something to eliminate completely$kw$), 'correct_index', 1),
 jsonb_build_object('prompt', $kw$متن بیشتر ترس را چگونه توصیف می‌کند؟$kw$,
   'options', jsonb_build_array(
     $kw$همیشه به عنوان یک تابلوی ایست که می‌گوید باید برگردید.$kw$,
     $kw$عقربه یک قطب‌نما که اغلب به سمت چیزی اشاره دارد که باعث رشد شما می‌شود.$kw$,
     $kw$نقطه‌ضعفی که مردهای واقعی آن را حس نمی‌کنند.$kw$,
     $kw$چیزی که باید به کل نابود و حذف شود.$kw$), 'correct_index', 1)),

(12, 4, 'quiz',
 jsonb_build_object('prompt', $kw$What are the two kinds of fear the Initiate learns to tell apart?$kw$,
   'options', jsonb_build_array(
     $kw$Big fears and small fears$kw$,
     $kw$Fear of real danger vs. fear of exposure (comfort/image)$kw$,
     $kw$Morning fear and night fear$kw$,
     $kw$His fears and other people's fears$kw$), 'correct_index', 1),
 jsonb_build_object('prompt', $kw$آن دو نوع ترسی که فرد تازه‌کار (رهرو) یاد می‌گیرد از هم تشخیص دهد چیست؟$kw$,
   'options', jsonb_build_array(
     $kw$ترس‌های بزرگ و ترس‌های کوچک.$kw$,
     $kw$ترس از خطر واقعی در برابر ترس از آشکار شدن (حفظ آسایش/تصویر ذهنی).$kw$,
     $kw$ترس‌های صبحگاهی و ترس‌های شبانه.$kw$,
     $kw$ترس‌های خودش و ترس‌های دیگران.$kw$), 'correct_index', 1)),

(12, 5, 'quiz',
 jsonb_build_object('prompt', $kw$According to the passage, what is courage?$kw$,
   'options', jsonb_build_array(
     $kw$Never feeling afraid$kw$,
     $kw$Waiting until the fear goes away$kw$,
     $kw$Moving while afraid$kw$,
     $kw$Avoiding all risk$kw$), 'correct_index', 2),
 jsonb_build_object('prompt', $kw$طبق متن، شجاعت چیست؟$kw$,
   'options', jsonb_build_array(
     $kw$هرگز احساس ترس نکردن.$kw$,
     $kw$منتظر ماندن تا زمانی که ترس از بین برود.$kw$,
     $kw$حرکت کردن در عینِ ترسیدن.$kw$,
     $kw$دوری کردن از هرگونه ریسک و خطر.$kw$), 'correct_index', 2));

commit;
