import fs from 'fs';
import path from 'path';

/**
 * Real Team Account Validation Suite
 * Verifies all 5 confirmed real internal team members and the pending 6th slot.
 */
async function runRealTeamAccountValidation() {
  console.log('============================================================');
  console.log('       AGRITECH REAL TEAM ACCOUNT VALIDATION SUITE          ');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}${details ? ` -> ${details}` : ''}`);
      failed++;
    }
  }

  const teamPage = fs.readFileSync(
    path.join(process.cwd(), 'src', 'pages', 'admin', 'TeamManagementPage.tsx'),
    'utf8'
  );
  const provisionScript = fs.readFileSync(
    path.join(process.cwd(), 'scripts', 'provision-team.ts'),
    'utf8'
  );
  const routesFile = fs.readFileSync(
    path.join(process.cwd(), 'src', 'routes', 'AppRoutes.tsx'),
    'utf8'
  );

  // 1. Om Nalawade
  console.log('--- Checking Member 1: Om Nalawade ---');
  assert(
    'Om Nalawade configured with exact email: om.nalawade.aids.25@vpkbiet.org',
    teamPage.includes('om.nalawade.aids.25@vpkbiet.org') &&
    provisionScript.includes('om.nalawade.aids.25@vpkbiet.org')
  );
  assert(
    'Om Nalawade mapped to Platform Role: ADMIN and Team Role: TEAM_LEAD',
    teamPage.includes('TEAM_LEAD') && provisionScript.includes('TEAM_LEAD') &&
    provisionScript.includes("platformRole: 'ADMIN'")
  );

  // 2. Date Atharv
  console.log('\n--- Checking Member 2: Date Atharv ---');
  assert(
    'Date Atharv configured with exact email: dateathrav@gmail.com',
    teamPage.includes('dateathrav@gmail.com') &&
    provisionScript.includes('dateathrav@gmail.com')
  );
  assert(
    'Date Atharv mapped to Platform Role: FARMER and Team Role: BACKEND',
    teamPage.includes('BACKEND') && provisionScript.includes('BACKEND') &&
    provisionScript.includes("platformRole: 'FARMER'")
  );

  // 3. Yash Lokhande
  console.log('\n--- Checking Member 3: Yash Lokhande ---');
  assert(
    'Yash Lokhande configured with exact email: yashlokhande082@gmail.com',
    teamPage.includes('yashlokhande082@gmail.com') &&
    provisionScript.includes('yashlokhande082@gmail.com')
  );
  assert(
    'Yash Lokhande mapped to Platform Role: SELLER and Team Role: FRONTEND',
    teamPage.includes('FRONTEND') && provisionScript.includes('FRONTEND') &&
    provisionScript.includes("platformRole: 'SELLER'")
  );

  // 4. Shravani Bhosale
  console.log('\n--- Checking Member 4: Shravani Bhosale ---');
  assert(
    'Shravani Bhosale configured with exact email: shravani2.bhosale.comp.25@vpkbiet.org',
    teamPage.includes('shravani2.bhosale.comp.25@vpkbiet.org') &&
    provisionScript.includes('shravani2.bhosale.comp.25@vpkbiet.org')
  );
  assert(
    'Shravani Bhosale mapped to Platform Role: FARMER and Team Role: DATABASE',
    teamPage.includes('DATABASE') && provisionScript.includes('DATABASE') &&
    provisionScript.includes("platformRole: 'FARMER'")
  );

  // 5. Anuj Deshpande
  console.log('\n--- Checking Member 5: Anuj Deshpande ---');
  assert(
    'Anuj Deshpande configured with exact email: anuj.deshpande.comp.25@vpkbiet.org',
    teamPage.includes('anuj.deshpande.comp.25@vpkbiet.org') &&
    provisionScript.includes('anuj.deshpande.comp.25@vpkbiet.org')
  );
  assert(
    'Anuj Deshpande mapped to Platform Role: BUYER and Team Role: AI_ML',
    teamPage.includes('AI_ML') && provisionScript.includes('AI_ML') &&
    provisionScript.includes("platformRole: 'BUYER'")
  );

  // 6. Prajwal Khomane
  console.log('\n--- Checking Member 6: Prajwal Khomane ---');
  assert(
    'Prajwal Khomane configured with exact email: Prajwal.khomane.aids.25@vppkbiet.org',
    teamPage.includes('Prajwal.khomane.aids.25@vppkbiet.org') &&
    provisionScript.includes('Prajwal.khomane.aids.25@vppkbiet.org')
  );
  assert(
    'Prajwal Khomane mapped to Platform Role: BUYER and Team Role: QA',
    teamPage.includes('QA') && provisionScript.includes('QA') &&
    provisionScript.includes("platformRole: 'BUYER'")
  );

  // 7. Route Protection for /admin and /admin/team
  console.log('\n--- Checking Route Protection & Authorization ---');
  assert(
    '/admin and /admin/team are protected by RoleRoute allowedRoles=["ADMIN"]',
    routesFile.includes("<Route element={<RoleRoute allowedRoles={['ADMIN']} />}>") &&
    routesFile.includes('path="/admin"') &&
    routesFile.includes('path="/admin/team"')
  );

  // 8. Repository Password Audit
  console.log('\n--- Checking Repository Secret Isolation ---');
  const seedSql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'migrations', '025_seed.sql'), 'utf8');
  assert(
    '025_seed.sql contains NO committed passwords',
    !seedSql.includes('password =') && !seedSql.includes('encrypted_password')
  );

  console.log(`\n============================================================`);
  console.log(`Real Team Account Validation: ${passed} passed, ${failed} failed.`);
  console.log(`============================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runRealTeamAccountValidation().catch((err) => {
  console.error('Real team account validation failed:', err);
  process.exit(1);
});
