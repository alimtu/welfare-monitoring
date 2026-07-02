import Joi from 'joi';
import FA_MESSAGES from './joi-messages-fa.json';

export default function buildFormSchema(steps) {
  const shape = {};

  for (const step of steps) {
    const sections = step.sections || [];

    if (step.numrow > 1) {
      const rowShape = {};
      for (const section of sections) {
        const key = `section_${section.sectionId}`;
        rowShape[key] = buildRule(section, false);
      }
      shape[`rows_${step.stepId}`] = Joi.array()
        .items(Joi.object(rowShape))
        .min(1)
        .label(step.title);
    } else {
      for (const section of sections) {
        const key = `section_${section.sectionId}`;
        shape[key] = buildRule(section, !!section.required);
      }
    }
  }

  return Joi.object(shape).messages(FA_MESSAGES).options({ abortEarly: false });
}

function buildRule(section, isRequired) {
  switch (section.type) {
    case 0:
    case 1:
      return isRequired
        ? Joi.string().required().disallow('', null).label(section.title)
        : Joi.string().allow('', null).label(section.title);

    case 2:
      return isRequired
        ? Joi.string()
            .required()
            .custom((value, helpers) => {
              const stripped = (value || '').replace(/<[^>]*>/g, '').trim();
              if (!stripped) return helpers.error('any.required');
              return value;
            })
            .label(section.title)
        : Joi.string().allow('', null).label(section.title);

    case 3:
      return isRequired
        ? Joi.number().required().label(section.title)
        : Joi.number().allow(null, '').label(section.title);

    case 4:
      return isRequired
        ? Joi.string().required().disallow('', null).label(section.title)
        : Joi.string().allow('', null).label(section.title);

    case 5:
      return isRequired
        ? Joi.array().items(Joi.string()).min(1).required().label(section.title)
        : Joi.array().items(Joi.string()).label(section.title);

    case 6:
      return isRequired
        ? Joi.any().required().invalid(null).label(section.title)
        : Joi.any().label(section.title);

    case 7:
    case 8:
    case 23:
    case 24:
      return isRequired
        ? Joi.any().required().invalid(null, '').label(section.title)
        : Joi.any().label(section.title);

    case 9:
      return isRequired
        ? Joi.string().required().disallow('', null).label(section.title)
        : Joi.string().allow('', null).label(section.title);

    case 14:
      return isRequired
        ? Joi.string().required().disallow('', null).label(section.title)
        : Joi.string().allow('', null).label(section.title);

    case 10:
      return isRequired
        ? Joi.object({
            category: Joi.string()
              .required()
              .disallow('', null)
              .label('دسته')
              .messages(FA_MESSAGES),
            sub: Joi.string().required().disallow('', null).label('زیر‌دسته').messages(FA_MESSAGES),
          })
            .required()
            .label(section.title)
        : Joi.object({
            category: Joi.string().allow('', null).label('دسته'),
            sub: Joi.string().allow('', null).label('زیر‌دسته'),
          }).label(section.title);

    default:
      return isRequired
        ? Joi.any().required().label(section.title)
        : Joi.any().label(section.title);
  }
}
