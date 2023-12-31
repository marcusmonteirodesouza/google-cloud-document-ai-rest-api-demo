import {Joi} from 'celebrate';

const envVarsSchema = Joi.object()
  .keys({
    DOCUMENT_AI_US_DRIVER_LICENSE_PROCESSOR_LOCATION: Joi.string().required(),
    DOCUMENT_AI_US_DRIVER_LICENSE_PROCESSOR_ID: Joi.string().required(),
    DOCUMENT_AI_US_ID_PROOFING_PROCESSOR_LOCATION: Joi.string().required(),
    DOCUMENT_AI_US_ID_PROOFING_PROCESSOR_ID: Joi.string().required(),
    DOCUMENT_AI_US_PASSPORT_PROCESSOR_LOCATION: Joi.string().required(),
    DOCUMENT_AI_US_PASSPORT_PROCESSOR_ID: Joi.string().required(),
    DOCUMENT_AI_US_PATENT_PROCESSOR_LOCATION: Joi.string().required(),
    DOCUMENT_AI_US_PATENT_PROCESSOR_ID: Joi.string().required(),
    GOOGLE_PROJECT_ID: Joi.string().required(),
    LOG_LEVEL: Joi.string().valid('debug', 'info').default('info'),
    PORT: Joi.number().integer().required(),
    K_REVISION: Joi.string().required(),
    K_SERVICE: Joi.string().required(),
  })
  .unknown();

const {value: envVars, error} = envVarsSchema.validate(process.env);

if (error) {
  throw error;
}

const config = {
  documentAi: {
    processors: {
      us: {
        ids: {
          driverLicense: {
            location: envVars.DOCUMENT_AI_US_DRIVER_LICENSE_PROCESSOR_LOCATION,
            id: envVars.DOCUMENT_AI_US_DRIVER_LICENSE_PROCESSOR_ID,
          },
          idProofing: {
            location: envVars.DOCUMENT_AI_US_ID_PROOFING_PROCESSOR_LOCATION,
            id: envVars.DOCUMENT_AI_US_ID_PROOFING_PROCESSOR_ID,
          },
          passport: {
            location: envVars.DOCUMENT_AI_US_PASSPORT_PROCESSOR_LOCATION,
            id: envVars.DOCUMENT_AI_US_PASSPORT_PROCESSOR_ID,
          },
        },
        patent: {
          location: envVars.DOCUMENT_AI_US_PATENT_PROCESSOR_LOCATION,
          id: envVars.DOCUMENT_AI_US_PATENT_PROCESSOR_ID,
        },
      },
    },
  },
  google: {
    cloudRun: {
      revision: envVars.K_REVISION,
      service: envVars.K_SERVICE,
    },
    projectId: envVars.GOOGLE_PROJECT_ID,
  },
  logLevel: envVars.LOG_LEVEL,
  port: envVars.PORT,
};

export {config};
