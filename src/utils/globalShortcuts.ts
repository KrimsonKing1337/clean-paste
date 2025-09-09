import { register, unregister } from '@tauri-apps/plugin-global-shortcut';

// Нормализуем из нашего "Ctrl+Alt+S" к Accelerator плагина.
// Рекомендуется хранить в виде "CommandOrControl+Alt+S" для кросс-платформенности.
function toAccelerator(combo: string): string {
  // если уже хранишь в формате плагина — просто верни combo
  return combo
    .replace(/\bMod\b/ig, 'CommandOrControl')  // наш псевдоним → плагин
    .replace(/\bCmd\b/ig, 'Command')
    .replace(/\bCtrl\b/ig, 'Control')
    .replace(/\bOpt(ion)?\b/ig, 'Alt')
    .replace(/\bWin\b/ig, 'Super');           // Win-key → Super
}

let currentAccel: string | null = null;

export async function updateGlobalShortcut(userCombo: string, onTrigger: () => void) {
  const accel = toAccelerator(userCombo);

  // Снимем старый (если был)
  if (currentAccel) {
    try { await unregister(currentAccel); } catch {}
    currentAccel = null;
  }

  // Защитимся от мусора: комбинация должна содержать модификатор
  if (!/[+]/.test(accel)) return;

  // Регистрируем новый
  try {
    await register(accel, () => onTrigger());
    currentAccel = accel;
  } catch (e) {
    console.error('Failed to register global shortcut', accel, e);
    // Тут можно показать тост "Комбинация занята другой программой"
  }
}

// При выходе/размонтаже приложения
export async function disposeGlobalShortcut() {
  if (currentAccel) {
    try { await unregister(currentAccel); } catch {}
    currentAccel = null;
  }
}
