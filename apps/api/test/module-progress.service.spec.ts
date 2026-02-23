import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModuleProgressService } from '../src/module-progress/module-progress.service';
import { ModuleProgress, ProgressStatus } from '../src/module-progress/entities/module-progress.entity'
import { CreateModuleProgressDto } from '../src/module-progress/dto/create-module-progress.dto';
import { UpdateModuleProgressDto } from '../src/module-progress/dto/update-module-progress.dto';

const mockModuleProgressModel = {
  findOneAndUpdate: jest.fn(),
  findOne: jest.fn(),
};

describe('ModuleProgressService', () => {
  let service: ModuleProgressService;

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });




  // ════════════════════════════════════════════════════════════════
  // updateOrCreate()
  // ════════════════════════════════════════════════════════════════

  describe('updateOrCreate()', () => {
    let apprenantId: Types.ObjectId;
    let moduleId: Types.ObjectId;
    let enrollmentId: Types.ObjectId;

    beforeEach(() => {
      apprenantId = new Types.ObjectId();
      moduleId = new Types.ObjectId();
      enrollmentId = new Types.ObjectId();
    });

    // ── Filtre de recherche ──────────────────────────────────────

    it('devrait appeler findOneAndUpdate avec le bon filtre (apprenantId, moduleId, enrollmentId)', async () => {
      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({});

      await service.updateOrCreate(
        apprenantId, moduleId, enrollmentId,
        50, ProgressStatus.IN_PROGRESS, false,
      );

      const [filter] = mockModuleProgressModel.findOneAndUpdate.mock.calls[0];
      expect(filter).toEqual({ apprenantId, moduleId, enrollmentId });
    });

    // ── Options upsert / new ─────────────────────────────────────

    it('devrait toujours passer { upsert: true, new: true } en options', async () => {
      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({});

      await service.updateOrCreate(
        apprenantId, moduleId, enrollmentId,
        50, ProgressStatus.IN_PROGRESS, false,
      );

      const [, , options] = mockModuleProgressModel.findOneAndUpdate.mock.calls[0];
      expect(options).toEqual({ upsert: true, new: true });
    });

    // ── ProgressStatus.NOT_STARTED ───────────────────────────────

    it('devrait mettre à jour avec status NOT_STARTED sans completedAt', async () => {
      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({});

      await service.updateOrCreate(
        apprenantId, moduleId, enrollmentId,
        0, ProgressStatus.NOT_STARTED, true,
      );

      const [, update] = mockModuleProgressModel.findOneAndUpdate.mock.calls[0];
      expect(update.$set.status).toBe(ProgressStatus.NOT_STARTED);
      expect(update.$set.progressPercentage).toBe(0);
      expect(update.$set.isLocked).toBe(true);
      expect(update.$set).not.toHaveProperty('completedAt');
    });

    // ── ProgressStatus.IN_PROGRESS ───────────────────────────────

    it('devrait mettre à jour avec status IN_PROGRESS sans completedAt', async () => {
      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({});

      await service.updateOrCreate(
        apprenantId, moduleId, enrollmentId,
        60, ProgressStatus.IN_PROGRESS, false,
      );

      const [, update] = mockModuleProgressModel.findOneAndUpdate.mock.calls[0];
      expect(update.$set.status).toBe(ProgressStatus.IN_PROGRESS);
      expect(update.$set.progressPercentage).toBe(60);
      expect(update.$set.isLocked).toBe(false);
      expect(update.$set).not.toHaveProperty('completedAt');
    });

    // ── ProgressStatus.COMPLETED ─────────────────────────────────

    it('devrait inclure completedAt quand status === COMPLETED', async () => {
      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({});

      const before = new Date();
      await service.updateOrCreate(
        apprenantId, moduleId, enrollmentId,
        100, ProgressStatus.COMPLETED, false,
      );
      const after = new Date();

      const [, update] = mockModuleProgressModel.findOneAndUpdate.mock.calls[0];
      expect(update.$set).toHaveProperty('completedAt');
      expect(update.$set.completedAt).toBeInstanceOf(Date);
      expect(update.$set.completedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(update.$set.completedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('devrait avoir progressPercentage = 100 et isLocked = false quand COMPLETED', async () => {
      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({});

      await service.updateOrCreate(
        apprenantId, moduleId, enrollmentId,
        100, ProgressStatus.COMPLETED, false,
      );

      const [, update] = mockModuleProgressModel.findOneAndUpdate.mock.calls[0];
      expect(update.$set.progressPercentage).toBe(100);
      expect(update.$set.isLocked).toBe(false);
      expect(update.$set.status).toBe(ProgressStatus.COMPLETED);
    });

    it('devrait inclure completedAt même si isLocked = true et status = COMPLETED', async () => {
      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({});

      await service.updateOrCreate(
        apprenantId, moduleId, enrollmentId,
        100, ProgressStatus.COMPLETED, true,
      );

      const [, update] = mockModuleProgressModel.findOneAndUpdate.mock.calls[0];
      expect(update.$set).toHaveProperty('completedAt');
      expect(update.$set.isLocked).toBe(true);
    });

    // ── isLocked variations ──────────────────────────────────────

    it('devrait passer isLocked = true correctement', async () => {
      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({});

      await service.updateOrCreate(
        apprenantId, moduleId, enrollmentId,
        0, ProgressStatus.NOT_STARTED, true,
      );

      const [, update] = mockModuleProgressModel.findOneAndUpdate.mock.calls[0];
      expect(update.$set.isLocked).toBe(true);
    });

    it('devrait passer isLocked = false correctement', async () => {
      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({});

      await service.updateOrCreate(
        apprenantId, moduleId, enrollmentId,
        50, ProgressStatus.IN_PROGRESS, false,
      );

      const [, update] = mockModuleProgressModel.findOneAndUpdate.mock.calls[0];
      expect(update.$set.isLocked).toBe(false);
    });

    // ── progressPercentage limites ───────────────────────────────

    it('devrait accepter progressPercentage = 0 (début)', async () => {
      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({});

      await service.updateOrCreate(
        apprenantId, moduleId, enrollmentId,
        0, ProgressStatus.NOT_STARTED, false,
      );

      const [, update] = mockModuleProgressModel.findOneAndUpdate.mock.calls[0];
      expect(update.$set.progressPercentage).toBe(0);
    });

    it('devrait accepter progressPercentage = 100 (fin)', async () => {
      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({});

      await service.updateOrCreate(
        apprenantId, moduleId, enrollmentId,
        100, ProgressStatus.COMPLETED, false,
      );

      const [, update] = mockModuleProgressModel.findOneAndUpdate.mock.calls[0];
      expect(update.$set.progressPercentage).toBe(100);
    });

    it('devrait accepter progressPercentage intermédiaire (ex: 47)', async () => {
      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue({});

      await service.updateOrCreate(
        apprenantId, moduleId, enrollmentId,
        47, ProgressStatus.IN_PROGRESS, false,
      );

      const [, update] = mockModuleProgressModel.findOneAndUpdate.mock.calls[0];
      expect(update.$set.progressPercentage).toBe(47);
    });

    // ── Valeur de retour ─────────────────────────────────────────

    it('devrait retourner le document mis à jour', async () => {
      const mockDoc = {
        _id: new Types.ObjectId(),
        apprenantId,
        moduleId,
        enrollmentId,
        progressPercentage: 75,
        status: ProgressStatus.IN_PROGRESS,
        isLocked: false,
      };
      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue(mockDoc);

      const result = await service.updateOrCreate(
        apprenantId, moduleId, enrollmentId,
        75, ProgressStatus.IN_PROGRESS, false,
      );

      expect(result).toEqual(mockDoc);
    });

    it('devrait retourner null si le modèle retourne null', async () => {
      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue(null);

      const result = await service.updateOrCreate(
        apprenantId, moduleId, enrollmentId,
        0, ProgressStatus.NOT_STARTED, false,
      );

      expect(result).toBeNull();
    });

    // ── Création (upsert) ────────────────────────────────────────

    it('devrait créer un nouveau document si aucun n\'existe (upsert)', async () => {
      const newDoc = {
        _id: new Types.ObjectId(),
        apprenantId,
        moduleId,
        enrollmentId,
        progressPercentage: 0,
        status: ProgressStatus.NOT_STARTED,
        isLocked: true,
      };
      mockModuleProgressModel.findOneAndUpdate.mockResolvedValue(newDoc);

      const result = await service.updateOrCreate(
        apprenantId, moduleId, enrollmentId,
        0, ProgressStatus.NOT_STARTED, true,
      );

      expect(mockModuleProgressModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(result).toEqual(newDoc);
    });

  });

  // ════════════════════════════════════════════════════════════════
  // getByModuleAndUser()
  // ════════════════════════════════════════════════════════════════

  describe('getByModuleAndUser()', () => {
    let moduleId: Types.ObjectId;
    let apprenantId: Types.ObjectId;

    beforeEach(() => {
      moduleId = new Types.ObjectId();
      apprenantId = new Types.ObjectId();
    });

    // ── Filtre correct ───────────────────────────────────────────

    it('devrait appeler findOne avec { moduleId, apprenantId }', async () => {
      mockModuleProgressModel.findOne.mockResolvedValue({});

      await service.getByModuleAndUser(moduleId, apprenantId);

      expect(mockModuleProgressModel.findOne).toHaveBeenCalledWith({
        moduleId,
        apprenantId,
      });
    });

    it('devrait appeler findOne exactement une fois', async () => {
      mockModuleProgressModel.findOne.mockResolvedValue({});

      await service.getByModuleAndUser(moduleId, apprenantId);

      expect(mockModuleProgressModel.findOne).toHaveBeenCalledTimes(1);
    });

    // ── Document trouvé ──────────────────────────────────────────

    it('devrait retourner le document trouvé avec toutes ses propriétés', async () => {
      const mockDoc = {
        _id: new Types.ObjectId(),
        moduleId,
        apprenantId,
        progressPercentage: 80,
        status: ProgressStatus.IN_PROGRESS,
        isLocked: false,
        completedAt: null,
      };
      mockModuleProgressModel.findOne.mockResolvedValue(mockDoc);

      const result = await service.getByModuleAndUser(moduleId, apprenantId);

      expect(result).toEqual(mockDoc);
    });

    it('devrait retourner un document avec status COMPLETED et completedAt', async () => {
      const completedAt = new Date();
      const mockDoc = {
        _id: new Types.ObjectId(),
        moduleId,
        apprenantId,
        progressPercentage: 100,
        status: ProgressStatus.COMPLETED,
        isLocked: false,
        completedAt,
      };
      mockModuleProgressModel.findOne.mockResolvedValue(mockDoc);

      const result = await service.getByModuleAndUser(moduleId, apprenantId);

      expect(result).toEqual(mockDoc);
      expect(result!.completedAt).toEqual(completedAt);
    });

    it('devrait retourner un document avec isLocked = true', async () => {
      const mockDoc = {
        _id: new Types.ObjectId(),
        moduleId,
        apprenantId,
        progressPercentage: 0,
        status: ProgressStatus.NOT_STARTED,
        isLocked: true,
      };
      mockModuleProgressModel.findOne.mockResolvedValue(mockDoc);

      const result = await service.getByModuleAndUser(moduleId, apprenantId);

      expect(result!.isLocked).toBe(true);
    });

    // ── Document non trouvé ──────────────────────────────────────

    it('devrait retourner null si aucun document n\'existe', async () => {
      mockModuleProgressModel.findOne.mockResolvedValue(null);

      const result = await service.getByModuleAndUser(moduleId, apprenantId);

      expect(result).toBeNull();
    });

    it('devrait retourner undefined si le modèle retourne undefined', async () => {
      mockModuleProgressModel.findOne.mockResolvedValue(undefined);

      const result = await service.getByModuleAndUser(moduleId, apprenantId);

      expect(result).toBeUndefined();
    });

    // ── IDs différents ───────────────────────────────────────────

    it('ne devrait pas confondre deux apprenants différents', async () => {
      const apprenantId1 = new Types.ObjectId();
      const apprenantId2 = new Types.ObjectId();

      const doc1 = { _id: new Types.ObjectId(), apprenantId: apprenantId1, progressPercentage: 30 };
      const doc2 = { _id: new Types.ObjectId(), apprenantId: apprenantId2, progressPercentage: 70 };

      mockModuleProgressModel.findOne
        .mockResolvedValueOnce(doc1)
        .mockResolvedValueOnce(doc2);

      const result1 = await service.getByModuleAndUser(moduleId, apprenantId1);
      const result2 = await service.getByModuleAndUser(moduleId, apprenantId2);

      expect(result1!.progressPercentage).toBe(30);
      expect(result2!.progressPercentage).toBe(70);
      expect(mockModuleProgressModel.findOne).toHaveBeenCalledTimes(2);
    });

    it('ne devrait pas confondre deux modules différents', async () => {
      const moduleId1 = new Types.ObjectId();
      const moduleId2 = new Types.ObjectId();

      const doc1 = { _id: new Types.ObjectId(), moduleId: moduleId1, progressPercentage: 20 };
      const doc2 = { _id: new Types.ObjectId(), moduleId: moduleId2, progressPercentage: 90 };

      mockModuleProgressModel.findOne
        .mockResolvedValueOnce(doc1)
        .mockResolvedValueOnce(doc2);

      const result1 = await service.getByModuleAndUser(moduleId1, apprenantId);
      const result2 = await service.getByModuleAndUser(moduleId2, apprenantId);

      expect(result1!.progressPercentage).toBe(20);
      expect(result2!.progressPercentage).toBe(90);
    });

    // ── Gestion des erreurs ──────────────────────────────────────

    it('devrait propager une erreur MongoDB', async () => {
      mockModuleProgressModel.findOne.mockRejectedValue(
        new Error('MongoNetworkError'),
      );

      await expect(
        service.getByModuleAndUser(moduleId, apprenantId),
      ).rejects.toThrow('MongoNetworkError');
    });

    it('devrait propager une erreur de timeout', async () => {
      mockModuleProgressModel.findOne.mockRejectedValue(
        new Error('Operation timed out'),
      );

      await expect(
        service.getByModuleAndUser(moduleId, apprenantId),
      ).rejects.toThrow('Operation timed out');
    });

    it('devrait propager n\'importe quelle erreur inattendue', async () => {
      mockModuleProgressModel.findOne.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(
        service.getByModuleAndUser(moduleId, apprenantId),
      ).rejects.toThrow('Unexpected error');
    });
  });
});