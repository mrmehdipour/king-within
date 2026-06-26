-- King Within — Initiate course #8: "The Comparison Trap"
-- Level 8 (chained after level 7) + blocks, EN + FA. Re-runnable; never deletes
-- user_progress. Run in the Supabase SQL editor (after course #7).

begin;

insert into levels
  (level_id, level_number, archetype_stage, title, title_fa, content_body, content_body_fa, xp_reward, unlock_requirement)
values (
  8, 8, 'Initiate',
  $kw$The Comparison Trap$kw$,
  $kw$تله مقایسه$kw$,
  $kw$Comparison is the fastest way to feel poor while holding a fortune.$kw$,
  $kw$مقایسه، سریع‌ترین راه برای این است که در عین داشتنِ یک ثروتِ بزرگ، احساس فقر کنید.$kw$,
  50, 7
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

delete from course_blocks where level_id = 8;

insert into course_blocks (level_id, sort_order, type, content, content_fa) values
(8, 1, 'reading',
 jsonb_build_object('body', $kw$There is a thief that robs men in broad daylight, and most invite him in willingly: comparison. You scroll, you glance, you measure — another man's body, income, house, the ease of his life — and in seconds the life that felt fine a moment ago feels like failure.

The trick comparison plays is dishonest by design. You compare your behind-the-scenes to another man's highlight reel — your full messy reality against the two seconds he chose to show. It was never a fair contest. You are weighing your private doubts against his public performance.

Comparison also blinds you to your own road. Every man starts from a different place, carries a different weight, runs a different race. Measuring your mile five against another man's mile twenty tells you nothing true — except how to feel ashamed of progress you should be proud of.

The Initiate is not asked to stop noticing other men. He is asked to stop using them as his ruler. There is only one honest comparison: the man you are today against the man you were yesterday. That measure is fair, it is yours, and it is the only one that actually moves you.

Run your own race. The only finish line that matters is the one behind you.$kw$),
 jsonb_build_object('body', $kw$دزدِ عجیبی وجود دارد که در روزِ روشن جیب انسان‌ها را می‌زند، و جالب اینجاست که بیشترِ ما با میل خودمان او را به خانه دعوت می‌کنیم؛ نام این دزد «مقایسه» است. شما در فضای مجازی چرخ می‌زنید، نگاهی می‌اندازید و متر می‌کنید: اندام یک نفر دیگر، درآمدش، خانه‌اش و راحتیِ زندگی‌اش را. و تنها در چند ثانیه، زندگی‌ای که تا همین لحظه قبل خوب و روبه‌راه به نظر می‌رسید، ناگهان شبیه به یک شکستِ کامل دیده می‌شود.

کلکی که مقایسه به شما می‌زند، ذاتاً ناصادقانه و فریب‌کارانه است. شما «پشت‌صحنه» زندگی خودتان را با «تیزر و بخش‌های جذاب» زندگی یک نفر دیگر مقایسه می‌کنید؛ یعنی واقعیتِ تمام و کمال و آشفته خودتان را در برابرِ همان دو ثانیه‌ای می‌گذارید که او خودش انتخاب کرده به شما نشان دهد. این اصلاً رقابت عادلانه‌ای نیست. شما دارید تردیدهای درونی و پنهانی خودتان را با نمایشِ بیرونی و عمومی او وزن می‌کنید.

علاوه بر این، مقایسه شما را نسبت به مسیرِ خودتان کور می‌کند. هر انسانی از نقطه‌ای متفاوت شروع می‌کند، وزنه متفاوتی را به دوش می‌کشد و در مسابقه متفاوتی می‌دود. اینکه مایل پنجمِ مسیر خودتان را با مایل بیستمِ مسیر یک نفر دیگر مقایسه کنید، هیچ حقیقتِ ارزشمندی به شما نمی‌گوید؛ جز اینکه چطور از پیشرفتی که باید به آن افتخار می‌کردید، احساس شرمندگی کنید.

از یک انسان آگاه خواسته نمی‌شود که کلاً دیگران را نادیده بگیرد یا آن‌ها را نبیند؛ بلکه از او خواسته می‌شود دیگران را به عنوان «خط‌کش و معیارِ سنجش» خود قرار ندهد. تنها یک مقایسه منصفانه و درست وجود دارد: مقایسه کسی که امروز هستید با کسی که دیروز بودید. این سنجش، هم عادلانه است، هم مالِ خودِ شماست و هم تنها سنجشی است که واقعاً شما را به جلو حرکت می‌دهد.

در مسابقه خودت بدو. تنها خط پایانی که اهمیت دارد، خطی است که پشت سر گذاشته‌ای.$kw$)),

(8, 2, 'writing',
 jsonb_build_object('prompt', $kw$Where do you most compare yourself to other men (money, looks, status, relationships)? Name it — then describe one concrete way you've actually progressed in that same area compared to a year ago.$kw$),
 jsonb_build_object('prompt', $kw$بیشتر در چه زمینه‌ای خودتان را با دیگران مقایسه می‌کنید (پول، ظاهر، جایگاه اجتماعی یا روابط)؟ آن را نام ببرید، و بعد یک نمونه از پیشرفت‌های ملموس و واقعیِ خودتان را در همین زمینه، نسبت به سال گذشته توصیف کنید.$kw$)),

(8, 3, 'quiz',
 jsonb_build_object('prompt', $kw$According to the reading, what "dishonest trick" does comparison play?$kw$,
   'options', jsonb_build_array(
     $kw$It makes you work harder$kw$,
     $kw$You compare your behind-the-scenes to another man's highlight reel$kw$,
     $kw$It tells you the truth too bluntly$kw$,
     $kw$It only happens online$kw$), 'correct_index', 1),
 jsonb_build_object('prompt', $kw$طبق متن، مقایسه چه «کلک فریب‌کارانه‌ای» به ما می‌زند؟$kw$,
   'options', jsonb_build_array(
     $kw$باعث می‌شود سخت‌تر کار کنید.$kw$,
     $kw$شما پشت‌صحنه زندگی خودتان را با بخش‌های جذاب و گلچین‌شده زندگی دیگران مقایسه می‌کنید.$kw$,
     $kw$حقیقت را بیش از حد رک و بی‌پرده به شما می‌گوید.$kw$,
     $kw$این اتفاق فقط در فضای مجازی رخ می‌دهد.$kw$), 'correct_index', 1)),

(8, 4, 'quiz',
 jsonb_build_object('prompt', $kw$What does the passage call the only honest comparison?$kw$,
   'options', jsonb_build_array(
     $kw$You against the most successful man you know$kw$,
     $kw$You against the average man$kw$,
     $kw$The man you are today against the man you were yesterday$kw$,
     $kw$You against your father$kw$), 'correct_index', 2),
 jsonb_build_object('prompt', $kw$متن چه چیزی را تنها مقایسه منصفانه و درست می‌داند؟$kw$,
   'options', jsonb_build_array(
     $kw$مقایسه خودتان با موفق‌ترین آدمی که می‌شناسید.$kw$,
     $kw$مقایسه خودتان با یک آدم معمولی.$kw$,
     $kw$مقایسه کسی که امروز هستید با کسی که دیروز بودید.$kw$,
     $kw$مقایسه خودتان با پدرتان.$kw$), 'correct_index', 2)),

(8, 5, 'quiz',
 jsonb_build_object('prompt', $kw$According to the reading, the Initiate is asked to:$kw$,
   'options', jsonb_build_array(
     $kw$Stop noticing other men entirely$kw$,
     $kw$Stop using other men as his ruler / measure$kw$,
     $kw$Compare himself more carefully$kw$,
     $kw$Avoid all social media forever$kw$), 'correct_index', 1),
 jsonb_build_object('prompt', $kw$طبق متن، از یک انسان آگاه خواسته می‌شود که:$kw$,
   'options', jsonb_build_array(
     $kw$دیگران را به کل نادیده بگیرد و اصلاً به آن‌ها توجه نکند.$kw$,
     $kw$دیگران را به عنوان خط‌کش و معیار سنجش خود قرار ندهد.$kw$,
     $kw$خودش را با دقت بیشتری با دیگران مقایسه کند.$kw$,
     $kw$برای همیشه از تمام شبکه‌های اجتماعی دوری کند.$kw$), 'correct_index', 1));

commit;
