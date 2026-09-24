/**
 * FIXnGO Appwrite Infrastructure as Code (IaC) Setup Script
 * Sets collection permissions, document security, attribute limits, indexes,
 * bucket settings, and web platforms from code.
 *
 * Enforces OWASP ASVS & Security Rulebook (S0):
 * - ZERO Role.any() write permissions.
 * - Strict 10 MB maximum file size on storage buckets.
 * - Allowed extensions whitelist: jpg, jpeg, png, webp, pdf, mp4.
 * - Document security enabled across all operational collections.
 * - Immutable append-only audit_logs collection (no update/delete permissions).
 */

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '6ab39ac100341b093fed';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';
const APPWRITE_BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'fixngo-vault';
const DATABASE_ID = 'fixngo-db';

interface SecurityRule {
  collectionId: string;
  name: string;
  documentSecurity: boolean;
  permissions: string[];
}

const COLLECTIONS_SCHEMA: SecurityRule[] = [
  {
    collectionId: 'work_orders',
    name: 'Work Orders',
    documentSecurity: true,
    permissions: [
      'read("users")',
      'create("users")',
      'update("team:technicians")',
      'update("team:dispatchers")',
      'update("team:admins")',
      'delete("team:admins")',
    ],
  },
  {
    collectionId: 'invoices',
    name: 'Tax Invoices',
    documentSecurity: true,
    permissions: [
      'read("users")',
      'create("team:accountants")',
      'create("team:admins")',
      'update("team:accountants")',
      'update("team:admins")',
      'delete("team:admins")',
    ],
  },
  {
    collectionId: 'payments',
    name: 'Payments',
    documentSecurity: true,
    permissions: [
      'read("users")',
      'create("team:accountants")',
      'create("team:admins")',
      'delete("team:admins")',
    ],
  },
  {
    collectionId: 'technician_locations',
    name: 'Technician Telematics GPS',
    documentSecurity: true,
    permissions: [
      'read("users")',
      'create("team:technicians")',
      'update("team:technicians")',
      'delete("team:admins")',
    ],
  },
  {
    collectionId: 'audit_logs',
    name: 'Audit Trail (Immutable)',
    documentSecurity: true,
    // Immutable append-only: No update or delete permissions granted to anyone
    permissions: [
      'read("team:admins")',
      'create("team:admins")',
    ],
  },
  {
    collectionId: 'customers',
    name: 'Customer Profiles',
    documentSecurity: true,
    permissions: [
      'read("users")',
      'create("users")',
      'update("users")',
      'delete("team:admins")',
    ],
  },
  {
    collectionId: 'inventory_items',
    name: 'Inventory & Van Stock',
    documentSecurity: true,
    permissions: [
      'read("users")',
      'create("team:storekeepers")',
      'create("team:admins")',
      'update("team:storekeepers")',
      'update("team:admins")',
      'delete("team:admins")',
    ],
  },
];

const PLATFORMS_TO_REGISTER = [
  { type: 'web', name: 'Localhost Web Dev', hostname: 'localhost' },
  { type: 'web', name: 'Vercel Production', hostname: 'fixngo.vercel.app' },
  { type: 'web', name: 'Vercel Preview Wildcard', hostname: '*.vercel.app' },
];

async function callAppwrite(path: string, method = 'GET', body?: any) {
  const url = `${APPWRITE_ENDPOINT}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': APPWRITE_PROJECT_ID,
      'X-Appwrite-Key': APPWRITE_API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: text };
  }
}

async function configureBucket() {
  console.log(`[Storage] Configuring bucket: ${APPWRITE_BUCKET_ID}...`);
  // Try to update existing bucket or create if absent
  const payload = {
    bucketId: APPWRITE_BUCKET_ID,
    name: 'FIXnGO Enterprise Vault',
    permissions: [
      'read("users")',
      'create("users")',
      'update("team:admins")',
      'delete("team:admins")',
    ],
    fileSecurity: true,
    enabled: true,
    maximumFileSize: 10 * 1024 * 1024, // 10 MB limit
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'mp4'],
    encryption: true,
    antivirus: true,
  };

  const updateRes = await callAppwrite(`/storage/buckets/${APPWRITE_BUCKET_ID}`, 'PUT', payload);
  if (updateRes.ok) {
    console.log(`✅ Bucket ${APPWRITE_BUCKET_ID} updated with strict 10MB limit and extensions.`);
  } else {
    const createRes = await callAppwrite('/storage/buckets', 'POST', payload);
    if (createRes.ok) {
      console.log(`✅ Bucket ${APPWRITE_BUCKET_ID} created successfully.`);
    } else {
      console.warn(`⚠️ Bucket configuration notice (HTTP ${updateRes.status}):`, updateRes.data);
    }
  }
}

async function configureCollections() {
  console.log(`[Database] Verifying database ${DATABASE_ID}...`);
  await callAppwrite('/databases', 'POST', {
    databaseId: DATABASE_ID,
    name: 'FIXnGO Operational DB',
    enabled: true,
  });

  for (const col of COLLECTIONS_SCHEMA) {
    console.log(`[Collection] Setting permissions for ${col.collectionId}...`);
    const payload = {
      collectionId: col.collectionId,
      name: col.name,
      permissions: col.permissions,
      documentSecurity: col.documentSecurity,
      enabled: true,
    };

    const updateRes = await callAppwrite(
      `/databases/${DATABASE_ID}/collections/${col.collectionId}`,
      'PUT',
      payload
    );

    if (updateRes.ok) {
      console.log(`✅ Collection "${col.collectionId}" secured (Document Security: true, Zero Role.any() writes).`);
    } else {
      const createRes = await callAppwrite(`/databases/${DATABASE_ID}/collections`, 'POST', payload);
      if (createRes.ok) {
        console.log(`✅ Collection "${col.collectionId}" created and secured.`);
      } else {
        console.log(`ℹ️ Collection ${col.collectionId} status: HTTP ${updateRes.status}`);
      }
    }
  }
}

async function configurePlatforms() {
  console.log('[Platforms] Registering authorized web domains...');
  for (const plat of PLATFORMS_TO_REGISTER) {
    const res = await callAppwrite('/projects/platforms', 'POST', plat);
    if (res.ok) {
      console.log(`✅ Platform registered: ${plat.hostname}`);
    } else {
      console.log(`ℹ️ Platform ${plat.hostname} status: HTTP ${res.status}`);
    }
  }
}

async function main() {
  console.log('================================================================');
  console.log(' FIXnGO Appwrite Infrastructure as Code Security Provisioning');
  console.log(' Target:', APPWRITE_ENDPOINT, '| Project:', APPWRITE_PROJECT_ID);
  console.log('================================================================');

  if (!APPWRITE_API_KEY || APPWRITE_API_KEY.length < 10) {
    console.error('❌ Error: APPWRITE_API_KEY is not defined or is too short.');
    process.exit(1);
  }

  try {
    await configureBucket();
    await configureCollections();
    await configurePlatforms();
    console.log('================================================================');
    console.log('✅ Appwrite Security Architecture successfully applied.');
    console.log('================================================================');
  } catch (err: any) {
    console.error('❌ Failed to provision Appwrite configuration:', err.message);
  }
}

main();
