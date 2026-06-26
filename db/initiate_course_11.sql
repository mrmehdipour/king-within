-- King Within — Initiate course #11: "The Company You Keep"
-- Level 11 (chained after level 10) + blocks, EN + FA. Re-runnable; never deletes
-- user_progress. Run in the Supabase SQL editor (after course #10).

begin;

insert into levels
  (level_id, level_number, archetype_stage, title, title_fa, content_body, content_body_fa, xp_reward, unlock_requirement)
values (
  11, 11, 'Initiate',
  $kw$The Company You Keep$kw$,
  $kw$هم‌نشینان شما$kw$,
  $kw$You become the average of the voices you let closest.$kw$,
  $kw$شما به میانگینِ صداهایی تبدیل می‌شوید که اجازه می‌دهید به نزدیک‌ترین فاصله از شما برسند.$kw$,
  50, 10
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

delete from course_blocks where level_id = 11;

insert into course_blocks (level_id, sort_order, type, content, content_fa) values
(11, 1, 'reading',
 jsonb_build_object('body', $kw$No man is self-made. You are quietly shaped by the people you spend time with and the voices you feed into your mind. Their standards drift into your standards; their normal becomes your normal. Spend your days among men who settle, and settling starts to feel reasonable. Spend them among men who push, and pushing starts to feel ordinary.

And it isn't only the people in the room. In the modern world, the loudest company a man keeps is the stream he scrolls — the voices in his ears on the commute, the feeds he wakes up to. These inputs are not neutral. Every one of them is slowly casting a vote for the man you are becoming.

The Initiate audits his inputs the way a careful man audits his money. Who am I around most? What am I feeding my mind? Are these pulling me up — or quietly pulling me under? He doesn't need to cut everyone off. He simply stops pretending his environment has no effect, because that pretense is exactly how the environment wins.

You can't choose every circumstance. But you have far more control than you admit over the voices you let closest. Choose them on purpose, or they'll be chosen for you — by algorithms and accidents.

Guard the door. Not everyone gets a key to your mind.$kw$),
 jsonb_build_object('body', $kw$هیچ مردی به تنهایی و کاملاً ساخته‌ی دست خودش نیست. شما به‌طور بی‌صدا توسط افرادی که با آن‌ها وقت می‌گذرانید و صداهایی که به ذهنتان تزریق می‌کنید، شکل می‌گیرید. معیارهای آن‌ها به مرور زمان وارد معیارهای شما می‌شوند؛ و آنچه برای آن‌ها «عادی» است، برای شما هم «عادی» می‌شود. روزهای خود را در میان مردهایی سپری کنید که به کم راضی می‌شوند (و دست از تلاش می‌کشند)، آن‌وقت راضی شدن به کم، برای شما هم منطقی به نظر خواهد رسید. روزهایتان را با مردهایی بگذرانید که رو به جلو فشار می‌آورند و تلاش می‌کنند، آن‌وقت تلاش کردن برایتان به امری معمولی تبدیل می‌شود.

این موضوع فقط درباره افراد حاضر در اتاق صدق نمی‌کند. در دنیای مدرن، بلندترین صدا در میان هم‌نشینان یک مرد، همان محتوایی است که در گوشی‌اش بالا و پایین (اسکرول) می‌کند — صداهایی که در مسیر رفت‌وآمد در گوشش می‌پیچند، و صفحاتی که صبح‌ها به محض بیدار شدن چک می‌کند. این ورودی‌ها خنثی نیستند. تک‌تک آن‌ها دارند به‌آرامی به نفعِ مردی که قرار است به آن تبدیل شوید، رای می‌دهند.

فرد تازه‌کار (رهرو) ورودی‌های ذهنش را همان‌گونه حساب‌رسی و ارزیابی می‌کند که یک انسان محتاط، پولش را حساب‌رسی می‌کند. بیشتر وقتم را با چه کسانی می‌گذرانم؟ چه چیزی به ذهنم تزریق می‌کنم؟ آیا این‌ها دارند مرا بالا می‌کشند — یا بی‌صدا مرا به زیر می‌کشند؟ نیازی نیست او رابطه خود را با همه قطع کند؛ او فقط دیگر تظاهر نمی‌کند که محیطش هیچ تأثیری روی او ندارد، زیرا این تظاهر دقیقاً همان راهی است که محیط از طریق آن بر شما پیروز می‌شود.

شما نمی‌توانید تمام شرایط زندگی را خودتان انتخاب کنید. اما روی صداهایی که اجازه می‌دهید به نزدیک‌ترین حد به شما برسند، کنترلی به مراتب بیشتر از آنچه اعتراف می‌کنید، دارید. آن‌ها را آگاهانه و هدفمند انتخاب کنید، وگرنه توسط الگوریتم‌ها و اتفاقات تصادفی برای شما انتخاب خواهند شد.

از درِ ورودی محافظت کنید. هر کسی نباید کلید ورود به ذهن شما را داشته باشد.$kw$)),

(11, 2, 'writing',
 jsonb_build_object('prompt', $kw$Name the person or daily input (a feed, a podcast, a friend) that most shapes your standards right now. Is it pulling you up or under? Name one input you'll add this week, and one you'll cut.$kw$),
 jsonb_build_object('prompt', $kw$یک فرد یا یک ورودی روزانه (یک صفحه مجازی، یک پادکست، یا یک دوست) را نام ببرید که در حال حاضر بیشترین تأثیر را روی معیارهای شما می‌گذارد. آیا این ورودی شما را بالا می‌کشد یا به زیر؟ یک ورودی را که این هفته به زندگی‌تان اضافه خواهید کرد، و یک ورودی را که حذف می‌کنید، نام ببرید.$kw$)),

(11, 3, 'quiz',
 jsonb_build_object('prompt', $kw$According to the reading, how are you shaped?$kw$,
   'options', jsonb_build_array(
     $kw$Entirely by your own willpower, alone$kw$,
     $kw$Quietly, by the people you spend time with and the voices you feed your mind$kw$,
     $kw$Only by your childhood$kw$,
     $kw$Purely by luck$kw$), 'correct_index', 1),
 jsonb_build_object('prompt', $kw$طبق متن، شما چگونه شکل می‌گیرید؟$kw$,
   'options', jsonb_build_array(
     $kw$صرفاً و به تنهایی توسط نیروی اراده خودتان.$kw$,
     $kw$به‌طور بی‌صدا، توسط افرادی که با آن‌ها وقت می‌گذرانید و صداهایی که به ذهنتان تزریق می‌کنید.$kw$,
     $kw$فقط توسط دوران کودکی‌تان.$kw$,
     $kw$کاملاً از روی شانس.$kw$), 'correct_index', 1)),

(11, 4, 'quiz',
 jsonb_build_object('prompt', $kw$What does the passage call "the loudest company" a modern man keeps?$kw$,
   'options', jsonb_build_array(
     $kw$His coworkers$kw$,
     $kw$The stream he scrolls and the voices in his ears$kw$,
     $kw$His family$kw$,
     $kw$Strangers on the street$kw$), 'correct_index', 1),
 jsonb_build_object('prompt', $kw$متن از چه چیزی به عنوان «بلندترین صدا در میان هم‌نشینان» یک مرد مدرن یاد می‌کند؟$kw$,
   'options', jsonb_build_array(
     $kw$همکارانش.$kw$,
     $kw$محتوایی که در گوشی‌اش اسکرول می‌کند و صداهایی که در گوشش می‌پیچند.$kw$,
     $kw$خانواده‌اش.$kw$,
     $kw$غریبه‌ها در خیابان.$kw$), 'correct_index', 1)),

(11, 5, 'quiz',
 jsonb_build_object('prompt', $kw$What does the Initiate do about his inputs?$kw$,
   'options', jsonb_build_array(
     $kw$Ignores them — environment has no effect$kw$,
     $kw$Cuts off every person in his life$kw$,
     $kw$Audits them — who he's around and what he feeds his mind — and chooses on purpose$kw$,
     $kw$Waits for better circumstances to arrive$kw$), 'correct_index', 2),
 jsonb_build_object('prompt', $kw$فرد تازه‌کار (رهرو) در مورد ورودی‌های ذهنی‌اش چه کار می‌کند؟$kw$,
   'options', jsonb_build_array(
     $kw$آن‌ها را نادیده می‌گیرد — چون محیط هیچ تأثیری روی او ندارد.$kw$,
     $kw$رابطه خود را با تمام افراد زندگی‌اش قطع می‌کند.$kw$,
     $kw$آن‌ها را حساب‌رسی می‌کند — اینکه دور و برش چه کسانی هستند و چه به ذهنش می‌رساند — و آگاهانه انتخاب می‌کند.$kw$,
     $kw$منتظر می‌ماند تا شرایط بهتری از راه برسد.$kw$), 'correct_index', 2));

commit;
