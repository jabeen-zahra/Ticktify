require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose     = require('mongoose');
const bcrypt       = require('bcryptjs');
const User         = require('../models/User');
const Opportunity  = require('../models/Opportunity');
const Bookmark     = require('../models/Bookmark');
const Notification = require('../models/Notification');

const CLEAR_ONLY = process.argv.includes('--clear');

const future = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

// Hash password manually — bypasses pre-save hook completely
const hash = (plain) => bcrypt.hashSync(plain, 12);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected\n');

  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Opportunity.deleteMany({}),
    Bookmark.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('✅ Cleared\n');

  if (CLEAR_ONLY) {
    console.log('Done (clear only)');
    await mongoose.disconnect();
    process.exit(0);
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  console.log('👤 Creating admin...');
  const admin = await User.create({
    name: 'Ticktify Admin', email: 'admin@ticktify.pk',
    password: hash('Admin@123456'), role: 'admin', isActive: true,
  });
  console.log(`   ✅ ${admin.email}`);

  // ── Organizers ────────────────────────────────────────────────────────────
  console.log('\n🏢 Creating organizers...');
  const [fastOrg, lumsOrg, nustOrg] = await User.create([
    {
      name: 'FAST NUCES Events', email: 'events@fast.edu.pk',
      password: hash('Organizer@123'), role: 'organizer', isActive: true,
      organizerProfile: {
        organizationName: 'FAST-NUCES', emailDomain: 'fast.edu.pk',
        status: 'approved', isFirstTimePoster: false,
        verifiedAt: new Date(), verifiedBy: admin._id,
      },
    },
    {
      name: 'LUMS Student Affairs', email: 'studentaffairs@lums.edu.pk',
      password: hash('Organizer@123'), role: 'organizer', isActive: true,
      organizerProfile: {
        organizationName: 'LUMS', emailDomain: 'lums.edu.pk',
        status: 'approved', isFirstTimePoster: false,
        verifiedAt: new Date(), verifiedBy: admin._id,
      },
    },
    {
      name: 'NUST Office of Research', email: 'research@nust.edu.pk',
      password: hash('Organizer@123'), role: 'organizer', isActive: true,
      organizerProfile: {
        organizationName: 'NUST', emailDomain: 'nust.edu.pk',
        status: 'approved', isFirstTimePoster: false,
        verifiedAt: new Date(), verifiedBy: admin._id,
      },
    },
  ]);
  console.log(`   ✅ ${fastOrg.email}, ${lumsOrg.email}, ${nustOrg.email}`);

  // ── Students ──────────────────────────────────────────────────────────────
  console.log('\n🎓 Creating students...');
  const [ali, sara, hassan] = await User.create([
    { name: 'Ali Ahmed',   email: 'ali@student.fast.edu.pk',    password: hash('Student@123'), role: 'student', university: 'FAST-NUCES', degreeLevel: 'undergraduate', isActive: true },
    { name: 'Sara Khan',   email: 'sara@student.lums.edu.pk',   password: hash('Student@123'), role: 'student', university: 'LUMS',       degreeLevel: 'graduate',      isActive: true },
    { name: 'Hassan Raza', email: 'hassan@student.nust.edu.pk', password: hash('Student@123'), role: 'student', university: 'NUST',       degreeLevel: 'undergraduate', isActive: true },
  ]);
  console.log(`   ✅ ${ali.email}, ${sara.email}, ${hassan.email}`);

  // ── Opportunities ─────────────────────────────────────────────────────────
  console.log('\n🏆 Creating opportunities...');
  const opps = await Opportunity.create([
    {
      title: 'FAST Softec 2025 — National Computing Competition',
      shortDescription: "Pakistan's largest computing competition with PKR 5 Lakh+ in prizes",
      description: "SOFTEC is FAST-NUCES Lahore's flagship annual computing competition that brings together the brightest minds from universities across Pakistan. Compete in categories including AI/ML, Web Dev, Game Dev, Competitive Programming, and more. Open to all undergrad and grad students. Team size 2–4. Top teams get internship offers from leading tech companies.",
      type: 'competition', category: 'technology',
      tags: ['programming', 'ai', 'web', 'gaming', 'hackathon'],
      deadline: future(45), eventDate: future(60),
      isOnline: false, city: 'lahore', venue: 'FAST-NUCES Lahore Campus',
      degreeLevel: ['undergraduate', 'graduate'], teamSize: { min: 2, max: 4 },
      registrationLink: 'https://softec.org.pk/register',
      websiteLink: 'https://softec.org.pk',
      organizer: fastOrg._id, prize: 'PKR 5,00,000 total prize pool',
      status: 'active', isFeatured: true, featuredUntil: future(60),
      viewCount: 342, bookmarkCount: 89,
    },
    {
      title: 'LUMS Entrepreneurship Case Competition 2025',
      shortDescription: 'Present your startup idea to top VCs and win seed funding',
      description: "The LUMS Entrepreneurship Case Competition (LECC) is one of Pakistan's most prestigious business competitions. Present your startup idea to a panel of investors and industry leaders. Winners receive seed funding of up to PKR 2 Million and mentorship from leading entrepreneurs.",
      type: 'competition', category: 'business',
      tags: ['startup', 'entrepreneurship', 'business', 'funding'],
      deadline: future(30), eventDate: future(50),
      isOnline: false, city: 'lahore', venue: 'LUMS Main Campus, DHA Lahore',
      degreeLevel: ['undergraduate', 'graduate', 'phd'], teamSize: { min: 2, max: 5 },
      registrationLink: 'https://lums.edu.pk/lecc/register',
      websiteLink: 'https://lums.edu.pk/lecc',
      organizer: lumsOrg._id, prize: 'PKR 2,000,000 seed funding',
      status: 'active', isFeatured: true, featuredUntil: future(50),
      viewCount: 215, bookmarkCount: 67,
    },
    {
      title: 'NUST Merit Scholarship 2025 — Engineering Students',
      shortDescription: 'Full tuition scholarship for outstanding engineering students',
      description: 'NUST is offering full merit scholarships to outstanding engineering students enrolled in any Pakistani university. The scholarship covers full tuition fees for one academic year. Applicants must have a minimum CGPA of 3.5.',
      type: 'scholarship', category: 'research',
      tags: ['scholarship', 'engineering', 'merit', 'financial-aid'],
      deadline: future(20), isOnline: true, city: 'islamabad',
      degreeLevel: ['undergraduate'], teamSize: { min: 1, max: 1 },
      registrationLink: 'https://nust.edu.pk/scholarships/apply',
      organizer: nustOrg._id, prize: 'Full tuition — PKR 180,000/semester',
      status: 'active', viewCount: 498, bookmarkCount: 134,
    },
    {
      title: 'Introduction to Machine Learning — Free Workshop',
      shortDescription: 'Hands-on 2-day ML workshop with Python — all levels welcome',
      description: 'A free intensive 2-day workshop covering Machine Learning fundamentals using Python. Topics include data preprocessing, supervised learning, model evaluation, and a final mini-project. Certificate provided. No prior ML experience needed.',
      type: 'workshop', category: 'technology',
      tags: ['machine-learning', 'python', 'ai', 'free', 'certificate'],
      deadline: future(14), eventDate: future(21), eventEndDate: future(22),
      isOnline: true, degreeLevel: ['open'], teamSize: { min: 1, max: 1 },
      registrationLink: 'https://fast.edu.pk/ml-workshop',
      organizer: fastOrg._id, status: 'active',
      viewCount: 189, bookmarkCount: 45,
    },
    {
      title: 'TEDxLUMS 2025 — Student Speaker Applications',
      shortDescription: 'Share your idea worth spreading at TEDxLUMS',
      description: 'TEDxLUMS is seeking passionate student speakers. If you have an idea worth spreading, we want to hear from you. Selected speakers receive coaching, speaking training, and the chance to inspire hundreds of fellow students.',
      type: 'event', category: 'arts',
      tags: ['ted', 'speaking', 'ideas', 'inspiration'],
      deadline: future(25), eventDate: future(90),
      isOnline: false, city: 'lahore', venue: 'LUMS Auditorium',
      degreeLevel: ['open'], teamSize: { min: 1, max: 1 },
      registrationLink: 'https://lums.edu.pk/tedx/apply',
      websiteLink: 'https://tedxlums.com',
      organizer: lumsOrg._id, status: 'active',
      viewCount: 156, bookmarkCount: 38,
    },
    {
      title: 'NUST Research Internship — Summer 2025',
      shortDescription: '8-week paid research internship in NUST labs',
      description: "NUST's SEECS is offering 8-week paid research internships for top students. Work alongside faculty on active projects in AI, Robotics, IoT, and Cybersecurity. Stipend: PKR 25,000/month.",
      type: 'scholarship', category: 'research',
      tags: ['internship', 'research', 'paid', 'summer'],
      deadline: future(35), eventDate: future(75),
      isOnline: false, city: 'islamabad', venue: 'NUST SEECS, H-12',
      degreeLevel: ['undergraduate', 'graduate'], teamSize: { min: 1, max: 1 },
      registrationLink: 'https://seecs.nust.edu.pk/internship',
      organizer: nustOrg._id, prize: 'PKR 25,000/month stipend',
      status: 'active', viewCount: 267, bookmarkCount: 72,
    },
  ]);
  console.log(`   ✅ Created ${opps.length} opportunities`);

  // ── Bookmarks ─────────────────────────────────────────────────────────────
  console.log('\n🔖 Creating bookmarks...');
  await Bookmark.create([
    { user: ali._id,    opportunity: opps[0]._id, applicationStatus: 'applied' },
    { user: ali._id,    opportunity: opps[2]._id, applicationStatus: 'saved'   },
    { user: ali._id,    opportunity: opps[3]._id, applicationStatus: 'saved'   },
    { user: sara._id,   opportunity: opps[1]._id, applicationStatus: 'applied' },
    { user: sara._id,   opportunity: opps[4]._id, applicationStatus: 'saved'   },
    { user: hassan._id, opportunity: opps[0]._id, applicationStatus: 'saved'   },
    { user: hassan._id, opportunity: opps[5]._id, applicationStatus: 'applied' },
  ]);
  console.log('   ✅ Created 7 bookmarks');

  // ── Notifications ─────────────────────────────────────────────────────────
  console.log('\n🔔 Creating notifications...');
  await Notification.create([
    {
      user: ali._id, type: 'deadline_reminder',
      title: '⏰ Deadline in 3 days: FAST Softec 2025',
      message: "You bookmarked this. The deadline is approaching — don't miss out!",
      link: `/opportunities/${opps[0].slug}`, isRead: false,
    },
    {
      user: sara._id, type: 'new_opportunity',
      title: '🆕 New: LUMS Entrepreneurship Case Competition',
      message: 'A new competition matching your interests has been posted.',
      link: `/opportunities/${opps[1].slug}`, isRead: true,
    },
  ]);
  console.log('   ✅ Created 2 notifications');

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50));
  console.log('🎉 DATABASE SEEDED SUCCESSFULLY');
  console.log('═'.repeat(50));
  console.log('\n📋 LOGIN CREDENTIALS:\n');
  console.log('  ADMIN');
  console.log('  admin@ticktify.pk  /  Admin@123456\n');
  console.log('  ORGANIZERS  (password: Organizer@123)');
  console.log('  events@fast.edu.pk');
  console.log('  studentaffairs@lums.edu.pk');
  console.log('  research@nust.edu.pk\n');
  console.log('  STUDENTS  (password: Student@123)');
  console.log('  ali@student.fast.edu.pk');
  console.log('  sara@student.lums.edu.pk');
  console.log('  hassan@student.nust.edu.pk\n');
  console.log('⚠️  Dev only — never use in production!\n');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => {
  console.error('\n❌ Seeding failed:', err.message);
  process.exit(1);
});