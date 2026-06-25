-- King Within — Expansion 3 / Phase D: Persian translations of the seed content.
-- Run AFTER db/05_i18n_schema.sql (and the earlier seeds). Re-runnable.
-- Matches rows by their stable keys (Initiate level_number, question sort_order,
-- journal starter sort_order, blog slug) so it works regardless of ids.

begin;

-- ===== Levels (Initiate) =====
update levels set
  title_fa = $fa$رهاشدگی$fa$,
  content_body_fa = $fa$بیشتر مردان روی خلبان خودکار زندگی می‌کنند. نخستین گام، دیدن است.$fa$,
  critical_thinking_prompt_fa = $fa$یک حوزه از زندگی‌ات (کار، سلامت، یک رابطه، زمانت) را نام ببر که در آن به‌جای تصمیم‌گرفتن، رها بوده‌ای. دقیق بگو این رهاشدگی چگونه آغاز شد.$fa$,
  reading_text_fa = $fa$بیشتر مردان زندگی‌شان را انتخاب نمی‌کنند — آن را به ارث می‌برند. شغلی که پیش آمد، عادت‌هایی که آسان بودند و باورهایی که در اطرافشان بود را می‌پذیرند. روزها به هفته‌ها و هفته‌ها به سال‌ها بدل می‌شوند و مردی یک روز صبح در زندگی‌ای بیدار می‌شود که هرگز واقعاً آن را انتخاب نکرده است.

این «رهاشدگی» است. دراماتیک نیست. هیچ انتخاب بدِ واحدی باعث آن نمی‌شود. انباشتِ آرامِ پیش‌فرض‌هاست — اینکه بگذاری جریان تو را ببرد، چون هدایت‌کردن تلاش می‌طلبد.

رهاشدگی حسِ راحتی می‌دهد، اما بی‌سروصدا گران است. هر سالی که در رهاشدگی بگذرد، سالی از زندگیِ یگانه‌ات است که به‌جای نیت، به اینرسی سپرده شده. نخستین وظیفهٔ نوآموز درست‌کردن همه‌چیز نیست؛ تنها دیدنِ شفافِ رهاشدگی است.

آگاهی همهٔ سفر نیست. اما تا مردی نتواند جریانی را که بر آن شناور بوده نام ببرد، هیچ‌چیز تغییر نمی‌کند.$fa$
where archetype_stage = 'Initiate' and level_number = 1;

update levels set
  title_fa = $fa$مسئولیت رادیکال$fa$,
  content_body_fa = $fa$شاید مقصرِ همه‌چیز نباشی — اما مسئولِ واکنشت هستی.$fa$,
  critical_thinking_prompt_fa = $fa$به مشکلی فکر کن که آن را گردن کسی یا چیزی دیگر انداخته‌ای. بدون توجیهِ آنچه رخ داده، نخستین کاری را که بر عهدهٔ توست بنویس.$fa$,
  reading_text_fa = $fa$میان «تقصیر» و «مسئولیت» تفاوت هست. تقصیر به گذشته می‌نگرد و می‌پرسد: «چه کسی این را به‌وجود آورد؟» مسئولیت به آینده می‌نگرد و می‌پرسد: «چه کسی با آن کنار می‌آید؟»

بسیاری چیزها در زندگی‌ات تقصیر تو نیست. اما حقیقتِ سختی که نوآموز باید بپذیرد این است: فارغ از اینکه تقصیر کیست، مسئولیتِ زندگی‌ات تنها با توست. کسی نمی‌آید آن را برایت زندگی کند.

این دربارهٔ سرزنش یا شرم نیست؛ دربارهٔ قدرت است. لحظه‌ای که بگویی «این بر عهدهٔ من است»، نویسندگیِ زندگی‌ات را پس می‌گیری. مردی که سرزنش می‌کند همیشه در انتظار است؛ مردی که مسئولیت می‌پذیرد همین امروز می‌تواند کاری کند.

مسئولیت رادیکال یعنی نسپردنِ زندگی‌ات به دیگران، به گذشته یا به بخت. این بنیانی است که هر چیز دیگر بر آن ساخته می‌شود.$fa$
where archetype_stage = 'Initiate' and level_number = 2;

