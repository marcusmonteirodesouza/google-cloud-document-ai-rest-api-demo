import {DocumentProcessorServiceClient} from '@google-cloud/documentai';
import {google} from '@google-cloud/documentai/build/protos/protos';
import Jimp from 'jimp';
import {
  USDriverLicenseParsingResults,
  USIDProofingResults,
  USPassportParsingResults,
  USPatentParsingResults,
} from '../../models';

interface USDocumentsServiceSettings {
  documentAi: {
    documentProcessorServiceClient: DocumentProcessorServiceClient;
    processors: {
      driverLicense: {
        location: string;
        id: string;
      };
      idProofing: {
        location: string;
        id: string;
      };
      passport: {
        location: string;
        id: string;
      };
      patent: {
        location: string;
        id: string;
      };
    };
  };
}

interface ParseUSDriverLicenseOptions {
  imageData: Buffer;
  mimeType: string;
}

interface ParseUSPassportOptions {
  imageData: Buffer;
  mimeType: string;
}

interface ParseUSPatentOptions {
  imageData: Buffer;
  mimeType: string;
}

interface IdProofOptions {
  imageData: Buffer;
  mimeType: string;
}

class USDocumentsService {
  constructor(private readonly settings: USDocumentsServiceSettings) {}

  async parseUSDriverLicense(
    options: ParseUSDriverLicenseOptions
  ): Promise<USDriverLicenseParsingResults> {
    const {documentProcessorServiceClient} = this.settings.documentAi;

    const {location, id: processorId} =
      this.settings.documentAi.processors.driverLicense;

    const projectId = await documentProcessorServiceClient.getProjectId();

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    const encodedImage = options.imageData.toString('base64');

    const [processDocumentResult] =
      await this.settings.documentAi.documentProcessorServiceClient.processDocument(
        {
          name,
          rawDocument: {
            content: encodedImage,
            mimeType: options.mimeType,
          },
        }
      );

    if (!processDocumentResult.document) {
      throw new Error('processDocumentResult.document must be defined');
    }

    if (!processDocumentResult.document.entities) {
      throw new Error(
        'processDocumentResult.document.entities must be defined'
      );
    }

    const address =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'Address'
        )
      ) || null;

    const dateOfBirth =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'Date Of Birth'
        )
      ) || null;

    const documentId =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'Document Id'
        )
      ) || null;

    const expirationDate =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'Expiration Date'
        )
      ) || null;

    const familyName =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'Family Name'
        )
      ) || null;

    const givenNames =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'Given Names'
        )
      ) || null;

    const issueDate =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'Issue Date'
        )
      ) || null;

    const portraitEntity = processDocumentResult.document.entities.find(
      entity => entity.type === 'Portrait'
    );

    const results: USDriverLicenseParsingResults = {
      address,
      dateOfBirth,
      documentId,
      expirationDate,
      familyName,
      givenNames,
      issueDate,
      portraitImage: null,
    };

    if (portraitEntity) {
      if (!portraitEntity.confidence) {
        throw new Error('portraitEntity.confidence must be defined');
      }

      if (!portraitEntity.pageAnchor) {
        throw new Error('portrait.pageAnchor must be defined');
      }

      if (!portraitEntity.pageAnchor.pageRefs) {
        throw new Error('portrait.pageAnchor.pageRefs must be defined');
      }

      if (portraitEntity.pageAnchor.pageRefs.length === 0) {
        throw new Error(
          'portrait.pageAnchor.pageRefs.length must be greater than 0'
        );
      }

      const pageRef = portraitEntity.pageAnchor.pageRefs[0];

      if (!pageRef.page) {
        throw new Error('pageRef.page must be defined');
      }

      const page = Number.parseInt(pageRef.page.toString());
      if (Number.isNaN(page)) {
        throw new Error(
          `Failed to parse pageRef.page as an integer. Received ${pageRef.page}`
        );
      }

      if (!pageRef.boundingPoly) {
        throw new Error('pageRef.boundingPoly must be defined');
      }

      if (!pageRef.boundingPoly.normalizedVertices) {
        throw new Error(
          'pageRef.boundingPoly.normalizedVertices must be defined'
        );
      }

      const normalizedVertices = pageRef.boundingPoly.normalizedVertices;

      const portraitImage = await this.cropImage(
        options.imageData,
        options.mimeType,
        normalizedVertices
      );

      results.portraitImage = portraitImage.toString('base64');
    }

    return results;
  }

  async parseUSPassport(
    options: ParseUSPassportOptions
  ): Promise<USPassportParsingResults> {
    const {documentProcessorServiceClient} = this.settings.documentAi;

    const {location, id: processorId} =
      this.settings.documentAi.processors.passport;

    const projectId = await documentProcessorServiceClient.getProjectId();

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    const encodedImage = options.imageData.toString('base64');

    const [processDocumentResult] =
      await this.settings.documentAi.documentProcessorServiceClient.processDocument(
        {
          name,
          rawDocument: {
            content: encodedImage,
            mimeType: options.mimeType,
          },
        }
      );

    if (!processDocumentResult.document) {
      throw new Error('processDocumentResult.document must be defined');
    }

    if (!processDocumentResult.document.entities) {
      throw new Error(
        'processDocumentResult.document.entities must be defined'
      );
    }

    const address =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'Address'
        )
      ) || null;

    const dateOfBirth =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'Date Of Birth'
        )
      ) || null;

    const documentId =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'Document Id'
        )
      ) || null;

    const expirationDate =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'Expiration Date'
        )
      ) || null;

    const familyName =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'Family Name'
        )
      ) || null;

    const givenNames =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'Given Names'
        )
      ) || null;

    const issueDate =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'Issue Date'
        )
      ) || null;

    const mrzCode =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'MRZ Code'
        )
      ) || null;

    const portraitEntity = processDocumentResult.document.entities.find(
      entity => entity.type === 'Portrait'
    );

    const results: USPassportParsingResults = {
      address,
      dateOfBirth,
      documentId,
      expirationDate,
      familyName,
      givenNames,
      issueDate,
      mrzCode,
      portraitImage: null,
    };

    if (portraitEntity) {
      if (!portraitEntity.confidence) {
        throw new Error('portraitEntity.confidence must be defined');
      }

      if (!portraitEntity.pageAnchor) {
        throw new Error('portrait.pageAnchor must be defined');
      }

      if (!portraitEntity.pageAnchor.pageRefs) {
        throw new Error('portrait.pageAnchor.pageRefs must be defined');
      }

      if (portraitEntity.pageAnchor.pageRefs.length === 0) {
        throw new Error(
          'portrait.pageAnchor.pageRefs.length must be greater than 0'
        );
      }

      const pageRef = portraitEntity.pageAnchor.pageRefs[0];

      if (!pageRef.page) {
        throw new Error('pageRef.page must be defined');
      }

      const page = Number.parseInt(pageRef.page.toString());
      if (Number.isNaN(page)) {
        throw new Error(
          `Failed to parse pageRef.page as an integer. Received ${pageRef.page}`
        );
      }

      if (!pageRef.boundingPoly) {
        throw new Error('pageRef.boundingPoly must be defined');
      }

      if (!pageRef.boundingPoly.normalizedVertices) {
        throw new Error(
          'pageRef.boundingPoly.normalizedVertices must be defined'
        );
      }

      const normalizedVertices = pageRef.boundingPoly.normalizedVertices;

      const portraitImage = await this.cropImage(
        options.imageData,
        options.mimeType,
        normalizedVertices
      );

      results.portraitImage = portraitImage.toString('base64');
    }

    return results;
  }

  async parseUSPatent(
    options: ParseUSPatentOptions
  ): Promise<USPatentParsingResults> {
    const {documentProcessorServiceClient} = this.settings.documentAi;

    const {location, id: processorId} =
      this.settings.documentAi.processors.patent;

    const projectId = await documentProcessorServiceClient.getProjectId();

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    const encodedImage = options.imageData.toString('base64');

    const [processDocumentResult] =
      await this.settings.documentAi.documentProcessorServiceClient.processDocument(
        {
          name,
          rawDocument: {
            content: encodedImage,
            mimeType: options.mimeType,
          },
        }
      );

    if (!processDocumentResult.document) {
      throw new Error('processDocumentResult.document must be defined');
    }

    if (!processDocumentResult.document.entities) {
      throw new Error(
        'processDocumentResult.document.entities must be defined'
      );
    }

    const applicantLine1 =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'applicant_line_1'
        )
      ) || null;

    const applicationNumber =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'application_number'
        )
      ) || null;

    const classInternational =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'class_international'
        )
      ) || null;

    const classUS =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'class_us'
        )
      ) || null;

    const filingDate =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'filing_date'
        )
      ) || null;

    const inventorLine1 =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'inventor_line_1'
        )
      ) || null;

    const issuer =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'issuer'
        )
      ) || null;

    const patentNumber =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'patent_number'
        )
      ) || null;

    const publicationDate =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'publication_date'
        )
      ) || null;

    const titleLine1 =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'title_line_1'
        )
      ) || null;

    const results: USPatentParsingResults = {
      applicantLine1,
      applicationNumber,
      classInternational,
      classUS,
      filingDate,
      inventorLine1,
      issuer,
      patentNumber,
      publicationDate,
      titleLine1,
    };

    return results;
  }

  async idProof(options: IdProofOptions): Promise<USIDProofingResults> {
    const {documentProcessorServiceClient} = this.settings.documentAi;

    const {location, id: processorId} =
      this.settings.documentAi.processors.idProofing;

    const projectId = await documentProcessorServiceClient.getProjectId();

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    const encodedImage = options.imageData.toString('base64');

    const [processDocumentResult] =
      await this.settings.documentAi.documentProcessorServiceClient.processDocument(
        {
          name,
          rawDocument: {
            content: encodedImage,
            mimeType: options.mimeType,
          },
        }
      );

    if (!processDocumentResult.document) {
      throw new Error('processDocumentResult.document must be defined');
    }

    if (!processDocumentResult.document.entities) {
      throw new Error(
        'processDocumentResult.document.entities must be defined'
      );
    }

    const fraudSignalsIsIdentityDocument =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'fraud_signals_is_identity_document'
        )
      ) || null;

    const fraudSignalsSuspiciousWords =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'fraud_signals_suspicious_words'
        )
      ) || null;

    const evidenceInconclusiveSuspiciousWord =
      processDocumentResult.document.entities
        .filter(
          entity => entity.type === 'evidence_inconclusive_suspicious_word'
        )
        .map(this.getMentionText);

    const evidenceSuspiciousWord = processDocumentResult.document.entities
      .filter(entity => entity.type === 'evidence_suspicious_word')
      .map(this.getMentionText);

    const fraudSignalsImageManipulation =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'fraud_signals_image_manipulation'
        )
      ) || null;

    const fraudSignalsOnlineDuplicate =
      this.maybeGetMentionText(
        processDocumentResult.document.entities.find(
          entity => entity.type === 'fraud_signals_online_duplicate'
        )
      ) || null;

    const evidenceHostname = processDocumentResult.document.entities
      .filter(entity => entity.type === 'evidence_hostname')
      .map(this.getMentionText);

    const evidenceThumbnailUrl = processDocumentResult.document.entities
      .filter(entity => entity.type === 'evidence_thumbnail_url')
      .map(this.getMentionText);

    const results: USIDProofingResults = {
      fraudSignalsIsIdentityDocument,
      fraudSignalsSuspiciousWords,
      evidenceSuspiciousWord,
      evidenceInconclusiveSuspiciousWord,
      fraudSignalsImageManipulation,
      fraudSignalsOnlineDuplicate,
      evidenceHostname,
      evidenceThumbnailUrl,
    };

    return results;
  }

  private getMentionText(
    entity: google.cloud.documentai.v1.Document.IEntity
  ): string {
    if (entity.mentionText) {
      return entity.mentionText;
    }

    throw new Error('entity.mentionText must be defined');
  }

  private maybeGetMentionText(
    entity: google.cloud.documentai.v1.Document.IEntity | undefined
  ): string | null | undefined {
    return entity?.mentionText;
  }

  private async cropImage(
    imageData: Buffer,
    mimeType: string,
    normalizedVertices: google.cloud.documentai.v1.INormalizedVertex[]
  ) {
    if (normalizedVertices.length !== 4) {
      throw new Error('normalizedVertices length must be 4');
    }

    if (!normalizedVertices[0].x) {
      throw new Error('normalizedVertices[0].x must be defined');
    }

    if (!normalizedVertices[0].y) {
      throw new Error('normalizedVertices[0].y must be defined');
    }

    if (!normalizedVertices[1].x) {
      throw new Error('normalizedVertices[1].x must be defined');
    }

    if (!normalizedVertices[1].y) {
      throw new Error('normalizedVertices[1].y must be defined');
    }

    if (!normalizedVertices[2].x) {
      throw new Error('normalizedVertices[2].x must be defined');
    }

    if (!normalizedVertices[2].y) {
      throw new Error('normalizedVertices[2].x must be defined');
    }

    if (!normalizedVertices[3].x) {
      throw new Error('normalizedVertices[2].x must be defined');
    }

    if (!normalizedVertices[3].y) {
      throw new Error('normalizedVertices[2].x must be defined');
    }

    const image = await Jimp.read(imageData);

    const imageWidth = image.getWidth();
    const imageHeight = image.getHeight();

    const topX = imageWidth * normalizedVertices[0].x;
    const topY = imageHeight * normalizedVertices[0].y;
    const width = imageWidth * normalizedVertices[1].x - topX;
    const height = imageHeight * normalizedVertices[2].y - topY;

    const cropedImage = image.crop(topX, topY, width, height);

    return await cropedImage.getBufferAsync(mimeType);
  }
}

export {USDocumentsService};
