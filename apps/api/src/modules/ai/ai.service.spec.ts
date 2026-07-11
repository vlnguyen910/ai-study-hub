import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';
import { aiConfiguration } from '../../config/ai.config';
import { ServiceUnavailableException } from '@nestjs/common';

describe('AIService', () => {
  let service: AIService;
  let mockGetGenerativeModel: jest.Mock;
  let mockGenerateContent: jest.Mock;
  let mockEmbedContent: jest.Mock;
  let mockBatchEmbedContents: jest.Mock;

  beforeEach(async () => {
    mockGenerateContent = jest.fn();
    mockEmbedContent = jest.fn();
    mockBatchEmbedContents = jest.fn();
    mockGetGenerativeModel = jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
      embedContent: mockEmbedContent,
      batchEmbedContents: mockBatchEmbedContents,
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

  it('throws ServiceUnavailableException before provider call when API key is missing', async () => {
    const serviceWithoutKey = new AIService({ apiKey: '' } as any);

    await expect(serviceWithoutKey.generateText('hello')).rejects.toThrow(
      ServiceUnavailableException,
    );
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

  describe('getEmbedding', () => {
    it('throws ServiceUnavailableException before provider call when API key is missing', async () => {
      const serviceWithoutKey = new AIService({ apiKey: '' } as any);
      (serviceWithoutKey as any).genAI = {
        getGenerativeModel: mockGetGenerativeModel,
      };

      await expect(serviceWithoutKey.getEmbedding('hello')).rejects.toThrow(
        ServiceUnavailableException,
      );
      expect(mockEmbedContent).not.toHaveBeenCalled();
    });

    it('returns embedding values on success', async () => {
      mockEmbedContent.mockResolvedValue({
        embedding: {
          values: [0.1, 0.2, 0.3],
        },
      });

      const result = await service.getEmbedding('hello');

      expect(result).toEqual([0.1, 0.2, 0.3]);
      expect(mockEmbedContent).toHaveBeenCalledWith('hello');
    });

    it('wraps embedding provider errors as ServiceUnavailableException', async () => {
      mockEmbedContent.mockRejectedValue(new Error('Invalid API key'));

      await expect(service.getEmbedding('hello')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe('getEmbeddings', () => {
    it('returns embeddings in the same order as the input texts', async () => {
      mockBatchEmbedContents.mockResolvedValue({
        embeddings: [{ values: [0.1, 0.2] }, { values: [0.3, 0.4] }],
      });

      const result = await service.getEmbeddings(['first', 'second']);

      expect(result).toEqual([
        [0.1, 0.2],
        [0.3, 0.4],
      ]);
      expect(mockBatchEmbedContents).toHaveBeenCalledWith({
        requests: [
          {
            content: { role: 'user', parts: [{ text: 'first' }] },
          },
          {
            content: { role: 'user', parts: [{ text: 'second' }] },
          },
        ],
      });
    });

    it('returns an empty array without calling Gemini for empty input', async () => {
      await expect(service.getEmbeddings([])).resolves.toEqual([]);
      expect(mockBatchEmbedContents).not.toHaveBeenCalled();
    });

    it('retries a rate-limited embedding batch', async () => {
      const rateLimitError = new Error('429 Please retry in 12.5s.');
      (rateLimitError as any).status = 429;
      mockBatchEmbedContents
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce({
          embeddings: [{ values: [0.1, 0.2] }],
        });
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        callback();
        return {} as any;
      });

      await expect(service.getEmbeddings(['retry me'])).resolves.toEqual([
        [0.1, 0.2],
      ]);
      expect(mockBatchEmbedContents).toHaveBeenCalledTimes(2);
    });
  });
});
