import { SvgIcon, type SvgIconProps } from '@mui/material';

const iconPaths: Readonly<Record<string, string>> = Object.freeze({
  add: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z',
  automation:
    'M7 3h10v4h-4v3.17A3.001 3.001 0 0 1 15 13v1h2v-2h4v6h-4v-2h-2v1a3 3 0 0 1-3 3H7v-4h5a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2v2H3V9h6v2h2V7H7V3Z',
  bell: 'M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6v-5a7 7 0 0 0-5-6.71V3a2 2 0 0 0-4 0v1.29A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z',
  cart: 'M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM6.2 6l.8 2h11.8l-1.7 6H8.4L5 4H2V2h4l.2 4Z',
  commerce:
    'M4 4h16l1 5v2a3 3 0 0 1-1 2.24V21H4v-7.76A3 3 0 0 1 3 11V9l1-5Zm2 10v5h12v-5.1a3.02 3.02 0 0 1-3-1.18 3.02 3.02 0 0 1-6 0A3.02 3.02 0 0 1 6 13.9Zm-.2-8-.8 3v2a1 1 0 0 0 2 0V9l.4-3H5.8Zm3.82 0L9 9v2a1 1 0 0 0 2 0V6H9.62ZM13 6v5a1 1 0 0 0 2 0V9l-.62-3H13Zm3.4 0 .6 3v2a1 1 0 0 0 2 0V9l-.8-3h-1.8Z',
  content: 'M5 3h10l4 4v14H5V3Zm2 2v14h10V8h-3V5H7Zm2 7h6v2H9v-2Zm0 4h6v2H9v-2Z',
  dashboard:
    'M3 3h8v8H3V3Zm2 2v4h4V5H5Zm8-2h8v5h-8V3Zm2 2v1h4V5h-4Zm-2 5h8v11h-8V10Zm2 2v7h4v-7h-4ZM3 13h8v8H3v-8Zm2 2v4h4v-4H5Z',
  menu: 'M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z',
  module: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  operations:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm9 5.5-2.07.8a7.1 7.1 0 0 1-.58 1.4l.9 2.03-1.52 1.52-2.03-.9a7.1 7.1 0 0 1-1.4.58L13.5 21h-3l-.8-2.07a7.1 7.1 0 0 1-1.4-.58l-2.03.9-1.52-1.52.9-2.03a7.1 7.1 0 0 1-.58-1.4L3 13.5v-3l2.07-.8c.15-.49.35-.96.58-1.4l-.9-2.03 1.52-1.52 2.03.9c.44-.23.91-.43 1.4-.58L10.5 3h3l.8 2.07c.49.15.96.35 1.4.58l2.03-.9 1.52 1.52-.9 2.03c.23.44.43.91.58 1.4l2.07.8v3Z',
  organization:
    'M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21v-3a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v3H2Zm13.5 0v-3a6.48 6.48 0 0 0-1.2-3.76A4.5 4.5 0 0 1 22 17.5V21h-6.5Z',
  search:
    'M10.5 4a6.5 6.5 0 1 0 3.98 11.64L19.85 21 21 19.85l-5.36-5.37A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z',
  tasks: 'M5 3h14v18H5V3Zm2 2v14h10V5H7Zm2 3h6v2H9V8Zm0 4h6v2H9v-2Zm0 4h4v2H9v-2Z',
});

const aliases: Readonly<Record<string, string>> = Object.freeze({
  price: 'commerce',
  pricing: 'commerce',
  product: 'commerce',
  inventory: 'commerce',
  store: 'commerce',
  workflow: 'automation',
  process: 'automation',
  cronjob: 'automation',
  profile: 'organization',
  customer: 'organization',
  employee: 'organization',
  cms: 'content',
  experience: 'content',
  platform: 'operations',
  integration: 'operations',
  settings: 'operations',
  notifications: 'bell',
});

interface ShellIconProps extends SvgIconProps {
  readonly name: string;
}

export function ShellIcon({ name, ...props }: ShellIconProps) {
  const normalizedName = name.trim().toLocaleLowerCase();
  const resolvedName = aliases[normalizedName] ?? normalizedName;
  const path = iconPaths[resolvedName] ?? iconPaths.module;

  return (
    <SvgIcon {...props}>
      <path d={path} />
    </SvgIcon>
  );
}
