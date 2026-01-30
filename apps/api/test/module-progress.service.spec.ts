import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ModuleProgressService } from '../src/module-progress/module-progress.service';
import { ModuleProgress, ProgressStatus } from '../src/module-progress/entities/module-progress.entity';

describe('ModuleProgressService - Unit Tests', () => {
  let service: ModuleProgressService;
  let model: Model<ModuleProgress>;

  // Mock data
  const mockObjectId = new Types.ObjectId();
  const mockApprenantId = new Types.ObjectId();
  const mockModuleId = new Types.ObjectId();
  const mockEnrollmentId = new Types.ObjectId();

  const mockModuleProgress = {
    _id: mockObjectId,
    apprenantId: mockApprenantId,
    moduleId: mockModuleId,
    enrollmentId: mockEnrollmentId,
    progressPercentage: 50,
    status: ProgressStatus.IN_PROGRESS,
    isLocked: false,
    startedAt: new Date(),
    completedAt: null,
  };

  // Mock model methods
  const mockModuleProgressModel = {
    findOneAndUpdate: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleProgressService,
        {
          provide: getModelToken(ModuleProgress.name),
          useValue: mockModuleProgressModel,
        },
      ],
    }).compile();

    service = module.get<ModuleProgressService>(ModuleProgressService);
    model = module.get<Model<ModuleProgress>>(getModelToken(ModuleProgress.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateOrCreate', () => {
    it('should create new progress when it does not exist', async () => {
      const progressData = {
        apprenantId: mockApprenantId,
        moduleId: mockModuleId,
        enrollmentId: mockEnrollmentId,
        progressPercentage: 25,
        status: ProgressStatus.IN_PROGRESS,
        isLocked: false,
      };

      const expectedResult = {
        ...mockModuleProgress,
        ...progressData,
      };

      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue(expectedResult);

      const result = await service.updateOrCreate(
        progressData.apprenantId,
        progressData.moduleId,
        progressData.enrollmentId,
        progressData.progressPercentage,
        progressData.status,
        progressData.isLocked,
      );

      expect(mockModuleProgressModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          apprenantId: progressData.apprenantId,
          moduleId: progressData.moduleId,
          enrollmentId: progressData.enrollmentId,
        },
        {
          $set: {
            progressPercentage: progressData.progressPercentage,
            status: progressData.status,
            isLocked: progressData.isLocked,
          },
        },
        { upsert: true, new: true },
      );

      expect(result).toEqual(expectedResult);
    });

    it('should update existing progress', async () => {
      const progressData = {
        apprenantId: mockApprenantId,
        moduleId: mockModuleId,
        enrollmentId: mockEnrollmentId,
        progressPercentage: 75,
        status: ProgressStatus.IN_PROGRESS,
        isLocked: false,
      };

      const expectedResult = {
        ...mockModuleProgress,
        progressPercentage: 75,
      };

      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue(expectedResult);

      const result = await service.updateOrCreate(
        progressData.apprenantId,
        progressData.moduleId,
        progressData.enrollmentId,
        progressData.progressPercentage,
        progressData.status,
        progressData.isLocked,
      );

      expect(result).toEqual(expectedResult);
      expect(mockModuleProgressModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('should set completedAt when status is COMPLETED', async () => {
      const progressData = {
        apprenantId: mockApprenantId,
        moduleId: mockModuleId,
        enrollmentId: mockEnrollmentId,
        progressPercentage: 100,
        status: ProgressStatus.COMPLETED,
        isLocked: false,
      };

      const completedDate = new Date();
      const expectedResult = {
        ...mockModuleProgress,
        progressPercentage: 100,
        status: ProgressStatus.COMPLETED,
        completedAt: completedDate,
      };

      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue(expectedResult);

      const result = await service.updateOrCreate(
        progressData.apprenantId,
        progressData.moduleId,
        progressData.enrollmentId,
        progressData.progressPercentage,
        progressData.status,
        progressData.isLocked,
      );

      expect(mockModuleProgressModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          apprenantId: progressData.apprenantId,
          moduleId: progressData.moduleId,
          enrollmentId: progressData.enrollmentId,
        },
        {
          $set: expect.objectContaining({
            progressPercentage: progressData.progressPercentage,
            status: progressData.status,
            isLocked: progressData.isLocked,
            completedAt: expect.any(Date),
          }),
        },
        { upsert: true, new: true },
      );

      expect(result.status).toBe(ProgressStatus.COMPLETED);
      expect(result.completedAt).toBeDefined();
    });

    it('should not set completedAt when status is IN_PROGRESS', async () => {
      const progressData = {
        apprenantId: mockApprenantId,
        moduleId: mockModuleId,
        enrollmentId: mockEnrollmentId,
        progressPercentage: 50,
        status: ProgressStatus.IN_PROGRESS,
        isLocked: false,
      };

      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue(mockModuleProgress);

      await service.updateOrCreate(
        progressData.apprenantId,
        progressData.moduleId,
        progressData.enrollmentId,
        progressData.progressPercentage,
        progressData.status,
        progressData.isLocked,
      );

      const callArgs = mockModuleProgressModel.findOneAndUpdate.mock.calls[0][1];
      expect(callArgs.$set).not.toHaveProperty('completedAt');
    });

    it('should not set completedAt when status is NOT_STARTED', async () => {
      const progressData = {
        apprenantId: mockApprenantId,
        moduleId: mockModuleId,
        enrollmentId: mockEnrollmentId,
        progressPercentage: 0,
        status: ProgressStatus.NOT_STARTED,
        isLocked: true,
      };

      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({
        ...mockModuleProgress,
        ...progressData,
      });

      await service.updateOrCreate(
        progressData.apprenantId,
        progressData.moduleId,
        progressData.enrollmentId,
        progressData.progressPercentage,
        progressData.status,
        progressData.isLocked,
      );

      const callArgs = mockModuleProgressModel.findOneAndUpdate.mock.calls[0][1];
      expect(callArgs.$set).not.toHaveProperty('completedAt');
    });

    it('should handle LOCKED status', async () => {
      const progressData = {
        apprenantId: mockApprenantId,
        moduleId: mockModuleId,
        enrollmentId: mockEnrollmentId,
        progressPercentage: 0,
        status: ProgressStatus.LOCKED,
        isLocked: true,
      };

      const expectedResult = {
        ...mockModuleProgress,
        ...progressData,
      };

      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue(expectedResult);

      const result = await service.updateOrCreate(
        progressData.apprenantId,
        progressData.moduleId,
        progressData.enrollmentId,
        progressData.progressPercentage,
        progressData.status,
        progressData.isLocked,
      );

      expect(result.status).toBe(ProgressStatus.LOCKED);
      expect(result.isLocked).toBe(true);
    });

    it('should handle different progress percentages', async () => {
      const testCases = [
        { percentage: 0, status: ProgressStatus.NOT_STARTED },
        { percentage: 25, status: ProgressStatus.IN_PROGRESS },
        { percentage: 50, status: ProgressStatus.IN_PROGRESS },
        { percentage: 75, status: ProgressStatus.IN_PROGRESS },
        { percentage: 100, status: ProgressStatus.COMPLETED },
      ];

      for (const testCase of testCases) {
        mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({
          ...mockModuleProgress,
          progressPercentage: testCase.percentage,
          status: testCase.status,
        });

        const result = await service.updateOrCreate(
          mockApprenantId,
          mockModuleId,
          mockEnrollmentId,
          testCase.percentage,
          testCase.status,
          false,
        );

        expect(result.progressPercentage).toBe(testCase.percentage);
        expect(result.status).toBe(testCase.status);
      }
    });

    it('should unlock module when isLocked is false', async () => {
      const progressData = {
        apprenantId: mockApprenantId,
        moduleId: mockModuleId,
        enrollmentId: mockEnrollmentId,
        progressPercentage: 0,
        status: ProgressStatus.NOT_STARTED,
        isLocked: false,
      };

      const expectedResult = {
        ...mockModuleProgress,
        ...progressData,
      };

      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue(expectedResult);

      const result = await service.updateOrCreate(
        progressData.apprenantId,
        progressData.moduleId,
        progressData.enrollmentId,
        progressData.progressPercentage,
        progressData.status,
        progressData.isLocked,
      );

      expect(result.isLocked).toBe(false);
    });

    it('should handle all ProgressStatus enum values', async () => {
      const statuses = [
        ProgressStatus.NOT_STARTED,
        ProgressStatus.IN_PROGRESS,
        ProgressStatus.COMPLETED,
        ProgressStatus.LOCKED,
      ];

      for (const status of statuses) {
        mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({
          ...mockModuleProgress,
          status,
        });

        const result = await service.updateOrCreate(
          mockApprenantId,
          mockModuleId,
          mockEnrollmentId,
          50,
          status,
          false,
        );

        expect(result.status).toBe(status);
      }
    });
  });

  describe('getByModuleAndUser', () => {
    it('should return progress for given module and user', async () => {
      mockModuleProgressModel.findOne.mockResolvedValue(mockModuleProgress);

      const result = await service.getByModuleAndUser(mockModuleId, mockApprenantId);

      expect(mockModuleProgressModel.findOne).toHaveBeenCalledWith({
        moduleId: mockModuleId,
        apprenantId: mockApprenantId,
      });

      expect(result).toEqual(mockModuleProgress);
      expect(result?.status).toBe(ProgressStatus.IN_PROGRESS);
    });

    it('should return null when no progress found', async () => {
      mockModuleProgressModel.findOne.mockResolvedValue(null);

      const result = await service.getByModuleAndUser(mockModuleId, mockApprenantId);

      expect(result).toBeNull();
    });

    it('should handle different ObjectIds', async () => {
      const differentModuleId = new Types.ObjectId();
      const differentApprenantId = new Types.ObjectId();

      mockModuleProgressModel.findOne.mockResolvedValue(null);

      await service.getByModuleAndUser(differentModuleId, differentApprenantId);

      expect(mockModuleProgressModel.findOne).toHaveBeenCalledWith({
        moduleId: differentModuleId,
        apprenantId: differentApprenantId,
      });
    });

    it('should call findOne exactly once', async () => {
      mockModuleProgressModel.findOne.mockResolvedValue(mockModuleProgress);

      await service.getByModuleAndUser(mockModuleId, mockApprenantId);

      expect(mockModuleProgressModel.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return progress with completed status', async () => {
      const completedProgress = {
        ...mockModuleProgress,
        status: ProgressStatus.COMPLETED,
        progressPercentage: 100,
        completedAt: new Date(),
      };

      mockModuleProgressModel.findOne.mockResolvedValue(completedProgress);

      const result = await service.getByModuleAndUser(mockModuleId, mockApprenantId);

      expect(result?.status).toBe(ProgressStatus.COMPLETED);
      expect(result?.progressPercentage).toBe(100);
      expect(result?.completedAt).toBeDefined();
    });

    it('should return progress with locked status', async () => {
      const lockedProgress = {
        ...mockModuleProgress,
        status: ProgressStatus.LOCKED,
        isLocked: true,
      };

      mockModuleProgressModel.findOne.mockResolvedValue(lockedProgress);

      const result = await service.getByModuleAndUser(mockModuleId, mockApprenantId);

      expect(result?.status).toBe(ProgressStatus.LOCKED);
      expect(result?.isLocked).toBe(true);
    });
  });

  describe('create', () => {
    it('should return placeholder message', () => {
      const dto = {} as any;
      const result = service.create(dto);
      expect(result).toBe('This action adds a new moduleProgress');
    });
  });

  describe('findAll', () => {
    it('should return placeholder message', () => {
      const result = service.findAll();
      expect(result).toBe('This action returns all moduleProgress');
    });
  });

  describe('findOne', () => {
    it('should return placeholder message with correct id', () => {
      const result = service.findOne(1);
      expect(result).toBe('This action returns a #1 moduleProgress');
    });

    it('should handle different ids', () => {
      expect(service.findOne(999)).toBe('This action returns a #999 moduleProgress');
    });
  });

  describe('remove', () => {
    it('should return placeholder message with correct id', () => {
      const result = service.remove(1);
      expect(result).toBe('This action removes a #1 moduleProgress');
    });

    it('should handle different ids', () => {
      expect(service.remove(999)).toBe('This action removes a #999 moduleProgress');
    });
  });
});