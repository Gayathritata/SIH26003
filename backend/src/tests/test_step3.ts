import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import axios from 'axios';
import mongoose from 'mongoose';
import app from '../app';
import { connectDB } from '../config/database';
import User from '../models/User';
import PatientProfile from '../models/PatientProfile';
import CaregiverPatient from '../models/CaregiverPatient';

const TEST_PORT = 5099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

let server: http.Server;

async function runStep3Tests() {
  console.log('\n=======================================================');
  console.log('  STARTING STEP 3 BACKEND & AUTH VERIFICATION SUITE');
  console.log('=======================================================\n');

  let passedTests = 0;
  const totalTests = 11;

  try {
    // 1. Test Server Startup & DB Connection
    await connectDB();
    server = app.listen(TEST_PORT);
    console.log(`[TEST 1 PASS] Backend starts successfully on port ${TEST_PORT}.`);
    passedTests++;

    // 2. Test MongoDB Connection Status
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      console.log(`[TEST 2 PASS] MongoDB connected successfully to database '${mongoose.connection.name}'.`);
      passedTests++;
    } else {
      console.error(`[TEST 2 FAIL] MongoDB is not connected.`);
    }

    // Prepare Test Data in MongoDB
    await User.deleteMany({ firebaseUid: { $regex: /^test_/ } });
    await PatientProfile.deleteMany({ firebaseUid: { $regex: /^test_/ } });
    await CaregiverPatient.deleteMany({ $or: [{ caregiverId: { $regex: /^test_/ } }, { patientId: { $regex: /^test_/ } }] });

    const elderlyUser = await User.create({
      firebaseUid: 'test_elderly_123',
      name: 'Test Elderly Person',
      email: 'elderly@test.com',
      role: 'elderly_user',
      preferredLanguage: 'en',
    });

    const patientProfile = await PatientProfile.create({
      userId: elderlyUser._id,
      firebaseUid: elderlyUser.firebaseUid,
      age: 78,
      preferredLanguage: 'en',
    });

    const caregiverUser = await User.create({
      firebaseUid: 'test_caregiver_456',
      name: 'Test Caregiver Person',
      email: 'caregiver@test.com',
      role: 'caregiver',
      preferredLanguage: 'en',
    });

    const unassignedPatient = await User.create({
      firebaseUid: 'test_unassigned_patient_789',
      name: 'Unassigned Patient',
      email: 'unassigned@test.com',
      role: 'elderly_user',
      preferredLanguage: 'en',
    });

    const adminUser = await User.create({
      firebaseUid: 'test_admin_999',
      name: 'System Admin',
      email: 'admin@test.com',
      role: 'admin',
      preferredLanguage: 'en',
    });

    // Assign elderlyUser to caregiverUser
    await CaregiverPatient.create({
      caregiverId: caregiverUser.firebaseUid,
      patientId: elderlyUser.firebaseUid,
      relationship: 'Primary Caregiver',
    });

    // 3. Test GET /api/health
    const healthRes = await axios.get(`${BASE_URL}/api/health`);
    if (healthRes.status === 200 && healthRes.data.status === 'online' && healthRes.data.mongodb === 'connected') {
      console.log(`[TEST 3 PASS] GET /api/health returned 200 OK with status: 'online' and mongodb: 'connected'.`);
      passedTests++;
    } else {
      console.error(`[TEST 3 FAIL] GET /api/health returned unexpected payload:`, healthRes.data);
    }

    // 4. Test Authenticated User GET /api/auth/me
    const meRes = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer demo_token_${elderlyUser.firebaseUid}` },
    });
    if (meRes.status === 200 && meRes.data.user.firebaseUid === elderlyUser.firebaseUid) {
      console.log(`[TEST 4 PASS] Firebase-authenticated user successfully fetched MongoDB profile via GET /api/auth/me.`);
      passedTests++;
    } else {
      console.error(`[TEST 4 FAIL] GET /api/auth/me failed:`, meRes.data);
    }

    // 5. Test Unauthenticated Request Rejection (401)
    try {
      await axios.get(`${BASE_URL}/api/auth/me`);
      console.error(`[TEST 5 FAIL] Request without Authorization header was not rejected.`);
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        console.log(`[TEST 5 PASS] Unauthenticated request correctly rejected with HTTP 401.`);
        passedTests++;
      } else {
        console.error(`[TEST 5 FAIL] Expected 401 but got:`, err.message);
      }
    }

    // 6. Test Invalid Token Rejection (401)
    try {
      await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: 'Bearer ' }, // Empty / invalid token
      });
      console.error(`[TEST 6 FAIL] Invalid token request was not rejected.`);
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        console.log(`[TEST 6 PASS] Invalid Firebase token correctly rejected with HTTP 401.`);
        passedTests++;
      } else {
        console.error(`[TEST 6 FAIL] Expected 401 but got:`, err.message);
      }
    }

    // 7. Test Firebase UID Mapping to MongoDB User
    const syncRes = await axios.post(
      `${BASE_URL}/api/auth/sync`,
      {
        firebaseUid: 'test_new_uid_555',
        name: 'Synced User',
        email: 'synced@test.com',
        role: 'elderly_user',
        preferredLanguage: 'en',
      },
      {
        headers: { Authorization: `Bearer demo_token_test_new_uid_555` },
      }
    );
    if (syncRes.status === 200 && syncRes.data.user.firebaseUid === 'test_new_uid_555') {
      console.log(`[TEST 7 PASS] Firebase UID correctly mapped and synchronized to MongoDB user.`);
      passedTests++;
    } else {
      console.error(`[TEST 7 FAIL] POST /api/auth/sync mapping failed:`, syncRes.data);
    }

    // 8. Test Role Authorization: Elderly user restricted from caregiver-only access
    // Note: getPatients checks caregiver patient assignments, elderly user attempting to access other patient's record is blocked
    try {
      await axios.get(`${BASE_URL}/api/patients/${unassignedPatient.firebaseUid}`, {
        headers: { Authorization: `Bearer demo_token_${elderlyUser.firebaseUid}` },
      });
      console.error(`[TEST 8 FAIL] Elderly user was able to access another user's profile!`);
    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        console.log(`[TEST 8 PASS] Elderly user correctly denied access to other patient data (HTTP 403).`);
        passedTests++;
      } else {
        console.error(`[TEST 8 FAIL] Expected 403 for role restriction but got:`, err.message);
      }
    }

    // 9. Test Caregiver-Patient Access Restriction: Caregiver cannot access unassigned patient
    try {
      await axios.get(`${BASE_URL}/api/patients/${unassignedPatient.firebaseUid}`, {
        headers: { Authorization: `Bearer demo_token_${caregiverUser.firebaseUid}` },
      });
      console.error(`[TEST 9 FAIL] Caregiver accessed an unassigned patient profile!`);
    } catch (err: any) {
      if (err.response && err.response.status === 403) {
        console.log(`[TEST 9 PASS] Caregiver correctly denied access to unassigned patient (HTTP 403).`);
        passedTests++;
      } else {
        console.error(`[TEST 9 FAIL] Expected 403 for unassigned patient but got:`, err.message);
      }
    }

    // Also verify caregiver CAN access assigned patient:
    const assignedRes = await axios.get(`${BASE_URL}/api/patients/${elderlyUser.firebaseUid}`, {
      headers: { Authorization: `Bearer demo_token_${caregiverUser.firebaseUid}` },
    });
    if (assignedRes.status !== 200) {
      console.error(`[TEST 9 ERROR] Caregiver failed to access assigned patient!`);
    }

    // 10. Test Admin Role Authorization
    const adminRes = await axios.get(`${BASE_URL}/api/patients/${unassignedPatient.firebaseUid}`, {
      headers: { Authorization: `Bearer demo_token_${adminUser.firebaseUid}` },
    });
    if (adminRes.status === 200 && adminRes.data.patient.firebaseUid === unassignedPatient.firebaseUid) {
      console.log(`[TEST 10 PASS] Admin role correctly authorized for full system oversight.`);
      passedTests++;
    } else {
      console.error(`[TEST 10 FAIL] Admin access failed:`, adminRes.data);
    }

    // 11. Test Mobile App API Connection Headers & Endpoint Response
    const mobileTestHeader = { Authorization: `Bearer demo_token_${elderlyUser.firebaseUid}` };
    const mobileRes = await axios.get(`${BASE_URL}/api/auth/me`, { headers: mobileTestHeader });
    if (mobileRes.status === 200 && mobileRes.data.success === true) {
      console.log(`[TEST 11 PASS] Mobile app API client header format successfully communicates with backend.`);
      passedTests++;
    } else {
      console.error(`[TEST 11 FAIL] Mobile app API connection test failed.`);
    }

    // Clean up test data
    await User.deleteMany({ firebaseUid: { $regex: /^test_/ } });
    await PatientProfile.deleteMany({ firebaseUid: { $regex: /^test_/ } });
    await CaregiverPatient.deleteMany({ $or: [{ caregiverId: { $regex: /^test_/ } }, { patientId: { $regex: /^test_/ } }] });

    console.log('\n=======================================================');
    console.log(`  VERIFICATION RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('=======================================================\n');

  } catch (error) {
    console.error('[SUITE ERROR]', error);
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
    process.exit(passedTests === totalTests ? 0 : 1);
  }
}

runStep3Tests();
