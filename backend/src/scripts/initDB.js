const { sequelize, connectDB } = require('../config/database');
const User = require('../models/User');
const Scan = require('../models/Scan');
const Booking = require('../models/Booking');
const Pricing = require('../models/Pricing');
const Knowledge = require('../models/Knowledge');

const seedPricing = async () => {
  const prices = [
    // Material Costs
    { id: 'material', category: 'material', name: 'Material Cost', description: 'High-grade structural steel plate inserts', unitPrice: 650, unit: 'Units' },
    { id: 'labor', category: 'labor', name: 'Labor Charges', description: 'Certified Grade-A Welder (Site Visit + 3 hrs Ops)', unitPrice: 2800, unit: 'Job' },
    { id: 'equipment', category: 'material', name: 'Equipment Cost', description: 'Plasma cutter & specialized TIG welding rig', unitPrice: 550, unit: 'Set' },
    { id: 'welding-rods', category: 'material', name: 'Welding Rods', description: 'E7018 low-hydrogen electrodes (Pack of 10)', unitPrice: 320, unit: 'Pack' },

    // Emergency Issue Pricing (as metadata)
    { 
      id: 'issue_chassis', category: 'emergency_issue', name: 'Broken Chassis', unitPrice: 53, 
      metadata: { 
        lineItems: [
          { label: 'Labor Cost (Welding Specialist)', amount: 35 },
          { label: 'Materials & Consumables', amount: 10 },
          { label: 'Safety & Equipment Surcharge', amount: 3 },
          { label: 'Service Tax (GST 10%)', amount: 5 }
        ]
      }
    },
    { 
      id: 'issue_leak', category: 'emergency_issue', name: 'Pipeline Leak', unitPrice: 4, 
      metadata: { 
        lineItems: [
          { label: 'Labor Cost (Welding Specialist)', amount: 1 },
          { label: 'Materials & Consumables', amount: 1 },
          { label: 'Safety & Equipment Surcharge', amount: 1 },
          { label: 'Service Tax (GST 10%)', amount: 1 }
        ]
      }
    },
    { 
      id: 'issue_rift', category: 'emergency_issue', name: 'Conveyor Rift', unitPrice: 312, 
      metadata: { 
        lineItems: [
          { label: 'Labor Cost (Welding Specialist)', amount: 32 },
          { label: 'Materials & Consumables', amount: 9 },
          { label: 'Safety & Equipment Surcharge', amount: 280 },
          { label: 'Service Tax (GST 10%)', amount: 1 }
        ]
      }
    },
    { 
      id: 'issue_other', category: 'emergency_issue', name: 'Other Critical', unitPrice: 884, 
      metadata: { 
        lineItems: [
          { label: 'Labor Cost (Welding Specialist)', amount: 42 },
          { label: 'Materials & Consumables', amount: 15 },
          { label: 'Safety & Equipment Surcharge', amount: 420 },
          { label: 'Service Tax (GST 10%)', amount: 7 }
        ]
      }
    }
  ];

  for (const price of prices) {
    await Pricing.upsert(price);
  }
  console.log('✅ Pricing data seeded');
};

