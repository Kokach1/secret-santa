// Native fetch used

async function testAuth() {
    console.log('1. Requesting Magic Link...');
    try {
        const res = await fetch('http://localhost:5000/auth/request-magic-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'student@cek.ac.in' })
        });
        const data = await res.json();
        console.log('Response:', data);
    } catch (e) {
        console.error('Failed to request link:', e);
    }
}

testAuth();