update levels set
  title_fa = $fa$شاهدِ درون$fa$,
  content_body_fa = $fa$تو افکارت نیستی. بیاموز که آن‌ها را تماشا کنی.$fa$,
  critical_thinking_prompt_fa = $fa$لحظه‌ای را به یاد آور که از روی تکانه واکنش نشان دادی و پشیمان شدی. آن را آرام بازپخش کن: فکر یا احساس چه بود، و شاهد کجا می‌توانست مکثی بسازد؟$fa$,
  reading_text_fa = $fa$درون هر مرد جریانی پیوسته از اندیشه است — قضاوت‌ها، ترس‌ها، تکانه‌ها و گفت‌وگوی درونی. بیشتر مردان چنان با این جریان یکی شده‌اند که آن را خودِ خویش می‌پندارند. وقتی خشم می‌گوید «نابود کن»، نابود می‌کنند. وقتی ترس می‌گوید «پنهان شو»، پنهان می‌شوند.

اما بخش دیگری در تو هست: شاهد. بخشی که می‌تواند فکری را ببیند بی‌آنکه از آن فرمان ببرد. لحظه‌ای که بگویی «دارم خشمگین می‌شوم»، دیگر تنها آن خشم نیستی — تماشاگرِ آنی. آن شکافِ کوچک، جایگاهِ آزادی است.

نوآموز این شاهد را آگاهانه پرورش می‌دهد. با مکث، با نفس، با نام‌نهادن بر آنچه درون می‌گذرد، شکافِ میان محرک و واکنش را گشاد می‌کند. در آن شکاف، انتخاب ممکن می‌شود.

مردی که اسیر تکانه‌هایش است آزاد نیست، هرچقدر هم قدرتمند به‌نظر برسد. استادی از درون آغاز می‌شود.$fa$
where archetype_stage = 'Initiate' and level_number = 3;

update levels set
  title_fa = $fa$معیارِ روزانهٔ تو$fa$,
  content_body_fa = $fa$انضباط انگیزه نیست. معیاری است که وقتی کسی نگاه نمی‌کند نگه می‌داری.$fa$,
  critical_thinking_prompt_fa = $fa$یک معیارِ روزانهٔ کوچک و بدونِ استثنا تعریف کن که فارغ از حال‌وهوا نگهش می‌داری. آن‌قدر مشخص باشد که هر شب بدانی نگهش داشته‌ای یا نه.$fa$,
  reading_text_fa = $fa$انگیزه یک احساس است، و احساس‌ها مانند آب‌وهوا می‌آیند و می‌روند. مردی که تنها هنگام انگیزه عمل می‌کند، اسیرِ حال‌وهوای خویش است. انضباط چیز دیگری است: معیاری که فارغ از احساست نگه می‌داری.

نوآموز می‌آموزد که هیاهو را کم و کف را بالا ببرد. به‌جای «دلم می‌خواهد؟»، می‌پرسد «این معیاری است که نگه می‌دارم؟» معیار قهرمانانه نیست؛ کوچک، روشن و تکرارپذیر است: تختت را مرتب کن، بدنت را تمرین بده، سرِ قولت بمان، کار را پیش از پاداش انجام بده.

آنچه معیار را نیرومند می‌کند، غیرقابل‌مذاکره‌بودن آن است. لحظه‌ای که اجازهٔ استثنای «فقط برای امروز» بدهی، معیار به یک پیشنهاد بدل می‌شود، و پیشنهادها مرد نمی‌سازند. هر بار که معیار را به‌رغم حال‌وهوا نگه می‌داری، رأیی به مردی می‌دهی که داری می‌شوی.

عظمت در فوران‌های الهام ساخته نمی‌شود؛ در تکرارِ بی‌زرق‌وبرقِ روزهای عادی ساخته می‌شود.$fa$
where archetype_stage = 'Initiate' and level_number = 4;

