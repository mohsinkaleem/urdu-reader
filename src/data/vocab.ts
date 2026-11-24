export type TopicId = 'everyday' | 'formal' | 'emotions' | 'poetry';

export type Word = {
  urdu: string;
  roman: string;
  english: string;
  topic?: TopicId;
};

export const TOPICS: { id: TopicId; urdu: string; english: string; blurb: string }[] = [
  { id: 'everyday', urdu: 'روزمرہ', english: 'Everyday life', blurb: 'Home, market, weather, time and people' },
  { id: 'formal', urdu: 'رسمی اور خبریں', english: 'Formal & news', blurb: 'Words from newspapers, offices and government' },
  { id: 'emotions', urdu: 'جذبات اور محاورے', english: 'Emotions & idioms', blurb: 'Feelings and common muhavare' },
  { id: 'poetry', urdu: 'شاعری', english: 'Poetry & literary', blurb: 'Vocabulary of the ghazal and literature' },
];

type Row = [urdu: string, roman: string, english: string];

const everyday: Row[] = [
  ['باورچی خانہ', 'bawarchi khaana', 'kitchen'],
  ['بازار', 'baazaar', 'market'],
  ['موسم', 'mausam', 'weather; season'],
  ['بارش', 'baarish', 'rain'],
  ['دھوپ', 'dhoop', 'sunshine'],
  ['سردی', 'sardi', 'cold; winter'],
  ['گرمی', 'garmi', 'heat; summer'],
  ['صبح', 'subah', 'morning'],
  ['دوپہر', 'dopahar', 'noon; early afternoon'],
  ['شام', 'shaam', 'evening'],
  ['پڑوسی', 'paṛosi', 'neighbour'],
  ['رشتہ دار', 'rishta daar', 'relative'],
  ['خریدنا', 'khareedna', 'to buy'],
  ['سبزی', 'sabzi', 'vegetable(s)'],
  ['مہنگا', 'mehnga', 'expensive'],
  ['سستا', 'sasta', 'cheap'],
  ['کرایہ', 'kiraaya', 'rent; fare'],
  ['ملاقات', 'mulaaqaat', 'meeting; encounter'],
  ['چھٹی', 'chhuṭṭi', 'holiday; day off'],
  ['نوکری', 'naukri', 'job'],
  ['مہمان', 'mehmaan', 'guest'],
  ['دعوت', 'daawat', 'invitation; feast'],
  ['تیار', 'tayyaar', 'ready'],
  ['جلدی', 'jaldi', 'quickly; hurry'],
  ['آہستہ', 'aahista', 'slowly'],
  ['ضروری', 'zaroori', 'necessary; important'],
  ['اکثر', 'aksar', 'often'],
  ['کبھی کبھی', 'kabhi kabhi', 'sometimes'],
  ['صفائی', 'safaai', 'cleaning; cleanliness'],
  ['کپڑے', 'kapṛe', 'clothes'],
];

const formal: Row[] = [
  ['حکومت', 'hukoomat', 'government'],
  ['وزیرِ اعظم', 'wazeer-e-aazam', 'prime minister'],
  ['انتخابات', 'intikhaabaat', 'elections'],
  ['معیشت', 'maeeshat', 'economy'],
  ['مہنگائی', 'mehngaai', 'inflation; rising prices'],
  ['عدالت', 'adaalat', 'court'],
  ['فیصلہ', 'faisla', 'decision; verdict'],
  ['اعلان', 'elaan', 'announcement'],
  ['اجلاس', 'ijlaas', 'session; formal meeting'],
  ['قانون', 'qaanoon', 'law'],
  ['شہری', 'shehri', 'citizen; urban'],
  ['ادارہ', 'idaara', 'institution; organisation'],
  ['ترقی', 'taraqqi', 'progress; development'],
  ['معاہدہ', 'muaahida', 'agreement; treaty'],
  ['مذاکرات', 'muzaakiraat', 'negotiations; talks'],
  ['احتجاج', 'ehtijaaj', 'protest'],
  ['تحقیقات', 'tehqeeqaat', 'investigation(s)'],
  ['بیان', 'bayaan', 'statement'],
  ['ذرائع', 'zaraaye', 'sources'],
  ['صوبہ', 'sooba', 'province'],
  ['وفاقی', 'wifaaqi', 'federal'],
  ['بجٹ', 'bajaṭ', 'budget'],
  ['درخواست', 'darkhwaast', 'application; request'],
  ['اطلاع', 'ittila', 'information; notice'],
  ['سرکاری', 'sarkaari', 'official; governmental'],
  ['ملازم', 'mulaazim', 'employee'],
  ['انتظامیہ', 'intezaamiya', 'administration'],
  ['حادثہ', 'haadsa', 'accident'],
  ['زخمی', 'zakhmi', 'injured'],
  ['امن', 'aman', 'peace'],
];

