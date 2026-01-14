import { useState, useCallback } from 'react';
import { validateForm } from '@shared/utils';

interface FormValues {
  [key: string]: any;
}

interface FormErrors {
  [key: string]: string | null;
}

interface FormTouched {
  [key: string]: boolean;
}

interface ValidationRule {
  (value: any): string | null;
}

interface ValidationSchema {
  [key: string]: ValidationRule[];
}

interface UseFormReturn<T extends FormValues> {
  values: T;
  errors: FormErrors;
  touched: FormTouched;
  isSubmitting: boolean;
  setValue: (name: keyof T, value: any) => void;
  setFieldTouched: (name: keyof T, isTouched?: boolean) => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  validate: () => boolean;
  reset: (newValues?: Partial<T>) => void;
  submitForm: (onSubmit?: (values: T) => Promise<void>) => Promise<void>;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

export const useForm = <T extends FormValues = FormValues>(
  initialValues: T = {} as T,
  validationSchema: ValidationSchema = {}
): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const setValue = useCallback((name: keyof T, value: any): void => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is modified
    if (errors[name as string]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((name: keyof T, isTouched: boolean = true): void => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched
    }));
  }, []);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value, type } = event.target;
    const target = event.target as HTMLInputElement;
    const fieldValue = type === 'checkbox' ? target.checked : value;
    setValue(name as keyof T, fieldValue);
  }, [setValue]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name } = event.target;
    setFieldTouched(name as keyof T, true);

    // Validate field on blur
    if (validationSchema[name]) {
      const fieldValue = values[name as keyof T];
      const rules = validationSchema[name];

      for (let rule of rules) {
        const error = rule(fieldValue);
        if (error) {
          setErrors(prev => ({
            ...prev,
            [name]: error
          }));
          break;
        }
      }
    }
  }, [values, validationSchema, setFieldTouched]);

  const validate = useCallback((): boolean => {
    const { errors: validationErrors, isValid } = validateForm(values, validationSchema);
    setErrors(validationErrors);
    return isValid;
  }, [values, validationSchema]);

  const reset = useCallback((newValues: Partial<T> = initialValues): void => {
    setValues(newValues as T);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const submitForm = useCallback(async (onSubmit?: (values: T) => Promise<void>): Promise<void> => {
    setIsSubmitting(true);

    const isValid = validate();

    if (isValid && onSubmit) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setIsSubmitting(false);
  }, [values, validate]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    handleChange,
    handleBlur,
    validate,
    reset,
    submitForm,
    setIsSubmitting
  };
};
