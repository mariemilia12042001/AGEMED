/**
 * CONTEXTO DE SEGURIDAD PARA ENTORNOS MÉDICOS (AGEMED)
 * 
 * Este módulo implementa criptografía del lado del cliente utilizando la Web Crypto API del navegador.
 * Tipo de algoritmo: AES-GCM (criptografía simétrica basada en autenticación) de 256 bits.
 * Derivación de clave: PBKDF2 con SHA-256 y un "salt" pseudoaleatorio de 16 bytes.
 * 
 * NOTA PARA PRODUCCIÓN: En un entorno de producción real:
 * 1. Las claves de cifrado y descifrado no deben gestionarse únicamente en el frontend.
 * 2. Un backend seguro debe validar el inicio de sesión y la autorización a través de MFA/OAuth.
 * 3. Las claves criptográficas deben derivarse o recuperarse mediante protocolos de intercambio de claves seguros (como ECDH)
 *    u obtenerse temporalmente en memoria a través de tokens firmados que expiren rápidamente.
 * 4. Los logs de auditoría e integridad de datos deben estar implementados en la base de datos centralizada.
 */

interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  salt: string;
}

/**
 * Deriva una clave criptográfica de 256 bits a partir de una contraseña / PIN utilizando PBKDF2.
 */
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Importar la contraseña como clave base de importación
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Derivar la clave AES-GCM de 256 bits
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 80000, // Número de iteraciones para dificultar ataques de fuerza bruta
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Cifra una cadena de texto plano con una contraseña/PIN usando AES-GCM.
 * Devuelve el texto cifrado, el vector de inicialización (IV) y el salt en formato hexadecimal.
 */
export async function encryptData(data: string, password: string): Promise<EncryptedPayload> {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Generar Salt e IV criptográficamente seguros
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // IV estándar de 12 bytes para GCM

    const key = await deriveKeyFromPassword(password, salt);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      dataBuffer
    );

    // Función auxiliar para convertir ArrayBuffer a cadena hexadecimal
    const bufferToHex = (buffer: ArrayBuffer) => {
      return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    };

    return {
      ciphertext: bufferToHex(ciphertextBuffer),
      iv: bufferToHex(iv),
      salt: bufferToHex(salt),
    };
  } catch (error) {
    console.error("Error durante el cifrado de datos:", error);
    throw new Error("No se pudo cifrar la información sensible.");
  }
}

/**
 * Descifra una cadena cifrada utilizando los componentes hexadecimales y el PIN de desbloqueo.
 */
export async function decryptData(
  ciphertextHex: string,
  ivHex: string,
  saltHex: string,
  password: string
): Promise<string> {
  try {
    // Convertir de hexadecimal de vuelta a buffers binarios
    const hexToBytes = (hex: string) => {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
      }
      return bytes;
    };

    const salt = hexToBytes(saltHex);
    const iv = hexToBytes(ivHex);
    const ciphertext = hexToBytes(ciphertextHex);

    const key = await deriveKeyFromPassword(password, salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("Error de descifrado (clave incorrecta o integridad dañada):", error);
    throw new Error("PIN de seguridad incorrecto u operación no autorizada.");
  }
}
