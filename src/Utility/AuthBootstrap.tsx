import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getPatient } from '../Service/PatientProfileService.tsx';
import { getDoctor } from '../Service/DoctorProfileService.tsx';
import { getUserProfile } from '../Service/UserService.tsx';
import { setprofile } from '../Slices/ProfileSlice.tsx';

const AuthBootstrap = () => {
  const user = useSelector((state: any) => state.user);
  const profile = useSelector((state: any) => state.profile);
  const dispatch = useDispatch();

  useEffect(() => {
    // if there's no authenticated user or profile already hydrated, skip
    console.log('AuthBootstrap: useEffect start', { user, profile });
    // User must have 'userId' instead of 'id' in the token payload if stored that way
    const userId = user.userId || user.id;
    if (!user || !userId) {
      console.log('AuthBootstrap: no user id, skipping');
      return;
    }
    if (profile && Object.keys(profile).length > 0) {
      console.log('AuthBootstrap: profile already hydrated, skipping');
      return;
    }

    const load = async () => {
        try {
          console.log('AuthBootstrap: loading profile for user', { id: user.id, role: user.role, profileId: user.profileId });
        const role = (user.role || '').toString().toUpperCase();
        // Doctor
        if (role.includes('DOCTOR')) {
          if (user.profileId) {
            const data = await getDoctor(user.profileId);
            console.log('AuthBootstrap: got doctor profile', data);
            dispatch(setprofile(data));
          } else {
            const data = await getUserProfile(userId);
            console.log('AuthBootstrap: fallback getUserProfile for doctor', data);
            dispatch(setprofile(data));
          }
          return;
        }

        // Patient
        if (role.includes('PATIENT')) {
          if (user.profileId) {
            const data = await getPatient(user.profileId);
            console.log('AuthBootstrap: got patient profile', data);
            dispatch(setprofile(data));
          } else {
            const data = await getUserProfile(userId);
            console.log('AuthBootstrap: fallback getUserProfile for patient', data);
            dispatch(setprofile(data));
          }
          return;
        }

        // Admin or other roles: fall back to user profile endpoint
        const data = await getUserProfile(userId);
        console.log('AuthBootstrap: got user profile fallback', data);
        dispatch(setprofile(data));
      } catch (err) {
        // silent fail here; components can fetch on demand
        console.warn('AuthBootstrap: failed to hydrate profile', err);
      }
    };

    load();
  }, [user, profile, dispatch]);

  return null;
};

export default AuthBootstrap;
