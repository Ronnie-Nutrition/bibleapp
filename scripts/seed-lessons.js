/**
 * Seed Firestore with Biblical Lessons for Entrepreneurs
 * Run: node scripts/seed-lessons.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(process.env.HOME, 'Downloads/biblical-lessons-dev-firebase-adminsdk-fbsvc-45806fda14.json'));

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
    bibleVerses: [
      { book: 'Mark', chapter: 10, verse: 45, text: 'For even the Son of Man did not come to be served, but to serve, and to give his life as a ransom for many.' },
      { book: 'John', chapter: 13, verse: 14, endVerse: 15, text: 'Now that I, your Lord and Teacher, have washed your feet, you also should wash one another\'s feet. I have set you an example that you should do as I have done for you.' }
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
    keyTakeaway: 'Integrity is not just moral - it\'s strategic. Honest business practices build lasting success.',
    bibleVerses: [
      { book: 'Proverbs', chapter: 11, verse: 1, text: 'The Lord detests dishonest scales, but accurate weights find favor with him.' },
      { book: 'Proverbs', chapter: 22, verse: 1, text: 'A good name is more desirable than great riches; to be esteemed is better than silver or gold.' }
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

Take calculated risks. Invest in growth. Use what you have to create more value. This is biblical stewardship.`,
    category: 'Financial Stewardship',
    difficulty: 'Intermediate',
    duration: 10,
    keyTakeaway: 'Don\'t bury your potential out of fear. Invest your resources wisely to multiply what God has given you.',
    bibleVerses: [
      { book: 'Matthew', chapter: 25, verse: 14, endVerse: 30, text: 'Well done, good and faithful servant! You have been faithful with a few things; I will put you in charge of many things.' },
      { book: 'Luke', chapter: 16, verse: 10, text: 'Whoever can be trusted with very little can also be trusted with much.' }
    ],
    practicalSteps: [
      'Identify your top 3 business "talents" (resources, skills, opportunities)',
      'Create a plan to invest and grow each one',
      'Replace fear-based decisions with faith-based calculated risks',
      'Track your ROI not just financially, but in impact and growth'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  },
  {
    id: 'lesson-004',
    title: 'Trust in Divine Timing',
    subtitle: 'Patience in Business Growth',
    content: `Ecclesiastes tells us there is a season for everything. In business, we often want instant results, but God's timing is perfect. Joseph waited years in prison before becoming second in command of Egypt.

Patience is not passive waiting - it's active preparation. While waiting for your breakthrough, sharpen your skills, build relationships, and stay faithful in small things.

The businesses that last are built slowly and intentionally, not overnight. Trust the process.`,
    category: 'Trust & Faith',
    difficulty: 'Intermediate',
    duration: 9,
    keyTakeaway: 'Success rarely comes overnight. Stay faithful in preparation while trusting God\'s perfect timing.',
    bibleVerses: [
      { book: 'Ecclesiastes', chapter: 3, verse: 1, text: 'There is a time for everything, and a season for every activity under the heavens.' },
      { book: 'Isaiah', chapter: 40, verse: 31, text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles.' },
      { book: 'Habakkuk', chapter: 2, verse: 3, text: 'For the revelation awaits an appointed time; it speaks of the end and will not prove false. Though it linger, wait for it; it will certainly come.' }
    ],
    practicalSteps: [
      'Identify areas where you\'re rushing and forcing outcomes',
      'Create a "preparation checklist" for your next level',
      'Set milestones that focus on growth, not just results',
      'Practice gratitude for your current season while preparing for the next'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  },
  {
    id: 'lesson-005',
    title: 'Purpose-Driven Business',
    subtitle: 'Serving Others Through Commerce',
    content: `Jesus spent His ministry healing, teaching, and serving. Your business can be a ministry too - not by preaching, but by solving real problems and genuinely caring for customers.

When profit is your only purpose, you'll cut corners when times get hard. When service is your purpose, profit becomes a byproduct of doing good work.

Ask not just "How can I make money?" but "How can I serve people?" The answer often reveals the most sustainable business model.`,
    category: 'Serving Others',
    difficulty: 'Beginner',
    duration: 8,
    keyTakeaway: 'Purpose beyond profit creates sustainable success. Serve first, and the business will follow.',
    bibleVerses: [
      { book: 'Galatians', chapter: 5, verse: 13, text: 'Serve one another humbly in love.' },
      { book: 'Philippians', chapter: 2, verse: 3, endVerse: 4, text: 'Do nothing out of selfish ambition or vain conceit. Rather, in humility value others above yourselves, not looking to your own interests but each of you to the interests of the others.' }
    ],
    practicalSteps: [
      'Write down 5 ways your business genuinely helps people',
      'Interview customers about the real impact your product/service has',
      'Identify one way to increase service without increasing prices',
      'Create a mission statement focused on service, not sales'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  },
  {
    id: 'lesson-006',
    title: 'Perseverance Through Trials',
    subtitle: 'James on Business Hardships',
    content: `James tells us to consider it pure joy when we face trials, because testing produces perseverance. Every successful entrepreneur has a story of near-failure that became their foundation.

Obstacles are not signs to quit - they're opportunities to grow. The resistance you face today builds the strength you need for tomorrow's opportunities.

When business gets hard, don't ask "Why me?" Ask "What is this teaching me?" Every setback carries a lesson for your next success.`,
    category: 'Perseverance',
    difficulty: 'Intermediate',
    duration: 9,
    keyTakeaway: 'Trials develop the perseverance needed for long-term success. Embrace challenges as growth opportunities.',
    bibleVerses: [
      { book: 'James', chapter: 1, verse: 2, endVerse: 4, text: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.' },
      { book: 'Romans', chapter: 5, verse: 3, endVerse: 4, text: 'We also glory in our sufferings, because we know that suffering produces perseverance; perseverance, character; and character, hope.' }
    ],
    practicalSteps: [
      'Reframe your current biggest challenge as a growth opportunity',
      'Document lessons learned from past failures',
      'Create a "perseverance plan" for when things get tough',
      'Find a mentor who has overcome similar challenges'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  },
  {
    id: 'lesson-007',
    title: 'Seeking Wisdom First',
    subtitle: 'Solomon\'s Request for Business',
    content: `When God offered Solomon anything, he asked for wisdom to lead well. This single request brought him wisdom, wealth, and honor beyond measure.

In business, we often chase tactics, hacks, and shortcuts. But wisdom - the ability to make right decisions in complex situations - is the foundation everything else builds upon.

Seek wisdom through Scripture, mentors, and experience. A wise leader with limited resources will outperform a foolish one with unlimited capital.`,
    category: 'Wisdom & Discernment',
    difficulty: 'Advanced',
    duration: 11,
    keyTakeaway: 'Wisdom is the multiplier of all other resources. Prioritize gaining wisdom above tactics and trends.',
    bibleVerses: [
      { book: '1 Kings', chapter: 3, verse: 9, text: 'So give your servant a discerning heart to govern your people and to distinguish between right and wrong.' },
      { book: 'Proverbs', chapter: 4, verse: 7, text: 'The beginning of wisdom is this: Get wisdom. Though it cost all you have, get understanding.' },
      { book: 'James', chapter: 1, verse: 5, text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault.' }
    ],
    practicalSteps: [
      'Start each day asking God for wisdom in your decisions',
      'Identify 2-3 wise mentors and schedule regular time with them',
      'Before major decisions, pause 24 hours and pray',
      'Read one chapter of Proverbs daily for practical wisdom'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  },
  {
    id: 'lesson-008',
    title: 'Building Strong Partnerships',
    subtitle: 'The Power of Godly Community',
    content: `Ecclesiastes teaches that two are better than one. In business, partnerships multiply your capabilities, provide accountability, and offer support during hardships.

But not all partnerships are equal. Choose partners whose values align with yours. A skilled partner with conflicting values will eventually tear your business apart.

Invest in relationships before you need them. The network you build in good times becomes your support system in hard times.`,
    category: 'Community & Partnership',
    difficulty: 'Intermediate',
    duration: 8,
    keyTakeaway: 'Strategic partnerships with aligned values multiply your effectiveness and provide crucial support.',
    bibleVerses: [
      { book: 'Ecclesiastes', chapter: 4, verse: 9, endVerse: 10, text: 'Two are better than one, because they have a good return for their labor: If either of them falls down, one can help the other up.' },
      { book: 'Proverbs', chapter: 27, verse: 17, text: 'As iron sharpens iron, so one person sharpens another.' },
      { book: 'Amos', chapter: 3, verse: 3, text: 'Do two walk together unless they have agreed to do so?' }
    ],
    practicalSteps: [
      'List your top 5 business relationships and evaluate their health',
      'Identify gaps in your skills that a partner could fill',
      'Create criteria for potential partners based on values first, skills second',
      'Schedule monthly connection time with key business relationships'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  },
  {
    id: 'lesson-009',
    title: 'Redeeming Your Time',
    subtitle: 'Eternal Perspective on Productivity',
    content: `Paul urges us to make the most of every opportunity. Time is our most limited resource - we can make more money, but we cannot make more time.

Productivity is not about doing more things; it's about doing the right things. Say no to good opportunities so you can say yes to great ones.

Work with eternity in mind. Some tasks that seem urgent today won't matter in a year. Focus on what creates lasting value.`,
    category: 'Time & Productivity',
    difficulty: 'Beginner',
    duration: 7,
    keyTakeaway: 'Effective time management means focusing on what truly matters, not just what feels urgent.',
    bibleVerses: [
      { book: 'Ephesians', chapter: 5, verse: 15, endVerse: 16, text: 'Be very careful, then, how you live—not as unwise but as wise, making the most of every opportunity.' },
      { book: 'Psalm', chapter: 90, verse: 12, text: 'Teach us to number our days, that we may gain a heart of wisdom.' }
    ],
    practicalSteps: [
      'Audit your last week - how much time went to high-impact activities?',
      'Identify your top 3 time-wasters and create boundaries',
      'Block time for important but not urgent tasks',
      'Start each day identifying the ONE thing that must get done'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  },
  {
    id: 'lesson-010',
    title: 'Decisions at the Crossroads',
    subtitle: 'Seeking Divine Guidance',
    content: `Proverbs tells us to trust in the Lord and not lean on our own understanding. Major business decisions require more than spreadsheets and logic - they require spiritual discernment.

Create space to hear God's voice. In the noise of business, His still small voice is easily drowned out. Regular prayer, Scripture, and wise counsel are your decision-making framework.

Not every opportunity is from God. Learn to discern between an open door and a tempting distraction.`,
    category: 'Decision Making',
    difficulty: 'Advanced',
    duration: 10,
    keyTakeaway: 'Major decisions require spiritual discernment alongside practical analysis. Seek God\'s guidance first.',
    bibleVerses: [
      { book: 'Proverbs', chapter: 3, verse: 5, endVerse: 6, text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
      { book: 'Proverbs', chapter: 15, verse: 22, text: 'Plans fail for lack of counsel, but with many advisers they succeed.' },
      { book: 'Isaiah', chapter: 30, verse: 21, text: 'Whether you turn to the right or to the left, your ears will hear a voice behind you, saying, "This is the way; walk in it."' }
    ],
    practicalSteps: [
      'For major decisions, fast and pray before finalizing',
      'Create a "decision council" of 3-5 wise advisors',
      'Develop a framework: Does it align with my values? Does it serve others? Is there peace?',
      'Document your decision-making process to learn from outcomes'
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    imageURL: null
  }
];

async function seedLessons() {
  console.log('Starting to seed lessons...\n');

  const batch = db.batch();

  for (const lesson of lessons) {
    const docRef = db.collection('lessons').doc(lesson.id);
    batch.set(docRef, lesson);
    console.log(`  Added: ${lesson.title}`);
  }

  await batch.commit();

  console.log(`\nSuccessfully seeded ${lessons.length} lessons to Firestore!`);
  console.log('\nCategories covered:');
  const categories = [...new Set(lessons.map(l => l.category))];
  categories.forEach(cat => console.log(`  - ${cat}`));

  process.exit(0);
}

seedLessons().catch(error => {
  console.error('Error seeding lessons:', error);
  process.exit(1);
});
