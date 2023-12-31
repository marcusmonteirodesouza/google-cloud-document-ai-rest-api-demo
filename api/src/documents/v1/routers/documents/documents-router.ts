import {Router} from 'express';
import {USDocumentsService} from '../../services';

interface DocumentsRouterSettings {
  usDocumentsService: USDocumentsService;
}

class DocumentsRouter {
  constructor(private readonly settings: DocumentsRouterSettings) {}

  get router() {
    const router = Router();

    router.post(
      '/countries/us/ids/driver-licenses/parse',
      async (req, res, next) => {
        try {
          if (!req.files) {
            throw new RangeError('No files were uploaded');
          }

          const fileKeys = Object.keys(req.files);

          if (fileKeys.length !== 1) {
            throw new RangeError('A single file must be uploaded');
          }

          const uploadedFile = req.files[fileKeys[0]];

          if (!('data' in uploadedFile)) {
            throw new Error(
              "The uploaded file should contain the 'data' property"
            );
          }

          const {usDocumentsService} = this.settings;

          const parsedUSDriverLicense =
            await usDocumentsService.parseUSDriverLicense({
              imageData: uploadedFile.data,
              mimeType: uploadedFile.mimetype,
            });

          return res.json(parsedUSDriverLicense);
        } catch (err) {
          return next(err);
        }
      }
    );

    router.post('/countries/us/ids/passports/parse', async (req, res, next) => {
      try {
        if (!req.files) {
          throw new RangeError('No files were uploaded');
        }

        const fileKeys = Object.keys(req.files);

        if (fileKeys.length !== 1) {
          throw new RangeError('A single file must be uploaded');
        }

        const uploadedFile = req.files[fileKeys[0]];

        if (!('data' in uploadedFile)) {
          throw new Error(
            "The uploaded file should contain the 'data' property"
          );
        }

        const {usDocumentsService} = this.settings;

        const parsedUSPassport = await usDocumentsService.parseUSPassport({
          imageData: uploadedFile.data,
          mimeType: uploadedFile.mimetype,
        });

        return res.json(parsedUSPassport);
      } catch (err) {
        return next(err);
      }
    });

    router.post('/countries/us/ids/id-proof', async (req, res, next) => {
      try {
        if (!req.files) {
          throw new RangeError('No files were uploaded');
        }

        const fileKeys = Object.keys(req.files);

        if (fileKeys.length !== 1) {
          throw new RangeError('A single file must be uploaded');
        }

        const uploadedFile = req.files[fileKeys[0]];

        if (!('data' in uploadedFile)) {
          throw new Error(
            "The uploaded file should contain the 'data' property"
          );
        }

        const {usDocumentsService} = this.settings;

        const idProofingResults = await usDocumentsService.idProof({
          imageData: uploadedFile.data,
          mimeType: uploadedFile.mimetype,
        });

        return res.json(idProofingResults);
      } catch (err) {
        return next(err);
      }
    });

    router.post('/countries/us/patents/parse', async (req, res, next) => {
      try {
        if (!req.files) {
          throw new RangeError('No files were uploaded');
        }

        const fileKeys = Object.keys(req.files);

        if (fileKeys.length !== 1) {
          throw new RangeError('A single file must be uploaded');
        }

        const uploadedFile = req.files[fileKeys[0]];

        if (!('data' in uploadedFile)) {
          throw new Error(
            "The uploaded file should contain the 'data' property"
          );
        }

        const {usDocumentsService} = this.settings;

        const parsedUSPatent = await usDocumentsService.parseUSPatent({
          imageData: uploadedFile.data,
          mimeType: uploadedFile.mimetype,
        });

        return res.json(parsedUSPatent);
      } catch (err) {
        return next(err);
      }
    });

    return router;
  }
}

export {DocumentsRouter};
