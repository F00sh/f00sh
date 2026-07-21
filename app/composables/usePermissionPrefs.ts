type PermissionPref = 'unknown' | 'granted' | 'denied';

export function usePermissionPrefs() {
  const micPermission = useCookie<PermissionPref>('foosh_mic_permission', {
    default: () => 'unknown',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  return { micPermission };
}
