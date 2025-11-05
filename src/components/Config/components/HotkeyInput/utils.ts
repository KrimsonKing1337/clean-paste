import { getPlatformType } from 'utils';

export function getLabels() {
  const isMac = getPlatformType() === 'macos';

  const macButtons: Record<string, string> = {
    ctrl: 'Ctrl',
    alt: 'Opt',
    shift: 'Shift',
    meta: 'Cmd',
  };

  const otherButtons: Record<string, string> = {
    ctrl: 'Ctrl',
    alt: 'Alt',
    shift: 'Shift',
    meta: 'Win',
  };

  return isMac ? macButtons : otherButtons;
}

export function getAcceleratorMap() {
  const isMac = getPlatformType() === 'macos';

  const macButtons: Record<string, string> = {
    ctrl: 'Control',
    alt: 'Alt',
    shift: 'Shift',
    meta: 'Command',
  };

  const otherButtons: Record<string, string> = {
    ctrl: 'Control',
    alt: 'Alt',
    shift: 'Shift',
    meta: 'Super',
  };

  return isMac ? macButtons : otherButtons;
}

export function getLabelByAccel(value: string) {
  const arr = value.split('+');
  const accels = getAcceleratorMap();
  const labels = getLabels();

  const accelsKeys = Object.keys(accels);

  for (let i = 0; i < arr.length; i++) {
    const itemCur = arr[i];

    for (const accelsKeyCur of accelsKeys) {
      const accelsValue = accels[accelsKeyCur];

      if (itemCur === accelsValue) {
        arr[i] = labels[accelsKeyCur];
      }
    }
  }

  return arr.join('+');
}

export function getKeyNameUI(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.code.startsWith('Key')) {
    return e.code.slice(3).toUpperCase();
  }

  if (e.code.startsWith('Digit')) {
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

  if (/^F\d{1,2}$/.test(e.key)) {
    return e.key.toUpperCase();
  }

  return e.key.length === 1 ? e.key.toUpperCase() : e.key;
}

export function getKeyNameAccel(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.code.startsWith('Key')) {
    return e.code.slice(3).toUpperCase(); // A-Z
  }

  if (e.code.startsWith('Digit')) {
    return e.code.slice(5); // 0-9
  }

  if (e.code.startsWith('Numpad')) {
    const rest = e.code.slice(6);

    const voc: Record<string, string> = {
      Add: 'NumpadAdd',
      Subtract: 'NumpadSubtract',
      Multiply: 'NumpadMultiply',
      Divide: 'NumpadDivide',
      Decimal: 'NumpadDecimal',
    };

    if (rest in voc) {
      return voc[rest];
    }

    if (/^\d$/.test(rest)) {
      return `Numpad${rest}`;
    }

    return `Numpad${rest}`; // NumpadEnter, NumpadEqual и т.п.
  }

  const specials: Record<string, string> = {
    ' ': 'Space',
    Escape: 'Escape',
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

  if (/^F\d{1,2}$/.test(e.key)) {
    return e.key.toUpperCase();
  }

  return e.key.length === 1 ? e.key.toUpperCase() : e.key;
}

export function getValues(e: React.KeyboardEvent<HTMLInputElement>) {
  const noMods = !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey;
  const purgeKey = e.key === 'Escape' || e.key === 'Backspace' || e.key === 'Delete';

  if (noMods || purgeKey) {
    return null;
  }

  if (e.key === 'Control' || e.key === 'Shift' || e.key === 'Alt' || e.key === 'Meta') {
    return null;
  }

  const labels = getLabels();
  const accelMap = getAcceleratorMap();

  const uiMods: string[] = [];
  const accMods: string[] = [];

  if (e.ctrlKey) {
    uiMods.push(labels.ctrl);
    accMods.push(accelMap.ctrl);
  }

  if (e.altKey) {
    uiMods.push(labels.alt);
    accMods.push(accelMap.alt);
  }

  if (e.shiftKey) {
    uiMods.push(labels.shift);
    accMods.push(accelMap.shift);
  }

  if (e.metaKey) {
    uiMods.push(labels.meta);
    accMods.push(accelMap.meta);
  }

  const uiKey = getKeyNameUI(e);
  const accelKey = getKeyNameAccel(e);

  if (!uiKey || !accelKey) {
    return null;
  }

  const uiArr = [...uiMods, uiKey];
  const accelArr = [...accMods, accelKey];

  const ui = uiArr.join('+');
  const accel = accelArr.join('+');

  return {
    ui,
    accel,
    uiArr,
    accelArr,
  };
}
