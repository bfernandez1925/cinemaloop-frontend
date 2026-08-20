import { describe, expect, it } from "vitest";
import { buildTmdbImageUrl } from "@/lib/tmdb";

describe("buildTmdbImageUrl", () => {
  it("construye la URL de foto de actor con el tamaño de perfil", () => {
    expect(buildTmdbImageUrl("/abc123.jpg", "actor")).toBe(
      "https://image.tmdb.org/t/p/w185/abc123.jpg",
    );
  });

  it("construye la URL de póster de película con el tamaño de póster", () => {
    expect(buildTmdbImageUrl("/xyz789.jpg", "movie")).toBe(
      "https://image.tmdb.org/t/p/w342/xyz789.jpg",
    );
  });
});
