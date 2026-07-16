/**
 * A ready-made welfare dataset exported from a real active user, bundled with
 * the app so any visitor can load it into their own device to explore the app.
 *
 * The JSON lives in `static/welfareData/`. To swap the dataset, drop a new file
 * there and update the import path below — this is the only place it's named.
 */
import bundle from '../../../static/welfareData/welfare-all-20260716-1109.json';

export const SAMPLE_DATASET = {
  label: 'داده کاربر فعال',
  description: 'داده واقعی یک کاربر فعال برای مشاهده و آزمایش برنامه.',
  bundle,
};
