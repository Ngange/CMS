require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Article = require('../models/article.model');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_db';

// Function to generate paragraphs
const generateParagraphs = (count) => {
  const paragraphs = [
    'The advent of artificial intelligence has revolutionized numerous industries, from healthcare to finance. Machine learning algorithms can now diagnose diseases with accuracy surpassing human experts in some cases. This technological leap has opened up new possibilities for personalized medicine and predictive analytics that were once considered science fiction.',

    'Climate change remains one of the most pressing issues facing humanity today. Rising global temperatures, melting polar ice caps, and increasingly severe weather patterns threaten ecosystems worldwide. International cooperation and innovative green technologies are essential to mitigate these effects and ensure a sustainable future for coming generations.',

    'The digital transformation of businesses has accelerated exponentially in recent years. Remote work, cloud computing, and digital collaboration tools have reshaped traditional office environments. Companies that adapt quickly to these changes are finding new opportunities for growth and efficiency in an increasingly connected world.',

    'Space exploration has entered a new era with private companies joining government agencies in the quest to understand the cosmos. Recent missions to Mars and beyond are gathering data that could answer fundamental questions about the universe and our place within it. These endeavors not only advance scientific knowledge but also inspire future generations of explorers.',

    'Renewable energy technologies have made significant strides in efficiency and affordability. Solar panels and wind turbines are now competitive with fossil fuels in many regions. This shift toward sustainable energy sources is crucial for reducing carbon emissions and combating climate change on a global scale.',

    'The evolution of social media continues to shape communication and culture. Platforms that started as simple networking tools have become complex ecosystems influencing everything from politics to commerce. Understanding their impact on society requires examining both their benefits and the challenges they present.',

    "Advancements in biotechnology are transforming medicine and agriculture. CRISPR gene editing, personalized treatments, and lab-grown food represent just a few areas of rapid development. These innovations promise to address some of humanity's oldest challenges while raising important ethical questions.",

    'Economic globalization has created interconnected markets that span continents. While this has led to increased trade and cultural exchange, it has also made economies more vulnerable to distant disruptions. The balance between global integration and local resilience remains a critical policy consideration.',

    'Modern education systems are incorporating technology in unprecedented ways. Online learning platforms, interactive tools, and adaptive curricula are personalizing the educational experience. These changes are preparing students for a world where continuous learning and digital literacy are essential skills.',

    'Urban planning faces new challenges as cities grow and evolve. Smart city technologies, sustainable infrastructure, and community-focused design are becoming priorities for metropolitan areas worldwide. Creating livable, efficient urban spaces requires balancing technological innovation with human needs.',
  ];

  let selectedParagraphs = [];
  for (let i = 0; i < count; i++) {
    selectedParagraphs.push(
      paragraphs[Math.floor(Math.random() * paragraphs.length)]
    );
  }

  return selectedParagraphs.join('\n\n');
};

