import { getPlatformType } from 'utils';

export function getKeyName(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.code.startsWith('Key')) {
    // KeyV -> V
    return e.code.slice(3).toUpperCase();
  }

  if (e.code.startsWith('Digit')) {
    // Digit1 -> 1
    return e.code.slice(5);
  }

  if (e.code.startsWith('Numpad')) {
    const rest = e.code.slice(6);

    const voc: Record<string, string> = {
      Add: '+',
      Subtract: '-',
      Multiply: '*',
      Divide: '/',
      Decimal: '.',
    };

    if (rest in voc) {
      return `Num${voc[rest]}`;
    }

    if (/^\d$/.test(rest)) {
      return `Num${rest}`;
    }

    return `Num${rest}`;
  }

  // популярные системные клавиши
  const specials: Record<string, string> = {
    ' ': 'Space',
    Escape: 'Esc',
    Backspace: 'Backspace',
    Enter: 'Enter',
    Tab: 'Tab',
    ArrowUp: 'ArrowUp',
    ArrowDown: 'ArrowDown',
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight',
    Home: 'Home',
    End: 'End',
    PageUp: 'PageUp',
    PageDown: 'PageDown',
    Delete: 'Delete',
    Insert: 'Insert',
  };

  if (e.key in specials) {
    return specials[e.key];
  }

  // F-клавиши и прочее
  if (/^F\d{1,2}$/.test(e.key)) {
    return e.key.toUpperCase();
  }

  return e.key.length === 1 ? e.key.toUpperCase() : e.key; // fallback
}

export type Labels = {
  ctrl: string;
  alt: string;
  shift: string;
  meta: string;
};

export function getLabels(): Labels {
  const platformType = getPlatformType();
  const isMac = platformType === 'macos';

  if (isMac) {
    return {
      ctrl: 'Ctrl',
      alt: 'Cmd',
      shift: 'Shift',
      meta: 'Opt',
    };
  }

  return {
    ctrl: 'Ctrl',
    alt: 'Alt',
    shift: 'Shift',
    meta: 'Win',
  };
}

export function getNewVal(e: React.KeyboardEvent<HTMLInputElement>) {
  const noMods = !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey;
  const purgeKey = e.key === 'Escape' || e.key === 'Backspace' || e.key === 'Delete';

  if (noMods || purgeKey) {
    return null;
  }

  const justModifier = e.key === 'Control'
    || e.key === 'Shift'
    || e.key === 'Alt'
    || e.key === 'Meta';

  if (justModifier) {
    return null;
  }

  const labels = getLabels();

  const mods: string[] = [];

  if (e.ctrlKey) mods.push(labels.ctrl);
  if (e.altKey) mods.push(labels.alt);
  if (e.shiftKey) mods.push(labels.shift);
  if (e.metaKey) mods.push(labels.meta);

  const keyName = getKeyName(e);

  if (!keyName) {
    return null;
  }

  const newValArr = [...mods, keyName];
  const newVal = newValArr.join('+');

  return {
    arr: newValArr,
    val: newVal,
  }
}
