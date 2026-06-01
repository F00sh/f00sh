type PermissionPref = 'unknown' | 'granted' | 'denied';

export function usePermissionPrefs() {
  const gyroPermission = useCookie<PermissionPref>('foosh_gyro_permission', {
    default: () => 'unknown',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  const micPermission = useCookie<PermissionPref>('foosh_mic_permission', {
    default: () => 'unknown',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  return {
    gyroPermission,
    micPermission,
  };
}
