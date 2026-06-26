-- King Within — Initiate course #9: "The Comfort Trap"
-- Level 9 (chained after level 8) + blocks, EN + FA. Re-runnable; never deletes
-- user_progress. Run in the Supabase SQL editor (after course #8).

begin;

insert into levels
  (level_id, level_number, archetype_stage, title, title_fa, content_body, content_body_fa, xp_reward, unlock_requirement)
values (
  9, 9, 'Initiate',
  $kw$The Comfort Trap$kw$,
  $kw$تلهٔ آسایش$kw$,
  $kw$Comfort feels like a reward. Too much of it is a slow sedation.$kw$,
  $kw$آسایش شبیه به یک پاداش به نظر می‌رسد، اما زیاده‌روی در آن، یک بی‌هوشی تدریجی است.$kw$,
  50, 8
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

delete from course_blocks where level_id = 9;

insert into course_blocks (level_id, sort_order, type, content, content_fa) values
(9, 1, 'reading',
 jsonb_build_object('body', $kw$Comfort is not the enemy — it's the prize at the end of hard things. But comfort sought for its own sake becomes a cage with soft walls. It asks nothing of you, and in return it slowly takes everything: your edge, your hunger, your sense of being alive.

Every meaningful thing a man wants sits on the other side of discomfort. Strength is on the far side of strain. Skill is on the far side of clumsy beginnings. A real conversation is on the far side of awkwardness. When you flinch away from discomfort, you are not avoiding pain — you are declining the very doorway to what you say you want.

The drift (which you already named) and the comfort trap are cousins. The drift is not deciding; the comfort trap is deciding, every time, for the easier road. Both feel fine in the moment. Both are expensive in the end.

The Initiate makes a quiet shift: he stops treating discomfort as a signal to retreat and starts treating it as a signal he's near the thing that grows him. He doesn't chase suffering — that's just another trap. He simply stops running from the productive kind.

Choose the discomfort that builds you, or you'll inherit the discomfort that comes from staying small.$kw$),
 jsonb_build_object('body', $kw$آسایش دشمن شما نیست؛ بلکه جایزه‌ای است که در پایان کارهای سخت به دست می‌آید. اما آسایشی که صرفاً به خاطر خودش جستجو شود، به قفسی با دیوارهای نرم تبدیل خواهد شد. این آسایش هیچ‌چیزی از شما نمی‌خواهد، و در مقابل، به‌آرامی همه‌چیز را از شما می‌گیرد: تیزبینی و آمادگی‌تان، اشتیاق‌تان، و حس زنده بودن‌تان را.

هر چیز باارزشی که یک مرد می‌خواهد، آن سویِ ناآسایشی و سختی قرار دارد. قدرت، آن سویِ فشار و جان‌کندن است. مهارت، آن سویِ شروع‌های ناشیانه است. یک گفتگوی واقعی و عمیق، آن سویِ لحظات مبهم و دستپاچگی است. وقتی از ناآسایشی شانه خالی می‌کنید و عقب می‌کشید، در حال فرار از درد نیستید؛ بلکه دارید دقیقاً درِ ورودی به همان چیزی را رد می‌کنید که ادعا می‌کنید خواهانش هستید.

«رها شدن در جریان باد» (که قبلاً نامش را بردید) و «تله آسایش»، با هم پسرعمو هستند. رها شدن یعنی تصمیم نگرفتن؛ اما تله آسایش یعنی هر بار، عمدی راهِ راحت‌تر را انتخاب کردن. هر دو در لحظه حس خوبی دارند، اما در نهایت بسیار گران تمام می‌شوند.

فرد تازه‌کار (رهرو) یک تغییر بی‌صدا در درون خود ایجاد می‌کند: او دیگر به ناآسایشی به چشم سیگنالی برای عقب‌نشینی نگاه نمی‌کند، بلکه آن را نشانه‌ای می‌بیند از اینکه به چیزی که باعث رشدش می‌شود نزدیک شده است. او به دنبال زجر کشیدنِ خودخواسته نیست — چرا که آن هم تلهٔ دیگری است. او فقط دیگر از آن نوع ناآسایشی که سازنده و بارور است، فرار نمی‌کند.

یا ناآسایشی و سختی‌ای را انتخاب کنید که شما را می‌سازد، یا ناچارید سختی و رنجِ کوچک ماندن را به ارث ببرید.$kw$)),

(9, 2, 'writing',
 jsonb_build_object('prompt', $kw$Name one important thing you've been avoiding because it's uncomfortable (a conversation, a task, a habit). What is the smallest uncomfortable step you could take toward it in the next 24 hours?$kw$),
 jsonb_build_object('prompt', $kw$یک کار مهم را نام ببرید که صرفاً به خاطر راحت نبودن، از آن دوری کرده‌اید (یک گفتگو، یک وظیفه، یا یک عادت). کوچک‌ترین قدمِ همراه با ناآسایشی که می‌توانید در ۲۴ ساعت آینده برای آن بردارید چیست؟$kw$)),

(9, 3, 'quiz',
 jsonb_build_object('prompt', $kw$How does the reading describe comfort?$kw$,
   'options', jsonb_build_array(
     $kw$Always the enemy, to be rejected$kw$,
     $kw$Not the enemy — but comfort sought for its own sake becomes a cage with soft walls$kw$,
     $kw$Something a strong man never feels$kw$,
     $kw$The same thing as happiness$kw$), 'correct_index', 1),
 jsonb_build_object('prompt', $kw$متن، آسایش را چگونه توصیف می‌کند؟$kw$,
   'options', jsonb_build_array(
     $kw$همیشه دشمن است و باید آن را رد کرد.$kw$,
     $kw$دشمن نیست — اما آسایشی که صرفاً به خاطر خودش جستجو شود، به قفسی با دیوارهای نرم تبدیل می‌شود.$kw$,
     $kw$چیزی که یک مرد قوی هرگز حسش نمی‌کند.$kw$,
     $kw$همان مفهوم خوشبختی و شادی است.$kw$), 'correct_index', 1)),

(9, 4, 'quiz',
 jsonb_build_object('prompt', $kw$Where does the passage say the things a man wants are located?$kw$,
   'options', jsonb_build_array(
     $kw$In comfort and rest$kw$,
     $kw$On the other side of discomfort$kw$,
     $kw$In other men's lives$kw$,
     $kw$In the past$kw$), 'correct_index', 1),
 jsonb_build_object('prompt', $kw$طبق متن، چیزهایی که یک مرد می‌خواهد کجا قرار دارند؟$kw$,
   'options', jsonb_build_array(
     $kw$در آسایش و استراحت.$kw$,
     $kw$آن سویِ ناآسایشی و سختی.$kw$,
     $kw$در زندگی مردهای دیگر.$kw$,
     $kw$در گذشته.$kw$), 'correct_index', 1)),

(9, 5, 'quiz',
 jsonb_build_object('prompt', $kw$What "quiet shift" does the Initiate make?$kw$,
   'options', jsonb_build_array(
     $kw$He chases as much suffering as possible$kw$,
     $kw$He avoids all discomfort to stay safe$kw$,
     $kw$He treats discomfort as a signal he's near the thing that grows him$kw$,
     $kw$He waits until he feels motivated$kw$), 'correct_index', 2),
 jsonb_build_object('prompt', $kw$فرد تازه‌کار (رهرو) چه «تغییر بی‌صدایی» در خود ایجاد می‌کند؟$kw$,
   'options', jsonb_build_array(
     $kw$تا جایی که می‌تواند به دنبال رنج و عذاب می‌رود.$kw$,
     $kw$برای امن ماندن، از تمام ناآسایشی‌ها دوری می‌کند.$kw$,
     $kw$به ناآسایشی به چشم نشانه‌ای نگاه می‌کند که به چیزهای رشددهنده نزدیک شده است.$kw$,
     $kw$آن‌قدر صبر می‌کند تا حس و حالش (انگیزه‌اش) پیدا شود.$kw$), 'correct_index', 2));

commit;