update levels set
  title_fa = $fa$از صبحت محافظت کن$fa$,
  content_body_fa = $fa$شیوهٔ آغازِ روز، شرایطِ روز را تعیین می‌کند.$fa$,
  critical_thinking_prompt_fa = $fa$سی دقیقهٔ نخستِ پس از بیداری‌ات را توصیف کن. سپس صبحی را طراحی کن که اگر آگاهانه روزت را رهبری می‌کردی، نگهش می‌داشتی.$fa$,
  reading_text_fa = $fa$نخستین ساعتِ روز یک سنگِ بنا است — چیزی کوچک که سازهٔ بزرگ‌تر را سرِ جا نگه می‌دارد. صبح را ببر، و روز را در حالی آغاز می‌کنی که از پیش ایستاده‌ای. صبح را بباز، و بقیهٔ روز را صرفِ رسیدن به خودت می‌کنی.

بیشتر مردان صبح‌شان را پیش از آنکه حتی بیدار شوند واگذار می‌کنند. نخستین چیزی که لمس می‌کنند گوشی است، و در چند دقیقه توجهشان میان نظرها، خواسته‌ها و هیاهوی دیگران پخش می‌شود. روز را با واکنش آغاز می‌کنند، نه رهبری.

نوآموز از صبح محافظت می‌کند. نخستین بازهٔ زمان را برای خود برمی‌دارد — تا بدنش را به حرکت درآورد، نیتش را تنظیم کند و یک کارِ مهم را پیش از آنکه جهان سراغش را بگیرد انجام دهد. لازم نیست طولانی باشد؛ لازم است از آنِ او باشد.

صبحِ آگاهانه اعلامی آرام است: من روزم را رهبری می‌کنم؛ روزم مرا رهبری نمی‌کند.$fa$
where archetype_stage = 'Initiate' and level_number = 5;

update levels set
  title_fa = $fa$رویارویی با آینه$fa$,
  content_body_fa = $fa$یک خودارزیابیِ صادقانه، دروازهٔ جنگجوست.$fa$,
  critical_thinking_prompt_fa = $fa$کجا گفتار و رفتارت با هم نمی‌خوانند؟ یک شکافِ مشخص میان آنکه می‌گویی هستی و آنچه این هفته واقعاً انجام دادی را نام ببر.$fa$,
  reading_text_fa = $fa$هر مرد روایتی از خود با خود حمل می‌کند، و بیشترِ این روایت‌ها به‌نرمی ویرایش شده‌اند. تلاش‌هایمان را به‌بالا و شکست‌هایمان را به‌پایین گرد می‌کنیم. نیت‌هایمان را با کنشِ دیگران می‌سنجیم. این تملق مهربان به‌نظر می‌رسد، اما ما را خواب نگه می‌دارد.

واپسین وظیفهٔ نوآموز رویارویی با آینه بدون ویرایش است. صادقانه بپرسد: کجا به خودم دروغ می‌گویم؟ کجا گفتار و رفتارم اختلاف دارند؟ مردی که بیش از همه به او احترام می‌گذارم، اگر هفتهٔ گذشته‌ام را روی فیلم می‌دید چه می‌گفت؟

این تمرینِ خودزنی نیست. شرم مردان را پنهان می‌کند؛ صداقت آنان را می‌رویاند. هدف، دیدِ روشن است نه قساوت — اینکه دقیقاً بدانی کجا ایستاده‌ای تا گام بعدی را از واقعیت برداری، نه از خیال.

مردی که می‌تواند ساده به خود بنگرد چیز نادری به‌دست آورده است. از آن زمینِ صادقانه، سرانجام جنگجو را می‌توان فراخواند — چون بر بنیانی که از بازرسی‌اش سر باز می‌زنی نمی‌توان ساخت.$fa$
where archetype_stage = 'Initiate' and level_number = 6;

-- ===== Questions (by level_number + sort_order) =====
-- helper note: lvl(n) := (select level_id from levels where archetype_stage='Initiate' and level_number=n)

-- Level 1
update questions set prompt_fa = $fa$بر اساس متن، «رهاشدگی» معمولاً چگونه آغاز می‌شود؟$fa$,
  options_fa = jsonb_build_array($fa$با یک تصمیم بدِ دراماتیک$fa$, $fa$با انباشتِ آرامِ پیش‌فرض‌ها و انتخاب‌های آسان$fa$, $fa$با بدشانسیِ بیرون از کنترل تو$fa$, $fa$با کمبود هوش$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=1) and sort_order=1;
