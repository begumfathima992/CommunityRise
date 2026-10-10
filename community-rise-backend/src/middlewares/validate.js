import AppError from '../utils/AppError.js';

// Turns zod issues into { field: [messages] } for form-friendly errors.
export function formatZodIssues(issues) {
  const errors = {};
  const add = (field, message) => {
    (errors[field] ||= []).push(message);
  };

  for (const issue of issues) {
    if (issue.code === 'unrecognized_keys') {
      for (const key of issue.keys) add(key, 'Unknown field');
    } else {
      add(issue.path.join('.') || '_root', issue.message);
    }
  }
  return errors;
}

// validate(schema) checks req.body; pass 'query' or 'params' for others.
// The parsed (trimmed, lowercased, unknown-free) value replaces the input.
export default function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      return next(AppError.validation(formatZodIssues(result.error.issues)));
    }
    req[source] = result.data;
    return next();
  };
}
