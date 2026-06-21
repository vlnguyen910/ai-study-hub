import { ResponseDto } from './response.dto';

describe('ResponseDto', () => {
  it('sets fields and defaults data to null when omitted', () => {
    const dto = new ResponseDto(true, 'ok');
    expect(dto.success).toBe(true);
    expect(dto.message).toBe('ok');
    expect(dto.data).toBeNull();
    expect(dto.errors).toBeNull();
  });

  it('accepts data when provided', () => {
    const dto = new ResponseDto(false, 'err', { a: 1 }, ['detail']);
    expect(dto.data).toEqual({ a: 1 });
    expect(dto.errors).toEqual(['detail']);
  });
});
