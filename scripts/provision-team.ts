import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Secure Provisioning Script for the 6 Internal Team Members
 *
 * SECURITY RULES (Section 4):
 * - Passwords are NEVER hardcoded or committed to git, migrations, or code.
 * - Credentials and emails are supplied via environment variables at execution time.
 * - This script executes strictly in secure server-side CI/CD or admin terminal environments.
 */

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  console.error('Please provide them when executing this administrative script:');
  console.error('SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/provision-team.ts');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface TeamMemberConfig {
  envKey: string;
  nameKey: string;
  passKey: string;
  defaultEmail: string;
  defaultName: string;
  platformRole: 'ADMIN' | 'FARMER' | 'SELLER' | 'BUYER';
  teamRole: 'TEAM_LEAD' | 'BACKEND' | 'FRONTEND' | 'DATABASE' | 'AI_ML' | 'QA';
}

const TEAM_CONFIGS: TeamMemberConfig[] = [
  {
    envKey: 'TEAM_MEMBER_1_EMAIL',
    nameKey: 'TEAM_MEMBER_1_NAME',
    passKey: 'TEAM_MEMBER_1_PASSWORD',
    defaultEmail: 'om.nalawade.aids.25@vpkbiet.org',
    defaultName: 'Om Nalawade',
    platformRole: 'ADMIN',
    teamRole: 'TEAM_LEAD',
  },
  {
    envKey: 'TEAM_MEMBER_2_EMAIL',
    nameKey: 'TEAM_MEMBER_2_NAME',
    passKey: 'TEAM_MEMBER_2_PASSWORD',
    defaultEmail: 'dateathrav@gmail.com',
    defaultName: 'Date Atharv',
    platformRole: 'FARMER',
    teamRole: 'BACKEND',
  },
  {
    envKey: 'TEAM_MEMBER_3_EMAIL',
    nameKey: 'TEAM_MEMBER_3_NAME',
    passKey: 'TEAM_MEMBER_3_PASSWORD',
    defaultEmail: 'yashlokhande082@gmail.com',
    defaultName: 'Yash Lokhande',
    platformRole: 'SELLER',
    teamRole: 'FRONTEND',
  },
  {
    envKey: 'TEAM_MEMBER_4_EMAIL',
    nameKey: 'TEAM_MEMBER_4_NAME',
    passKey: 'TEAM_MEMBER_4_PASSWORD',
    defaultEmail: 'shravani2.bhosale.comp.25@vpkbiet.org',
    defaultName: 'Shravani Bhosale',
    platformRole: 'FARMER',
    teamRole: 'DATABASE',
  },
  {
    envKey: 'TEAM_MEMBER_5_EMAIL',
    nameKey: 'TEAM_MEMBER_5_NAME',
    passKey: 'TEAM_MEMBER_5_PASSWORD',
    defaultEmail: 'anuj.deshpande.comp.25@vpkbiet.org',
    defaultName: 'Anuj Deshpande',
    platformRole: 'BUYER',
    teamRole: 'AI_ML',
  },
  {
    envKey: 'TEAM_MEMBER_6_EMAIL',
    nameKey: 'TEAM_MEMBER_6_NAME',
    passKey: 'TEAM_MEMBER_6_PASSWORD',
    defaultEmail: 'prajwal.khomane.aids.25@vpkbiet.org',
    defaultName: 'Prajwal Khomane',
    platformRole: 'BUYER',
    teamRole: 'QA',
  },
];

async function provisionTeam() {
  console.log('Starting secure provisioning for AgriTech internal team members...\n');

  let adminLeadId: string | null = null;

  for (let i = 0; i < TEAM_CONFIGS.length; i++) {
    const config = TEAM_CONFIGS[i];
    const email = process.env[config.envKey] || config.defaultEmail;
    const name = process.env[config.nameKey] || config.defaultName;
    const password = process.env[config.passKey] || process.env.DEFAULT_TEAM_PASSWORD;

    if (!email || !password) {
      console.warn(`[Member ${i + 1}] Missing ${config.envKey} or password. Skipping.`);
      console.warn(`  To provision, supply ${config.passKey} (or DEFAULT_TEAM_PASSWORD) in your private environment.`);
      continue;
    }

    console.log(`[Member ${i + 1}] Provisioning ${config.teamRole} (${email}) as ${config.platformRole}...`);

    // 1. Create or retrieve auth.users account via Admin API
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        role: config.platformRole,
      },
    });

    let userId: string;
    if (userError) {
      if (userError.message.toLowerCase().includes('already') && userError.message.toLowerCase().includes('registered')) {
        console.log(`  User account already exists. Looking up ID...`);
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existing = listData?.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
        if (!existing) {
          console.error(`  Could not find existing user ID for ${email}`);
          continue;
        }
        userId = existing.id;
      } else {
        console.error(`  Error creating user: ${userError.message}`);
        continue;
      }
    } else {
      userId = userData.user.id;
    }

    if (config.teamRole === 'TEAM_LEAD') {
      adminLeadId = userId;
    }

    // 2. Ensure profile exists and role matches assigned platformRole
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: name,
        role: config.platformRole,
        status: 'ACTIVE',
      });

    if (profileError) {
      console.error(`  Error setting profile: ${profileError.message}`);
      continue;
    }

    // 3. Assign internal team role in team_members
    const { error: teamError } = await supabaseAdmin
      .from('team_members')
      .upsert(
        {
          user_id: userId,
          email: email.toLowerCase(),
          display_name: name,
          team_role: config.teamRole,
          assigned_by: adminLeadId || userId,
          assigned_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (teamError) {
      console.error(`  Error assigning team_role: ${teamError.message}`);
    } else {
      console.log(`  ✓ Successfully provisioned Member ${i + 1}: ${name} (${config.teamRole} / ${config.platformRole})`);
    }
  }

  console.log('\nTeam provisioning process completed.');
}

provisionTeam().catch((err) => {
  console.error('Fatal error during provisioning:', err);
  process.exit(1);
});
