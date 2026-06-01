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

  const geoPermission = useCookie<PermissionPref>('foosh_geo_permission', {
    default: () => 'unknown',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  const onboardingAsked = useCookie<boolean>('foosh_permissions_asked', {
    default: () => false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });

  return {
    gyroPermission,
    micPermission,
    geoPermission,
    onboardingAsked,
  };
}
