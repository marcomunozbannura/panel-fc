/* ==========================================================================
   GP · cifrado del lado del cliente · Grupo Progestion
   PBKDF2-SHA256 (deriva 64B) + AES-256-CBC + HMAC-SHA256 (encrypt-then-MAC).
   Compatible con el cifrado hecho en PowerShell (.NET Framework 4.x).
   La contraseña NUNCA se guarda: solo se conserva la clave derivada en sesion.
   ========================================================================== */
(function () {
  const G = (window.GPCrypto = {});

  const b64toBytes = (b64) => {
    const bin = atob(b64);
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  };
  const bytesToB64 = (buf) => {
    const a = new Uint8Array(buf);
    let s = "";
    for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]);
    return btoa(s);
  };
  G.b64toBytes = b64toBytes;
  G.bytesToB64 = bytesToB64;

  // Deriva 64 bytes desde la contrasena (32 -> AES-256, 32 -> HMAC-256)
  G.deriveKeyBytes = async function (password, saltBytes, iter) {
    const base = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: saltBytes, iterations: iter, hash: "SHA-256" },
      base,
      512
    );
    return new Uint8Array(bits);
  };

  // Importa las 2 claves (AES + HMAC) a partir de los 64 bytes derivados
  G.importKeys = async function (keyBytes) {
    const aes = await crypto.subtle.importKey(
      "raw",
      keyBytes.slice(0, 32),
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );
    const mac = await crypto.subtle.importKey(
      "raw",
      keyBytes.slice(32, 64),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    return { aes, mac };
  };

  // Verifica HMAC(iv || ct) == tag  y luego descifra -> Uint8Array (bytes en claro)
  G.decryptBlob = async function (keys, blob) {
    const iv = b64toBytes(blob.iv),
      ct = b64toBytes(blob.ct),
      tag = b64toBytes(blob.tag);
    const signed = new Uint8Array(iv.length + ct.length);
    signed.set(iv, 0);
    signed.set(ct, iv.length);
    const ok = await crypto.subtle.verify("HMAC", keys.mac, tag, signed);
    if (!ok) throw new Error("BAD_KEY");
    const pt = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, keys.aes, ct);
    return new Uint8Array(pt);
  };

  G.decryptText = async function (keys, blob) {
    return new TextDecoder("utf-8").decode(await G.decryptBlob(keys, blob));
  };
})();