const seedKnowledge = async () => {
  const items = [
    {
      title: 'Basics of Arc Welding',
      description: 'Master the fundamental techniques of SMAW in this comprehensive starter guide.',
      type: 'article',
      category: 'Beginner',
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7PsjOfVVKKwwz4OZQmsePHZcPIpnsJh28cuVBnIcRYXi2WfRmxfhYSqdEQB_CibMLbjbvS_wZjybXXumRsMQFTSqGPGk2LunBm5io62FsYYx90ILoD8QIWUHAVzM7QhOsK0GY9dlHn2aV_fAEb4jPebfz5-SqM9PeDmuQ8w_ns0h4t6bT1kJrjNcdaPr74JJOkqWWZh2Gokcg9vV21trDTVRNP-r6tLSfVorFDPevJYL9zv0SXhEELKzrbRRXfTV7mfawnRCoDD0t',
      content: `INTRODUCTION TO ARC WELDING (SMAW)
Shielded Metal Arc Welding (SMAW), also known as Stick Welding, is one of the most versatile and widely used welding processes in the industry.

1. ESSENTIAL TOOLS
- Welding Machine (AC/DC)
- Electrodes (6011, 6013, 7018)
- Chipping Hammer
- Wire Brush
- Ground Clamp

2. SAFETY PRECAUTIONS
- Always wear a Level 10+ shade helmet.
- Use fire-resistant gloves and apron.
- Ensure proper ventilation to avoid inhaling fumes.

3. STEP-BY-STEP TECHNIQUE
- Preparation: Clean the metal surface using a wire brush to remove rust or paint.
- Striking the Arc: Use a "match-strike" motion to initiate the arc.
- Maintaining Gap: Keep the electrode about 1/8th of an inch away from the metal.
- Travel Speed: Move consistently to ensure an even bead profile.`,
      duration: '15 min read',
      difficulty: 'Beginner'
    },
    {
      title: 'Heavy Equipment Frame Repair',
      description: 'Step-by-step structural welding for tractors and excavators.',
      type: 'guide',
      category: 'Agriculture',
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9qsa7IivRPjcO-MGe2axTC8h09ejS4VBTnrR7K52X22MHE1gwWAkKqGS6C0ek8J1wVaIO7N0LiFnV-8wqxVjKUbunPy0lqFU7duiZEPTS1pvjOhagT9KwhIsd8s64I93colPnvBCNAxxRwI1t8ss2mGZOvSFXjzsivQLtLkEu7ASyPqT7PgBlJ4Oz5o7fwYXUZn4RZgxi_TBhf8e1Xd-4BqoKLJTW92-uUyAP8cnR_j97jNMwy2ikV3t5toacvFfn1cOhUPzxJK8C',
      content: `STRUCTURAL REPAIR FOR AGRICULTURE
Repairing tractor frames and heavy implements requires high-penetration welding and proper stress relief.

1. CRACK IDENTIFICATION
- Use a dye penetrant test to find the full extent of the crack.
- Stop-drill both ends of the crack to prevent further propagation.

2. JOINT PREPARATION
- V-groove the crack using a grinder (60-degree angle recommended).
- Ensure full penetration to the root of the metal.

3. WELDING TECHNIQUE
- Use 7018 low-hydrogen electrodes for high-strength structural bonds.
- Apply multi-pass welds for thicker sections.
- Allow slow cooling to prevent brittle fractures.`,
      duration: '20 min read',
      difficulty: 'Pro'
    },
    {
      title: 'Precision Aluminum Fabrication',
      description: 'Expert tips on heat control and gas selection for aluminum TIG welding.',
      type: 'article',
      category: 'Fabrication',
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAB9li6aiAdmzkC4DNdxY9qsrL4IWwiPXwAbK-lEgA9VJxTskww1NcK_c46vOmYSno5k_19WF9eRwU8cgzxmU80P7qma6jncX_vlysqrEMe0P8Kd1ZYTrhX-EWnPr8PNiILm2lam6xG8MnZTvbzPbXz7KcsFY1uD4ra19_gnrGkzAarbD1H6iJqgq-cOV5qLu0CQv76un29fKgWVYc3DWxfv1uBbAYDNmH0N3RuJHROn-de-cdNwmm33h46Sf3Nzks89sXtq0kngr2J',
      content: `ALUMINUM TIG WELDING GUIDE
Aluminum requires precision heat management and extreme cleanliness.

1. MATERIAL PREPARATION
- Use a stainless steel wire brush dedicated ONLY to aluminum.
- Clean with acetone to remove oxides and oils.

2. MACHINE SETTINGS
- Use AC High Frequency mode.
- Set balance to 70-30 for better cleaning action.
- Use Pure Tungsten or Zirconiated Tungsten (Green/Brown tip).

3. TECHNIQUES
- The Dabs: Add filler rod in consistent "dabs" rather than a continuous feed.
- Heat Control: Use a foot pedal to reduce heat as the metal saturates.`,
      duration: '25 min read',
      difficulty: 'Advanced'
    },
    {
      title: 'Workshop Safety Standards',
      description: 'OSHA compliant safety protocols for modern workshops.',
      type: 'guide',
      category: 'Safety',
      thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNxPRfipD6Zh9nqfhOQQEAYW_gX21C0dIgg_O4fAZ1DWMAjRjW7JpOwGilVqAApY_YRaF0O-rLtzaZ8-HKCT8U54Ju5Q8pbtvS8mS1nyZAgqBrNamTp0gPJEDr3ssuJq5dPAMECpnt6Jr9Zsz_UwF3cMwOSmAZfKICnJu3iwVtw2Qry5omTRCocw3qyWMG6ajdcCUJH5Jz9SFxYZnSLhYdIwbiPV4VsXjrDRvKLm3IK8LKkDUXlnKEwBrIxkh-J__5FvDNNE_XdBk6',
      content: `INDUSTRIAL SAFETY CHECKLIST
A safe workshop is a productive workshop. Follow these OSHA-compliant protocols.

1. PERSONAL PROTECTIVE EQUIPMENT (PPE)
- Eyes: Auto-darkening helmet (Level 10-13 shade).
- Hands: Kevlar or heavy leather welding gloves.
- Feet: Steel-toe leather boots.

2. ENVIRONMENT
- Keep floors dry and clear of trip hazards.
- Store gas cylinders upright and chained.
- Maintain a fire extinguisher (Class ABC) within 10 feet.

3. MAINTENANCE
- Inspect cables for frays or exposed copper before every shift.
- Clean filters on fume extractors monthly.`,
      difficulty: 'Beginner'
    }
  ];

  for (const item of items) {
    await Knowledge.upsert(item);
  }
  console.log('✅ Knowledge data seeded');
};

const initDatabase = async () => {
  try {
    await connectDB();

    // Define associations
    User.hasMany(Scan, { foreignKey: 'userId', as: 'scans' });
    Scan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
    Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    Scan.hasMany(Booking, { foreignKey: 'scanId', as: 'bookings' });
    Booking.belongsTo(Scan, { foreignKey: 'scanId', as: 'scan' });

    // Sync database
    const force = process.argv.includes('--force');
    await sequelize.sync({ alter: true, force });
    
    console.log(`✅ Database synced successfully ${force ? '(FORCED)' : ''}`);

    // Seed initial data
    await seedPricing();
    await seedKnowledge();

    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
};

initDatabase();