// Generate 10 new articles
const generateNewArticles = (userIdMap) => {
  // Get user IDs by role
  const managerIds = Object.keys(userIdMap)
    .filter((name) => userIdMap[name].role === 'Manager')
    .map((name) => userIdMap[name].userId);

  const contributorIds = Object.keys(userIdMap)
    .filter((name) => userIdMap[name].role === 'Contributor')
    .map((name) => userIdMap[name].userId);

  return [
    {
      title: 'The Future of Artificial Intelligence in Healthcare',
      body: generateParagraphs(3),
      image: 'https://picsum.photos/seed/ai-health/800/400',
      author: managerIds[0],
      status: 'published',
      publishedAt: new Date('2024-01-15'),
      views: 1245,
    },
    {
      title: 'Sustainable Energy Solutions for Modern Cities',
      body: generateParagraphs(4),
      image: 'https://picsum.photos/seed/energy/800/400',
      author: managerIds[1],
      status: 'published',
      publishedAt: new Date('2024-02-10'),
      views: 892,
    },
    {
      title: 'The Impact of Remote Work on Corporate Culture',
      body: generateParagraphs(3),
      image: 'https://picsum.photos/seed/remote-work/800/400',
      author: contributorIds[0],
      status: 'draft',
      publishedAt: null,
      views: 0,
    },
    {
      title: 'Advancements in Space Exploration Technologies',
      body: generateParagraphs(5),
      image: 'https://picsum.photos/seed/space/800/400',
      author: contributorIds[0],
      status: 'published',
      publishedAt: new Date('2024-03-22'),
      views: 1567,
    },
    {
      title: 'Climate Change: Challenges and Opportunities',
      body: generateParagraphs(3),
      image: 'https://picsum.photos/seed/climate/800/400',
      author: contributorIds[1],
      status: 'published',
      publishedAt: new Date('2024-01-30'),
      views: 2103,
    },
    {
      title: 'The Evolution of Digital Payment Systems',
      body: generateParagraphs(4),
      image: 'https://picsum.photos/seed/payments/800/400',
      author: contributorIds[1],
      status: 'draft',
      publishedAt: null,
      views: 0,
    },
    {
      title: 'Biotechnology Breakthroughs in Modern Medicine',
      body: generateParagraphs(3),
      image: 'https://picsum.photos/seed/biotech/800/400',
      author: contributorIds[2],
      status: 'draft',
      publishedAt: null,
      views: 0,
    },
    {
      title: 'The Role of Social Media in Modern Politics',
      body: generateParagraphs(4),
      image: 'https://picsum.photos/seed/social-media/800/400',
      author: contributorIds[2],
      status: 'published',
      publishedAt: new Date('2024-03-05'),
      views: 1342,
    },
    {
      title: 'Urban Planning in the Age of Smart Cities',
      body: generateParagraphs(3),
      image: 'https://picsum.photos/seed/urban/800/400',
      author: managerIds[0],
      status: 'published',
      publishedAt: new Date('2024-01-20'),
      views: 765,
    },
    {
      title: 'The Future of Education Technology',
      body: generateParagraphs(5),
      image: 'https://picsum.photos/seed/education/800/400',
      author: managerIds[1],
      status: 'published',
      publishedAt: new Date('2024-03-15'),
      views: 1120,
    },
  ];
};

