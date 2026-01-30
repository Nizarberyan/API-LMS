import { Test, TestingModule } from '@nestjs/testing';
import { ModuleProgressService } from './module-progress.service';
import { getModelToken } from '@nestjs/mongoose';
import { ModuleProgress, ProgressStatus } from './entities/module-progress.entity';
import { Model, Types } from 'mongoose';

describe('ModuleProgressService', () => {
  let service: ModuleProgressService;
  let model: Model<ModuleProgress>;

  const mockModuleProgress = {
    _id: new Types.ObjectId(),
    apprenantId: new Types.ObjectId(),
    moduleId: new Types.ObjectId(),
    enrollmentId: new Types.ObjectId(),
    progressPercentage: 50,
    status: ProgressStatus.IN_PROGRESS,
    isLocked: false,
    save: jest.fn(),
  };

  const mockModuleProgressModel = {
    new: jest.fn().mockResolvedValue(mockModuleProgress),
    constructor: jest.fn().mockResolvedValue(mockModuleProgress),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
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
    it('should update or create a module progress record', async () => {
      const apprenantId = new Types.ObjectId();
      const moduleId = new Types.ObjectId();
      const enrollmentId = new Types.ObjectId();
      const progressPercentage = 80;
      const status = ProgressStatus.IN_PROGRESS;
      const isLocked = false;

      mockModuleProgressModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockModuleProgress,
          apprenantId,
          moduleId,
          progressPercentage,
          status,
        }),
      } as any);

      // Since the service method returns the result of findOneAndUpdate directly (which is a Query),
      // we need to verify how it's called. The service returns this.moduleProgressModel.findOneAndUpdate(...)
      // In many cases findOneAndUpdate returns a Thenable/Promise.
      // Let's adjust mock to return a simple object if the service awaits it, or a mock object with exec.
      // Looking at service code: return this.moduleProgressModel.findOneAndUpdate(...)
      // Mongoose findOneAndUpdate returns a Query, but it is awaitable.

      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({
        ...mockModuleProgress,
        apprenantId,
        moduleId,
        progressPercentage,
        status,
      });

      const result = await service.updateOrCreate(
        apprenantId,
        moduleId,
        enrollmentId,
        progressPercentage,
        status,
        isLocked,
      );

      expect(mockModuleProgressModel.findOneAndUpdate).toHaveBeenCalledWith(
        { apprenantId, moduleId, enrollmentId },
        {
          $set: {
            progressPercentage,
            status,
            isLocked,
          },
        },
        { upsert: true, new: true },
      );
    });

    it('should set completedAt when status is completed', async () => {
      const apprenantId = new Types.ObjectId();
      const moduleId = new Types.ObjectId();
      const enrollmentId = new Types.ObjectId();
      const progressPercentage = 100;
      const status = ProgressStatus.COMPLETED;
      const isLocked = false;

      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({
        ...mockModuleProgress,
        status: ProgressStatus.COMPLETED,
      });

      await service.updateOrCreate(
        apprenantId,
        moduleId,
        enrollmentId,
        progressPercentage,
        status,
        isLocked,
      );

      expect(mockModuleProgressModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          $set: expect.objectContaining({
            completedAt: expect.any(Date)
          })
        }),
        expect.any(Object),
      );
    });
  });

  describe('getByModuleAndUser', () => {
    it('should return module progress for a given user and module', async () => {
      const moduleId = new Types.ObjectId();
      const apprenantId = new Types.ObjectId();

      mockModuleProgressModel.findOne.mockReturnValue({
        ...mockModuleProgress,
        moduleId,
        apprenantId
      });

      const result = await service.getByModuleAndUser(moduleId, apprenantId);

      expect(mockModuleProgressModel.findOne).toHaveBeenCalledWith({
        moduleId,
        apprenantId,
      });
      expect(result).toEqual(expect.objectContaining({
        moduleId,
        apprenantId
      }));
    });
  });
});