const emotions: Row[] = [
  ['خوشی', 'khushi', 'happiness; joy'],
  ['غم', 'gham', 'sorrow; grief'],
  ['غصہ', 'ghussa', 'anger'],
  ['ڈر', 'ḍar', 'fear'],
  ['شرمندگی', 'sharmindagi', 'embarrassment; shame'],
  ['حیرت', 'hairat', 'astonishment; surprise'],
  ['اداس', 'udaas', 'sad'],
  ['پریشان', 'pareshaan', 'worried; troubled'],
  ['سکون', 'sukoon', 'calm; peace of mind'],
  ['امید', 'umeed', 'hope'],
  ['مایوسی', 'maayoosi', 'disappointment; despair'],
  ['فخر', 'fakhr', 'pride'],
  ['حسد', 'hasad', 'envy; jealousy'],
  ['بےچینی', 'bechaini', 'restlessness; unease'],
  ['اعتماد', 'etemaad', 'confidence; trust'],
  ['دل ٹوٹنا', 'dil ṭooṭna', 'to be heartbroken'],
  ['دل لگانا', 'dil lagaana', 'to set one’s heart on; to apply oneself'],
  ['آنکھوں کا تارا', 'aankhon ka taara', 'idiom: apple of one’s eye'],
  ['ناک میں دم کرنا', 'naak mein dam karna', 'idiom: to pester; to make life miserable'],
  ['ہاتھ پاؤں پھول جانا', 'haath paaon phool jaana', 'idiom: to panic; to be flustered'],
  ['آگ بگولا ہونا', 'aag bagoola hona', 'idiom: to be furious'],
  ['منہ میں پانی آنا', 'munh mein paani aana', 'idiom: mouth watering'],
  ['ایک انار سو بیمار', 'ek anaar sau beemaar', 'idiom: one thing, many wanting it'],
  ['اونٹ کے منہ میں زیرہ', 'oonṭ ke munh mein zeera', 'idiom: a drop in the ocean'],
  ['نو دو گیارہ ہونا', 'nau do gyaarah hona', 'idiom: to run off; to vanish'],
  ['آسمان سر پر اٹھانا', 'aasmaan sar par uṭhaana', 'idiom: to raise a huge fuss'],
  ['دن دگنی رات چوگنی ترقی', 'din dugni raat chaugni taraqqi', 'idiom: rapid, ever-growing progress'],
  ['اپنے منہ میاں مٹھو', 'apne munh miyaan miṭṭhu', 'idiom: blowing one’s own trumpet'],
  ['خوشی سے پھولے نہ سمانا', 'khushi se phoole na samaana', 'idiom: to be overjoyed'],
  ['حوصلہ بڑھانا', 'hausla baṛhaana', 'to encourage'],
];

const poetry: Row[] = [
  ['عشق', 'ishq', 'passionate love'],
  ['محبوب', 'mehboob', 'beloved'],
  ['ہجر', 'hijr', 'separation (from the beloved)'],
  ['وصل', 'vasl', 'union (with the beloved)'],
  ['جنوں', 'junoon', 'madness; obsession'],
  ['دیوانہ', 'deewaana', 'one crazed by love'],
  ['شب', 'shab', 'night (literary)'],
  ['سحر', 'sehar', 'dawn'],
  ['چمن', 'chaman', 'garden'],
  ['گل', 'gul', 'flower; rose'],
  ['بلبل', 'bulbul', 'nightingale'],
  ['ساقی', 'saaqi', 'cupbearer'],
  ['جام', 'jaam', 'goblet; cup'],
  ['زلف', 'zulf', 'lock of hair; tresses'],
  ['آرزو', 'aarzoo', 'longing; wish'],
  ['تمنا', 'tamanna', 'desire'],
  ['وفا', 'wafa', 'faithfulness'],
  ['بےوفا', 'bewafa', 'unfaithful'],
  ['فراق', 'firaaq', 'separation; parting'],
  ['منزل', 'manzil', 'destination'],
  ['مسافر', 'musaafir', 'traveller'],
  ['خواب', 'khwaab', 'dream'],
  ['اشک', 'ashk', 'tear(s)'],
  ['درد', 'dard', 'pain'],
  ['نگاہ', 'nigaah', 'gaze; glance'],
  ['قفس', 'qafas', 'cage'],
  ['صبا', 'saba', 'morning breeze'],
  ['ماہتاب', 'maahtaab', 'moon; moonlight'],
  ['خاک', 'khaak', 'dust'],
  ['دشت', 'dasht', 'wilderness; desert'],
];

const toWords = (rows: Row[], topic: TopicId): Word[] =>
  rows.map(([urdu, roman, english]) => ({ urdu, roman, english, topic }));

export const VOCAB: Word[] = [
  ...toWords(everyday, 'everyday'),
  ...toWords(formal, 'formal'),
  ...toWords(emotions, 'emotions'),
  ...toWords(poetry, 'poetry'),
];

export const VOCAB_BY_URDU: Map<string, Word> = new Map(VOCAB.map((w) => [w.urdu, w]));
