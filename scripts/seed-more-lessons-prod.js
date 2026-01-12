/**
 * Seed Production Firestore with 20 Additional Biblical Lessons (11-30)
 * Run: node scripts/seed-more-lessons-prod.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin with production credentials
const path = require('path');
const serviceAccount = require(path.join(process.env.HOME, 'Downloads/biblical-lessons-prod-firebase-adminsdk-fbsvc-7bae738ddb.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const additionalLessons = [
  // Lesson 11: Vision
  {
    id: 'lesson-11',
    title: 'Where There Is No Vision',
    subtitle: 'The Power of God-Given Vision in Business',
    problemHook: 'Feeling like your business is drifting without direction?',
    benefitStatement: 'Learn how to receive and pursue a God-given vision that provides direction and resilience.',
    content: `Proverbs 29:18 declares, "Where there is no vision, the people perish." In entrepreneurship, vision is not merely a business plan—it's a divine revelation of what could be. God gave Noah a vision of the ark before a single drop of rain fell. Abraham received a vision of descendants as numerous as the stars while still childless.

Your business vision should be rooted in prayer and aligned with God's purposes. A God-given vision will be bigger than you can accomplish alone, requiring faith and divine partnership. It will serve others, not just yourself. It will stand the test of time because it's built on eternal principles.

Without vision, businesses drift aimlessly, reacting to circumstances rather than pursuing purpose. With vision, you can weather storms, make difficult decisions, and inspire others to join your mission.`,
    category: 'Leadership & Authority',
    difficulty: 'Intermediate',
    duration: 12,
    keyTakeaway: 'A God-given vision provides direction, motivation, and resilience for your entrepreneurial journey.',
    bibleVerses: [
      { book: 'Proverbs', chapter: 29, verse: 18, reference: 'Proverbs 29:18', text: 'Where there is no vision, the people perish: but he that keepeth the law, happy is he.' },
      { book: 'Habakkuk', chapter: 2, verse: 2, reference: 'Habakkuk 2:2', text: 'Write the vision, and make it plain upon tables, that he may run that readeth it.' }
    ],
    practicalSteps: [
      'Spend time in prayer asking God to reveal His vision for your business',
      'Write down your vision clearly and review it regularly',
      'Share your vision with trusted advisors and team members',
      'Break your vision into actionable milestones',
      'Revisit and refine your vision as you grow in understanding'
    ],
    problemTags: ['direction', 'purpose', 'planning']
  },

  // Lesson 12: Patience
  {
    id: 'lesson-12',
    title: 'The Farmer\'s Faith',
    subtitle: 'Patience in Building Your Business',
    problemHook: 'Frustrated that success isn\'t coming fast enough?',
    benefitStatement: 'Discover why patient endurance produces the most fruitful business results.',
    content: `James 5:7 instructs, "Be patient, therefore, brothers, until the coming of the Lord. See how the farmer waits for the precious fruit of the earth, being patient about it." The farmer plants seeds, waters them, and waits—knowing that harvest comes in its season, not on his schedule.

Entrepreneurship requires the same patient faith. We live in an instant-gratification culture, but lasting businesses are built over years, not months. Joseph waited 13 years from his prophetic dreams to his position in Egypt. David was anointed king but waited years before taking the throne.

Patient entrepreneurs make better decisions because they're not desperate. They build stronger foundations because they're not rushing. They develop deeper relationships because they invest time in people.`,
    category: 'Perseverance',
    difficulty: 'Beginner',
    duration: 10,
    keyTakeaway: 'Patient endurance, like a farmer waiting for harvest, produces the most fruitful business results.',
    bibleVerses: [
      { book: 'James', chapter: 5, verse: 7, reference: 'James 5:7', text: 'Be patient therefore, brethren, unto the coming of the Lord. Behold, the husbandman waiteth for the precious fruit of the earth, and hath long patience for it.' },
      { book: 'Galatians', chapter: 6, verse: 9, reference: 'Galatians 6:9', text: 'And let us not be weary in well doing: for in due season we shall reap, if we faint not.' }
    ],
    practicalSteps: [
      'Set realistic timelines for business goals',
      'Celebrate small wins along the journey',
      'Use waiting periods for preparation and improvement',
      'Trust God\'s timing over your own urgency',
      'Avoid shortcuts that compromise integrity'
    ],
    problemTags: ['patience', 'growth', 'timing']
  },

  // Lesson 13: Excellence
  {
    id: 'lesson-13',
    title: 'Whatever You Do',
    subtitle: 'The Standard of Excellence in Business',
    problemHook: 'Struggling to stand out in a crowded marketplace?',
    benefitStatement: 'Learn how excellence becomes your testimony and competitive advantage.',
    content: `Colossians 3:23 commands, "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters." This transforms every business task from mundane to sacred. Excellence is not perfectionism—it's giving your best because you serve a perfect God.

Daniel distinguished himself in Babylon through "an excellent spirit." This excellence wasn't just competence; it was character, consistency, and commitment that set him apart. In a marketplace full of mediocrity, excellence becomes your testimony.

When you pursue excellence, you honor God, serve customers well, build reputation, and create sustainable success. Excellence attracts opportunities that shortcuts never will.`,
    category: 'Integrity & Ethics',
    difficulty: 'Beginner',
    duration: 8,
    keyTakeaway: 'Working with excellence as unto the Lord transforms ordinary business activities into acts of worship.',
    bibleVerses: [
      { book: 'Colossians', chapter: 3, verse: 23, reference: 'Colossians 3:23', text: 'And whatsoever ye do, do it heartily, as to the Lord, and not unto men.' },
      { book: 'Daniel', chapter: 6, verse: 3, reference: 'Daniel 6:3', text: 'Then this Daniel was preferred above the presidents and princes, because an excellent spirit was in him.' }
    ],
    practicalSteps: [
      'Define what excellence looks like in your specific industry',
      'Create quality standards and stick to them',
      'Regularly evaluate your work against your standards',
      'Invest in continuous improvement and learning',
      'Celebrate team members who demonstrate excellence'
    ],
    problemTags: ['quality', 'standards', 'reputation']
  },

  // Lesson 14: Generosity
  {
    id: 'lesson-14',
    title: 'Give and It Shall Be Given',
    subtitle: 'The Generous Entrepreneur',
    problemHook: 'Holding too tightly to resources out of fear?',
    benefitStatement: 'Discover how generosity unlocks blessing and greater abundance.',
    content: `Luke 6:38 promises, "Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap." Generosity is not just a nice trait for entrepreneurs—it's a kingdom principle that unlocks blessing.

The generous entrepreneur gives first without calculating return. They share knowledge freely, pay fairly, support their community, and give to those in need. Paradoxically, this openhandedness leads to greater abundance, not less.

Proverbs 11:25 confirms, "A generous person will prosper; whoever refreshes others will be refreshed." When you hold resources loosely and give generously, you position yourself to receive more because God knows you'll steward it well.`,
    category: 'Financial Stewardship',
    difficulty: 'Intermediate',
    duration: 11,
    keyTakeaway: 'Generosity is not just good character—it\'s a kingdom principle that leads to greater blessing and impact.',
    bibleVerses: [
      { book: 'Luke', chapter: 6, verse: 38, reference: 'Luke 6:38', text: 'Give, and it shall be given unto you; good measure, pressed down, and shaken together, and running over.' },
      { book: 'Proverbs', chapter: 11, verse: 25, reference: 'Proverbs 11:25', text: 'The liberal soul shall be made fat: and he that watereth shall be watered also himself.' }
    ],
    practicalSteps: [
      'Build giving into your business budget from day one',
      'Look for opportunities to add value without expecting return',
      'Pay employees and vendors fairly and promptly',
      'Support causes and organizations aligned with your values',
      'Share your knowledge and expertise freely'
    ],
    problemTags: ['generosity', 'giving', 'abundance']
  },

  // Lesson 15: Humility
  {
    id: 'lesson-15',
    title: 'Before Honor Comes Humility',
    subtitle: 'Leading with a Servant\'s Heart',
    problemHook: 'Has pride crept into your leadership style?',
    benefitStatement: 'Learn why humility is the foundation of sustainable leadership.',
    content: `Proverbs 18:12 teaches, "Before a downfall the heart is haughty, but humility comes before honor." Pride has destroyed more businesses than competition ever has. The entrepreneur who thinks they have all the answers stops learning, stops listening, and stops growing.

Jesus, though equal with God, "made himself nothing, taking the form of a servant." This humble leadership attracted devoted followers and changed the world. Humble entrepreneurs admit mistakes quickly, credit their teams generously, and seek counsel consistently.

Humility doesn't mean weakness or low self-esteem. It means accurate self-assessment, openness to feedback, and recognition that all success ultimately comes from God.`,
    category: 'Leadership & Authority',
    difficulty: 'Advanced',
    duration: 13,
    keyTakeaway: 'Humility is the foundation of sustainable leadership and opens the door to God\'s promotion.',
    bibleVerses: [
      { book: 'Proverbs', chapter: 18, verse: 12, reference: 'Proverbs 18:12', text: 'Before destruction the heart of man is haughty, and before honour is humility.' },
      { book: 'Philippians', chapter: 2, verse: 7, reference: 'Philippians 2:7', text: 'But made himself of no reputation, and took upon him the form of a servant.' }
    ],
    practicalSteps: [
      'Regularly seek honest feedback from team members',
      'Publicly credit others for successes',
      'Quickly admit and correct your mistakes',
      'Listen more than you speak in meetings',
      'Surround yourself with people who will challenge you'
    ],
    problemTags: ['humility', 'leadership', 'pride']
  },

  // Lesson 16: Rest
  {
    id: 'lesson-16',
    title: 'The Sabbath Principle',
    subtitle: 'Rest as a Business Strategy',
    problemHook: 'Burning out from constant hustle and grind?',
    benefitStatement: 'Discover why strategic rest multiplies your effectiveness.',
    content: `God commanded rest before productivity apps existed because He knew we would need it. Exodus 20:8-10 establishes the Sabbath principle: work six days, rest one. This isn't just a religious ritual—it's wisdom for sustainable entrepreneurship.

Entrepreneurs often wear exhaustion as a badge of honor. But Jesus said, "Come to me, all you who are weary and burdened, and I will give you rest." Rest is not laziness; it's trust. When you rest, you declare that your business depends on God, not just your constant striving.

Regular rest improves decision-making, creativity, relationships, and health. The most productive entrepreneurs understand that strategic rest multiplies their effectiveness.`,
    category: 'Time & Productivity',
    difficulty: 'Intermediate',
    duration: 9,
    keyTakeaway: 'Strategic rest is not the opposite of productivity—it\'s the foundation of sustainable success.',
    bibleVerses: [
      { book: 'Exodus', chapter: 20, verse: 8, reference: 'Exodus 20:8', text: 'Remember the sabbath day, to keep it holy.' },
      { book: 'Matthew', chapter: 11, verse: 28, reference: 'Matthew 11:28', text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.' }
    ],
    practicalSteps: [
      'Schedule regular rest into your calendar non-negotiably',
      'Take at least one full day off each week',
      'Plan vacations and actually disconnect',
      'Create boundaries around work hours',
      'Practice daily moments of rest through prayer or meditation'
    ],
    problemTags: ['burnout', 'rest', 'balance']
  },

  // Lesson 17: Diligence
  {
    id: 'lesson-17',
    title: 'The Hand of the Diligent',
    subtitle: 'Consistent Effort Over Time',
    problemHook: 'Struggling to maintain momentum in your business?',
    benefitStatement: 'Learn how consistent effort creates insurmountable advantage.',
    content: `Proverbs 10:4 states, "Lazy hands make for poverty, but diligent hands bring wealth." Diligence is the consistent application of effort over time. It's not about heroic bursts of activity but faithful, daily work toward your goals.

The ant, commended in Proverbs 6, works steadily without a supervisor. No one is watching, yet the ant prepares and provides. Diligent entrepreneurs show up every day, do the work whether they feel like it or not, and trust the compound effect of consistent effort.

Diligence means following through on commitments, paying attention to details, and maintaining focus when others get distracted. Over time, diligence creates an insurmountable advantage.`,
    category: 'Perseverance',
    difficulty: 'Beginner',
    duration: 10,
    keyTakeaway: 'Diligent, consistent effort over time produces results that talent alone never can.',
    bibleVerses: [
      { book: 'Proverbs', chapter: 10, verse: 4, reference: 'Proverbs 10:4', text: 'He becometh poor that dealeth with a slack hand: but the hand of the diligent maketh rich.' },
      { book: 'Proverbs', chapter: 6, verse: 6, reference: 'Proverbs 6:6', text: 'Go to the ant, thou sluggard; consider her ways, and be wise.' }
    ],
    practicalSteps: [
      'Create daily routines that move you toward your goals',
      'Track your progress consistently',
      'Eliminate distractions during focused work time',
      'Break large projects into daily actionable tasks',
      'Reward yourself for maintaining consistent effort'
    ],
    problemTags: ['consistency', 'discipline', 'habits']
  },

  // Lesson 18: Courage
  {
    id: 'lesson-18',
    title: 'Be Strong and Courageous',
    subtitle: 'Facing Fear in Business',
    problemHook: 'Paralyzed by fear of failure or rejection?',
    benefitStatement: 'Learn to trust God more than you fear circumstances.',
    content: `Joshua 1:9 commands, "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go." Entrepreneurship requires courage at every stage—courage to start, to pivot, to persist, and sometimes to stop.

Fear is natural but shouldn't be your master. David faced Goliath not because he wasn't afraid, but because he trusted God more than he feared the giant. Esther approached the king knowing she could die, but said, "If I perish, I perish."

Courageous entrepreneurs take calculated risks, have difficult conversations, make unpopular decisions when necessary, and stand for their values even when it costs them.`,
    category: 'Trust & Faith',
    difficulty: 'Intermediate',
    duration: 11,
    keyTakeaway: 'Courage isn\'t the absence of fear—it\'s trusting God more than you fear circumstances.',
    bibleVerses: [
      { book: 'Joshua', chapter: 1, verse: 9, reference: 'Joshua 1:9', text: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest.' },
      { book: 'Esther', chapter: 4, verse: 16, reference: 'Esther 4:16', text: 'And so will I go in unto the king, which is not according to the law: and if I perish, I perish.' }
    ],
    practicalSteps: [
      'Identify the fears holding you back in business',
      'Take one courageous action this week',
      'Surround yourself with encouragers who speak truth',
      'Recall past victories when facing new challenges',
      'Remember that God goes with you into every situation'
    ],
    problemTags: ['fear', 'courage', 'risk']
  },

  // Lesson 19: Communication
  {
    id: 'lesson-19',
    title: 'A Word Fitly Spoken',
    subtitle: 'The Power of Words in Business',
    problemHook: 'Struggling with miscommunication in your team or customers?',
    benefitStatement: 'Master communication to build trust and resolve conflicts.',
    content: `Proverbs 25:11 says, "A word fitly spoken is like apples of gold in settings of silver." Words have power—power to build or destroy, to encourage or discourage, to clarify or confuse. Wise entrepreneurs master the art of communication.

James warns that the tongue is a small part of the body but can set the whole course of life on fire. In business, careless words damage relationships, create misunderstandings, and destroy trust. But wise words can inspire teams, win customers, and resolve conflicts.

Effective communication means speaking truth in love, listening actively, being clear and concise, and knowing when silence is the better choice.`,
    category: 'Community & Partnership',
    difficulty: 'Intermediate',
    duration: 10,
    keyTakeaway: 'Mastering communication—both speaking and listening—is essential for business success.',
    bibleVerses: [
      { book: 'Proverbs', chapter: 25, verse: 11, reference: 'Proverbs 25:11', text: 'A word fitly spoken is like apples of gold in pictures of silver.' },
      { book: 'James', chapter: 3, verse: 5, reference: 'James 3:5', text: 'Even so the tongue is a little member, and boasteth great things.' }
    ],
    practicalSteps: [
      'Think before you speak, especially in conflict',
      'Practice active listening in every conversation',
      'Communicate expectations clearly and confirm understanding',
      'Give feedback that is specific, timely, and constructive',
      'Apologize quickly when your words cause harm'
    ],
    problemTags: ['communication', 'leadership', 'relationships']
  },

  // Lesson 20: Adversity
  {
    id: 'lesson-20',
    title: 'Refined by Fire',
    subtitle: 'Finding Purpose in Business Challenges',
    problemHook: 'Going through a difficult season in your business?',
    benefitStatement: 'Learn to view challenges as teachers that shape great entrepreneurs.',
    content: `1 Peter 1:7 explains that trials come "so that the proven genuineness of your faith—of greater worth than gold, which perishes even though refined by fire—may result in praise, glory and honor." Every entrepreneur faces adversity. The question is what you do with it.

Joseph's journey from pit to prison to palace shows how God uses adversity to prepare leaders. The very circumstances that seemed to destroy his dreams were actually preparing him for his destiny. What felt like setbacks were actually setups.

Adversity builds character, reveals weaknesses to address, creates empathy for others, and often redirects us toward better paths. The entrepreneurs who thrive are those who view challenges as teachers rather than tormentors.`,
    category: 'Perseverance',
    difficulty: 'Advanced',
    duration: 14,
    keyTakeaway: 'Adversity, properly responded to, becomes the refining fire that shapes great entrepreneurs.',
    bibleVerses: [
      { book: '1 Peter', chapter: 1, verse: 7, reference: '1 Peter 1:7', text: 'That the trial of your faith, being much more precious than of gold that perisheth, though it be tried with fire, might be found unto praise and honour and glory.' },
      { book: 'Romans', chapter: 5, verse: 3, reference: 'Romans 5:3', text: 'And not only so, but we glory in tribulations also: knowing that tribulation worketh patience.' }
    ],
    practicalSteps: [
      'When facing adversity, ask "What can I learn from this?"',
      'Keep a journal of challenges overcome and lessons learned',
      'Share your struggles with trusted mentors or advisors',
      'Look for opportunities hidden within problems',
      'Use your past adversity to help others facing similar challenges'
    ],
    problemTags: ['adversity', 'challenges', 'growth']
  },

  // Lesson 21: Priorities
  {
    id: 'lesson-21',
    title: 'Seek First the Kingdom',
    subtitle: 'Ordering Your Business Priorities',
    problemHook: 'Feel like your business is taking over your life?',
    benefitStatement: 'Learn how right priorities lead to greater success, not less.',
    content: `Matthew 6:33 instructs, "Seek first his kingdom and his righteousness, and all these things will be given to you as well." The order of your priorities determines the outcome of your life and business. When God is first, everything else finds its proper place.

Many entrepreneurs sacrifice family, health, and faith on the altar of business success. They gain the world but lose what matters most. Jesus posed the haunting question: "What good is it for someone to gain the whole world, yet forfeit their soul?"

Right priorities mean putting God first, family second, and business third. Paradoxically, this order often leads to greater business success because it provides the foundation of peace, support, and wisdom that sustainable success requires.`,
    category: 'Wisdom & Discernment',
    difficulty: 'Advanced',
    duration: 12,
    keyTakeaway: 'When you seek God\'s kingdom first, He ensures that your legitimate needs are met.',
    bibleVerses: [
      { book: 'Matthew', chapter: 6, verse: 33, reference: 'Matthew 6:33', text: 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.' },
      { book: 'Mark', chapter: 8, verse: 36, reference: 'Mark 8:36', text: 'For what shall it profit a man, if he shall gain the whole world, and lose his own soul?' }
    ],
    practicalSteps: [
      'Start each day with prayer and Scripture before checking email',
      'Schedule family time with the same commitment as business meetings',
      'Regularly evaluate if your calendar reflects your stated priorities',
      'Learn to say no to opportunities that compromise your priorities',
      'Create boundaries that protect what matters most'
    ],
    problemTags: ['priorities', 'balance', 'family']
  },

  // Lesson 22: Gratitude
  {
    id: 'lesson-22',
    title: 'In Everything Give Thanks',
    subtitle: 'The Grateful Entrepreneur',
    problemHook: 'Caught in the trap of never feeling satisfied?',
    benefitStatement: 'Discover how gratitude transforms your perspective and outcomes.',
    content: `1 Thessalonians 5:18 commands, "Give thanks in all circumstances; for this is God's will for you in Christ Jesus." Gratitude is not just a nice attitude—it's a powerful business practice that changes your perspective and your outcomes.

Grateful entrepreneurs see opportunities where others see problems. They appreciate their teams, celebrate small wins, and maintain perspective during challenges. Gratitude combats the comparison trap and the never-enough mentality that plague many business owners.

Research confirms what Scripture teaches: gratitude improves mental health, strengthens relationships, increases resilience, and enhances decision-making. It's not just spiritual advice; it's practical wisdom.`,
    category: 'Trust & Faith',
    difficulty: 'Beginner',
    duration: 8,
    keyTakeaway: 'Cultivating gratitude transforms your perspective and improves every aspect of business leadership.',
    bibleVerses: [
      { book: '1 Thessalonians', chapter: 5, verse: 18, reference: '1 Thessalonians 5:18', text: 'In every thing give thanks: for this is the will of God in Christ Jesus concerning you.' },
      { book: 'Philippians', chapter: 4, verse: 6, reference: 'Philippians 4:6', text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.' }
    ],
    practicalSteps: [
      'Start each day listing three things you\'re grateful for',
      'Express appreciation to team members regularly',
      'Keep a gratitude journal for your business journey',
      'Thank customers sincerely for their business',
      'Look for the blessing in every challenge'
    ],
    problemTags: ['gratitude', 'perspective', 'contentment']
  },

  // Lesson 23: Mentorship
  {
    id: 'lesson-23',
    title: 'Iron Sharpens Iron',
    subtitle: 'The Value of Mentorship in Business',
    problemHook: 'Feeling isolated on your entrepreneurial journey?',
    benefitStatement: 'Learn how mentorship accelerates growth and creates legacy.',
    content: `Proverbs 27:17 declares, "As iron sharpens iron, so one person sharpens another." No entrepreneur succeeds alone. Mentors provide wisdom from experience, accountability for growth, connections for opportunity, and encouragement during difficulty.

Paul mentored Timothy, passing on wisdom and preparing the next generation of leaders. Elijah mentored Elisha, eventually passing his mantle. Moses had Jethro to advise him. Jesus invested deeply in twelve disciples.

Seeking mentorship is not weakness—it's wisdom. And as you grow, you have a responsibility to mentor others, creating a legacy that extends beyond your own achievements.`,
    category: 'Community & Partnership',
    difficulty: 'Intermediate',
    duration: 11,
    keyTakeaway: 'Wise entrepreneurs both receive mentorship and give it, creating a legacy of developed leaders.',
    bibleVerses: [
      { book: 'Proverbs', chapter: 27, verse: 17, reference: 'Proverbs 27:17', text: 'Iron sharpeneth iron; so a man sharpeneth the countenance of his friend.' },
      { book: '2 Timothy', chapter: 2, verse: 2, reference: '2 Timothy 2:2', text: 'And the things that thou hast heard of me among many witnesses, the same commit thou to faithful men, who shall be able to teach others also.' }
    ],
    practicalSteps: [
      'Identify potential mentors and ask them to invest in you',
      'Come to mentor meetings prepared with specific questions',
      'Implement advice and report back on results',
      'Identify emerging leaders you can mentor',
      'Create a culture of mentorship in your organization'
    ],
    problemTags: ['mentorship', 'community', 'growth']
  },

  // Lesson 24: Innovation
  {
    id: 'lesson-24',
    title: 'New Wine, New Wineskins',
    subtitle: 'Biblical Principles for Innovation',
    problemHook: 'Stuck in old ways that no longer work?',
    benefitStatement: 'Learn how to innovate while staying grounded in timeless principles.',
    content: `Jesus said in Mark 2:22, "No one pours new wine into old wineskins. Otherwise, the wine will burst the skins, and both the wine and the wineskins will be ruined. No, they pour new wine into new wineskins." Innovation requires new containers for new ideas.

God is consistently creative—He makes all things new. The entrepreneur who reflects God's image should also create, innovate, and bring new solutions to old problems. But innovation must be grounded in timeless principles while expressing them in timely ways.

Ecclesiastes says there's nothing new under the sun, yet God does new things. The balance is maintaining eternal truths while finding fresh applications. Innovation without roots is just novelty; roots without innovation become irrelevance.`,
    category: 'Wisdom & Discernment',
    difficulty: 'Advanced',
    duration: 13,
    keyTakeaway: 'True innovation grounds timeless biblical principles in fresh expressions and solutions.',
    bibleVerses: [
      { book: 'Mark', chapter: 2, verse: 22, reference: 'Mark 2:22', text: 'And no man putteth new wine into old bottles: else the new wine doth burst the bottles, and the wine is spilled, and the bottles will be marred: but new wine must be put into new bottles.' },
      { book: 'Isaiah', chapter: 43, verse: 19, reference: 'Isaiah 43:19', text: 'Behold, I will do a new thing; now it shall spring forth; shall ye not know it?' }
    ],
    practicalSteps: [
      'Regularly set aside time for creative thinking',
      'Study how other industries solve similar problems',
      'Encourage and reward innovative ideas from your team',
      'Test new ideas quickly with minimal investment',
      'Balance innovation with core business fundamentals'
    ],
    problemTags: ['innovation', 'creativity', 'change']
  },

  // Lesson 25: Contentment
  {
    id: 'lesson-25',
    title: 'The Secret of Contentment',
    subtitle: 'Finding Peace in the Entrepreneurial Journey',
    problemHook: 'Always chasing the next milestone, never satisfied?',
    benefitStatement: 'Discover the secret of contentment that transforms entrepreneurship.',
    content: `Paul wrote in Philippians 4:12-13, "I have learned the secret of being content in any and every situation, whether well fed or hungry, whether living in plenty or in want. I can do all this through him who gives me strength." Contentment is not complacency—it's peace regardless of circumstances.

The entrepreneur without contentment is driven by anxiety, always chasing the next milestone, never satisfied with achievement. They gain success but not satisfaction. True contentment comes from identity in Christ, not business outcomes.

Contentment enables better decisions because you're not operating from desperation. It improves relationships because you're not constantly striving. It creates sustainability because you can enjoy the journey, not just the destination.`,
    category: 'Trust & Faith',
    difficulty: 'Advanced',
    duration: 12,
    keyTakeaway: 'Contentment—peace regardless of circumstances—is a learned skill that transforms entrepreneurship.',
    bibleVerses: [
      { book: 'Philippians', chapter: 4, verse: 12, reference: 'Philippians 4:12', text: 'I know both how to be abased, and I know how to abound: every where and in all things I am instructed both to be full and to be hungry, both to abound and to suffer need.' },
      { book: '1 Timothy', chapter: 6, verse: 6, reference: '1 Timothy 6:6', text: 'But godliness with contentment is great gain.' }
    ],
    practicalSteps: [
      'Identify the "if only" statements driving your discontentment',
      'Practice gratitude daily to cultivate contentment',
      'Define "enough" for various areas of business and life',
      'Celebrate achievements before rushing to the next goal',
      'Root your identity in Christ, not business success'
    ],
    problemTags: ['contentment', 'peace', 'satisfaction']
  },

  // Lesson 26: Forgiveness
  {
    id: 'lesson-26',
    title: 'Seventy Times Seven',
    subtitle: 'Forgiveness in Business Relationships',
    problemHook: 'Holding onto bitterness from a business betrayal?',
    benefitStatement: 'Learn why forgiveness frees you to move forward.',
    content: `When Peter asked how many times to forgive, Jesus answered "seventy times seven" (Matthew 18:22)—meaning unlimited forgiveness. In business, you will be wronged. Partners may betray you, employees may disappoint you, customers may mistreat you. Unforgiveness poisons you, not them.

Joseph had every reason to hold bitterness toward his brothers who sold him into slavery. Instead, he forgave them and saw God's redemptive purpose: "You intended to harm me, but God intended it for good."

Forgiveness doesn't mean trusting unwisely or accepting continued mistreatment. It means releasing the debt someone owes you and trusting God for justice. Forgiveness frees you to move forward without the weight of bitterness.`,
    category: 'Integrity & Ethics',
    difficulty: 'Advanced',
    duration: 11,
    keyTakeaway: 'Forgiveness is not optional—it\'s essential for your own freedom and continued effectiveness.',
    bibleVerses: [
      { book: 'Matthew', chapter: 18, verse: 22, reference: 'Matthew 18:22', text: 'Jesus saith unto him, I say not unto thee, Until seven times: but, Until seventy times seven.' },
      { book: 'Genesis', chapter: 50, verse: 20, reference: 'Genesis 50:20', text: 'But as for you, ye thought evil against me; but God meant it unto good.' }
    ],
    practicalSteps: [
      'Identify anyone you\'re holding unforgiveness toward',
      'Choose to release the debt they owe you to God',
      'Pray for those who have wronged you',
      'Set appropriate boundaries while maintaining forgiveness',
      'Address conflicts quickly before bitterness takes root'
    ],
    problemTags: ['forgiveness', 'bitterness', 'freedom']
  },

  // Lesson 27: Stewardship of Time
  {
    id: 'lesson-27',
    title: 'Redeeming the Time',
    subtitle: 'Managing Your Most Precious Resource',
    problemHook: 'Feel like there\'s never enough time in the day?',
    benefitStatement: 'Learn to steward time wisely by focusing on highest-impact activities.',
    content: `Ephesians 5:15-16 urges, "Be very careful, then, how you live—not as unwise but as wise, making the most of every opportunity, because the days are evil." Time is your most limited resource. Unlike money, you cannot earn more of it.

Moses prayed in Psalm 90:12, "Teach us to number our days, that we may gain a heart of wisdom." Wise entrepreneurs understand that time management is really life management. How you spend your hours determines the trajectory of your business and life.

Every yes is a no to something else. Every hour spent on low-value activities is an hour not spent on high-value ones. Stewarding time well requires clarity of priorities, discipline of focus, and courage to say no.`,
    category: 'Time & Productivity',
    difficulty: 'Intermediate',
    duration: 10,
    keyTakeaway: 'Time is your most valuable resource—steward it wisely by focusing on highest-impact activities.',
    bibleVerses: [
      { book: 'Ephesians', chapter: 5, verse: 16, reference: 'Ephesians 5:16', text: 'Redeeming the time, because the days are evil.' },
      { book: 'Psalm', chapter: 90, verse: 12, reference: 'Psalm 90:12', text: 'So teach us to number our days, that we may apply our hearts unto wisdom.' }
    ],
    practicalSteps: [
      'Audit how you actually spend your time for one week',
      'Identify your highest-value activities and protect time for them',
      'Eliminate or delegate low-value activities',
      'Use time-blocking to ensure focus',
      'Regularly evaluate if your time usage aligns with your priorities'
    ],
    problemTags: ['time', 'productivity', 'focus']
  },

  // Lesson 28: Legacy
  {
    id: 'lesson-28',
    title: 'A Good Name',
    subtitle: 'Building a Lasting Legacy',
    problemHook: 'Working hard but wondering if it will matter long-term?',
    benefitStatement: 'Learn how to build a legacy that outlasts your tenure.',
    content: `Proverbs 22:1 declares, "A good name is more desirable than great riches; to be esteemed is better than silver or gold." Legacy is not just what you leave when you die—it's what you build while you live. Every decision shapes the reputation that outlasts you.

David prepared materials for the temple he would never build, investing in the next generation's success. Nehemiah rebuilt walls that would protect generations after him. Legacy-minded entrepreneurs think beyond their own tenure.

Your legacy includes the people you develop, the culture you create, the customers you serve well, and the community you impact. What will people say about your business and leadership when you're gone?`,
    category: 'Leadership & Authority',
    difficulty: 'Advanced',
    duration: 13,
    keyTakeaway: 'Legacy is built through daily decisions that prioritize long-term impact over short-term gain.',
    bibleVerses: [
      { book: 'Proverbs', chapter: 22, verse: 1, reference: 'Proverbs 22:1', text: 'A good name is rather to be chosen than great riches, and loving favour rather than silver and gold.' },
      { book: 'Proverbs', chapter: 13, verse: 22, reference: 'Proverbs 13:22', text: 'A good man leaveth an inheritance to his children\'s children.' }
    ],
    practicalSteps: [
      'Write down the legacy you want to leave',
      'Make decisions with future generations in mind',
      'Invest in developing people, not just profits',
      'Document your values and wisdom for those who come after',
      'Regularly ask if current actions align with desired legacy'
    ],
    problemTags: ['legacy', 'reputation', 'impact']
  },

  // Lesson 29: Faith and Works
  {
    id: 'lesson-29',
    title: 'Faith Without Works',
    subtitle: 'Balancing Trust and Action',
    problemHook: 'Unsure when to trust God and when to take action?',
    benefitStatement: 'Learn to balance faithful trust with diligent action.',
    content: `James 2:17 states, "Faith by itself, if it is not accompanied by action, is dead." Some entrepreneurs spiritualize laziness, waiting for God to act without doing their part. Others work frantically without faith, relying entirely on their own effort. Biblical entrepreneurship balances both.

Nehemiah prayed AND posted guards. Joshua marched around Jericho in faith, THEN acted when the walls fell. Jesus fed the 5,000 with a boy's lunch, but the disciples had to distribute it.

Faith without works is presumption. Works without faith is pride. The sweet spot is working diligently while trusting completely—doing everything you can while acknowledging that results come from God.`,
    category: 'Trust & Faith',
    difficulty: 'Intermediate',
    duration: 11,
    keyTakeaway: 'Biblical entrepreneurship requires both faithful trust and diligent action working together.',
    bibleVerses: [
      { book: 'James', chapter: 2, verse: 17, reference: 'James 2:17', text: 'Even so faith, if it hath not works, is dead, being alone.' },
      { book: 'Nehemiah', chapter: 4, verse: 9, reference: 'Nehemiah 4:9', text: 'Nevertheless we made our prayer unto our God, and set a watch against them day and night.' }
    ],
    practicalSteps: [
      'Identify where you\'re trusting without acting',
      'Identify where you\'re acting without trusting',
      'Pray about your work and work after your prayers',
      'Take the next step, trusting God for results',
      'Give God credit for successes that follow your effort'
    ],
    problemTags: ['faith', 'action', 'trust']
  },

  // Lesson 30: Purpose
  {
    id: 'lesson-30',
    title: 'For Such a Time as This',
    subtitle: 'Discovering Your Business Purpose',
    problemHook: 'Questioning whether your business has a greater purpose?',
    benefitStatement: 'Discover how your entrepreneurial journey is part of God\'s plan.',
    content: `Mordecai asked Esther, "Who knows but that you have come to your royal position for such a time as this?" (Esther 4:14). Your business is not an accident. You are positioned in your industry, with your skills, at this moment in history for a purpose.

Purpose transforms business from mere money-making to meaning-making. When you understand your purpose, you make better decisions, attract aligned team members, and persist through difficulties. Purpose is the "why" that sustains the "what" and "how."

Jeremiah 29:11 assures us that God has plans for our welfare and future. Your entrepreneurial journey is part of that plan. Discovering and fulfilling your purpose is the ultimate measure of business success.`,
    category: 'Wisdom & Discernment',
    difficulty: 'Advanced',
    duration: 14,
    keyTakeaway: 'You are uniquely positioned for a divine purpose—discover it and let it drive your business.',
    bibleVerses: [
      { book: 'Esther', chapter: 4, verse: 14, reference: 'Esther 4:14', text: 'For if thou altogether holdest thy peace at this time, then shall there enlargement and deliverance arise to the Jews from another place; but thou and thy father\'s house shall be destroyed: and who knoweth whether thou art come to the kingdom for such a time as this?' },
      { book: 'Jeremiah', chapter: 29, verse: 11, reference: 'Jeremiah 29:11', text: 'For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.' }
    ],
    practicalSteps: [
      'Reflect on why God has placed you in your industry',
      'Identify the unique problems you\'re positioned to solve',
      'Write a purpose statement that goes beyond profit',
      'Align business decisions with your deeper purpose',
      'Regularly reconnect with your "why" during challenges'
    ],
    problemTags: ['purpose', 'calling', 'meaning']
  }
];

async function seedMoreLessons() {
  console.log('Starting to seed 20 additional lessons to PRODUCTION...\n');

  const batch = db.batch();

  for (const lesson of additionalLessons) {
    const lessonRef = db.collection('lessons').doc(lesson.id);
    batch.set(lessonRef, {
      ...lesson,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`  Prepared: ${lesson.title}`);
  }

  await batch.commit();
  console.log(`\n✓ Successfully added ${additionalLessons.length} more lessons to production!`);
  console.log('Total lessons should now be 30.');

  process.exit(0);
}

seedMoreLessons().catch(error => {
  console.error('Error seeding lessons:', error);
  process.exit(1);
});
