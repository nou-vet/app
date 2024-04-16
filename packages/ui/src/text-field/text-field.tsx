import { splitProps, type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { FormField, type FormFieldProps } from '../form-field';
import { mergeDefaultProps } from '../utils';

import * as cssStyle from './text-field.module.css';

export type TextFieldProps<T extends 'input' | 'textarea'> = FormFieldProps &
  (T extends 'input'
    ? JSX.InputHTMLAttributes<HTMLInputElement>
    : JSX.TextareaHTMLAttributes<HTMLTextAreaElement>) & {
    suffix?: JSX.Element;
    as?: T;
  };

const TextField = <T extends 'input' | 'textarea' = 'input'>(
  ownProps: TextFieldProps<T>,
) => {
  const [fieldProps, props] = splitProps(
    mergeDefaultProps(ownProps as TextFieldProps<'input'>, {
      as: 'input',
      // TODO: remove this default for textarea
      type: 'text',
    }),
    [
      'class',
      'style',
      'id',
      'label',
      'description',
      'variant',
      'prefix',
      'suffix',
    ],
  );

  return (
    <FormField {...fieldProps} name={props.name}>
      {(aria) => (
        <Dynamic
          {...props}
          component={props.as}
          class={cssStyle.input}
          id={aria.id()}
          aria-describedby={aria.describedBy()}
        />
      )}
    </FormField>
  );
};

export { TextField };