update questions set prompt_fa = $fa$چرا متن رهاشدگی را «بی‌سروصدا گران» می‌نامد؟$fa$,
  options_fa = jsonb_build_array($fa$هزینهٔ مالیِ زیادی دارد$fa$, $fa$سال‌های زندگی‌ات را به‌جای نیت به اینرسی می‌دهد$fa$, $fa$تو را خسته می‌کند$fa$, $fa$به آبرویت آسیب می‌زند$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=1) and sort_order=2;
update questions set prompt_fa = $fa$نخستین وظیفهٔ نوآموز چیست؟$fa$,
  options_fa = jsonb_build_array($fa$درست‌کردن همهٔ مشکلات یک‌باره$fa$, $fa$یافتن یک مربی$fa$, $fa$دیدنِ شفافِ رهاشدگی و پذیرشِ وجود آن$fa$, $fa$تعیین اهداف بلندپروازانه$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=1) and sort_order=3;

-- Level 2
update questions set prompt_fa = $fa$متن چگونه «تقصیر» را از «مسئولیت» جدا می‌کند؟$fa$,
  options_fa = jsonb_build_array($fa$آن‌ها یک‌چیزند$fa$, $fa$تقصیر به علت در گذشته می‌نگرد؛ مسئولیت به اینکه چه کسی عمل می‌کند$fa$, $fa$تقصیر بدتر از مسئولیت است$fa$, $fa$مسئولیت فقط دربارهٔ پول است$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=2) and sort_order=1;
update questions set prompt_fa = $fa$بر اساس متن، پذیرفتنِ مسئولیت بیش از همه دربارهٔ چیست؟$fa$,
  options_fa = jsonb_build_array($fa$سرزنش$fa$, $fa$شرم$fa$, $fa$قدرت و نویسندگی$fa$, $fa$مجازات$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=2) and sort_order=2;
update questions set prompt_fa = $fa$مردی که سرزنش می‌کند سرانجام چه می‌کند؟$fa$,
  options_fa = jsonb_build_array($fa$بی‌درنگ عمل می‌کند$fa$, $fa$منتظر می‌ماند تا دیگری اول حرکت کند$fa$, $fa$به‌آسانی می‌بخشد$fa$, $fa$سریع‌تر موفق می‌شود$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=2) and sort_order=3;

-- Level 3
update questions set prompt_fa = $fa$منظور متن از «شاهد» چیست؟$fa$,
  options_fa = jsonb_build_array($fa$کسی که تو را تماشا می‌کند$fa$, $fa$بخشی از تو که می‌تواند فکری را ببیند بی‌آنکه از آن فرمان ببرد$fa$, $fa$وجدانی که درست و غلط را می‌گوید$fa$, $fa$خاطره‌ای از گذشته$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=3) and sort_order=1;
update questions set prompt_fa = $fa$به‌گفتهٔ متن، آزادی کجا جای دارد؟$fa$,
  options_fa = jsonb_build_array($fa$در هرگز خشمگین‌نشدن$fa$, $fa$در شکافِ میان محرک و واکنش$fa$, $fa$در همیشه سریع عمل‌کردن$fa$, $fa$در نادیده‌گرفتنِ احساس‌ها$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=3) and sort_order=2;
update questions set prompt_fa = $fa$مردِ اسیرِ تکانه‌هایش چگونه توصیف می‌شود؟$fa$,
  options_fa = jsonb_build_array($fa$آزاد و قدرتمند$fa$, $fa$آزاد نیست، هرچقدر هم قدرتمند به‌نظر برسد$fa$, $fa$خردمند$fa$, $fa$آرام$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=3) and sort_order=3;

-- Level 4
update questions set prompt_fa = $fa$متن انگیزه را چگونه توصیف می‌کند؟$fa$,
  options_fa = jsonb_build_array($fa$بنیانی قابل‌اتکا$fa$, $fa$احساسی مانند آب‌وهوا که می‌آید و می‌رود$fa$, $fa$همان انضباط$fa$, $fa$چیزی که هر وقت بخواهی فرامی‌خوانی$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=4) and sort_order=1;