const createUsersAndArticles = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB\n');

    // Get existing roles
    const roles = await Role.find({
      name: { $in: ['Manager', 'Contributor', 'Viewer'] },
    });

    if (roles.length !== 3) {
      console.error(
        'Required roles not found. Please run init-roles.js first.'
      );
      process.exit(1);
    }

    const roleMap = {};
    roles.forEach((role) => {
      roleMap[role.name] = role._id;
    });

    // User data with different roles
    const usersToCreate = [
      // Managers
      {
        fullName: 'Alex Johnson',
        email: 'alex.johnson@cms.com',
        password: 'ManagerPass123!',
        roleName: 'Manager',
        roleId: roleMap['Manager'],
        profilePhoto: 'https://randomuser.me/api/portraits/men/32.jpg',
        isActive: true,
      },
      {
        fullName: 'Sarah Williams',
        email: 'sarah.williams@cms.com',
        password: 'ManagerPass456!',
        roleName: 'Manager',
        roleId: roleMap['Manager'],
        profilePhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
        isActive: true,
      },

      // Contributors
      {
        fullName: 'Michael Chen',
        email: 'michael.chen@cms.com',
        password: 'ContributorPass123!',
        roleName: 'Contributor',
        roleId: roleMap['Contributor'],
        profilePhoto: 'https://randomuser.me/api/portraits/men/67.jpg',
        isActive: true,
      },
      {
        fullName: 'Emma Davis',
        email: 'emma.davis@cms.com',
        password: 'ContributorPass456!',
        roleName: 'Contributor',
        roleId: roleMap['Contributor'],
        profilePhoto: 'https://randomuser.me/api/portraits/women/33.jpg',
        isActive: true,
      },
      {
        fullName: 'David Wilson',
        email: 'david.wilson@cms.com',
        password: 'ContributorPass789!',
        roleName: 'Contributor',
        roleId: roleMap['Contributor'],
        profilePhoto: 'https://randomuser.me/api/portraits/men/22.jpg',
        isActive: true,
      },

      // Viewers
      {
        fullName: 'Lisa Brown',
        email: 'lisa.brown@cms.com',
        password: 'ViewerPass123!',
        roleName: 'Viewer',
        roleId: roleMap['Viewer'],
        profilePhoto: 'https://randomuser.me/api/portraits/women/65.jpg',
        isActive: true,
      },
      {
        fullName: 'Robert Taylor',
        email: 'robert.taylor@cms.com',
        password: 'ViewerPass456!',
        roleName: 'Viewer',
        roleId: roleMap['Viewer'],
        profilePhoto: 'https://randomuser.me/api/portraits/men/55.jpg',
        isActive: true,
      },
    ];

    console.log('=== Creating Users ===');

    // Check for existing users and create new ones
    let createdCount = 0;
    let skippedCount = 0;
    const userIdMap = {};

    for (const userData of usersToCreate) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        console.log(
          `✓ User exists: ${userData.fullName} (${userData.roleName})`
        );
        userIdMap[userData.fullName] = {
          userId: existingUser._id,
          role: userData.roleName,
        };
        skippedCount++;
        continue;
      }

      // Create new user
      const newUser = new User({
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        role: userData.roleId,
        profilePhoto: userData.profilePhoto,
        isActive: userData.isActive,
      });

      await newUser.save();
      console.log(`✓ Created: ${userData.fullName} (${userData.roleName})`);

      userIdMap[userData.fullName] = {
        userId: newUser._id,
        role: userData.roleName,
      };
      createdCount++;
    }

    console.log(`\nUsers created: ${createdCount}, skipped: ${skippedCount}`);

    // Display all users
    console.log('\n=== All Users ===');
    const allUsers = await User.find().populate('role', 'name');
    allUsers.forEach((user) => {
      const fullName = (user.fullName || 'N/A').padEnd(20);
      const email = (user.email || 'N/A').padEnd(25);
      const roleName = user.role?.name || 'No Role';
      console.log(
        `${fullName} - ${email} - Role: ${roleName}`
      );
    });

    // Generate and create new articles
    console.log('\n=== Creating 10 New Articles ===');

    // Delete all existing articles first
    const deletedCount = await Article.deleteMany({});
    console.log(`🗑️  Deleted ${deletedCount.deletedCount} existing articles`);

    const newArticles = generateNewArticles(userIdMap);
    let articlesCreated = 0;
    let articlesSkipped = 0;

    for (const articleData of newArticles) {
      const newArticle = new Article(articleData);
      await newArticle.save();

      // Find author name for display
      const authorName = Object.keys(userIdMap).find((name) =>
        userIdMap[name].userId.equals(articleData.author)
      );

      const statusIcon = articleData.status === 'published' ? '📰' : '📝';
      console.log(
        `${statusIcon} Created: "${articleData.title}" by ${authorName}`
      );
      articlesCreated++;
    }

    console.log(
      `\nArticles created: ${articlesCreated}`
    );

    // Show statistics
    console.log('\n=== Database Statistics ===');
    const totalUsers = await User.countDocuments();
    const totalArticles = await Article.countDocuments();
    const publishedArticles = await Article.countDocuments({
      status: 'published',
    });
    const draftArticles = await Article.countDocuments({ status: 'draft' });

    console.log(`Total Users: ${totalUsers}`);
    console.log(`Total Articles: ${totalArticles}`);
    console.log(`  Published: ${publishedArticles}`);
    console.log(`  Drafts: ${draftArticles}`);

    // Show article breakdown by author
    console.log('\n=== Articles by Author ===');
    const articlesByAuthor = await Article.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } },
    ]);

    for (const stat of articlesByAuthor) {
      const author = await User.findById(stat._id).populate('role', 'name');
      if (author) {
        const authorName = (author.fullName || 'N/A').padEnd(20);
        const roleName = author.role?.name || 'No Role';
        console.log(
          `${authorName} (${roleName}): ${stat.count} articles`
        );
      }
    }

    // Display credentials for testing
    if (createdCount > 0) {
      console.log('\n=== Login Credentials for New Users ===');
      usersToCreate.forEach((user) => {
        console.log(`👤 ${user.fullName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: ${user.password}`);
        console.log(`   Role: ${user.roleName}`);
        console.log();
      });
    }

    console.log('\n✅ Script completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

createUsersAndArticles();
