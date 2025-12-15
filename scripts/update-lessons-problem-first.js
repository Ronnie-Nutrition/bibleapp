/**
 * Update Firestore Lessons with Problem-First Fields
 * Adds problemHook, benefitStatement, and problemTags to existing lessons
 *
 * Run: node scripts/update-lessons-problem-first.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(process.env.HOME, 'Downloads/biblical-lessons-dev-firebase-adminsdk-fbsvc-45806fda14.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Problem Categories (must match iOS ProblemCategory enum rawValues)
const ProblemCategory = {
  moneyStruggles: "Money Struggles",
  cantFindCustomers: "Can't Find Customers",
  teamProblems: "Team Problems",
  overwhelmed: "Feeling Overwhelmed",
  toughDecisions: "Tough Decisions",
  failingBusiness: "Business is Failing",
  noDirection: "No Clear Direction",
  workLifeBalance: "Work-Life Balance",
  competitionPressure: "Competition Pressure",
  startingOut: "Just Starting Out"
};

// Problem-first updates for each lesson
const lessonUpdates = {
  // === Original 10 Lessons ===
  'lesson-001': {
    problemHook: "Team Not Following Your Lead?",
    benefitStatement: "Discover why the best leaders serve first—and how it builds unstoppable loyalty",
    problemTags: [ProblemCategory.teamProblems, ProblemCategory.startingOut]
  },
  'lesson-002': {
    problemHook: "Tempted to Cut Corners?",
    benefitStatement: "Build a reputation that makes competitors irrelevant",
    problemTags: [ProblemCategory.toughDecisions, ProblemCategory.competitionPressure]
  },
  'lesson-003': {
    problemHook: "Feel Like You Don't Have Enough?",
    benefitStatement: "Learn the ancient secret of multiplying whatever you've been given",
    problemTags: [ProblemCategory.moneyStruggles, ProblemCategory.startingOut]
  },
  'lesson-004': {
    problemHook: "Frustrated Waiting for Results?",
    benefitStatement: "Turn your waiting season into preparation for breakthrough",
    problemTags: [ProblemCategory.overwhelmed, ProblemCategory.noDirection]
  },
  'lesson-005': {
    problemHook: "Just Chasing Money?",
    benefitStatement: "Find a purpose that makes profit sustainable and fulfilling",
    problemTags: [ProblemCategory.noDirection, ProblemCategory.startingOut]
  },
  'lesson-006': {
    problemHook: "Ready to Give Up?",
    benefitStatement: "Turn your biggest setback into your greatest comeback story",
    problemTags: [ProblemCategory.failingBusiness, ProblemCategory.overwhelmed]
  },
  'lesson-007': {
    problemHook: "Making Wrong Decisions?",
    benefitStatement: "Get the one thing that multiplies all your other resources",
    problemTags: [ProblemCategory.toughDecisions, ProblemCategory.noDirection]
  },
  'lesson-008': {
    problemHook: "Building Business Alone?",
    benefitStatement: "Discover partnerships that multiply your impact and support",
    problemTags: [ProblemCategory.teamProblems, ProblemCategory.cantFindCustomers]
  },
  'lesson-009': {
    problemHook: "Never Enough Hours in the Day?",
    benefitStatement: "Focus on what truly moves the needle in your business",
    problemTags: [ProblemCategory.overwhelmed, ProblemCategory.workLifeBalance]
  },
  'lesson-010': {
    problemHook: "Paralyzed by a Big Decision?",
    benefitStatement: "Get clarity for your most important business crossroads",
    problemTags: [ProblemCategory.toughDecisions, ProblemCategory.noDirection]
  },

  // === Additional 20 Lessons ===
  'lesson-11': {
    problemHook: "Lost Without a Clear Direction?",
    benefitStatement: "Discover the vision that gives your business unshakeable purpose",
    problemTags: [ProblemCategory.noDirection, ProblemCategory.startingOut]
  },
  'lesson-12': {
    problemHook: "Impatient for Success?",
    benefitStatement: "Learn why patient entrepreneurs build the most profitable businesses",
    problemTags: [ProblemCategory.overwhelmed, ProblemCategory.failingBusiness]
  },
  'lesson-13': {
    problemHook: "Customers Choosing Competitors?",
    benefitStatement: "Stand out from the crowd through excellence that can't be ignored",
    problemTags: [ProblemCategory.competitionPressure, ProblemCategory.cantFindCustomers]
  },
  'lesson-14': {
    problemHook: "Money Always Feels Tight?",
    benefitStatement: "Unlock the paradox of generosity that leads to greater abundance",
    problemTags: [ProblemCategory.moneyStruggles, ProblemCategory.startingOut]
  },
  'lesson-15': {
    problemHook: "Pride Sabotaging Your Success?",
    benefitStatement: "Learn why humility is the hidden key to lasting leadership",
    problemTags: [ProblemCategory.teamProblems, ProblemCategory.toughDecisions]
  },
  'lesson-16': {
    problemHook: "Burning Out Fast?",
    benefitStatement: "Discover rest as a strategic business advantage, not weakness",
    problemTags: [ProblemCategory.workLifeBalance, ProblemCategory.overwhelmed]
  },
  'lesson-17': {
    problemHook: "Struggling to Stay Consistent?",
    benefitStatement: "Build the daily habits that create unstoppable momentum",
    problemTags: [ProblemCategory.failingBusiness, ProblemCategory.startingOut]
  },
  'lesson-18': {
    problemHook: "Too Scared to Take the Leap?",
    benefitStatement: "Find the courage to make the moves your business needs",
    problemTags: [ProblemCategory.toughDecisions, ProblemCategory.startingOut]
  },
  'lesson-19': {
    problemHook: "Miscommunication Killing Deals?",
    benefitStatement: "Master the words that build trust and close more business",
    problemTags: [ProblemCategory.cantFindCustomers, ProblemCategory.teamProblems]
  },
  'lesson-20': {
    problemHook: "Everything Going Wrong?",
    benefitStatement: "Transform your worst challenges into your greatest assets",
    problemTags: [ProblemCategory.failingBusiness, ProblemCategory.overwhelmed]
  },
  'lesson-21': {
    problemHook: "Business Destroying Your Life?",
    benefitStatement: "Order your priorities so success doesn't cost you everything",
    problemTags: [ProblemCategory.workLifeBalance, ProblemCategory.noDirection]
  },
  'lesson-22': {
    problemHook: "Never Satisfied With Success?",
    benefitStatement: "Cultivate the mindset that attracts more of what you want",
    problemTags: [ProblemCategory.overwhelmed, ProblemCategory.moneyStruggles]
  },
  'lesson-23': {
    problemHook: "No One to Guide You?",
    benefitStatement: "Find mentors who shortcut your learning curve dramatically",
    problemTags: [ProblemCategory.startingOut, ProblemCategory.noDirection]
  },
  'lesson-24': {
    problemHook: "Stuck Doing Things the Old Way?",
    benefitStatement: "Innovate without losing the principles that actually work",
    problemTags: [ProblemCategory.competitionPressure, ProblemCategory.cantFindCustomers]
  },
  'lesson-25': {
    problemHook: "Success Still Feels Empty?",
    benefitStatement: "Find peace that doesn't depend on your next milestone",
    problemTags: [ProblemCategory.workLifeBalance, ProblemCategory.moneyStruggles]
  },
  'lesson-26': {
    problemHook: "Holding Grudges That Hurt You?",
    benefitStatement: "Free yourself from the weight that's dragging your business down",
    problemTags: [ProblemCategory.teamProblems, ProblemCategory.overwhelmed]
  },
  'lesson-27': {
    problemHook: "Wasting Time on Wrong Things?",
    benefitStatement: "Focus your limited time on what actually grows your business",
    problemTags: [ProblemCategory.overwhelmed, ProblemCategory.workLifeBalance]
  },
  'lesson-28': {
    problemHook: "Building Something That Won't Last?",
    benefitStatement: "Create a legacy that impacts generations beyond your lifetime",
    problemTags: [ProblemCategory.noDirection, ProblemCategory.toughDecisions]
  },
  'lesson-29': {
    problemHook: "Waiting for God to Do Everything?",
    benefitStatement: "Balance faith and action for maximum business results",
    problemTags: [ProblemCategory.failingBusiness, ProblemCategory.startingOut]
  },
  'lesson-30': {
    problemHook: "Why Does Your Business Exist?",
    benefitStatement: "Discover the divine purpose that makes your work matter",
    problemTags: [ProblemCategory.noDirection, ProblemCategory.startingOut]
  }
};

async function updateLessonsWithProblemFirst() {
  console.log('🚀 Starting to update lessons with problem-first fields...\n');

  let updatedCount = 0;
  let errorCount = 0;

  for (const [lessonId, updates] of Object.entries(lessonUpdates)) {
    try {
      const docRef = db.collection('lessons').doc(lessonId);
      const doc = await docRef.get();

      if (!doc.exists) {
        console.log(`  ⚠️  Lesson not found: ${lessonId}`);
        errorCount++;
        continue;
      }

      await docRef.update({
        problemHook: updates.problemHook,
        benefitStatement: updates.benefitStatement,
        problemTags: updates.problemTags,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`  ✓ Updated: ${lessonId} - "${updates.problemHook}"`);
      updatedCount++;
    } catch (error) {
      console.error(`  ✗ Error updating ${lessonId}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Successfully updated ${updatedCount} lessons`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} lessons had errors`);
  }

  // Display summary by problem category
  console.log('\n📊 Coverage by Problem Category:');
  const categoryCounts = {};

  for (const updates of Object.values(lessonUpdates)) {
    for (const tag of updates.problemTags) {
      categoryCounts[tag] = (categoryCounts[tag] || 0) + 1;
    }
  }

  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      console.log(`  • ${category}: ${count} lessons`);
    });

  process.exit(0);
}

updateLessonsWithProblemFirst().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
