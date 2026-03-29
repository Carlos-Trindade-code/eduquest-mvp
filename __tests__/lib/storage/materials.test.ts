import { describe, it, expect } from 'vitest';
import { getFileIcon, formatFileSize } from '@/lib/storage/materials';

describe('getFileIcon', () => {
  it('returns image icon for image types', () => {
    expect(getFileIcon('image/jpeg')).toBe('🖼️');
    expect(getFileIcon('image/png')).toBe('🖼️');
    expect(getFileIcon('image/webp')).toBe('🖼️');
  });

  it('returns PDF icon for PDF', () => {
    expect(getFileIcon('application/pdf')).toBe('📕');
  });

  it('returns doc icon for Word documents', () => {
    expect(getFileIcon('application/msword')).toBe('📝');
    expect(getFileIcon('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe('📝');
  });

  it('returns generic icon for null or unknown type', () => {
    expect(getFileIcon(null)).toBe('📄');
    expect(getFileIcon('application/zip')).toBe('📄');
  });
});

describe('formatFileSize', () => {
  it('returns empty string for null', () => {
    expect(formatFileSize(null)).toBe('');
  });

  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(512 * 1024)).toBe('512 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });
});
