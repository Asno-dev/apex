async function check() {
  try {
    const res = await fetch("http://localhost:3000/sandbox/health");
    console.log("Status:", res.status);
    console.log("Body:", await res.json());
  } catch (e: any) {
    console.log("Failed to connect to server:", e.message);
  }
}
check();
