import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Sin `test.globals: true` en vitest.config.mts, @testing-library/react no
// detecta un `afterEach` global y no limpia el DOM entre tests — hace
// falta registrarlo a mano para que varios `render()` en el mismo
// archivo no se acumulen.
afterEach(() => {
  cleanup();
});
