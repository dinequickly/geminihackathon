import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const API_KEY = process.env.TAVUS_API_KEY;
const REPLICA_ID = process.env.TAVUS_REPLICA_ID;
const PERSONA_ID = process.env.TAVUS_PERSONA_ID;

console.log('--- Config Check ---');
console.log('API Key exists:', !!API_KEY);
console.log('Replica ID:', REPLICA_ID);
console.log('Persona ID:', PERSONA_ID);

async function checkTavus() {
  if (!API_KEY) {
    console.error('Missing API Key');
    return;
  }

  console.log('\n--- 1. Testing Auth (List Replicas) ---');
  try {
    const response = await fetch('https://tavusapi.com/v2/replicas', {
      headers: { 'x-api-key': API_KEY }
    });
    
    if (!response.ok) {
      console.error('List Replicas Failed:', response.status, response.statusText);
      console.error(await response.text());
    } else {
      const data = await response.json();
      console.log('Success! Found', data.data?.length, 'replicas.');
      
      const foundReplica = data.data?.find((r: any) => r.replica_id === REPLICA_ID);
      if (foundReplica) {
        console.log('✅ Configured Replica ID found in list:', foundReplica.replica_name);
      } else {
        console.warn('⚠️ Configured Replica ID NOT found in list. Available IDs:');
        data.data?.forEach((r: any) => console.log(`- ${r.replica_id} (${r.replica_name})`));
      }
    }
  } catch (err) {
    console.error('List Replicas Network Error:', err);
  }

  console.log('\n--- 2. Testing Persona (List Personas) ---');
  try {
    const response = await fetch('https://tavusapi.com/v2/personas', {
      headers: { 'x-api-key': API_KEY }
    });
    
    if (!response.ok) {
      console.error('List Personas Failed:', response.status, response.statusText);
      console.error(await response.text());
    } else {
      const data = await response.json();
      console.log('Success! Found', data.data?.length, 'personas.');
      
      const foundPersona = data.data?.find((p: any) => p.persona_id === PERSONA_ID);
      if (foundPersona) {
        console.log('✅ Configured Persona ID found in list:', foundPersona.persona_name);
      } else {
        console.warn('⚠️ Configured Persona ID NOT found in list. Available IDs:');
        data.data?.forEach((p: any) => console.log(`- ${p.persona_id} (${p.persona_name})`));
      }
    }
  } catch (err) {
    console.error('List Personas Network Error:', err);
  }
}

checkTavus();
