import * as T from 'three';

/** Small, tileable surface maps; generated once, with no additional asset download. */
export function createShoeSurfaces() {
  const size = 128;
  const make = (woven: boolean) => {
    const heights = new Float32Array(size * size);
    let seed = 1982;
    const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      heights[y * size + x] = woven
        ? .5 + .18 * Math.sin(x * Math.PI / 4) * Math.cos(y * Math.PI / 4) + random() * .04
        : .35 + random() * .3;
    }
    const pixels = new Uint8Array(size * size * 4);
    const at = (x: number, y: number) => heights[((y + size) % size) * size + (x + size) % size];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = (at(x - 1, y) - at(x + 1, y)) * .65;
      const dy = (at(x, y - 1) - at(x, y + 1)) * .65;
      const length = Math.hypot(dx, dy, 1), i = (y * size + x) * 4;
      pixels[i] = Math.round((dx / length * .5 + .5) * 255);
      pixels[i + 1] = Math.round((dy / length * .5 + .5) * 255);
      pixels[i + 2] = Math.round((1 / length * .5 + .5) * 255);
      pixels[i + 3] = 255;
    }
    const texture = new T.DataTexture(pixels, size, size);
    texture.wrapS = texture.wrapT = T.RepeatWrapping;
    texture.repeat.setScalar(woven ? 10 : 7);
    texture.magFilter = T.LinearFilter;
    texture.minFilter = T.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    return texture;
  };
  return { leather: make(false), fabric: make(true) };
}