update questions set prompt_fa = $fa$به‌گفتهٔ متن، چه‌چیز یک معیار را نیرومند می‌کند؟$fa$,
  options_fa = jsonb_build_array($fa$قهرمانانه و چشمگیر بودن$fa$, $fa$غیرقابل‌مذاکره‌بودن، بدون استثنای «فقط برای امروز»$fa$, $fa$اینکه مدام تغییر کند$fa$, $fa$اینکه دیگران ببینندش$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=4) and sort_order=2;
update questions set prompt_fa = $fa$متن می‌گوید عظمت از چه راهی ساخته می‌شود؟$fa$,
  options_fa = jsonb_build_array($fa$فوران‌های الهام$fa$, $fa$تکرارِ بی‌زرق‌وبرق در روزهای عادی$fa$, $fa$تصمیم‌های بزرگ و دراماتیک$fa$, $fa$استعداد ذاتی$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=4) and sort_order=3;

-- Level 5
update questions set prompt_fa = $fa$چرا متن نخستین ساعت را «سنگِ بنا» می‌نامد؟$fa$,
  options_fa = jsonb_build_array($fa$سخت‌ترین ساعت است$fa$, $fa$چیزی کوچک است که سازهٔ بزرگ‌ترِ روز را سرِ جا نگه می‌دارد$fa$, $fa$زمانی است که بیشترین انرژی را داری$fa$, $fa$تنها ساعتی است که اهمیت دارد$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=5) and sort_order=1;
update questions set prompt_fa = $fa$بیشتر مردان چه می‌کنند که صبح‌شان را واگذار می‌کنند؟$fa$,
  options_fa = jsonb_build_array($fa$زیاد می‌خوابند$fa$, $fa$اول سراغ گوشی می‌روند و توجهشان را پخش می‌کنند$fa$, $fa$صبحانه می‌خورند$fa$, $fa$بیش‌از‌حد ورزش می‌کنند$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=5) and sort_order=2;
update questions set prompt_fa = $fa$صبحِ آگاهانه چه اعلامی توصیف می‌شود؟$fa$,
  options_fa = jsonb_build_array($fa$اینکه از دیگران بهتری$fa$, $fa$اینکه تو روزت را رهبری می‌کنی؛ روزت تو را رهبری نمی‌کند$fa$, $fa$اینکه به خواب بیشتری نیاز داری$fa$, $fa$اینکه صبح‌ها مهم نیستند$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=5) and sort_order=3;

-- Level 6
update questions set prompt_fa = $fa$به‌گفتهٔ متن، بیشتر مردان روایتِ خود را چگونه ویرایش می‌کنند؟$fa$,
  options_fa = jsonb_build_array($fa$تلاش‌ها را به‌بالا و شکست‌ها را به‌پایین گرد می‌کنند$fa$, $fa$بی‌رحمانه صادق‌اند$fa$, $fa$همه‌چیز را فراموش می‌کنند$fa$, $fa$تنها بر شکست‌ها تمرکز می‌کنند$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=6) and sort_order=1;
update questions set prompt_fa = $fa$تفاوت شرم و صداقت بر اساس متن چیست؟$fa$,
  options_fa = jsonb_build_array($fa$یک‌چیزند$fa$, $fa$شرم مردان را پنهان می‌کند؛ صداقت آنان را می‌رویاند$fa$, $fa$صداقت بی‌رحم است؛ شرم مهربان$fa$, $fa$هیچ‌کدام مهم نیستند$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=6) and sort_order=2;
update questions set prompt_fa = $fa$چرا مرد باید بنیانش را صادقانه بازرسی کند؟$fa$,
  options_fa = jsonb_build_array($fa$برای تحت‌تأثیر قراردادنِ دیگران$fa$, $fa$چون بر بنیانی که از بازرسی‌اش سر باز می‌زنی نمی‌توان ساخت$fa$, $fa$برای احساسِ شرم$fa$, $fa$در واقع لازم نیست$fa$)
  where level_id = (select level_id from levels where archetype_stage='Initiate' and level_number=6) and sort_order=3;

