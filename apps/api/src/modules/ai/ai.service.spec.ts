import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';
import { aiConfiguration } from '../../config/ai.config';
import { ServiceUnavailableException } from '@nestjs/common';

describe('AIService', () => {
  let service: AIService;
  let mockGetGenerativeModel: jest.Mock;
  let mockGenerateContent: jest.Mock;

  beforeEach(async () => {
    mockGenerateContent = jest.fn();
    mockGetGenerativeModel = jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: aiConfiguration.KEY,
          useValue: {
            apiKey: 'test-api-key',
          },
        },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
    (service as any).genAI = {
      getGenerativeModel: mockGetGenerativeModel,
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateText', () => {
    it('returns generated text on successful first attempt', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => 'Hello from Gemini',
        },
      });

      const result = await service.generateText('hello');
      expect(result).toBe('Hello from Gemini');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('retries on retryable errors and succeeds', async () => {
      const retryableError = new Error('Service Unavailable (503)');
      (retryableError as any).status = 503;

      mockGenerateContent
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValueOnce({
          response: {
            text: () => 'Recovered Hello',
          },
        });

      jest.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
        fn();
        return {} as any;
      });

      const result = await service.generateText('hello');
      expect(result).toBe('Recovered Hello');
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    it('retries up to 3 times on retryable errors and throws ServiceUnavailableException', async () => {
      const retryableError = new Error('Rate limit exceeded (429)');
      (retryableError as any).status = 429;

      mockGenerateContent.mockRejectedValue(retryableError);

      jest.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
        fn();
        return {} as any;
      });

      await expect(service.generateText('hello')).rejects.toThrow(
        ServiceUnavailableException,
      );
      expect(mockGenerateContent).toHaveBeenCalledTimes(3);
    });

    it('fails immediately and does not retry on non-retryable errors', async () => {
      const nonRetryableError = new Error('API key invalid (400)');
      (nonRetryableError as any).status = 400;

      mockGenerateContent.mockRejectedValue(nonRetryableError);

      jest.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
        fn();
        return {} as any;
      });

      await expect(service.generateText('hello')).rejects.toThrow(
        ServiceUnavailableException,
      );
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });
  });
});
