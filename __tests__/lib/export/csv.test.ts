import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCSV } from '@/lib/export/csv';

describe('exportToCSV', () => {
  let clickSpy: ReturnType<typeof vi.fn>;
  let capturedBlobParts: BlobPart[] | undefined;
  const RealBlob = globalThis.Blob;
  const realCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    capturedBlobParts = undefined;
    clickSpy = vi.fn();

    class SpyBlob extends RealBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        capturedBlobParts = parts;
      }
    }
    vi.stubGlobal('Blob', SpyBlob);
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:test'),
      revokeObjectURL: vi.fn(),
    });

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreateElement(tag) as HTMLAnchorElement;
      if (tag === 'a') el.click = clickSpy as unknown as () => void;
      return el;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function csvText() {
    expect(capturedBlobParts).toBeDefined();
    return (capturedBlobParts as string[]).join('');
  }

  it('returns early on empty data without creating a blob', () => {
    exportToCSV([], 'empty');
    expect(capturedBlobParts).toBeUndefined();
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('writes a BOM + header row + data rows', () => {
    exportToCSV([{ name: 'Ana', age: 10 }, { name: 'Bia', age: 11 }], 'users');
    const text = csvText();
    expect(text.startsWith('\uFEFF')).toBe(true);
    expect(text).toContain('name,age');
    expect(text).toContain('Ana,10');
    expect(text).toContain('Bia,11');
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('quotes values containing commas, quotes, or newlines', () => {
    exportToCSV(
      [{ text: 'hello, world', note: 'she said "hi"', multi: 'a\nb' }],
      'quotes'
    );
    const text = csvText();
    expect(text).toContain('"hello, world"');
    expect(text).toContain('"she said ""hi"""');
    expect(text).toContain('"a\nb"');
  });

  it('treats null and undefined as empty strings', () => {
    exportToCSV([{ a: null, b: undefined, c: 'x' }], 'nulls');
    const text = csvText();
    expect(text).toContain(',,x');
  });
});
