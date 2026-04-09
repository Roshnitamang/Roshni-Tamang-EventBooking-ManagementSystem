async function testReset() {
  try {
    const response = await fetch('http://localhost:4000/api/auth/send-reset-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'ghisingrosnee207@gmail.com' })
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.error("HTTP error:", text);
      return;
    }
    
    const data = await response.json();
    console.log("Response:", data);
  } catch (e) {
    console.error("Fetch error:", e.message);
  }
}

testReset();
