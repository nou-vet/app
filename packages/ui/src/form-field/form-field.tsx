import {
  children,
  createUniqueId,
  Match,
  Show,
  splitProps,
  Switch,
  type Accessor,
  type ComponentProps,
  type JSX,
  type JSXElement,
} from 'solid-js';
import { cva, type VariantProps } from 'class-variance-authority';

import { useFormContext } from '../form';
import { Text } from '../text';
import { tw } from '../tw';

import * as cssStyle from './form-field.module.css';

export const formFieldVariants = cva(cssStyle.wrapper, {
  variants: {
    variant: {
      underline: cssStyle['wrapperUnderline'],
      ghost: cssStyle['wrapperGhost'],
    },
  },
  defaultVariants: {
    variant: 'underline',
  },
});

export interface FormFieldProps extends VariantProps<typeof formFieldVariants> {
  /** Field label. */
  label?: JSXElement;
  /** Helper text. */
  description?: string;
}
interface FieldInnerProps
  extends FormFieldProps,
    Pick<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'id' | 'style'> {
  /* Name of the input field to assign validation description */
  name?: string;
  children: (ariaProps: {
    id: Accessor<string>;
    describedBy: Accessor<string | undefined>;
  }) => JSX.Element;
  /** Prefix text or an icon */
  prefix?: JSX.Element;
  /** Prefix text or an icon */
  suffix?: JSX.Element;
}
const FormField = (ownProps: FieldInnerProps) => {
  const formContext = useFormContext();
  const [local, props] = splitProps(ownProps, ['variant']);
  const localId = createUniqueId();
  const id = () => props.id || localId;
  const descriptionId = () => `${id()}-description`;
  const errorMessage = () =>
    props.name ? formContext().validationErrors?.[props.name] : null;
  const prefix = children(() => props.prefix);
  const suffix = children(() => props.suffix);
  return (
    <div class={tw(cssStyle.field, props.class)} style={props.style}>
      <div
        class={formFieldVariants(local)}
        onClick={(e) => {
          // suffix and prefix need dynamic width, click on them needs to trigger input focus anyway
          const input = e.currentTarget.querySelector('input, select');
          if (input instanceof HTMLInputElement) {
            input.focus();
          } else if (input instanceof HTMLSelectElement) {
            input.showPicker();
          }
        }}
      >
        <Show when={props.label}>
          <Text as="label" for={id()} with="label-sm" class={cssStyle.label}>
            {props.label}
          </Text>
        </Show>
        <div class={cssStyle.inputWrapper}>
          <Show when={prefix()}>
            <span class={cssStyle.prefix}>{prefix()}</span>
          </Show>
          {props.children({
            id,
            describedBy: () =>
              errorMessage() || props.description ? descriptionId() : undefined,
          })}
          <Show when={suffix()}>
            <span class={cssStyle.suffix}>{suffix()}</span>
          </Show>
        </div>
      </div>
      <Switch>
        <Match when={errorMessage()}>
          <span
            id={descriptionId()}
            aria-live="polite"
            class={cssStyle.description}
          >
            {errorMessage()}
          </span>
        </Match>
        <Match when={props.description}>
          <span id={descriptionId()} class={cssStyle.description}>
            {props.description}
          </span>
        </Match>
      </Switch>
    </div>
  );
};

const Fieldset = (props: ComponentProps<'fieldset'>) => {
  return <fieldset {...props} class={tw(cssStyle.fieldset, props.class)} />;
};

export { FormField, Fieldset };
