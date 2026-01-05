/**
 * Seed Production Firestore with Biblical Lessons for Entrepreneurs
 * Run: node scripts/seed-prod.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with production credentials
const serviceAccount = require('./biblical-lessons-prod-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Biblical Lessons for Entrepreneurs
const lessons = [
  {
    id: 'lesson-001',
    title: 'Leading with Servant Leadership',
    subtitle: 'The Example of Jesus in Business',
    content: `True leadership in business begins with serving others. Jesus demonstrated this when He washed His disciples' feet, showing that the greatest among us must be servants of all.

In your business, this means putting your team's growth before your ego, serving your customers genuinely, and leading by example rather than authority alone.

Servant leadership builds trust, loyalty, and creates a culture where people want to give their best. When you lift others up, your entire organization rises.`,
    category: 'Leadership & Authority',
    difficulty: 'Beginner',
    duration: 8,
    keyTakeaway: 'The greatest leaders serve first. Put your team and customers before yourself, and success will follow.',
    problemHook: 'Team Not Following You?',
    benefitStatement: 'Learn the leadership style that inspires genuine loyalty',
    problemTags: ['Team Problems', 'Just Starting Out'],
    bibleVerses: [
      { id: crypto.randomUUID(), book: 'Mark', chapter: 10, verse: 45, text: 'For even the Son of Man did not come to be served, but to serve, and to give his life as a ransom for many.' },
      { id: crypto.randomUUID(), book: 'John', chapter: 13, verse: 14, endVerse: 15, text: "Now that I, your Lord and Teacher, have washed your feet, you also should wash one another's feet. I have set you an example that you should do as I have done for you." }
    ],
    practicalSteps: [
      'Ask your team members what obstacles they face and help remove them',
      'Spend time doing frontline work alongside your employees',
      'Make decisions based on what serves others, not just profits',
      'Celebrate team wins publicly, take responsibility for failures privately'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  },
  {
    id: 'lesson-002',
    title: 'Integrity in Every Transaction',
    subtitle: 'Honest Scales in Modern Business',
    content: `Proverbs speaks of honest scales being a delight to the Lord. In business, this means transparency in pricing, truthful marketing, and keeping your word even when it costs you.

Your reputation is built one transaction at a time. Cut corners, and you may gain short-term profits but lose long-term trust. Operate with integrity, and you build a foundation that lasts generations.

Customers can sense authenticity. In an age of skepticism, integrity becomes your greatest competitive advantage.`,
    category: 'Integrity & Ethics',
    difficulty: 'Beginner',
    duration: 7,
    keyTakeaway: "Integrity is not just moral - it's strategic. Honest business practices build lasting success.",
    problemHook: 'Struggling to Build Trust?',
    benefitStatement: 'Discover how integrity becomes your competitive advantage',
    problemTags: ["Can't Find Customers", 'Competition Pressure'],
    bibleVerses: [
      { id: crypto.randomUUID(), book: 'Proverbs', chapter: 11, verse: 1, text: 'The Lord detests dishonest scales, but accurate weights find favor with him.' },
      { id: crypto.randomUUID(), book: 'Proverbs', chapter: 22, verse: 1, text: 'A good name is more desirable than great riches; to be esteemed is better than silver or gold.' }
    ],
    practicalSteps: [
      'Review your marketing - does it promise only what you can deliver?',
      'Create a policy of transparency with customers about pricing and processes',
      'When you make a mistake, own it immediately and make it right',
      'Build "integrity checks" into your business decisions'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  },
  {
    id: 'lesson-003',
    title: 'The Parable of Talents',
    subtitle: 'Biblical Principles of Investment',
    content: `In the Parable of the Talents, Jesus teaches about stewardship and multiplication. The servants who invested their talents were rewarded; the one who buried his out of fear was rebuked.

God gives us resources - time, money, skills, opportunities - not to hoard but to multiply for His glory. Fear of failure is not faithfulness; it's actually unfaithfulness to the gifts we've been given.

Take calculated risks. Invest in growth. Use what you've been given to create more value in the world.`,
    category: 'Financial Stewardship',
    difficulty: 'Intermediate',
    duration: 10,
    keyTakeaway: 'God expects us to multiply what we are given, not bury it in fear. Take wise risks and invest in growth.',
    problemHook: 'Not Enough to Succeed?',
    benefitStatement: 'Learn to multiply whatever resources you have',
    problemTags: ['Money Struggles', 'Just Starting Out'],
    bibleVerses: [
      { id: crypto.randomUUID(), book: 'Matthew', chapter: 25, verse: 21, text: "His master replied, 'Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things. Come and share your master's happiness!'" },
      { id: crypto.randomUUID(), book: 'Matthew', chapter: 25, verse: 29, text: 'For whoever has will be given more, and they will have an abundance. Whoever does not have, even what they have will be taken from them.' }
    ],
    practicalSteps: [
      'List all resources you currently have (skills, network, capital, time)',
      'Identify one area where fear is keeping you from taking action',
      'Create a plan to invest your top resource for maximum return',
      'Set measurable goals to track your multiplication'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  },
  {
    id: 'lesson-004',
    title: 'Finding Peace in Uncertainty',
    subtitle: 'Trusting God When Business is Unpredictable',
    content: `Every entrepreneur faces seasons of uncertainty - market shifts, cash flow crunches, key employee departures. In these moments, anxiety can paralyze us.

Jesus slept peacefully during a violent storm while His disciples panicked. His peace came from knowing the Father was in control. We can have this same peace.

This doesn't mean being passive. It means taking wise action while trusting God with outcomes we can't control.`,
    category: 'Trust & Faith',
    difficulty: 'Intermediate',
    duration: 9,
    keyTakeaway: 'Peace in business comes not from controlling everything, but from trusting the One who does.',
    problemHook: 'Anxiety Keeping You Up at Night?',
    benefitStatement: 'Find genuine peace even when business feels out of control',
    problemTags: ['Feeling Overwhelmed', 'Business is Failing', 'Tough Decisions'],
    bibleVerses: [
      { id: crypto.randomUUID(), book: 'Philippians', chapter: 4, verse: 6, endVerse: 7, text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.' },
      { id: crypto.randomUUID(), book: 'Mark', chapter: 4, verse: 39, endVerse: 40, text: "He got up, rebuked the wind and said to the waves, 'Quiet! Be still!' Then the wind died down and it was completely calm. He said to his disciples, 'Why are you so afraid? Do you still have no faith?'" }
    ],
    practicalSteps: [
      'Write down your biggest business worry and pray specifically about it',
      'Identify what you CAN control vs what you CANNOT control',
      'Create a morning routine that centers on trust before checking business metrics',
      'When anxiety rises, practice the "stop, breathe, pray" technique'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  },
  {
    id: 'lesson-005',
    title: 'The Power of Persistence',
    subtitle: 'When Quitting Feels Like the Only Option',
    content: `The parable of the persistent widow teaches us that breakthrough often comes to those who simply don't give up. She kept asking, kept knocking, kept persevering - and eventually received justice.

In business, most people quit just before the breakthrough. They give up after the 10th rejection, not knowing success was waiting at the 11th door.

Persistence is not stubbornness. It's faith in action, continuing to work toward God-given vision even when results aren't visible yet.`,
    category: 'Perseverance',
    difficulty: 'Advanced',
    duration: 11,
    keyTakeaway: 'Most failures are not final - they are invitations to persist. Keep going when others quit.',
    problemHook: 'Ready to Give Up?',
    benefitStatement: 'Discover why your breakthrough might be one more push away',
    problemTags: ['Business is Failing', 'Feeling Overwhelmed', "Can't Find Customers"],
    bibleVerses: [
      { id: crypto.randomUUID(), book: 'Luke', chapter: 18, verse: 1, text: 'Then Jesus told his disciples a parable to show them that they should always pray and not give up.' },
      { id: crypto.randomUUID(), book: 'Galatians', chapter: 6, verse: 9, text: 'Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.' }
    ],
    practicalSteps: [
      'Review your original vision - is it still worth fighting for?',
      'List 5 entrepreneurs who failed multiple times before succeeding',
      'Identify one area where you need to push through resistance this week',
      'Find an accountability partner who will encourage you to persist'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  },
  {
    id: 'lesson-006',
    title: 'Wisdom for Difficult Decisions',
    subtitle: 'Seeking God\'s Guidance in Business Choices',
    content: `Solomon asked God for wisdom above wealth or power, and God granted his request. As entrepreneurs, we face countless decisions - hiring, firing, pivoting, investing, partnering.

The Bible promises that if we lack wisdom, we can ask God and He will give it generously. But wisdom also comes through seeking counsel, studying, and learning from experience.

Don't rush major decisions. Create space to pray, seek counsel, and wait for clarity.`,
    category: 'Wisdom & Discernment',
    difficulty: 'Intermediate',
    duration: 8,
    keyTakeaway: 'Wisdom is available to those who ask and seek it. Don\'t make major decisions without divine guidance.',
    problemHook: 'Paralyzed by a Big Decision?',
    benefitStatement: 'Learn a framework for making wise business choices',
    problemTags: ['Tough Decisions', 'No Clear Direction'],
    bibleVerses: [
      { id: crypto.randomUUID(), book: 'James', chapter: 1, verse: 5, text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.' },
      { id: crypto.randomUUID(), book: 'Proverbs', chapter: 15, verse: 22, text: 'Plans fail for lack of counsel, but with many advisers they succeed.' }
    ],
    practicalSteps: [
      'Before your next big decision, schedule dedicated prayer time',
      'Identify 2-3 wise counselors you can call for major business decisions',
      'Create a decision framework: Pray → Research → Counsel → Decide → Trust',
      'Keep a journal of decisions and outcomes to build wisdom over time'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  },
  {
    id: 'lesson-007',
    title: 'Building a Business That Blesses Others',
    subtitle: 'Purpose Beyond Profit',
    content: `Abraham was blessed to be a blessing. God's prosperity in our businesses is not meant to end with us but to flow through us to others.

A business with purpose beyond profit attracts better employees, creates loyal customers, and provides deeper fulfillment for founders. People want to be part of something meaningful.

Ask yourself: Who else benefits when my business succeeds? If the answer is only "me," you're missing the bigger picture.`,
    category: 'Serving Others',
    difficulty: 'Beginner',
    duration: 7,
    keyTakeaway: 'True success is not just building a profitable business, but one that blesses employees, customers, and community.',
    problemHook: 'Success Feeling Empty?',
    benefitStatement: 'Find deeper purpose and meaning in your business',
    problemTags: ['No Clear Direction', 'Work-Life Balance'],
    bibleVerses: [
      { id: crypto.randomUUID(), book: 'Genesis', chapter: 12, verse: 2, text: 'I will make you into a great nation, and I will bless you; I will make your name great, and you will be a blessing.' },
      { id: crypto.randomUUID(), book: 'Acts', chapter: 20, verse: 35, text: "In everything I did, I showed you that by this kind of hard work we must help the weak, remembering the words the Lord Jesus himself said: 'It is more blessed to give than to receive.'" }
    ],
    practicalSteps: [
      'Write a "blessing statement" - who benefits when your business thrives?',
      'Identify one way to serve your employees better this month',
      'Look for opportunities to give back to your community through business',
      'Review your business model for alignment with blessing others'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  },
  {
    id: 'lesson-008',
    title: 'Rest as a Business Strategy',
    subtitle: 'The Sabbath Principle for Entrepreneurs',
    content: `God rested on the seventh day and commanded us to do the same. For entrepreneurs who feel they must work constantly, this feels counterintuitive.

But rest is not just spiritual obedience - it's strategic. Burnout destroys more businesses than competition. Rested minds make better decisions, build better relationships, and see opportunities others miss.

Sabbath rest is an act of faith. It declares that God is the one who builds the business, not our frantic activity.`,
    category: 'Time & Productivity',
    difficulty: 'Intermediate',
    duration: 9,
    keyTakeaway: 'Strategic rest is not laziness - it\'s faith that God sustains your business even when you stop working.',
    problemHook: 'Burning Out Fast?',
    benefitStatement: 'Learn why rest actually accelerates your success',
    problemTags: ['Work-Life Balance', 'Feeling Overwhelmed'],
    bibleVerses: [
      { id: crypto.randomUUID(), book: 'Exodus', chapter: 20, verse: 8, endVerse: 10, text: 'Remember the Sabbath day by keeping it holy. Six days you shall labor and do all your work, but the seventh day is a sabbath to the Lord your God.' },
      { id: crypto.randomUUID(), book: 'Psalm', chapter: 127, verse: 2, text: 'In vain you rise early and stay up late, toiling for food to eat— for he grants sleep to those he loves.' }
    ],
    practicalSteps: [
      'Block one full day per week with no work activities',
      'Turn off work notifications during rest periods',
      'Plan activities that genuinely refresh you (not just passive consumption)',
      'Start with small rest periods if a full day feels impossible'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  },
  {
    id: 'lesson-009',
    title: 'Competing Without Comparison',
    subtitle: 'Running Your Own Race',
    content: `The Bible warns against comparison - measuring ourselves by others. In business, we constantly see competitors' highlight reels: their funding rounds, their viral moments, their apparent success.

Paul said he runs his race, not someone else's. Your business has a unique calling, unique timing, and unique path. Comparison steals joy and leads to poor decisions.

Focus on being faithful to YOUR vision, YOUR customers, YOUR mission. Let others run their race.`,
    category: 'Perseverance',
    difficulty: 'Beginner',
    duration: 8,
    keyTakeaway: 'Stop comparing your journey to others. Run your race with focus and faithfulness.',
    problemHook: 'Competitors Making You Feel Behind?',
    benefitStatement: 'Break free from the comparison trap that destroys entrepreneurs',
    problemTags: ['Competition Pressure', 'No Clear Direction'],
    bibleVerses: [
      { id: crypto.randomUUID(), book: 'Galatians', chapter: 6, verse: 4, endVerse: 5, text: 'Each one should test their own actions. Then they can take pride in themselves alone, without comparing themselves to someone else, for each one should carry their own load.' },
      { id: crypto.randomUUID(), book: '2 Corinthians', chapter: 10, verse: 12, text: 'We do not dare to classify or compare ourselves with some who commend themselves. When they measure themselves by themselves and compare themselves with themselves, they are not wise.' }
    ],
    practicalSteps: [
      'Unfollow or mute accounts that trigger unhealthy comparison',
      'Write down 5 unique strengths of YOUR business',
      'Focus metrics on your own growth, not competitor benchmarks',
      'Celebrate other entrepreneurs\' wins without diminishing your own'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  },
  {
    id: 'lesson-010',
    title: 'Starting with What You Have',
    subtitle: 'The Boy with Five Loaves and Two Fish',
    content: `When faced with feeding 5,000 people, Jesus didn't send disciples to buy food. He asked what they had - just a boy's lunch. From that small offering, He created abundance.

Too many entrepreneurs wait until they have "enough" - enough capital, enough experience, enough connections. But God multiplies what we bring, not what we wish we had.

Start where you are. Use what you have. Trust God to multiply it.`,
    category: 'Trust & Faith',
    difficulty: 'Beginner',
    duration: 7,
    keyTakeaway: 'Don\'t wait for perfect conditions. Start with what you have and watch God multiply it.',
    problemHook: 'Feel Like You Don\'t Have Enough to Start?',
    benefitStatement: 'Learn why your current resources are enough to begin',
    problemTags: ['Just Starting Out', 'Money Struggles'],
    bibleVerses: [
      { id: crypto.randomUUID(), book: 'John', chapter: 6, verse: 9, endVerse: 11, text: '"Here is a boy with five small barley loaves and two small fish, but how far will they go among so many?" Jesus said, "Have the people sit down." ... Jesus then took the loaves, gave thanks, and distributed to those who were seated as much as they wanted.' },
      { id: crypto.randomUUID(), book: 'Zechariah', chapter: 4, verse: 10, text: 'Who dares despise the day of small things?' }
    ],
    practicalSteps: [
      'Make a complete inventory of resources you currently have',
      'Identify the smallest viable version of your business you could start today',
      'Take one action this week using only what you already possess',
      'Stop saying "I don\'t have enough" and start saying "This is what I have"'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  }
];

async function seedLessons() {
  console.log('Starting to seed production database...');
  console.log(`Seeding ${lessons.length} lessons to biblical-lessons-prod\n`);

  for (const lesson of lessons) {
    try {
      await db.collection('lessons').doc(lesson.id).set(lesson);
      console.log(`✓ Added: ${lesson.title}`);
    } catch (error) {
      console.error(`✗ Failed to add ${lesson.title}:`, error.message);
    }
  }

  console.log('\n✅ Seeding complete!');
  console.log(`Added ${lessons.length} lessons to Firestore.`);
  process.exit(0);
}

seedLessons();
