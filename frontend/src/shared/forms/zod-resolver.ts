import { get, set, type FieldError, type FieldErrors, type FieldValues, type Resolver } from "react-hook-form";
import type { z } from "zod";

/**
 * Validates a react-hook-form form with a Zod schema. On success the form receives the schema's parsed output; on
 * failure, the first issue per field path. An issue on a field array itself (e.g. "add at least one step") lands on
 * that array's `root`, where react-hook-form expects array-level errors.
 */
export function zodResolver<Input extends FieldValues, Context, Output>(
  schema: z.ZodType<Output, Input>,
): Resolver<Input, Context, Output> {
  return async (values, _context, options) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors = firstErrorPerPath(result.error.issues);
    return { values: {}, errors: nestErrors(errors, options.fields, options.names) as FieldErrors<Input> };
  };
}

function firstErrorPerPath(issues: z.core.$ZodIssue[]): Record<string, FieldError> {
  const errors: Record<string, FieldError> = {};
  for (const issue of issues) {
    const path = issue.path.join(".");
    errors[path] ??= { type: issue.code, message: issue.message };
  }
  return errors;
}

function nestErrors(
  errors: Record<string, FieldError>,
  fields: Record<string, unknown>,
  names: readonly string[] | undefined,
): FieldErrors {
  const nested: FieldErrors = {};
  const fieldNames = names ?? Object.keys(errors);

  for (const [path, error] of Object.entries(errors)) {
    const field = get(fields, path) as { ref?: FieldError["ref"] } | undefined;
    const withRef: FieldError = { ...error, ref: field?.ref };

    if (isFieldArray(fieldNames, path)) {
      set(nested, path, { ...get(nested, path), root: withRef });
    } else {
      set(nested, path, withRef);
    }
  }

  return nested;
}

function isFieldArray(names: readonly string[], path: string): boolean {
  const itemPattern = new RegExp(`^${escapeRegExp(stripBrackets(path))}\\.\\d+`);
  return names.some((name) => itemPattern.test(stripBrackets(name)));
}

const stripBrackets = (name: string) => name.replace(/[[\]]/g, "");

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
