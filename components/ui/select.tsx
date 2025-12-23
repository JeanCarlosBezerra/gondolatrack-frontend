"use client";

import * as React from "react";

type SelectContextType = {
  value: string;
  setValue: (v: string) => void;
};

const SelectContext = React.createContext<SelectContextType | null>(null);

type SelectProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
};

export function Select({ value, onValueChange, children }: SelectProps) {
  const [internal, setInternal] = React.useState(value ?? "");
  const currentValue = value ?? internal;

  const setValue = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
  };

  return (
    <SelectContext.Provider value={{ value: currentValue, setValue }}>
      {children}
    </SelectContext.Provider>
  );
}

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
};

export function SelectTrigger(props: TriggerProps) {
  return (
    <button type="button" {...props}>
      {props.children}
    </button>
  );
}

export function SelectContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}

export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return <div>{children}</div>;

  return (
    <div
      role="button"
      onClick={() => ctx.setValue(value)}
      className="cursor-pointer"
    >
      {children}
    </div>
  );
}

export function SelectValue({
  placeholder,
}: {
  placeholder?: string;
}) {
  const ctx = React.useContext(SelectContext);
  const text = !ctx || !ctx.value ? placeholder : ctx.value;
  return <span>{text}</span>;
}
