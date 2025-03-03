import { forwardRef, KeyboardEventHandler, useRef, useState } from "react";
import { Field, TValidateConfig, validateField } from "./fields";

interface ICombobox extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  value: string;
  tabIndex?: number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  options: string[];
  validate?: TValidateConfig;
}

function setInputValue(input: HTMLInputElement, value: string) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  ).set;
  nativeInputValueSetter.call(input, value);

  const inputEvent = new Event("change", { bubbles: true });
  input.dispatchEvent(inputEvent);
}

/**
 * Implements the Editable Combobx with List Autocomplete pattern
 * https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/
 */

function Combobox(
  {
    id,
    label,
    hint,
    error,
    value,
    onChange,
    onBlur,
    options,
    tabIndex,
    validate = {},
    className = "",
    ...restProps
  }: ICombobox,
  ref?: React.MutableRefObject<HTMLInputElement>,
) {
  const fieldRefInternal = useRef();
  const fieldRef = ref || fieldRefInternal;

  const [listBoxExpanded, setListBoxExpanded] = useState<boolean>(false);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number>();
  const [inputHasVisualFocus, setInputHasVisualFocus] = useState<boolean>(true);

  const [touched, setTouched] = useState(false);

  const displayOptions = value
    ? options.filter((o) =>
        o.toLocaleLowerCase().startsWith(value.toLocaleLowerCase()),
      )
    : options;

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    if (onBlur) onBlur(event);
    setTouched(true);
    setListBoxExpanded(false);
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = () => {
    setListBoxExpanded(true);
  };

  const handleOptionClick = (selectedOption: string) => {
    setInputValue(fieldRef.current, selectedOption);
    setListBoxExpanded(false);
    setSelectedOptionIdx(undefined);
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    switch (event.key) {
      case "Down":
      case "ArrowDown":
        setInputHasVisualFocus(false);
        setListBoxExpanded(true);
        if (selectedOptionIdx !== undefined) {
          setSelectedOptionIdx((prev) =>
            prev + 1 < displayOptions.length ? prev + 1 : 0,
          );
        } else {
          if (!event.altKey) {
            setSelectedOptionIdx(0);
          }
        }
        break;
      case "Up":
      case "ArrowUp":
        setInputHasVisualFocus(false);
        setListBoxExpanded(true);
        if (selectedOptionIdx !== undefined) {
          setSelectedOptionIdx((prev) =>
            prev - 1 >= 0 ? prev - 1 : displayOptions.length - 1,
          );
        } else {
          setSelectedOptionIdx(displayOptions.length - 1);
        }
        break;
      case "Enter":
        event.preventDefault(); // Prevent form submit
        if (selectedOptionIdx !== undefined) {
          setInputValue(fieldRef.current, displayOptions[selectedOptionIdx]);
        }
        setInputHasVisualFocus(true);
        setListBoxExpanded(false);
        setSelectedOptionIdx(undefined);
        break;
      case "Esc":
      case "Escape":
        setInputHasVisualFocus(true);
        if (listBoxExpanded) {
          setListBoxExpanded(false);
          setSelectedOptionIdx(undefined);
        } else {
          setInputValue(fieldRef.current, "");
        }
        break;
      case "Home":
        setInputHasVisualFocus(true);
        fieldRef.current.selectionStart = 0;
        fieldRef.current.selectionEnd = 0;
        setSelectedOptionIdx(undefined);
        event.preventDefault();
        event.stopPropagation();
        break;
      case "End":
        setInputHasVisualFocus(true);
        fieldRef.current.selectionStart = value.length;
        fieldRef.current.selectionEnd = value.length;
        setSelectedOptionIdx(undefined);
        event.preventDefault();
        event.stopPropagation();
        break;
      default:
        setInputHasVisualFocus(true);
        setSelectedOptionIdx(undefined);
        return;
    }
  };

  const listboxId = `${id}-listbox`;
  const required = !!validate.required;
  const validateError = validateField(value, validate, touched);

  return (
    <div style={{ position: "relative" }}>
      <Field id={id} label={label} hint={hint} error={validateError || error}>
        <input
          {...restProps}
          className={`form-control ${!inputHasVisualFocus ? "shadow-none" : ""} ${validateError || error ? "is-invalid" : ""} ${className}`}
          type="text"
          role="combobox"
          aria-invalid={!!error}
          aria-autocomplete="list"
          aria-expanded={listBoxExpanded}
          aria-controls={listboxId}
          aria-activedescendant={
            selectedOptionIdx !== undefined
              ? `${listboxId}-${selectedOptionIdx}`
              : undefined
          }
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          tabIndex={tabIndex}
          required={required}
          ref={fieldRef}
        />
        <ul
          id={listboxId}
          role="listbox"
          aria-label={`${label} Options`}
          className="list-group"
          style={{
            display: listBoxExpanded ? "block" : "none",
            position: "absolute",
            top: "2.5rem",
            zIndex: 1,
          }}
        >
          {displayOptions.map((option, index) => (
            <li
              key={`${listboxId}-${option}`}
              id={`${listboxId}-${index}`}
              role="option"
              className={`list-group-item list-group-item-action ${index === selectedOptionIdx ? "active" : ""}`}
              onClick={() => handleOptionClick(option)}
              onMouseDown={(e) => e.preventDefault()} // Preventing default so the input doesn't loose focus
              style={{
                cursor: "pointer",
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      </Field>
    </div>
  );
}

export default forwardRef(Combobox);