-- ===== Journal starter questions (by sort_order) =====
update journal_questions set prompt_fa = $fa$یک چیز که از آن طفره رفته‌ای چیست، و چه هزینه‌ای برایت دارد؟$fa$ where category='starter' and sort_order=1;
update journal_questions set prompt_fa = $fa$در کجای زندگی‌ات به‌جای تصمیم‌گرفتن، رها شده‌ای؟$fa$ where category='starter' and sort_order=2;
update journal_questions set prompt_fa = $fa$مردی که بیش از همه به او احترام می‌گذاری در موقعیت کنونی تو چه می‌کرد؟$fa$ where category='starter' and sort_order=3;
update journal_questions set prompt_fa = $fa$امروز چه کردی که خودِ آینده‌ات از تو سپاسگزار خواهد بود؟$fa$ where category='starter' and sort_order=4;
update journal_questions set prompt_fa = $fa$امروز چه معیاری را نگه داشتی، با آنکه دلت نمی‌خواست؟$fa$ where category='starter' and sort_order=5;
update journal_questions set prompt_fa = $fa$چه کسی را — از جمله خودت — باید ببخشی تا پیش بروی؟$fa$ where category='starter' and sort_order=6;
update journal_questions set prompt_fa = $fa$کدام حقیقت دربارهٔ خودت را از رویارویی با آن سر باز زده‌ای؟$fa$ where category='starter' and sort_order=7;
update journal_questions set prompt_fa = $fa$اگر ترس در میان نبود، این هفته چه می‌کردی؟$fa$ where category='starter' and sort_order=8;
update journal_questions set prompt_fa = $fa$همین حالا بابتِ چه‌چیزی سپاسگزاری که معمولاً نادیده‌اش می‌گیری؟$fa$ where category='starter' and sort_order=9;
update journal_questions set prompt_fa = $fa$این هفته کجا گفتار و رفتارت با هم نخواندند؟$fa$ where category='starter' and sort_order=10;
update journal_questions set prompt_fa = $fa$کوچک‌ترین گامِ بعدی به‌سوی چیزی که مدام به تعویق می‌اندازی چیست؟$fa$ where category='starter' and sort_order=11;
update journal_questions set prompt_fa = $fa$امروز چه‌چیز انرژی‌ات را گرفت و چه‌چیز آن را بازگرداند؟$fa$ where category='starter' and sort_order=12;
update journal_questions set prompt_fa = $fa$اگر می‌دانستی شکست نمی‌خوری، دست به چه کاری می‌زدی؟$fa$ where category='starter' and sort_order=13;
update journal_questions set prompt_fa = $fa$چه کسی در زندگی‌ات سزاوارِ توجه بیشتری از توست؟$fa$ where category='starter' and sort_order=14;
update journal_questions set prompt_fa = $fa$یک «روز خوب» برای تو واقعاً چه شکلی است؟$fa$ where category='starter' and sort_order=15;
update journal_questions set prompt_fa = $fa$کدام عادت، اگر یک سال تکرار شود، بیشترین تغییر را در زندگی‌ات می‌سازد؟$fa$ where category='starter' and sort_order=16;
update journal_questions set prompt_fa = $fa$وانمود می‌کنی چه‌چیزی را نمی‌دانی؟$fa$ where category='starter' and sort_order=17;
update journal_questions set prompt_fa = $fa$آخرین بار کِی کاملاً سرزنده بودی، و چرا؟$fa$ where category='starter' and sort_order=18;
update journal_questions set prompt_fa = $fa$کدام مرز را باید تعیین کنی، و با چه کسی؟$fa$ where category='starter' and sort_order=19;
update journal_questions set prompt_fa = $fa$اگر امروز سی روز تکرار شود، تو را به کجا می‌رساند؟$fa$ where category='starter' and sort_order=20;

-- ===== Blog =====
update blog_tracks set
  title_fa = $fa$بنیان‌ها$fa$,
  description_fa = $fa$از اینجا آغاز کن. ایده‌های اصلی‌ای که هر مرد پیش از شروع کار به آن‌ها نیاز دارد.$fa$
