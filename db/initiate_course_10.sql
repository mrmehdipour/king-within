-- King Within — Initiate course #10: "Your Word to Yourself"
-- Level 10 (chained after level 9) + blocks, EN + FA. Re-runnable; never deletes
-- user_progress. Run in the Supabase SQL editor (after course #9).

begin;

insert into levels
  (level_id, level_number, archetype_stage, title, title_fa, content_body, content_body_fa, xp_reward, unlock_requirement)
values (
  10, 10, 'Initiate',
  $kw$Your Word to Yourself$kw$,
  $kw$عهدِ شما با خودتان$kw$,
  $kw$Confidence isn't built by winning. It's built by keeping promises to yourself.$kw$,
  $kw$اعتمادبه‌نفس با برنده شدن ساخته نمی‌شود؛ بلکه با وفای به عهدهایی که با خودتان می‌بندید، شکل می‌گیرد.$kw$,
  50, 9
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

delete from course_blocks where level_id = 10;

insert into course_blocks (level_id, sort_order, type, content, content_fa) values
(10, 1, 'reading',
 jsonb_build_object('body', $kw$Most men chase confidence in the wrong place — in outcomes, praise, the mirror. But real confidence is quieter and more durable: it's the earned trust that when you say you'll do something, you do it. Self-trust.

Every time you make a promise to yourself and break it — the workout skipped, the bedtime ignored, the "I'll start Monday" that never comes — you file away quiet evidence that your word means nothing. Do it enough and a man stops believing himself. He sets goals he secretly knows he won't meet, because the part of him that's listening has learned not to.

The reverse is also true, and it's the way out. Every small promise kept is a deposit in self-trust. Not heroic promises — small, exact ones you actually keep. "I'll walk ten minutes." "I'll be in bed by eleven." Keep the small word, and the part of you that's always listening starts to believe again.

The Initiate guards his word to himself more carefully than his word to others — because he's learned that a man who can't trust himself will outsource every decision to other people's approval.

Make fewer promises. Keep the ones you make. That is the whole foundation of confidence.$kw$),
 jsonb_build_object('body', $kw$بیشتر مردها اعتمادبه‌نفس را در جای اشتباهی جستجو می‌کنند — در نتیجه‌ها، در تمجید دیگران، یا در آینه. اما اعتمادبه‌نفسِ واقعی، آرام‌تر و ماندگارتر است: این یک باور و اعتمادِ به‌دست‌آمده است؛ اینکه وقتی می‌گویید کاری را انجام خواهید داد، پای حرفتان می‌ایستید. یعنی همان «خوداعتمادی».

هر بار که قولی به خودتان می‌دهید و آن را می‌شکنید — تمرینی که از آن می‌گذرید، ساعت خوابی که نادیده می‌گیرید، یا آن جمله‌ی «از دوشنبه شروع می‌کنم» که هیچ‌وقت نمی‌آید — در واقع دارید یک مدرکِ بی‌صدا در ذهنتان بایگانی می‌کنید مبنی بر اینکه حرف شما هیچ ارزشی ندارد. اگر مردی این کار را به دفعات تکرار کند، دیگر خودش را باور نخواهد داشت. او اهدافی را تعیین می‌کند که در اعماق وجودش می‌داند به آن‌ها نخواهد رسید، چرا که آن بخش از وجودش که همواره در حال شنیدن است، یاد گرفته که حرف‌های او را باور نکند.

عکس این قضیه نیز صادق است و اتفاقاً راه نجات همین‌جاست. هر قولِ کوچکی که به آن وفا می‌کنید، یک واریزی به حسابِ «خوداعتمادی» شماست. نیازی نیست قول‌های قهرمانانه و بزرگ باشند — بلکه قول‌هایی کوچک و دقیق که واقعاً به آن‌ها عمل می‌کنید. مثلاً: «۱۰ دقیقه پیاده‌روی خواهم کرد» یا «تا ساعت ۱۱ در تخت‌خواب خواهم بود». پای این حرف‌های کوچک بایستید، تا آن بخش از وجودتان که همیشه در حال شنیدن است، دوباره شما را باور کند.

فرد تازه‌کار (رهرو) از عهدی که با خودش بسته، بیشتر از قولی که به دیگران داده مراقبت می‌کند — زیرا او آموخته مردی که نتواند به خودش اعتماد کند، در نهایت اختیارِ تمام تصمیماتش را به تایید و رضایت دیگران واگذار خواهد کرد.

قول‌های کمتری بدهید. اما همان‌هایی را که می‌دهید، نگه دارید. کل فونداسیون و ریشهٔ اعتمادبه‌نفس همین است.$kw$)),

(10, 2, 'writing',
 jsonb_build_object('prompt', $kw$Name one small promise you've repeatedly broken to yourself. Shrink it until it's almost too easy to fail — then state exactly when you'll keep it next.$kw$),
 jsonb_build_object('prompt', $kw$یک قولِ کوچک را نام ببرید که بارها آن را به خودتان داده و شکسته‌اید. آن‌قدر این قول را کوچک و آب‌رفته کنید که شکست خوردن در آن تقریباً غیرممکن باشد؛ سپس دقیقاً مشخص کنید که چه زمانی قرار است به آن عمل کنید.$kw$)),

(10, 3, 'quiz',
 jsonb_build_object('prompt', $kw$Where does the reading say real confidence comes from?$kw$,
   'options', jsonb_build_array(
     $kw$Winning, praise, and outcomes$kw$,
     $kw$The earned trust that you do what you say you'll do (self-trust)$kw$,
     $kw$Being naturally talented$kw$,
     $kw$Other people's approval$kw$), 'correct_index', 1),
 jsonb_build_object('prompt', $kw$متن می‌گوید اعتمادبه‌نفس واقعی از کجا سرچشمه می‌گیرد؟$kw$,
   'options', jsonb_build_array(
     $kw$برنده شدن، تمجید دیگران و نتایج.$kw$,
     $kw$اعتمادِ به‌دست‌آمده از اینکه به آنچه می‌گویید عمل می‌کنید (خوداعتمادی).$kw$,
     $kw$داشتن استعداد ذاتی.$kw$,
     $kw$تایید و رضایت دیگران.$kw$), 'correct_index', 1)),

(10, 4, 'quiz',
 jsonb_build_object('prompt', $kw$What happens each time a man breaks a promise to himself?$kw$,
   'options', jsonb_build_array(
     $kw$Nothing$kw$,
     $kw$He files away evidence that his word means nothing, eroding self-trust$kw$,
     $kw$He becomes stronger$kw$,
     $kw$Other people lose trust in him$kw$), 'correct_index', 1),
 jsonb_build_object('prompt', $kw$هر بار که مردی قولی را به خودش می‌شکند، چه اتفاقی می‌افتد؟$kw$,
   'options', jsonb_build_array(
     $kw$هیچ اتفاقی نمی‌افتد.$kw$,
     $kw$مدرکی را ثبت می‌کند مبنی بر اینکه حرفش ارزشی ندارد، و این امر خوداعتمادی‌اش را فرسایش می‌دهد.$kw$,
     $kw$قوی‌تر می‌شود.$kw$,
     $kw$دیگران اعتمادشان را به او از دست می‌دهند.$kw$), 'correct_index', 1)),

(10, 5, 'quiz',
 jsonb_build_object('prompt', $kw$What does the passage advise about promises?$kw$,
   'options', jsonb_build_array(
     $kw$Make big, ambitious promises$kw$,
     $kw$Make fewer promises and keep the ones you make$kw$,
     $kw$Never promise anything$kw$,
     $kw$Only promise things to other people$kw$), 'correct_index', 1),
 jsonb_build_object('prompt', $kw$این بخش از متن چه توصیه‌ای درباره قول‌ها و عهدها دارد؟$kw$,
   'options', jsonb_build_array(
     $kw$قول‌های بزرگ و بلندپروازانه بدهید.$kw$,
     $kw$قول‌های کمتری بدهید و پای همان‌هایی که دادید بایستید.$kw$,
     $kw$هرگز هیچ قولی ندهید.$kw$,
     $kw$فقط به دیگران قول بدهید.$kw$), 'correct_index', 1));

commit;
