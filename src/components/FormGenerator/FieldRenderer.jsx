'use client';

import TextField from './fields/TextField';
import TextareaField from './fields/TextareaField';
import RichTextField from './fields/RichTextField';
import NumberField from './fields/NumberField';
import SingleSelectField from './fields/SingleSelectField';
import MultiSelectField from './fields/MultiSelectField';
import DateField from './fields/DateField';
import UploaderField from './fields/UploaderField';
import MaskedField from './fields/MaskedField';
import TimeField from './fields/TimeField';
import CascadeSelectField from './fields/CascadeSelectField';

const FIELD_MAP = {
  0:  TextField,
  1:  TextareaField,
  2:  RichTextField,
  3:  NumberField,
  4:  SingleSelectField,
  5:  MultiSelectField,
  6:  DateField,
  7:  UploaderField,
  8:  UploaderField,
  9:  MaskedField,
  10: CascadeSelectField,
  14: TimeField,
  23: UploaderField,
  24: UploaderField,
};

export default function FieldRenderer({ section, control, namePrefix = '' }) {
  const name = `${namePrefix}section_${section.sectionId}`;
  const Component = FIELD_MAP[section.type];

  if (!Component) return null;

  return (
    <div data-field={name}>
      <Component name={name} control={control} section={section} />
    </div>
  );
}
