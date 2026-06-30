function b64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function deriveKey(password, salt, iterations) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

async function tryUnlock(password) {
  const { salt, iv, ciphertext, iterations } = ENCRYPTED_PAYLOAD;
  const key = await deriveKey(password, b64ToBytes(salt), iterations);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(iv) },
    key,
    b64ToBytes(ciphertext)
  );
  return new TextDecoder().decode(decrypted);
}

function showSite(html) {
  document.getElementById("lock-screen").remove();
  const main = document.getElementById("site-content");
  main.innerHTML = html;
  main.hidden = false;
  document.title = "Carles Civit — Portfolio";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("unlock-form");
  const input = document.getElementById("password-input");
  const error = document.getElementById("unlock-error");

  // Optional: skip the prompt if previously unlocked this session.
  const cached = sessionStorage.getItem("site-key");
  if (cached) {
    tryUnlock(cached).then(showSite).catch(() => sessionStorage.removeItem("site-key"));
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.textContent = "";
    const password = input.value;
    try {
      const html = await tryUnlock(password);
      sessionStorage.setItem("site-key", password);
      showSite(html);
    } catch (err) {
      error.textContent = "Incorrect password.";
      input.value = "";
      input.focus();
    }
  });
});
