import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Claves de pega para los tests: src/lib/firebase.ts llama a
// initializeApp()/getAuth() al importarse, y necesita algo en estas
// variables aunque los tests mockeen firebase/auth y nunca lleguen a
// hacer una llamada de red real.
process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??= "test-api-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??= "test.firebaseapp.com";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??= "test-project";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??= "test-project.firebasestorage.app";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??= "000000000000";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??= "1:000000000000:web:0000000000000000000000";

// Sin `test.globals: true` en vitest.config.mts, @testing-library/react no
// detecta un `afterEach` global y no limpia el DOM entre tests — hace
// falta registrarlo a mano para que varios `render()` en el mismo
// archivo no se acumulen.
afterEach(() => {
  cleanup();
});