where slug = 'foundations';

update blog_posts set
  title_fa = $fa$چرا بیشتر مردان رها می‌شوند$fa$,
  excerpt_fa = $fa$رهاشدگی به‌ندرت از یک تصمیم بد می‌آید؛ هزینهٔ آرامِ سپردنِ خود به جریان است.$fa$,
  body_fa = $fa$بیشتر مردان زندگی‌شان را انتخاب نمی‌کنند — آن را به ارث می‌برند. روزها به هفته‌ها و هفته‌ها به سال‌ها بدل می‌شوند.

این «رهاشدگی» است. دراماتیک نیست. انباشتِ آرامِ پیش‌فرض‌هاست — اینکه بگذاری جریان تو را ببرد چون هدایت‌کردن تلاش می‌طلبد.

> هر سالی که در رهاشدگی بگذرد، سالی از زندگیِ یگانه‌ات است که به‌جای نیت، به اینرسی سپرده شده.

نخستین گام، درست‌کردنِ همه‌چیز نیست؛ دیدنِ شفافِ رهاشدگی است. تا مردی نتواند جریانی را که بر آن شناور بوده نام ببرد، هیچ‌چیز تغییر نمی‌کند.$fa$
where slug = 'why-most-men-drift';

update blog_posts set
  title_fa = $fa$انضباط یک معیار است، نه یک احساس$fa$,
  excerpt_fa = $fa$انگیزه آب‌وهواست. معیار چیزی است که فارغ از حالت نگه می‌داری.$fa$,
  body_fa = $fa$انگیزه یک احساس است، و احساس‌ها مانند آب‌وهوا می‌آیند و می‌روند. مردی که تنها هنگام انگیزه عمل می‌کند، اسیرِ حال‌وهوای خویش است.

انضباط چیز دیگری است: معیاری که فارغ از احساست نگه می‌داری. به‌جای «دلم می‌خواهد؟»، بپرس «این معیاری است که نگه می‌دارم؟»

> هر بار که معیار را به‌رغم حال‌وهوا نگه می‌داری، رأیی به مردی می‌دهی که داری می‌شوی.

عظمت در فوران‌های الهام ساخته نمی‌شود؛ در تکرارِ بی‌زرق‌وبرقِ روزهای عادی ساخته می‌شود.$fa$
where slug = 'the-daily-standard';

update blog_posts set
  title_fa = $fa$نقشهٔ راهِ پادشاه درون$fa$,
  excerpt_fa = $fa$جایی که امروز ایستاده‌ایم و آنچه در پی آن می‌سازیم — از مسیرِ یادگیری تا اپلیکیشن اندروید.$fa$,
  body_fa = $fa$پادشاه درون یک مسیر است، نه یک دوره. هدف ساده و جدی است: بردنِ مرد از رهاشدگی به رهبریِ آگاهانهٔ زندگی، گام به گام.

## چشم‌انداز
رشد باید مانند بازی‌ای باشد که واقعاً می‌خواهی انجامش دهی. پادشاه درون بهترینِ آن دنیا را برمی‌دارد — مسیری دیدنی، گام‌های روشن، پیشرفتِ واقعی — و آن را به‌سوی چیزی مهم نشانه می‌رود.

## اکنون کجاییم
تجربهٔ اصلی ساخته شده: نقشه‌ای پیچ‌درپیچ از گام‌های به‌هم‌پیوسته، و درس‌هایی که هر کدام با سه فعالیت آموزش داده می‌شوند — درک مطلب، تفکر نقادانه و آزمون.

## در حال ساختِ چه هستیم
- حساب‌های واقعی و پیشرفتِ ذخیره‌شده در همهٔ دستگاه‌ها.
- برنامهٔ کاملِ مرحلهٔ نوآموز.
- دفترچهٔ روزانه با یک پرسش در هر روز.
- مراحل جنگجو، جادوگر و پادشاه.
- اپلیکیشن بومیِ اندروید در کنار وب.

این صفحه را با پیشرفتِ کار صادقانه به‌روز نگه می‌داریم.$fa$
where slug = 'king-within-roadmap';

commit;
